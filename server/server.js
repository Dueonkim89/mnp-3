let env = process.env.NODE_ENV;
console.log(env);

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');

const { mongoose } = require('./mongoDB/mongoose');
const { Todo } = require('./models/todo');
const { User } = require('./models/user');
const { authenticate } = require('./middleware');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.get('/users/me', authenticate, (req, res) => {
	res.send(req.user);
});

app.get('/todos', (req, res) => {
	
	Todo.find().then((todos) => {
		res.send({todos});
	}, (error) => {
		res.status(404).send(error);
	});	
	
});

// GET/todos/id
app.get('/todos/:id', (req, res) => {
	const id = req.params.id;

	Todo.findById(id).then(data => {
		if (!data) {
			res.status(404).send();
		}
		
		res.send({data});
	}).catch((error) => res.status(400).send());	
		
});

app.post('/todos', (req, res) => {
	//console.log(req.body);
	console.log(req.body);
	var todo = new Todo({
		text: req.body.text
	});
	
	todo.save().then( (todo) => {
		res.send(todo);
	}, (error) => {
		res.status(404).send(error);
	});
	
});

// delete the specific todo
app.delete('/todos/:id', (req, res) => {
	const id = req.params.id;

	Todo.findByIdAndRemove(id).then(data => {
		if (!data) {
			return res.status(404).send();
		}
		
		res.status(200).send({data});
	}).catch((error) => res.status(400).send());	
		
});

app.listen(port, () => {
	console.log(`listening on port ${port}`);
});

app.patch('/todos/:id', (req,res) => {
	const id = req.params.id;
	//const body = _.pick(req.body, ['text', 'completed']);
	
	const {text, completed} = req.body;
	const body = {completed};
	
	if (text) {
		body.text = text;
	}
	
	if (typeof(completed) === 'boolean' && completed) {
		body.completedAt = new Date().getTime();
	} else {
		body.completed = false;
		body.completedAt = null;
	}
	
	Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then(todo => {
		if (!todo) {
			return res.status(404).send();
		}
		
		res.send({todo});
	}).catch(error => {
		res.status(400).send();
	});
});

app.post('/users', (req, res) => {
	const {email, password} = req.body;
	const user = new User({
		email,
		password
	});
	
	user.save().then( () => {
		return user.generateAuthToken();
	}).then((token) => {
		res.header('x-auth', token).send(user);
	}).catch((error) => {
		res.status(400).send(error);
	});
	
});


module.exports = {
	app
};










