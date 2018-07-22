'use strict';

/**
 * Module dependencies.
 */

var errorHandler = require('./errors.server.controller'),
        _ = require('lodash');

var multiparty = require('multiparty'), //To save file type
        fs = require('fs');
var logs = require('../components/logs.js');
var validate = require('../components/validation.js');
var coreCont = require('./core.server.controller');


exports.create = function (req, res) {
    try {
        validate.addEventValidation(req, res, function (err, value) {
            if (err) {
                console.log("error" + value);
                res.status(400).send({message: value});
            } else {
                var current_date = new Date();
                var start_date = new Date(req.body.start_date + ' ' + req.body.start_time);
                var end_date = new Date(req.body.end_date + ' ' + req.body.end_time);
                var created_date = current_date.getFullYear() + '-' + (parseInt(current_date.getMonth()) + 1) + '-' + current_date.getDate() + ' ' + current_date.getHours() + ':' + current_date.getMinutes() + ':' + current_date.getSeconds();
                var start_sqlDate = start_date.getFullYear() + '-' + (parseInt(start_date.getMonth()) + 1) + '-' + start_date.getDate() + ' ' + start_date.getHours() + ':' + start_date.getMinutes() + ':' + start_date.getSeconds();
                var end_sqlDate = end_date.getFullYear() + '-' + (parseInt(end_date.getMonth()) + 1) + '-' + end_date.getDate() + ' ' + end_date.getHours() + ':' + end_date.getMinutes() + ':' + end_date.getSeconds();

                var data = {
                    user_id: req.body.user_id,
                    title: req.body.title,
                    description: req.body.description,
                    address: req.body.address,
                    start_datetime: start_sqlDate,
                    end_datetime: end_sqlDate,
                    create_date: created_date,
                    status: 'Pending'
                };
                if (req.body.isImage && req.body.isImage == true)
                {
                    data.image = req.body.image;
                }
                req.getConnection(function (err, connection) {
                    var qry = connection.query('INSERT INTO event SET ?', data, function (err, rows) {
                        console.log(qry.sql);
                        if (err) {
                            console.log(err);
                            return res.status(400).send({
                                message: errorHandler.getErrorMessage(err)
                            });
                        } else {
                            if (rows.affectedRows) {
                                if (req.body.isImage && req.body.isImage == true)
                                {
                                    var source = fs.createReadStream(appRoot + '/../public/images/event_images/tmp/' + req.body.image),
                                            destination = fs.createWriteStream(appRoot + '/../public/images/event_images/' + req.body.image);
                                    source.pipe(destination, {end: false});
                                    source.on("end", function () {
                                        fs.unlink(appRoot + '/../public/images/event_images/tmp/' + req.body.image);
                                    });
                                    source.on('close', function () {
                                        console.log("Upload Finished");
                                    });
                                }
                                res.json({message: "Event added successfully"});
                            } else {
                                res.json({message: "Error occured while processing your request"});
                            }
                        }
                    });
                });
            }
        });
    } catch (e) {
        console.log(e);
        logs.appendError(e.stack);
    }
};

exports.list = function (req, res) {
    try {
        req.getConnection(function (err, connection) {
            var searchCondition = '';
            var userCondition = '';
            var paramArr = [];
            if(req.body.role_id != 1)
            {
               userCondition = ' AND user_id = ' + req.body.doctor_id + ' ';
            }
            if (req.body.searchVal)
            {
                var sArr = req.body.searchVal.split(' ');
                searchCondition += " AND (";
                for (var i = 0; i < sArr.length; i++) {
                    searchCondition += (i == 0) ? "" : " OR ";
                    searchCondition += ' (description like ? OR title like ? OR address like ?)';
                    paramArr.push('%' + sArr[i] + '%', '%' + sArr[i] + '%', '%' + sArr[i] + '%');
                }
                searchCondition += ") ";
            }

            //Pagination//
            if (req.body.page)
            {
                if (typeof req.body.page != 'object')
                {
                    req.body.page = JSON.parse(req.body.page);
                }
                var indexFrom = (req.body.page.page) ? req.body.page.page : 1;
                var countUpTo = (req.body.page.perPage) ? req.body.page.perPage : 10;
            } else {
                var indexFrom = 1;
                var countUpTo = 10;
            }
            //End//

            var qrr = connection.query('SELECT id,title,description,address,start_datetime,end_datetime,status, if(status != "Approved", "No", "Yes") AS eventStatus FROM event WHERE status != "Deleted" '+ userCondition +' ' + searchCondition + ' LIMIT ' + ((indexFrom - 1) * countUpTo) + ',' + countUpTo, paramArr, function (err, rows) {
                console.log(qrr.sql);
                if (err) {
                    console.log(err);
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    //res.json({'data': rows});
                    var totalQuery = connection.query('SELECT count(id) AS totalRes FROM event WHERE status != "Deleted" AND user_id = ' + req.body.doctor_id + ' ' + searchCondition, paramArr, function (err, totalrows) {
                        console.log('Pagination :-> ' + totalQuery.sql);
                        if (err) {
                            console.log(err);
                            return res.status(400).send({
                                message: errorHandler.getErrorMessage(err)
                            });
                        } else {
                            res.json({'data': rows, 'total': totalrows[0]});
                        }
                    });
                }
            });
        });
    } catch (e) {
        console.log(e);
        logs.appendError(e.stack);
    }
};

