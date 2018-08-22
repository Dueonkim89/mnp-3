const expect = require('expect');
const request = require('supertest');

const { app } = require('./../server');
const { Todo } = require('./../models/todo');
const { User } = require('./../models/user');
const {populateTodos, populateUsers, todos, users} = require('./seed');


beforeEach(populateTodos);
beforeEach(populateUsers);


describe('POST /todos', () => {
	it('should create a new todo', (done) => {
		var text = 'Test this POST route';
		
		request(app)
			.post('/todos')		
			.set('x-auth', users[0].tokens[0].token)			
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
			.set('x-auth', users[0].tokens[0].token)
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
			.set('x-auth', users[0].tokens[0].token)
			.expect(200)
			.expect((res) => {
				expect(res.body.todos.length).toBe(1);
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
			.set('x-auth', users[0].tokens[0].token)
			.expect(200)
			.expect((res) => {
				expect(res.body.data.text).toBe(text);
			})		
			.end(done);			
		});				
	});	
	
	it('should not retrieve a todo doc from other user', (done) => {
		Todo.find().then((todos) => {
			const id = todos[1]._id;
			const text = todos[0].text;
			
			request(app)
			.get(`/todos/${id}`)
			.set('x-auth', users[0].tokens[0].token)
			.expect(404)	
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
				.set('x-auth', users[0].tokens[0].token)
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
				.set('x-auth', users[1].tokens[0].token)
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
			.set('x-auth', users[0].tokens[0].token)
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


describe('GET /users/me', () => {
	it('should return user if authenticated', (done) => {
		request(app)
			.get('/users/me')
			.set('x-auth', users[0].tokens[0].token)
			.expect(200)
			.expect( (res) => {
				expect(res.body._id).toBe(users[0]._id);
				expect(res.body.email).toBe(users[0].email);
			})
			.end(done);
	});	
	
	it('should return 401 if not authenticated', (done) => {
		request(app)
			.get('/users/me')
			.expect(401)
			.expect( (res) => {
				expect(res.body).toEqual({});
			})
			.end(done);		
	});		
});

describe('POST /users', () => {
	it('should create a user', (done) => {
		const email = 'example@example.com';
		const password = '123abc';
		request(app)
			.post('/users')	
			.send({email, password})
			.expect(200)
			.expect( (res) => {
				expect(res.headers['x-auth']).toBeTruthy();
				expect(res.body._id).toBeTruthy();
				expect(res.body.email).toBe(email);
			})			
			.end((error) => {
				if (error) {
					return done(error);
				}
				User.findOne({email}).then((user) => {
					expect(user).toBeTruthy();
					expect(user.password).not.toBe(password);
					done();
				});				
			});
	});
		
	it('should return validation errors if request invalid', (done) => {
		//400
		const email = 'zyzz';
		const password = '123abc';
		request(app)
			.post('/users')	
			.send({email, password})
			.expect(400)		
			.end(done);		
	});	
		
	it('should not create user if email in use', (done) => {
		const email = users[0].email;
		const password = '123abc';
		request(app)
			.post('/users')	
			.send({email, password})
			.expect(400)		
			.end(done);			
	});				
});

describe('POST /users/login', () => {
	it('should login user and return auth token', (done) => {
		const email = users[1].email;
		const password = users[1].password;
		request(app)
			.post('/users/login')
			.send({email, password})
			.expect(200)
			.expect( (res) => {
				expect(res.headers['x-auth']).toBeTruthy();
			})
			.end((error, response) => {
				if (error) {
					return done(error);
				}
				User.findById(users[1]._id).then((user) => {
					expect(user.tokens[0].access).toBe('auth');
					expect(user.tokens[1].token).toBe(response.headers['x-auth']);			
					done();
				}).catch((error) => done(error));
			});
	});

	it('should reject invalid login', (done) => {
		const email = users[1].email;
		const password = 'popcorn';
		request(app)
			.post('/users/login')
			.send({email, password})
			.expect(400)
			.expect( (res) => {
				expect(res.headers['x-auth']).not.toBeTruthy();
			})		
			.end((error, response) => {
				if (error) {
					return done(error);
				}
				User.findById(users[1]._id).then((user) => {
					expect(user.tokens[0]).toBeTruthy();
					done();
				}).catch((error) => done(error));
			});		
	});		
});

describe('DELETE /users/me/token', () => {
	it('should remove auth token on logout', (done) => {
		const token = users[0].tokens[0].token;
		request(app)
			.delete('/users/me/token')
			.set('x-auth', token)
			.expect(200)
			.end((error, response) => {
				if (error) {
					return done(error);
				}
				User.findById(users[0]._id).then((user) => {
					expect(user.tokens[0]).not.toBeTruthy();
					done();
				}).catch((error) => done(error));			
			});
	});							
});