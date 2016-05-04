var compressor = {
  browser: require('./lib/compressor_browser'),
  node: require('./lib/compressor_node')
};

module.exports = compressor;