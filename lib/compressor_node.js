var $ = require('cheerio');
var BoundingHelper = require('svg-boundings');
var shapeToPath = require('./to_path');
var REGEX = require('./constants').REGEX;

// Simulate DOM object methods and properties used in to_path and boundingHelper
$.prototype.getAttribute = $.prototype.attr;
Object.defineProperty($.prototype, 'tagName', {
  get: function() { return this.get(0).tagName; }
});
Object.defineProperty($.prototype, 'nodeName', {
  get: function() { return this.get(0).tagName; }
});

function getSvgNode($el) {
  while ($el.nodeName.toLowerCase() !== 'svg') {
    $el = $el.parent();
  }

  return $el;
}

function getSvgBounding($svg) {
  var viewBox = $svg.attr('viewBox');
  var points = viewBox.trim().split(/\s+/);
  return {
    left: points[0],
    top: points[1],
    right: points[2],
    bottom: points[3]
  }
}

function unwrap($node) {
  $node.children().insertBefore($node);
  $node.remove();
}

function handleId($el) {
  var id = $el.attr('id');
  var child = null;

  if (REGEX.ID.TEXT.test(id)) {
    child = $el.children('text').get(0);
  }
  else if (REGEX.ID.IMAGE.test(id)) {
    child = $el.children('image').get(0);
  }
  else if (REGEX.ID.COLOR.test(id)) {
    child = $el.children().get(0);
  }
  if (child) $(child).attr('id', id);
}

function removeRedundantGroups($el) {
  var $child = null;

  // Looks like cheerio doesn't update $el.children()
  // when referencing it using a variable after updating
  // the DOM tree.
  for (var i = 0; i < $el.children().length; i++) {
    $child = $el.children().eq(i);
    if (
      REGEX.GROUP.test($child.nodeName) &&
      !$child.attr('clip-path') &&
      !$child.attr('mask') &&
      !$child.attr('transform') &&
      !$child.attr('opacity')
    ) {
      i -= 1;

      if ($child.attr('id')) {
        handleId($child);
      }

      unwrap($child);
    }
  }
}

function outOfView(bounding, svgBounding) {
  var minX1 = bounding.left;
  var minY1 = bounding.top;
  var maxX1 = minX1 + bounding.width;
  var maxY1 = minY1 + bounding.height;

  var minX2 = svgBounding.left;
  var minY2 = svgBounding.top;
  var maxX2 = svgBounding.right;
  var maxY2 = svgBounding.bottom;

  var minX = Math.max(minX1, minX2)
  var minY = Math.max(minY1, minY2)
  var maxX = Math.min(maxX1, maxX2)
  var maxY = Math.min(maxY1, maxY2)

  return minX > maxX || minY > maxY;
}

/**
 * Pass in an SVG DOM reference and merge the shape elements.
 * The original reference is modified.
 * Only sibling shape elements of the same fill, stroke and opacity are merged.
 * Shapes not shown in the visible area are removed.
 */
function _merge($el, idCounter, svgBounding) {
  removeRedundantGroups($el);

  if (typeof idCounter !== 'number') idCounter = 10000;

  var $child = null;

  var ds; // The property is d
  var prevKey;
  var id;
  var bounding;

  var $svg = getSvgNode($el);

  function createPath(attrs, d, id) {
    var path = '<path';

    if (REGEX.ID.COLOR.test(id)) {
      path += ' id="c_' + idCounter + '_"';
      idCounter += 1;
    }

    if (attrs[0]) path += ' fill="' + attrs[0] + '"';
    if (attrs[1]) path += ' stroke="' + attrs[1] + '"';
    if (attrs[2]) path += ' opacity="' + attrs[2] + '"';
    if (attrs[3]) path += ' clip-path="' + attrs[3] + '"';
    if (attrs[4]) path += ' mask="' + attrs[4] + '"';

    path += ' d="' + d + '"/>';

    return path;
  }

  for (var i = 0; i < $el.children().length; i++) {
    $child = $el.children().eq(i);
    if (REGEX.SHAPE.ALL.test($child.nodeName)) {
      bounding = BoundingHelper.shape($child, true);
      if (outOfView(bounding, svgBounding)) {
        $child.remove();
        i -= 1;
        continue;
      }

      key = ($child.attr('fill') || '') +
        '|' + ($child.attr('stroke') || '') +
        '|' + ($child.attr('opacity') || '') +
        '|' + ($child.attr('clip-path') || '')
        '|' + ($child.attr('mask') || '');

      if (!prevKey) {
        id = $child.attr('id');
        prevKey = key;
        ds = [shapeToPath($child)];
        i -= 1;
      }
      else if (prevKey === key) {
        ds.push(shapeToPath($child));
        i -= 1;
      }
      else {
        $child.before(createPath(prevKey.split('|'), ds.join(''), id));
        prevKey = key;
        ds = [shapeToPath($child)];
      }

      $child.remove();
    }
    else if (ds && ds.length) {
      $child.before(createPath(prevKey.split('|'), ds.join(''), id));
      i += 1;
      prevKey = null;
      ds = null;
    }

    if (REGEX.GROUP.test($child.nodeName)) {
      _merge($child, idCounter, svgBounding);
    }
  }

  if (ds && ds.length) {
    $el.append(createPath(prevKey.split('|'), ds.join(''), id));
  }
}

function merge(svgStr) {
  var $svgs = $.load(svgStr, { xmlMode: true })('svg');
  if ($svgs.length === 0) return '';

  var $svg = $svgs.eq(0);
  _merge($svg, 10000, getSvgBounding($svg));

  return '<?xml version="1.0" encoding="utf-8"?>\n' + $.html($svg).replace(/^\s*\n/mg, '');
}

module.exports = merge;
