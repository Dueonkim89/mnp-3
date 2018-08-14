const mongoose = require('mongoose');
const keys = require("../../config/keys.js");

mongoose.Promise = global.Promise;
mongoose.connect(keys.mongoURI, { useNewUrlParser: true });

module.exports = {
	mongoose
};