var shapeToPath = require('./to_path');
var REGEX = require('./constants').REGEX;

function getSvgNode(el) {
  while (el.nodeName.toLowerCase() !== 'svg') {
    el = el.parentNode;
  }

  return el;
}

function unwrap(nodeToBeRemoved) {
  while (nodeToBeRemoved.firstChild) {
    nodeToBeRemoved.parentNode.insertBefore(nodeToBeRemoved.firstChild, nodeToBeRemoved);
  }
  nodeToBeRemoved.parentNode.removeChild(nodeToBeRemoved);
}

function handleId(el) {
  var id = el.getAttribute('id');
  var child = null;

  if (REGEX.ID.TEXT.test(id)) {
    child = el.getElementsByTagName('text')[0];
  }
  else if (REGEX.ID.IMAGE.test(id)) {
    child = el.getElementsByTagName('image')[0];
  }
  else if (REGEX.ID.COLOR.test(id)) {
    child = el.children[0];
  }
  if (child) child.setAttribute('id', id);
}

function removeRedundantGroups(el) {
  var children = el.children;
  var child = null;
  var count = children.length; // will be updated in the for loop

  for (var i = 0; i < count; i++) {
    child = children[i];
    if (
      REGEX.GROUP.test(child.nodeName) &&
      !child.hasAttribute('clip-path') &&
      !child.hasAttribute('mask') &&
      child.attributes.length < 2
    ) {
      count = count - 1 + child.children.length;
      i -= 1;

      if (child.hasAttribute('id')) {
        handleId(child);
      }

      unwrap(child);
    }
  }
}

/**
 * Pass in an SVG DOM reference and merge the shape elements.
 * The original reference is modified.
 * Only sibling shape elements of the same fill, stroke and opacity are merged.
 */
function merge(el, idCounter) {
  removeRedundantGroups(el);

  if (typeof idCounter !== 'number') idCounter = 10000;

  var children = el.children;
  var child = null;
  var count = children.length;

  var ds; // The property is d
  var prevKey;
  var id;

  var svg = getSvgNode(el);

  function createPath(attrs, d, id) {
    var path = document.createElementNS(svg.namespaceURI, 'path');

    if (REGEX.ID.COLOR.test(id)) {
      path.setAttribute('id', 'c_' + idCounter + '_');
      idCounter += 1;
    }

    if (attrs[0]) path.setAttribute('fill', attrs[0]);
    if (attrs[1]) path.setAttribute('stroke', attrs[1]);
    if (attrs[2]) path.setAttribute('opacity', attrs[2]);
    if (attrs[3]) path.setAttribute('clip-path', attrs[3]);
    if (attrs[4]) path.setAttribute('mask', attrs[4]);

    path.setAttribute('d', d);

    return path;
  }

  for (var i = 0; i < count; i++) {
    child = children[i];
    if (REGEX.SHAPE.ALL.test(child.nodeName)) {
      key = (child.getAttribute('fill') || '') +
        '|' + (child.getAttribute('stroke') || '') +
        '|' + (child.getAttribute('opacity') || '') +
        '|' + (child.getAttribute('clip-path') || '')
        '|' + (child.getAttribute('mask') || '');

      if (!prevKey) {
        id = child.getAttribute('id');
        prevKey = key;
        ds = [shapeToPath(child)];
        i -= 1;
        count -= 1;
      }
      else if (prevKey === key) {
        ds.push(shapeToPath(child));
        i -= 1;
        count -= 1;
      }
      else {
        el.insertBefore(
          createPath(prevKey.split('|'), ds.join(''), id),
          child
        );
        prevKey = key;
        ds = [shapeToPath(child)];
      }

      el.removeChild(child);
    }
    else if (ds && ds.length) {
      el.insertBefore(
        createPath(prevKey.split('|'), ds.join(''), id),
        child
      );
      i += 1;
      count += 1;
      prevKey = null;
      ds = null;
    }

    if (REGEX.GROUP.test(child.nodeName)) {
      merge(child, idCounter);
    }
  }

  if (ds && ds.length) {
    el.appendChild(createPath(key.split('|'), ds.join(''), id));
  }
}

module.exports = merge;
