var REGEX = require('./constants').REGEX;

/**
 * Illustrator never exports <line> with transform property.
 * Just convert the start and end point is fine.
 */
function lineToPath(line) {
  var x1 = parseFloat(line.getAttribute('x1'));
  var y1 = parseFloat(line.getAttribute('y1'));
  var x2 = parseFloat(line.getAttribute('x2'));
  var y2 = parseFloat(line.getAttribute('y2'));

  var d = 'M' + x1;
  d += (y1 < 0 ? y1 : ','+y1) + 'L' + x2;
  d += y2 < 0 ? y2 : ','+y2;
  return d;
}

function rectToPath(rect) {
  var w = parseFloat(rect.getAttribute('width'));
  var h = parseFloat(rect.getAttribute('height'))
  var l = parseFloat(rect.getAttribute('x')) || 0;
  var t = parseFloat(rect.getAttribute('y')) || 0;
  var r = l + w;
  var b = t + h;

  var d = 'M' + l;
  d += (t < 0 ? t : ','+t) + 'L' + r;
  d += t < 0 ? t : ','+t;
  d += r < 0 ? r : ','+r;
  d += b < 0 ? b : ','+b;
  d += l < 0 ? l : ','+l;
  d += b < 0 ? b : ','+b;
  d += 'Z';
  // TODO: handle transform

  return d;
}

function circleToPath(circle){
  var cx = parseFloat(circle.getAttribute('cx'));
  var cy = parseFloat(circle.getAttribute('cy'));
  var r = parseFloat(circle.getAttribute('r'));
  // TODO: handle transform
  return 'M '+cx+' '+cy+' m -'+r+', 0 a '+r+','+r+' 0 1,0 '+(r*2)+',0 a '+r+','+r+' 0 1,0 -'+(r*2)+',0Z';
}

function ellipseToPath(ellipse) {
  var cx = parseFloat(ellipse.getAttribute('cx'));
  var cy = parseFloat(ellipse.getAttribute('cy'));
  var rx = parseFloat(ellipse.getAttribute('rx'));
  var ry = parseFloat(ellipse.getAttribute('ry'));
  // TODO: handle transform
  return 'M' + (cx-rx) + ' ' + cy
    + 'A' + rx + ' ' + ry + ' 0 1 0 ' + (cx+rx) + ' ' + cy
    + 'A' + rx + ' ' + ry + ' 0 1 0 ' + (cx-rx) + ' ' + cy
    + 'Z';
}

function polygonToPath(polygon) {
  var points = polygon.getAttribute('points').trim().split(/\s*,\s*|\s+/);
  var d = 'M' + points[0];
  d += (points[1] < 0 ? points[1] : ','+points[1]) + 'L';

  points = points.slice(2);
  for (var i = 0; i < points.length; i += 2) {
    d += points[i] + (points[i+1] < 0 ? points[i+1] : ','+points[i+1]);
    if (points[i+2] >= 0) d += ' ';
  }

  d += 'Z';

  return d
}

function polylineToPath(polyline) {

}

/**
 * Convert an SVG shape to the drawing commands <path> uses.
 * @param {SVGDOM} shape - An SVG DOM node
 * @return {string} - A string used for the d property of <path>
 */
function shapeToPath(shape) {
  var nodeName = shape.nodeName;
  if (REGEX.SHAPE.RECT.test(nodeName)) return rectToPath(shape);
  else if (REGEX.SHAPE.LINE.test(nodeName)) return lineToPath(shape);
  else if (REGEX.SHAPE.CIRCLE.test(nodeName)) return circleToPath(shape);
  else if (REGEX.SHAPE.ELLIPSE.test(nodeName)) return ellipseToPath(shape);
  else if (REGEX.SHAPE.POLYGON.test(nodeName)) return polygonToPath(shape);
  else if (REGEX.SHAPE.POLYLINE.test(nodeName)) return polylineToPath(shape);
  else if (REGEX.SHAPE.PATH.test(nodeName)) {
    return shape
      .getAttribute('d')
      .replace(/[\r\n]/mg, '')
      .replace(/\s+/g, ' ');
  }
}

module.exports = shapeToPath;
