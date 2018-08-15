const express = require('express');
const bodyParser = require('body-parser');

const { mongoose } = require('./mongoDB/mongoose');
const { Todo } = require('./models/todo');
const { User } = require('./models/user');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

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










