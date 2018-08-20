const { Todo } = require('./../models/todo');
const { User } = require('./../models/user');
const jwt = require('jsonwebtoken');

const userOneID = "5b79f0bbdc0e2f31d48cb747";
const userTwoID = "5b79f0bbdc0e2f31d48cb748"

const users = [{
	_id: userOneID,
	email: '8hourarmday@gmail.com',
	password: 'password1',
	tokens: [{
		access: 'auth',
		token: jwt.sign({_id: userOneID, access: 'auth'}, 'abc123').toString()
	}]
}, {
	_id: userTwoID,
	email: '10mealsaday@gmail.com',
	password: 'password2'
}];

const populateUsers = (done) => {
	User.remove({}).then(() => {
		var userOne = new User(users[0]).save();
		var userTwo = new User(users[1]).save();
		return Promise.all([userOne, userTwo]);			
	}).then( () => done() );
};

const todos = [
{text: 'First test todo'},
{text: 'Second test todo', completed: true, completedAt: 333}
];

const populateTodos = (done) => {
	Todo.remove({}).then(() => {
		return Todo.insertMany(todos);
	}).then( () => done());
};

module.exports = {populateTodos, populateUsers, todos, users};