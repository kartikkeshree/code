'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
        errorHandler = require('../errors.server.controller.js'),
        passport = require('passport');
//User = mongoose.model('User');
var config = require('../../components/config.js');
var logs = require('../../components/logs.js');
var send = require('../../components/send_mail');
var validate = require('../../components/validation.js');


var multiparty = require('multiparty'), //To save file type
        //uuid = require('node-uuid'), //To create GUID of file name
        fs = require('fs');


/**
 * Update user details
 */
exports.update = function (req, res) {
    var user = req.body;
    var display_name = req.body.display_name;
    var imageUpdated = req.body.imageUpdate;
    var editOnlyImage = req.body.editOnlyImage;
    console.log(editOnlyImage);
    delete req.body.display_name;
    delete req.body.imageUpdate;
    delete req.body.editOnlyImage;
    delete req.body.user_id;
    delete req.body.doctor_id;
    console.log(req.body);
    var message = null;
    try {
        /* var validateUser = validate.updateUserValidate(req,res,function(err, value) {
         if (err) {
         console.log("error");
         res.status(400).send(value);
         } else {*/
        var errVal = false;
        var value1 = '';
        if (!editOnlyImage) {
            var validateUser = validate.updateUserValidate(req, res, function (err, value) {
                if (err) {
                    console.log("error");
                    value1 = value;
                    errVal = true;
                }
            });
        }
        req.getConnection(function (err, connection) {
            //delete req.body.email;
            var query = connection.query(
                    "update user set ? where id=? ",
                    [req.body, req.body.id], function (err, rows) {
                console.log(query.sql);
                if (err) {
                    console.log("err");
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    if (imageUpdated) {
                        var source = fs.createReadStream(appRoot + '/../public/images/profile_images/tmp/' + req.body.image),
                                destination = fs.createWriteStream(appRoot + '/../public/images/profile_images/' + req.body.image);
                        source.pipe(destination, {end: false});
                        source.on("end", function () {
                            fs.unlink(appRoot + '/../public/images/profile_images/tmp/' + req.body.image);
                        });
                        source.on('close', function () {
                            console.log("Upload Finished");
                        });
                    }
                    user.display_name = req.body.first_name + ' ' + req.body.last_name;
                    console.log(errVal + '  ' + value1);
                    if (errVal) {
                        res.status(400).send(value1);
                    } else {
                        res.json(user);
                    }

                }
            });
        });

        /*}
         });*/
    } catch (e) {
        console.log(e);
    }

    // For security measurement we remove the roles from the req.body object
    /*	delete req.body.roles;
     
     if (user) {
     // Merge existing user
     user = _.extend(user, req.body);
     user.updated = Date.now();
     user.displayName = user.firstName + ' ' + user.lastName;
     
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
     res.json(user);
     }
     });
     }
     });
     } else {
     res.status(400).send({
     message: 'User is not signed in'
     });
     }*/
};

/**
 * Send User
 */
exports.me = function (req, res) {
    console.log('PPPPPPPPP' + JSON.stringify(req.user));
    res.json(req.user || null);
};

exports.sendContact = function (req, res) {

    try {
        var validateUser = validate.contactUsValidate(req, res, function (err, value) {
            if (err) {
                console.log("error");
                res.status(400).send(value);
            } else {
                var htmlBody = "Hello  Admin, <br/>" + req.body.first_name + " " + req.body.last_name + " want to contact with you.<br>"
                        + "Message is - " + req.body.message + "<br>"
                        + "Contact number-" + req.body.contact_no + "<br><br>"
                        + "<br>Best Regards,<br>DoctorHere";
                var mailOptions = {
                    from: 'Caprium  <caprium.test@gmail.com>',
                    to: 'Caprium  <caprium.test@gmail.com>',
                    subject: 'Message from ' + req.body.first_name + " " + req.body.last_name,
                    html: htmlBody
                };
                send.sendMail(mailOptions, res);
                res.json({status: true, desc: "Message sent successfully"});
            }
        });

    } catch (e) {
        console.log(e);
        logs.appendError(e.stack);
    }
}

exports.getTempUrl = function (req, res) {
    console.log('getTempURL');
    var form = new multiparty.Form();
    form.parse(req, function (err, fields, files) {
        var file = files.file[0];
        var contentType = file.headers['content-type'];
        var tmpPath = file.path;
        var extIndex = tmpPath.lastIndexOf('.');
        var extension = (extIndex < 0) ? '' : tmpPath.substr(extIndex);
        var destPath = appRoot + '/../public/images/profile_images/tmp/' + fields.data[0] + extension;
        // Server side file type checker.
        if (contentType !== 'image/png' && contentType !== 'image/jpeg') {
            fs.unlink(tmpPath);
            return res.status(400).send('Unsupported file type.');
        }

        var is = fs.createReadStream(tmpPath);
        var os = fs.createWriteStream(destPath);

        if (is.pipe(os)) {
            fs.unlink(tmpPath, function (err) { //To unlink the file from temp path after copy
                if (err) {
                    console.log(err);
                }
            });
            is.on('close', function () {
                console.log("Upload Finished");
            });
            return res.json(fields.data[0] + extension);
        } else
            return res.json('File not uploaded');
    });
}

exports.saveImage = function (req, res) {
    var form = new multiparty.Form();
    form.parse(req, function (err, fields, files) {

        var file = files.file[0];
        var contentType = file.headers['content-type'];
        var tmpPath = file.path;
        console.log(tmpPath);
        var extIndex = tmpPath.lastIndexOf('.');
        var extension = (extIndex < 0) ? '' : tmpPath.substr(extIndex);
        var destPath = appRoot + '/../public/images/profile_images/' + fields.data[0] + extension;
        // Server side file type checker.
        if (contentType !== 'image/png' && contentType !== 'image/jpeg') {
            fs.unlink(tmpPath);
            return res.status(400).send('Unsupported file type.');
        }

        var is = fs.createReadStream(tmpPath);
        var os = fs.createWriteStream(destPath);

        if (is.pipe(os)) {
            fs.unlink(tmpPath, function (err) { //To unlink the file from temp path after copy
                if (err) {
                    console.log(err);
                }
            });
            return res.json(destPath);
        } else
            return res.json('File not uploaded');
    });

}
