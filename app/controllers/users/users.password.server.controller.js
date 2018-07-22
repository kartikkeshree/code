'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	errorHandler = require('../errors.server.controller'),
	//mongoose = require('mongoose'),
	passport = require('passport'),
	//User = mongoose.model('User'),
	config = require('../../../config/config'),
	nodemailer = require('nodemailer'),
	async = require('async'),
    user_model=require('../../models/user.server.model'),
    send = require('../../components/send_mail'),
	crypto = require('crypto');
var validate = require('../../components/validation.js');

/**
 * Forgot for reset password (forgot POST)
 */
exports.forgot = function(req, res, next) {
	if (req.body.forgotEmail) {
		try {
			var validateEmail=validate.emailValidation(req.body.forgotEmail);
			if(validateEmail!=true){
				res.status(400).send({message:[validateEmail]});
				return false;
			}
				var val = req.getConnection(function (err, connection) {
					var query = connection.query("select first_name,last_name from user where email=?",
						[req.body.forgotEmail], function (err, rows) {
							console.log(query.sql);
							if (err) {
								console.log(err);
								res.send({
									message: ['No account with that username has been found']
								});
							} else {
								if (rows.length > 0) {
									var stringPass = randomString();
									var encryptPassword = user_model.generateHash(stringPass);
									console.log(encryptPassword);
									var query1 = connection.query("update user set password=? where email=?", [encryptPassword, req.body.forgotEmail], function (err, rows1) {
										if (err) {
											res.send({
												message: ['No account with that username has been found']
											});
										} else {
											rows.password = stringPass;
											var htmlBody = "Dear " + rows[0].first_name + " "
												+ rows[0].last_name + "<br><br>"

												+ "Your new password is  <h5>" + rows.password+"</h5>"
												+ "<br>Best Regards,<br>DoctorHere";

											var mailOptions = {
												from : 'Caprium  <caprium.test@gmail.com>',
												to : req.body.forgotEmail,
												subject : 'Forgot Password',
												html : htmlBody
											};
											send.sendMail(mailOptions, res);
											res.send({
												message: ['An email has been sent to ' + req.body.forgotEmail + ' please check.']
											});
										}
									});
								}
								else {
									return res.status(400).send({
										message: ['No account with that email has been found']
									});
								}
						}
					});
				});
			}catch (e) {
				logs.appendError(e.stack);
				callback(err, 0);
			}
	} else {
		return res.status(400).send({
			message: ['Email field must not be blank']
		});
	}
}

/**
 * Reset password GET from email token
 */
exports.validateResetToken = function(req, res) {
	/*User.findOne({
		resetPasswordToken: req.params.token,
		resetPasswordExpires: {
			$gt: Date.now()
		}
	}, function(err, user) {
		if (!user) {
			return res.redirect('/#!/password/reset/invalid');
		}

		res.redirect('/#!/password/reset/' + req.params.token);
	});*/
};

/**
 * Reset password POST from email token
 */
exports.reset = function(req, res, next) {
	// Init Variables
	var passwordDetails = req.body;

	async.waterfall([

		function(done) {/*
			User.findOne({
				resetPasswordToken: req.params.token,
				resetPasswordExpires: {
					$gt: Date.now()
				}
			}, function(err, user) {
				if (!err && user) {
					if (passwordDetails.newPassword === passwordDetails.verifyPassword) {
						user.password = passwordDetails.newPassword;
						user.resetPasswordToken = undefined;
						user.resetPasswordExpires = undefined;

						user.save(function(err) {
							if (err) {
								return res.status(400).send({
									message: errorHandler.getErrorMessage(err)
								});
							} else {
								req.login(user, function(err) {
									if (err) {
										res.status(400).send(err);
									} else {
										// Return authenticated user 
										res.json(user);

										done(err, user);
									}
								});
							}
						});
					} else {
						return res.status(400).send({
							message: 'Passwords do not match'
						});
					}
				} else {
					return res.status(400).send({
						message: 'Password reset token is invalid or has expired.'
					});
				}
			});*/
		},
		function(user, done) {
			res.render('templates/reset-password-confirm-email', {
				name: user.displayName,
				appName: config.app.title
			}, function(err, emailHTML) {
				done(err, emailHTML, user);
			});
		},
		// If valid email, send reset email using service
		function(emailHTML, user, done) {
			var smtpTransport = nodemailer.createTransport(config.mailer.options);
			var mailOptions = {
				to: user.email,
				from: config.mailer.from,
				subject: 'Your password has been changed',
				html: emailHTML
			};

			smtpTransport.sendMail(mailOptions, function(err) {
				done(err, 'done');
			});
		}
	], function(err) {
		if (err) return next(err);
	});
};

/**
 * Change Password
 */
/*exports.changePassword = function(req, res) {
	// Init Variables
	var passwordDetails = req.body;
    console.log(passwordDetails);

	*//*if (req.user) {*//*
		if (passwordDetails.newpass) {
            req.getConnection(function(err,connection){
                connection.query("select * from user where id=? ",req.body.id, function(err, user) {
                    if (!err && user) {
                        if (user.authenticate(passwordDetails.curPassword)) {
                            if (passwordDetails.newPass === passwordDetails.cpass) {
                                user.password = passwordDetails.newPassword;
                                user.save(function(err) {
                                    if (err) {
                                        return res.status(400).send({
                                            message: errorHandler.getErrorMessage(err)
                                        });
                                    } else {
                                        req.login(user, function(err) {
                                            if (err) {
                                                res.status(400).send(err);
                                            } else {
                                                res.send({
                                                    message: 'Password changed successfully'
                                                });
                                            }
                                        });
                                    }
                                });
                            } else {
                                res.status(400).send({
                                    message: 'Passwords do not match'
                                });
                            }
                        } else {
                            res.status(400).send({
                                message: 'Current password is incorrect'
                            });
                        }
                    } else {
                        res.status(400).send({
                            message: 'User is not found'
                        });
                    }
                });
            });

		} else {
			res.status(400).send({
				message: 'Please provide a new password'
			});
		}
	*//*} else {
		res.status(400).send({
			message: 'User is not signed in'
		});
	}*//*
};*/

function randomString() {
	var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	var result = '';
	for (var i = 6; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
	return result;
}
