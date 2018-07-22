'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Knowledgebase = mongoose.model('Knowledgebase');

/**
 * Globals
 */
var user, knowledgebase;

/**
 * Unit tests
 */
describe('Knowledgebase Model Unit Tests:', function() {
	beforeEach(function(done) {
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: 'username',
			password: 'password'
		});

		user.save(function() { 
			knowledgebase = new Knowledgebase({
				name: 'Knowledgebase Name',
				user: user
			});

			done();
		});
	});

	describe('Method Save', function() {
		it('should be able to save without problems', function(done) {
			return knowledgebase.save(function(err) {
				should.not.exist(err);
				done();
			});
		});

		it('should be able to show an error when try to save without name', function(done) { 
			knowledgebase.name = '';

			return knowledgebase.save(function(err) {
				should.exist(err);
				done();
			});
		});
	});

	afterEach(function(done) { 
		Knowledgebase.remove().exec();
		User.remove().exec();

		done();
	});
});