'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Dentist = mongoose.model('Dentist'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, dentist;

/**
 * Dentist routes tests
 */
describe('Dentist CRUD tests', function() {
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

		// Save a user to the test db and create new Dentist
		user.save(function() {
			dentist = {
				name: 'Dentist Name'
			};

			done();
		});
	});

	it('should be able to save Dentist instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Dentist
				agent.post('/dentists')
					.send(dentist)
					.expect(200)
					.end(function(dentistSaveErr, dentistSaveRes) {
						// Handle Dentist save error
						if (dentistSaveErr) done(dentistSaveErr);

						// Get a list of Dentists
						agent.get('/dentists')
							.end(function(dentistsGetErr, dentistsGetRes) {
								// Handle Dentist save error
								if (dentistsGetErr) done(dentistsGetErr);

								// Get Dentists list
								var dentists = dentistsGetRes.body;

								// Set assertions
								(dentists[0].user._id).should.equal(userId);
								(dentists[0].name).should.match('Dentist Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Dentist instance if not logged in', function(done) {
		agent.post('/dentists')
			.send(dentist)
			.expect(401)
			.end(function(dentistSaveErr, dentistSaveRes) {
				// Call the assertion callback
				done(dentistSaveErr);
			});
	});

	it('should not be able to save Dentist instance if no name is provided', function(done) {
		// Invalidate name field
		dentist.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Dentist
				agent.post('/dentists')
					.send(dentist)
					.expect(400)
					.end(function(dentistSaveErr, dentistSaveRes) {
						// Set message assertion
						(dentistSaveRes.body.message).should.match('Please fill Dentist name');
						
						// Handle Dentist save error
						done(dentistSaveErr);
					});
			});
	});

	it('should be able to update Dentist instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Dentist
				agent.post('/dentists')
					.send(dentist)
					.expect(200)
					.end(function(dentistSaveErr, dentistSaveRes) {
						// Handle Dentist save error
						if (dentistSaveErr) done(dentistSaveErr);

						// Update Dentist name
						dentist.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Dentist
						agent.put('/dentists/' + dentistSaveRes.body._id)
							.send(dentist)
							.expect(200)
							.end(function(dentistUpdateErr, dentistUpdateRes) {
								// Handle Dentist update error
								if (dentistUpdateErr) done(dentistUpdateErr);

								// Set assertions
								(dentistUpdateRes.body._id).should.equal(dentistSaveRes.body._id);
								(dentistUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Dentists if not signed in', function(done) {
		// Create new Dentist model instance
		var dentistObj = new Dentist(dentist);

		// Save the Dentist
		dentistObj.save(function() {
			// Request Dentists
			request(app).get('/dentists')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Dentist if not signed in', function(done) {
		// Create new Dentist model instance
		var dentistObj = new Dentist(dentist);

		// Save the Dentist
		dentistObj.save(function() {
			request(app).get('/dentists/' + dentistObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', dentist.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Dentist instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Dentist
				agent.post('/dentists')
					.send(dentist)
					.expect(200)
					.end(function(dentistSaveErr, dentistSaveRes) {
						// Handle Dentist save error
						if (dentistSaveErr) done(dentistSaveErr);

						// Delete existing Dentist
						agent.delete('/dentists/' + dentistSaveRes.body._id)
							.send(dentist)
							.expect(200)
							.end(function(dentistDeleteErr, dentistDeleteRes) {
								// Handle Dentist error error
								if (dentistDeleteErr) done(dentistDeleteErr);

								// Set assertions
								(dentistDeleteRes.body._id).should.equal(dentistSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Dentist instance if not signed in', function(done) {
		// Set Dentist user 
		dentist.user = user;

		// Create new Dentist model instance
		var dentistObj = new Dentist(dentist);

		// Save the Dentist
		dentistObj.save(function() {
			// Try deleting Dentist
			request(app).delete('/dentists/' + dentistObj._id)
			.expect(401)
			.end(function(dentistDeleteErr, dentistDeleteRes) {
				// Set message assertion
				(dentistDeleteRes.body.message).should.match('User is not logged in');

				// Handle Dentist error error
				done(dentistDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Dentist.remove().exec();
		done();
	});
});