exports.delete = function (req, res) {
    try {
        req.getConnection(function (err, connection) {
            connection.query('UPDATE event SET status = ? WHERE id = ?', [req.body.status, req.body.id], function (err, rows) {
                if (err) {
                    console.log(err);
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    if (rows.affectedRows) {
                        //console.log(rows);
                        res.json({message: "Event "+req.body.status+" successfully"});
                    } else {
                        res.json({message: "No Events"});
                    }
                }
            });
        });
    } catch (e) {
        console.log(e);
        logs.appendError(e.stack);
    }
};

exports.getData = function (req, res) {
    try {
        req.getConnection(function (err, connection) {
            connection.query('SELECT user_id, title, description, address, start_datetime, end_datetime, image, status FROM event WHERE id = ?', req.body.id, function (err, rows) {
                if (err) {
                    console.log(err);
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    if (rows.length > 0) {
                        res.json(rows);
                    } else {
                        res.json({message: "No Event Found"});
                    }
                }
            });
        });
    } catch (e) {
        console.log(e);
        logs.appendError(e.stack);
    }
};


exports.update = function (req, res) {
    try {
        validate.addEventValidation(req, res, function (err, value) {
            if (err) {
                console.log("error" + value);
                res.status(400).send({message: value});
            } else {

                var start_date = new Date(req.body.start_date + ' ' + req.body.start_time);
                var end_date = new Date(req.body.end_date + ' ' + req.body.end_time);

                var start_sqlDate = start_date.getFullYear() + '-' + (parseInt(start_date.getMonth()) + 1) + '-' + start_date.getDate() + ' ' + start_date.getHours() + ':' + start_date.getMinutes() + ':' + start_date.getSeconds();
                var end_sqlDate = end_date.getFullYear() + '-' + (parseInt(end_date.getMonth()) + 1) + '-' + end_date.getDate() + ' ' + end_date.getHours() + ':' + end_date.getMinutes() + ':' + end_date.getSeconds();

                var data = {
                    title: req.body.title,
                    description: req.body.description,
                    address: req.body.address,
                    start_datetime: start_sqlDate,
                    end_datetime: end_sqlDate,
                    status: 'Pending'
                };

                if (req.body.isImage && req.body.isImage == true)
                {
                    data.image = req.body.image;
                }
                req.getConnection(function (err, connection) {
                    var qry = connection.query('UPDATE event SET ?  WHERE id = ?', [data, req.body.id], function (err, rows) {
                        console.log(qry.sql);
                        if (err) {
                            console.log(err);
                            return res.status(400).send({
                                message: errorHandler.getErrorMessage(err)
                            });
                        } else {
                            if (rows.affectedRows) {
                                if (req.body.isImage && req.body.isImage == true)
                                {
                                    var source = fs.createReadStream(appRoot + '/../public/images/event_images/tmp/' + req.body.image),
                                            destination = fs.createWriteStream(appRoot + '/../public/images/event_images/' + req.body.image);
                                    source.pipe(destination, {end: false});
                                    source.on("end", function () {
                                        fs.unlink(appRoot + '/../public/images/event_images/tmp/' + req.body.image);
                                    });
                                    source.on('close', function () {
                                        console.log("Upload Finished");
                                    });
                                }
                                res.json({message: "Event updated successfully"});
                            } else {
                                res.json({message: "Error occured while processing your request"});
                            }
                        }
                    });
                });
            }
        });
    } catch (e) {
        console.log(e);
        logs.appendError(e.stack);
    }
};

