'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Clinic = mongoose.model('Clinic'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, clinic;

/**
 * Clinic routes tests
 */
describe('Clinic CRUD tests', function() {
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

		// Save a user to the test db and create new Clinic
		user.save(function() {
			clinic = {
				name: 'Clinic Name'
			};

			done();
		});
	});

	it('should be able to save Clinic instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Clinic
				agent.post('/clinics')
					.send(clinic)
					.expect(200)
					.end(function(clinicSaveErr, clinicSaveRes) {
						// Handle Clinic save error
						if (clinicSaveErr) done(clinicSaveErr);

						// Get a list of Clinics
						agent.get('/clinics')
							.end(function(clinicsGetErr, clinicsGetRes) {
								// Handle Clinic save error
								if (clinicsGetErr) done(clinicsGetErr);

								// Get Clinics list
								var clinics = clinicsGetRes.body;

								// Set assertions
								(clinics[0].user._id).should.equal(userId);
								(clinics[0].name).should.match('Clinic Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Clinic instance if not logged in', function(done) {
		agent.post('/clinics')
			.send(clinic)
			.expect(401)
			.end(function(clinicSaveErr, clinicSaveRes) {
				// Call the assertion callback
				done(clinicSaveErr);
			});
	});

	it('should not be able to save Clinic instance if no name is provided', function(done) {
		// Invalidate name field
		clinic.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Clinic
				agent.post('/clinics')
					.send(clinic)
					.expect(400)
					.end(function(clinicSaveErr, clinicSaveRes) {
						// Set message assertion
						(clinicSaveRes.body.message).should.match('Please fill Clinic name');
						
						// Handle Clinic save error
						done(clinicSaveErr);
					});
			});
	});

	it('should be able to update Clinic instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Clinic
				agent.post('/clinics')
					.send(clinic)
					.expect(200)
					.end(function(clinicSaveErr, clinicSaveRes) {
						// Handle Clinic save error
						if (clinicSaveErr) done(clinicSaveErr);

						// Update Clinic name
						clinic.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Clinic
						agent.put('/clinics/' + clinicSaveRes.body._id)
							.send(clinic)
							.expect(200)
							.end(function(clinicUpdateErr, clinicUpdateRes) {
								// Handle Clinic update error
								if (clinicUpdateErr) done(clinicUpdateErr);

								// Set assertions
								(clinicUpdateRes.body._id).should.equal(clinicSaveRes.body._id);
								(clinicUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Clinics if not signed in', function(done) {
		// Create new Clinic model instance
		var clinicObj = new Clinic(clinic);

		// Save the Clinic
		clinicObj.save(function() {
			// Request Clinics
			request(app).get('/clinics')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Clinic if not signed in', function(done) {
		// Create new Clinic model instance
		var clinicObj = new Clinic(clinic);

		// Save the Clinic
		clinicObj.save(function() {
			request(app).get('/clinics/' + clinicObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', clinic.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Clinic instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Clinic
				agent.post('/clinics')
					.send(clinic)
					.expect(200)
					.end(function(clinicSaveErr, clinicSaveRes) {
						// Handle Clinic save error
						if (clinicSaveErr) done(clinicSaveErr);

						// Delete existing Clinic
						agent.delete('/clinics/' + clinicSaveRes.body._id)
							.send(clinic)
							.expect(200)
							.end(function(clinicDeleteErr, clinicDeleteRes) {
								// Handle Clinic error error
								if (clinicDeleteErr) done(clinicDeleteErr);

								// Set assertions
								(clinicDeleteRes.body._id).should.equal(clinicSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Clinic instance if not signed in', function(done) {
		// Set Clinic user 
		clinic.user = user;

		// Create new Clinic model instance
		var clinicObj = new Clinic(clinic);

		// Save the Clinic
		clinicObj.save(function() {
			// Try deleting Clinic
			request(app).delete('/clinics/' + clinicObj._id)
			.expect(401)
			.end(function(clinicDeleteErr, clinicDeleteRes) {
				// Set message assertion
				(clinicDeleteRes.body.message).should.match('User is not logged in');

				// Handle Clinic error error
				done(clinicDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Clinic.remove().exec();
		done();
	});
});