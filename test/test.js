var fs = require('fs');
var path = require('path');
var assert = require('assert');
var svgStr = fs.readFileSync(path.join(__dirname, 'sample_files', 'many_nodes.svg'), { encoding: 'utf-8' });
var compress = require('../lib/compressor_node');

var str = compress(svgStr);
fs.writeFileSync(path.join(__dirname, 'output.svg'), str);