'use strict';

var errorHandler = require('./errors.server.controller'),
        _ = require('lodash');
var logs = require('../components/logs.js');
var validate = require('../components/validation.js');
/**
 * Module dependencies.
 */
exports.saveChatMessage = function (req, res) {
    try {
        validate.chatMessageValidate(req, res, function (err, value) {
            if (err) {
                console.log("error" + value);
                res.status(400).send({message: value});
            } else {
                req.getConnection(function (err, connection) {
                    var current_date = new Date();
                    var currentDate = current_date.getFullYear() + '-' + (parseInt(current_date.getMonth()) + 1) + '-' + current_date.getDate() + ' ' + current_date.getHours() + ':' + current_date.getMinutes() + ':' + current_date.getSeconds();
                    var data = {
                        from_id: req.body.client,
                        to_id: (req.body.clientNext) ? req.body.clientNext : 0,
                        date_time: currentDate,
                        message: req.body.message,
                    };

                    var qry = connection.query('INSERT INTO chat_message SET ?', data, function (err, rows) {
                        console.log(qry.sql);
                        if (err) {
                            console.log(err);
                            return res.status(400).send({
                                message: errorHandler.getErrorMessage(err)
                            });
                        } else {
                            res.json({'data': {message: ['Message sent successfully']}});
                        }
                    });
                });
            }
        });
    } catch (e) {
        console.log(e);
        logs.appendError(e.stack);
    }
}

exports.getGroupMessage = function (req, res) {
    try {
        req.getConnection(function (err, connection) {
            var qry = connection.query('SELECT c.from_id, CONCAT(u.first_name, " ", u.last_name) AS user, u.image, c.date_time AS date, c.message AS text FROM chat_message AS c JOIN user AS u ON c.from_id = u.id WHERE to_id = 0 ORDER BY date_time ASC LIMIT 50', function (err, rows) {
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

    } catch (e) {
        console.log(e);
        logs.appendError(e.stack);
    }
}

exports.getPersonalMessage = function (req, res) {
    try {
        req.getConnection(function (err, connection) {
            var qry = connection.query('SELECT c.from_id, CONCAT(u.first_name, " ", u.last_name) AS user, u.image, c.date_time AS date, c.message AS text FROM chat_message AS c JOIN user AS u ON c.from_id = u.id WHERE (to_id = ? AND from_id = ?) OR (to_id = ? AND from_id = ?) ORDER BY date_time ASC LIMIT 50', [req.body.clientTo, req.body.clientFrom, req.body.clientFrom, req.body.clientTo], function (err, rows) {
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
    } catch (e) {
        console.log(e);
        logs.appendError(e.stack);
    }
}