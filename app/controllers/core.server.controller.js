'use strict';

var errorHandler = require('./errors.server.controller'),
        _ = require('lodash');
var logs = require('../components/logs.js');
/**
 * Module dependencies.
 */
/*exports.index = function(req, res) {
 console.log('aaaaaaaaa'+req.user);
 res.render('index', {
 user: req.user || null,
 request: req
 });
 };*/
exports.index = function (req, res) {
    if (req.session != undefined) {
        return res.json(req.session.user);
    } else {
        res.render('index', {
            user: req.user || null,
            request: req
        });
    }
};
exports.index1 = function (req, res) {
    if (req.session != undefined) {
        return res.json(req.session.user);
    } else {
        return res.json({message: 'false'});
    }
};
exports.addEvent = function (req, msg, user, userType) {
    req.getConnection(function (err, connection) {
        var userName = user;
        var inputStr = userName + ' ' + msg;
        if (!isNaN(user))
        {
            if (userType && userType == 'doctor')
            {
                var userQry = "SELECT user.first_name FROM user JOIN doctor ON user.id = doctor.user_id WHERE doctor.id = ?";
            } else {
                var userQry = "SELECT first_name FROM user WHERE id = ?";
            }
            var qry = connection.query(userQry, user, function (err, rows) {
                console.log(qry.sql);
                if (err) {
                    console.log(err);
                    console.log({message: errorHandler.getErrorMessage(err)});
                } else {
                    if (rows.length > 0)
                        userName = ((userType && userType == 'doctor') ? 'Dr. ' : '') + rows[0].first_name;

                    inputStr = userName + ' ' + msg;
                    var qry1 = connection.query('INSERT INTO activity (message) VALUES (?)', inputStr, function (err, rows1) {
                        console.log(qry1.sql);
                        if (err) {
                            console.log(err);
                            console.log({message: errorHandler.getErrorMessage(err)});
                        } else {
                            console.log({message: "Event added successfully"});
                        }
                    });
                }
            });
        } else {
            var qry = connection.query('INSERT INTO activity (message) VALUES (?)', inputStr, function (err, rows) {
                console.log(qry.sql);
                if (err) {
                    console.log(err);
                    console.log({message: errorHandler.getErrorMessage(err)});
                } else {
                    console.log({message: "Event added successfully"});
                }
            });
        }
    });
};

exports.listActivity = function (req, res) {
    req.getConnection(function (err, connection) {
        var qry = connection.query('SELECT id, message FROM activity ORDER BY id DESC limit 20', function (err, rows) {
            console.log(qry.sql);
            if (err) {
                console.log(err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.json({'data': rows});
            }
        });
    });
}