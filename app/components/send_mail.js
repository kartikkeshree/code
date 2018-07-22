'use strict';
// create reusable transporter object using SMTP transport
var config = require('./config.js');
var errLog = require('./logs.js');
// NB! No need to recreate the transporter object. You can use
// the same transporter object for all e-mails

exports.sendMail = function(mailOptions, resp) {
	try {
		var nodemailer = require('nodemailer');
		var email = config.getAdminEmail();
		var pass = config.getAdminPassword();
		var transporter = nodemailer.createTransport({
			service : 'Gmail',
			auth : {
				user : email,
				pass : pass
			}
		});

		transporter.sendMail(mailOptions, function(error, info) {
			if (error) {
				console.log(error);
				errLog.appendError(error);
				resp = error;
			} else {
				console.log('Message sent: ' + info.response);
				resp = info.response;
			}
		});
	} catch (e) {
		// TODO: handle exception
		errLog.appendError(e.stack);
	}
};
