'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport');

module.exports = function(app) {
	// User Routes
	var users = require('../../app/controllers/users.server.controller');

	// Setting up the users profile api
	app.route('/users/me').get(users.me);
	app.route('/users').post(users.update);
	app.route('/users/accounts').delete(users.removeOAuthProvider);

    app.route('/sendContact').post(users.sendContact);
	// Setting up the users password api
	//app.route('/users/password').post(users.changePassword);
	app.route('/auth/forgot').post(users.forgot);
	app.route('/auth/reset/:token').get(users.validateResetToken);
	app.route('/auth/reset/:token').post(users.reset);

	// Setting up the users authentication api
	app.route('/auth/signup').post(users.signup);
	//app.route('rest/auth/signup').post(res.auth,users.signup);

	app.route('/auth/signin').post(users.signin);
	app.route('/auth/signout').get(users.signout);

	// Setting the facebook oauth routes
	app.route('/auth/facebook').get(passport.authenticate('facebook', {
		scope: ['email']
	}));
	app.route('/auth/facebook/callback').get(users.oauthCallback('facebook'));

	// Setting the twitter oauth routes
	app.route('/auth/twitter').get(passport.authenticate('twitter'));
	app.route('/auth/twitter/callback').get(users.oauthCallback('twitter'));

	// Setting the google oauth routes
	app.route('/auth/google').get(passport.authenticate('google', {
		scope: [
			'https://www.googleapis.com/auth/userinfo.profile',
			'https://www.googleapis.com/auth/userinfo.email'
		]
	}));
	app.route('/auth/google/callback').get(users.oauthCallback('google'));

	// Setting the linkedin oauth routes
	app.route('/auth/linkedin').get(passport.authenticate('linkedin'));
	app.route('/auth/linkedin/callback').get(users.oauthCallback('linkedin'));

	// Setting the github oauth routes
	app.route('/auth/github').get(passport.authenticate('github'));
	app.route('/auth/github/callback').get(users.oauthCallback('github'));

	// Finish by binding the user middleware
	app.param('userId', users.userByID);

	//added by developer
	app.route('/isActivatedViaEmail').post(users.userVerification);
	//To get Temp URL of uploaded image
	app.route('/getTempUrlImage').post(users.getTempUrl);
	//To Save user image
	app.route('/userImage').post(users.saveImage);

	app.route('/addNewMember').post(users.addNewMember);
	app.route('/getMember').post(users.getMember);
	app.route('/selectMember').post(users.selectMember);
	app.route('/auth/checkToken').post(users.checkToken);
	app.route('/auth/getToken').post(users.getToken);
};
