const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const keys = require('./../../config/keys');

const UserSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
		minlength: 1,
		trim: true,
		unique: true,
		validate: {
			validator: value => validator.isEmail(value),
			message: props => `${props.value} is not a valid email!`
		}
	},
	password: {
		type: String,
		required: true,
		minlength: 6		
	},
	tokens: [{
		access: {
			type: String,
			required: true
		},
		token: {
			type: String,
			required: true		
		}
	}]
});

UserSchema.methods.toJSON = function() {
	var user = this;
	var userObject = user.toObject();
	var {_id, email} = userObject;
	return {_id, email};
};

UserSchema.methods.generateAuthToken = function () {
	var user = this;
	var access = 'auth';
	var token = jwt.sign({_id: user._id.toHexString(), access}, keys.JWT_SECRET).toString();
	user.tokens = user.tokens.concat([{access, token}]);
	return user.save().then(() => {return token});		
};

UserSchema.methods.removeToken = function (token) {
	var user = this;
	return user.update({
		$pull: {
			tokens: { token }
		}
	});	
};

UserSchema.statics.findByToken = function (token) {
	var User = this;
	var decoded;
	
	try {
		decoded = jwt.verify(token, keys.JWT_SECRET);
	} catch(error) {
		return Promise.reject();
	}
	
	return User.findOne({
		'_id': decoded._id,
		'tokens.token': token,
		'tokens.access': 'auth'
	});
};

UserSchema.statics.findByCredentials = function (email, password) {
	var User = this;
	return User.findOne({email}).then((user) => {
		if (!user) {
			return Promise.reject();
		}
		return new Promise((resolve, reject) => {
			bcrypt.compare(password, user.password, (err, match) => {
				if (match) {
					resolve(user);
				} else {
					reject();
				}
			});		
		});		
	});
};

UserSchema.pre('save', function(next) {
	var user = this;
	
	if (user.isModified('password')) {
		bcrypt.genSalt(10, (err, salt) => {
			bcrypt.hash(user.password, salt, (error, hash) => {
				user.password = hash;
				next();
			});
		});		
	} else {
		next();
	}
});

const User = mongoose.model('User', UserSchema);

module.exports = {
	User
}