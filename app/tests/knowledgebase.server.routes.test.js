'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Knowledgebase = mongoose.model('Knowledgebase'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, knowledgebase;

/**
 * Knowledgebase routes tests
 */
describe('Knowledgebase CRUD tests', function() {
	beforeEach(function(done) {
		// Create user credentials
		credentials = {
			username: 'username',
			password: 'password'
		};

		// Create a new user
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: credentials.username,
			password: credentials.password,
			provider: 'local'
		});

		// Save a user to the test db and create new Knowledgebase
		user.save(function() {
			knowledgebase = {
				name: 'Knowledgebase Name'
			};

			done();
		});
	});

	it('should be able to save Knowledgebase instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Knowledgebase
				agent.post('/knowledgebases')
					.send(knowledgebase)
					.expect(200)
					.end(function(knowledgebaseSaveErr, knowledgebaseSaveRes) {
						// Handle Knowledgebase save error
						if (knowledgebaseSaveErr) done(knowledgebaseSaveErr);

						// Get a list of Knowledgebases
						agent.get('/knowledgebases')
							.end(function(knowledgebasesGetErr, knowledgebasesGetRes) {
								// Handle Knowledgebase save error
								if (knowledgebasesGetErr) done(knowledgebasesGetErr);

								// Get Knowledgebases list
								var knowledgebases = knowledgebasesGetRes.body;

								// Set assertions
								(knowledgebases[0].user._id).should.equal(userId);
								(knowledgebases[0].name).should.match('Knowledgebase Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Knowledgebase instance if not logged in', function(done) {
		agent.post('/knowledgebases')
			.send(knowledgebase)
			.expect(401)
			.end(function(knowledgebaseSaveErr, knowledgebaseSaveRes) {
				// Call the assertion callback
				done(knowledgebaseSaveErr);
			});
	});

	it('should not be able to save Knowledgebase instance if no name is provided', function(done) {
		// Invalidate name field
		knowledgebase.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Knowledgebase
				agent.post('/knowledgebases')
					.send(knowledgebase)
					.expect(400)
					.end(function(knowledgebaseSaveErr, knowledgebaseSaveRes) {
						// Set message assertion
						(knowledgebaseSaveRes.body.message).should.match('Please fill Knowledgebase name');
						
						// Handle Knowledgebase save error
						done(knowledgebaseSaveErr);
					});
			});
	});

	it('should be able to update Knowledgebase instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Knowledgebase
				agent.post('/knowledgebases')
					.send(knowledgebase)
					.expect(200)
					.end(function(knowledgebaseSaveErr, knowledgebaseSaveRes) {
						// Handle Knowledgebase save error
						if (knowledgebaseSaveErr) done(knowledgebaseSaveErr);

						// Update Knowledgebase name
						knowledgebase.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Knowledgebase
						agent.put('/knowledgebases/' + knowledgebaseSaveRes.body._id)
							.send(knowledgebase)
							.expect(200)
							.end(function(knowledgebaseUpdateErr, knowledgebaseUpdateRes) {
								// Handle Knowledgebase update error
								if (knowledgebaseUpdateErr) done(knowledgebaseUpdateErr);

								// Set assertions
								(knowledgebaseUpdateRes.body._id).should.equal(knowledgebaseSaveRes.body._id);
								(knowledgebaseUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Knowledgebases if not signed in', function(done) {
		// Create new Knowledgebase model instance
		var knowledgebaseObj = new Knowledgebase(knowledgebase);

		// Save the Knowledgebase
		knowledgebaseObj.save(function() {
			// Request Knowledgebases
			request(app).get('/knowledgebases')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Knowledgebase if not signed in', function(done) {
		// Create new Knowledgebase model instance
		var knowledgebaseObj = new Knowledgebase(knowledgebase);

		// Save the Knowledgebase
		knowledgebaseObj.save(function() {
			request(app).get('/knowledgebases/' + knowledgebaseObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', knowledgebase.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Knowledgebase instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Knowledgebase
				agent.post('/knowledgebases')
					.send(knowledgebase)
					.expect(200)
					.end(function(knowledgebaseSaveErr, knowledgebaseSaveRes) {
						// Handle Knowledgebase save error
						if (knowledgebaseSaveErr) done(knowledgebaseSaveErr);

						// Delete existing Knowledgebase
						agent.delete('/knowledgebases/' + knowledgebaseSaveRes.body._id)
							.send(knowledgebase)
							.expect(200)
							.end(function(knowledgebaseDeleteErr, knowledgebaseDeleteRes) {
								// Handle Knowledgebase error error
								if (knowledgebaseDeleteErr) done(knowledgebaseDeleteErr);

								// Set assertions
								(knowledgebaseDeleteRes.body._id).should.equal(knowledgebaseSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Knowledgebase instance if not signed in', function(done) {
		// Set Knowledgebase user 
		knowledgebase.user = user;

		// Create new Knowledgebase model instance
		var knowledgebaseObj = new Knowledgebase(knowledgebase);

		// Save the Knowledgebase
		knowledgebaseObj.save(function() {
			// Try deleting Knowledgebase
			request(app).delete('/knowledgebases/' + knowledgebaseObj._id)
			.expect(401)
			.end(function(knowledgebaseDeleteErr, knowledgebaseDeleteRes) {
				// Set message assertion
				(knowledgebaseDeleteRes.body.message).should.match('User is not logged in');

				// Handle Knowledgebase error error
				done(knowledgebaseDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Knowledgebase.remove().exec();
		done();
	});
});