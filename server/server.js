const express = require('express');
const bodyParser = require('body-parser');

const { mongoose } = require('./mongoDB/mongoose');
const { Todo } = require('./models/todo');
const { User } = require('./models/user');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

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
	
	var todo = new Todo({
		text: req.body.text
	});
	
	todo.save().then( (todo) => {
		res.send(todo);
	}, (error) => {
		res.status(404).send(error);
	});
	
});

app.listen(port, () => {
	console.log(`listening on port ${port}`);
});


module.exports = {
	app
};










