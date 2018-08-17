const mongoose = require('mongoose');
const keys = require("./../../config/keys.js");

mongoose.Promise = global.Promise;

if (process.env.NODE_ENV === 'production') {
	mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true });
} else {
	mongoose.connect(keys.mongoURI, { useNewUrlParser: true });
}


module.exports = {
	mongoose
};