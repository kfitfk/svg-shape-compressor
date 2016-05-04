
exports.REGEX = {
  ID: {
    TEXT: /^t/,
    IMAGE: /^i/,
    COLOR: /^c/,
  },
  SHAPE: {
    ALL: /^(?:rect|line|circle|ellipse|polygon|polyline|path)$/i,
    RECT: /^rect$/i,
    LINE: /^line$/i,
    CIRCLE: /^circle$/i,
    ELLIPSE: /^ellipse$/i,
    POLYGON: /^polygon$/i,
    POLYLINE: /^polyline$/i,
    PATH: /^path$/i
  },
  GROUP: /^g$/i
};