exports.listAllEvents = function (req, res) {
    try {
        var strStatus = '';
        if (req.body.dateOf && req.body.dateOf != '')
        {
            var current_date = new Date(req.body.dateOf);
            var compDate = current_date.getFullYear() + '-' + (parseInt(current_date.getMonth()) + 1) + '-' + current_date.getDate();
            if (req.body.status == 'my' && req.body.id) {
                strStatus = 'WHERE user_id = ' + req.body.id + ' AND ( (CAST("' + compDate + '" AS DATE)) BETWEEN CAST(start_datetime AS DATE) AND CAST(end_datetime AS DATE)) ';
            } else {
                strStatus = 'WHERE ( (CAST("' + compDate + '" AS DATE)) BETWEEN CAST(start_datetime AS DATE) AND CAST(end_datetime AS DATE)) ';
            }
        } else {
            var current_date = new Date();
            var compDate = current_date.getFullYear() + '-' + (parseInt(current_date.getMonth()) + 1) + '-' + current_date.getDate();

            if (req.body.status == 'upcoming') {
                strStatus = 'WHERE (CAST(start_datetime AS DATE)) >= (CAST("' + compDate + '" AS DATE)) ';
            } else if (req.body.status == 'past') {
                strStatus = 'WHERE (CAST(end_datetime AS DATE)) < (CAST("' + compDate + '" AS DATE)) ';
            } else if (req.body.status == 'my' && req.body.id) {
                strStatus = 'WHERE user_id = ' + req.body.id;
            } else {
                strStatus = 'WHERE ( (CAST("' + compDate + '" AS DATE)) BETWEEN CAST(start_datetime AS DATE) AND CAST(end_datetime AS DATE)) ';
            }
        }
        //Pagination//
        if (req.body.page)
        {
            if (typeof req.body.page != 'object')
            {
                req.body.page = JSON.parse(req.body.page);
            }
            var indexFrom = (req.body.page.page) ? req.body.page.page : 1;
            var countUpTo = (req.body.page.perPage) ? req.body.page.perPage : 10;
        } else {
            var indexFrom = 1;
            var countUpTo = 10;
        }
        //End//
        req.getConnection(function (err, connection) {
            var Qry = connection.query('SELECT id, title, description, address, end_datetime, start_datetime, image FROM event ' + strStatus + ' AND status = "Approved" ORDER BY start_datetime ASC LIMIT ' + ((indexFrom - 1) * countUpTo) + ',' + countUpTo, function (err, rows) {
                console.log(Qry.sql);
                if (err) {
                    console.log(err);
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    //res.json({'data': rows});
                    var totalQuery = connection.query('SELECT count(id) AS totalRes FROM event ' + strStatus + ' AND status = "Approved"', function (err, totalrows) {
                        console.log('Pagination :-> ' + totalQuery.sql);
                        if (err) {
                            console.log(err);
                            return res.status(400).send({
                                message: errorHandler.getErrorMessage(err)
                            });
                        } else {
                            res.json({'data': rows, 'total': totalrows[0]});
                        }
                    });
                }
            });
        });
    } catch (e) {
        console.log(e);
        logs.appendError(e.stack);
    }
};


exports.saveTempImage = function (req, res) {
    var form = new multiparty.Form();
    form.parse(req, function (err, fields, files) {
        var file = files.file[0];
        var contentType = file.headers['content-type'];
        var tmpPath = file.path;
        var extIndex = tmpPath.lastIndexOf('.');
        var extension = (extIndex < 0) ? '' : tmpPath.substr(extIndex);
        var destPath = appRoot + '/../public/images/event_images/tmp/' + fields.data[0] + extension;
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


function getDateSqlFormat(dt) {
    var date = "0000-00-00 00:00";
    if (dt != undefined) {
        var str = dt.split('/');//mdy/ymd
        var date = str[2] + '-' + str[0] + '-' + str[1];
    }
    return date;
}
