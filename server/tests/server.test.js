const expect = require('expect');
const request = require('supertest');

const { app } = require('./../server');
const { Todo } = require('./../models/todo');

const todos = [
{text: 'First test todo'},
{text: 'Second test todo', completed: true, completedAt: 333}
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

describe('GET /todos/:id', () => {
	it('should retrieve the specific todo', (done) => {

		Todo.find().then((todos) => {
			const id = todos[0]._id;
			const text = todos[0].text;
			
			request(app)
			.get(`/todos/${id}`)
			.expect(200)
			.expect((res) => {
				expect(res.body.data.text).toBe(text);
			})		
			.end(done);			
		});				
	});	
});

describe('PATCH /todos/:id', () => {
	it('should update the todo', (done) => {
		Todo.find().then((todos) => {
			const firstTodo = todos[0];
			const firstID = firstTodo._id;
			const firstOption = {text: 'qwerty asdfg', completed: true};			
		
			request(app)
				.patch(`/todos/${firstID}`)
				.send(firstOption)
				.expect(200)
				.expect((res) => {
					expect(res.body.todo.text).toBe(firstOption.text);
					expect(res.body.todo.completed).toBe(true);
					expect(typeof(res.body.todo.completedAt)).toBe('number');
				})
				.end(done);	
		});	
	});
	
	it('should clear completedAt when todo is not completed', (done) => {
		Todo.find().then((todos) => {
			const secondTodo = todos[1];
			const secondID = secondTodo._id;
			const secondOption = {text: 'qwerty asdfg', completed: false};			
		
			request(app)
				.patch(`/todos/${secondID}`)
				.send(secondOption)
				.expect(200)
				.expect((res) => {
					expect(res.body.todo.text).toBe(secondOption.text);
					expect(res.body.todo.completed).toBe(false);
					expect(res.body.todo.completedAt).toBe(null);
				})
				.end(done);	
		});			
	});	
	
});

describe('DELETE /todos/:id', () => {
	it('should remove a todo', (done) => {
		Todo.find().then((todos) => {
			const id = todos[0]._id;
			const text = todos[0].text;
			
			request(app)
			.delete(`/todos/${id}`)
			.expect(200)
			.expect((res) => {
				expect(res.body.data.text).toBe(text);
			})		
			.end((err, res) => {
				if (err) {
					return done(err);
				}
				Todo.findByIdAndRemove(id).then((todo) => {
					expect(todo).toNotExist();
					done();
				}).catch((error) => done(err));
				
			});			
		});				
	});	
});



