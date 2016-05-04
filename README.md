# SVG Shape Nodes Compressor

## Usage

### Browser

Make sure browserify or webpack or any module loader you like is set up properly. The all-in-one bundle is not provided by now.

```js
var svgShapeCompressor = require('svg-shape-compressor/lib/compressor_browser');
var svg = document.getElementsByTagName('svg')[0];

// The svg reference will be modified
svgShapeCompressor(svg);
```

### Node

Use cheerio to parse the SVG DOM. Just pass in the whole SVG as a string.

```js
var fs = require('fs');
var svgShapeCompressor = require('svg-shape-compressor/lib/compressor_node');
var svgString = fs.readFileSync('file_path.svg');

var compressedSvgString = svgShapeCompressor(svgString);
```
