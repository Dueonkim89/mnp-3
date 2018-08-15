const expect = require('expect');
const request = require('supertest');

const { app } = require('./../server');
const { Todo } = require('./../models/todo');

const todos = [
{text: 'First test todo'},
{text: 'Second test todo'}
];


beforeEach((done) => {
	Todo.remove({}).then(() => {
		return Todo.insertMany(todos);
	}).then( () => done());
});

describe('POST /todos', () => {
	it('should create a new todo', (done) => {
		var text = 'Test this POST route';
		
		request(app)
			.post('/todos')
			.send({text})
			.expect(200)
			.expect((res) => {
				expect(res.body.text).toBe(text);
			})
			.end((err,res) => {
				if (err) {
					return done(err);
				}
				
				Todo.find({text}).then((todos) => {
					expect(todos.length).toBe(1);
					expect(todos[0].text).toBe(text);
					done();
				}).catch((error) => done(error));
			});
	});
	
	it('should not create todo with invalid body data', (done) => {
		request(app)
			.post('/todos')
			.send({})
			.expect(404)
			.end((err,res) => {
				if (err) {
					return done(err);
				}
				
				Todo.find().then((todos) => {
					expect(todos.length).toBe(2);
					done();
				}).catch((error) => done(error));				
			});
	});
});


describe('GET /todos', () => {
	it('should retrieve the todo collection', (done) => {
		request(app)
			.get('/todos')
			.expect(200)
			.expect((res) => {
				expect(res.body.todos.length).toBe(2);
			})		
			.end(done);
	});
});







