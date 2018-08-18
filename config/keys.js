if (process.env.NODE_ENV === 'production') {
  module.exports = require('./prod.js');
} else if (process.env.NODE_ENV === 'test') {
	module.exports = require('./test.js');
} else {
  module.exports = require('./dev.js');
}