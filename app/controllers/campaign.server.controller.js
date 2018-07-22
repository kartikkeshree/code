
var log = require('../components/logs.js');
var campaign = require('./campaign.server.controller');
var config = require('../components/config.js');
var errorHandler = require('./errors.server.controller'),
        //Blog = mongoose.model('Blog'),
        _ = require('lodash');
var validate = require('../components/validation.js');

exports.getPatientByDentist = function (req, res) {
    try {
        req.getConnection(function (err, connection) {
            if (err) {
                log.appendError(err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                var sql = 'SELECT u.first_name,u.last_name,u.id,u.email,u.contact_no FROM user AS u ' +
                        'JOIN appointment AS app ON u.id = app.user_id ' +
                        'JOIN clinic AS c ON c.id = app.clinic_id ' +
                        'JOIN doctor AS d ON d.id = c.doctor_id WHERE doctor_id = ? AND u.role_id = 5 GROUP BY u.id ' +
                        'UNION ' +
                        'SELECT u.first_name,u.last_name,u.id,u.email,u.contact_no ' +
                        'FROM user AS u WHERE u.created_by = ? AND u.role_id = 5 GROUP BY u.id';
                var qry = connection.query(sql, [req.body.doctor_id, req.body.doctor_id], function (err, rows) {
                    console.log(qry.sql);
                    if (err) {
                        log.appendError(err);
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    } else {
                        res.json(rows);
                    }
                });
            }
        })
    } catch (e) {
        log.appendError(e);
        return res.status(400).send({
            message: errorHandler.getErrorMessage(e)
        });
    }
}

exports.addCampaign = function (req, res) {
    try {
        if (req.body) {
            validate.campaignValidation(req, function (err, value) {
                if (err) {
                    log.appendError(value);
                    return res.status(400).send({message: value});
                } else {
                    campaign.checkSmsPackageAvailableOrNot(req, res, function (err, val) {
                        if (err) {
                            log.appendError(val);
                            return res.status(400).send({message: val});
                        } else {
                            console.log(val);
                            var patientValues = [];
                            var patientCampValues = '';
                            if (req.body.patients) {
                                for (var i = 0; i < req.body.patients.length; i++) {
                                    patientCampValues += (i == 0) ? '' : ',';
                                    patientCampValues += req.body.patients[i];
                                    patientValues.push(req.body.patients[i]);
                                }
                            }
                            var data = {};
                            var date = new Date();
                            req.body.created_date = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes();
                            req.body.patients = patientCampValues;
                            delete req.body.user_id;
                            delete req.body.id;
                            var sql = '';
                            if (req.body.type == 'Sms') {
                                sql = 'Select u.contact_no FROM user as u where u.id in (?)';
                            } else {
                                sql = 'Select u.email FROM user as u where u.id in (?)';
                            }
                            req.getConnection(function (err, connection) {
                                if (err) {
                                    log.appendError(err);
                                    return res.status(400).send({
                                        message: errorHandler.getErrorMessage(err)
                                    });
                                } else {
                                    var qry = connection.query(sql, [patientValues], function (err, rows) {
                                        console.log(qry.sql);
                                        if (err) {
                                            log.appendError(err);
                                            return res.status(400).send({
                                                message: errorHandler.getErrorMessage(err)
                                            });
                                        } else {
                                            console.log("controller " + JSON.stringify(rows));

                                            campaign.insertCampaign(req, res, rows.length, req.body.type, function (err, val) {
                                                if (err) {
                                                    log.appendError(err);
                                                    return res.status(400).send({
                                                        message: errorHandler.getErrorMessage(err)
                                                    });
                                                } else {
                                                    if (req.body.type == 'Sms') {
                                                        config.sendSmsToSelectedUser(req, res, rows, req.body.sms_email_txt);
                                                        res.json({message: 'Sms sent successfully'});
                                                    } else {
                                                        config.sendEmailToSelectedUser(res, rows, req.body.sms_email_txt);
                                                        res.json({message: 'Email sent successfully'});
                                                    }
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        } else {
            return res.status(400).send({
                message: "Body cannot empty"
            });
        }

    } catch (e) {
        log.appendError(e);
        return res.status(400).send({
            message: errorHandler.getErrorMessage(e)
        });
    }

};

exports.insertCampaign = function (req, res, cnt, type, callback) {
    try {
        req.getConnection(function (err, connection) {
            if (err) {
                log.appendError(err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                var qry1 = connection.query('INSERT INTO campaign SET ?', req.body, function (err, rows) {
                    if (err) {
                        log.appendError(err);
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    } else {
                        var qry = connection.query('UPDATE package SET sent = (sent + ?) WHERE doctor_id = ? and type = ? and status = "Approved"'
                                , [cnt, req.body.doctor_id, type], function (err, row) {
                            console.log(qry.sql);
                            if (err) {
                                log.appendError(err);
                                return res.status(400).send({
                                    message: errorHandler.getErrorMessage(err)
                                });
                            } else {
                                callback(false, rows);
                            }
                        })

                    }
                });
            }
        });
    } catch (e) {
        log.appendError(e);
        return res.status(400).send({
            message: errorHandler.getErrorMessage(e)
        });
    }
}

exports.listCampaignByDentist = function (req, res) {
    try {
        var searchCondition = '';
        var paramArr = [];
        paramArr.push(req.body.doctor_id);
        console.log(req.body);
        if (req.body.searchVal != '' && req.body.searchVal) {
            searchCondition = 'AND ('
            var searchTxt = req.body.searchVal.split(' ');
            for (var i = 0; i < searchTxt.length; i++) {
                searchCondition += (i == 0) ? '' : ' OR ';
                searchCondition += '((name like ?))';
                paramArr.push('%' + searchTxt[i] + '%');
            }
            searchCondition += ')';
        }
        var sql = 'SELECT id,created_date,name,type,' +
                'LENGTH(patients) - LENGTH( REPLACE(patients, ",","") ) + 1 as cnt ' +
                'FROM campaign where doctor_id = ? ' + searchCondition + ' order by id desc ';
        req.getConnection(function (err, connection) {
            if (err) {
                log.appendError(err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                var qry = connection.query(sql, paramArr, function (err, rows) {
                    console.log(qry.sql);
                    if (err) {
                        log.appendError(err);
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    } else {
                        res.json(rows);
                    }
                });
            }
        });
    } catch (e) {
        log.appendError(e);
        return res.status(400).send({
            message: errorHandler.getErrorMessage(e)
        });
    }
}

exports.checkSmsPackageAvailableOrNot = function (req, res, callback) {
    try {
        if (req.body.type == 'Sms') {
            req.getConnection(function (err, connection) {
                if (err) {
                    log.appendError(err);
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    var qry = 'SELECT (allocated - sent) as remaining FROM package where doctor_id = ? AND type = "Sms" AND status !="Pending" HAVING remaining > 0 ';
                    var sql = connection.query(qry, req.body.doctor_id, function (err, rows) {
                        console.log(sql.sql);
                        if (err) {
                            log.appendError(err);
                            return res.status(400).send({
                                message: errorHandler.getErrorMessage(err)
                            });
                        } else {
                            if (rows.length > 0) {
                                if (rows[0].remaining > 0 && rows[0].remaining >= req.body.patients.length) {
                                    callback(false, 'Success');
                                } else if (rows[0].remaining > 0 && rows[0].remaining < req.body.patients.length) {
                                    callback(true, 'You have only ' + rows[0].remaining + ' SMS to send');
                                } else {
                                    callback(true, 'You don\'t have any SMS package, Please request for SMS package ');
                                }
                            } else {
                                callback(true, 'You don\'t have any SMS package, Please request for SMS package');
                            }
                        }
                    })
                }
            });
        } else {
            callback(false, 'Success');
        }
    } catch (e) {
        log.appendError(e);
        return res.status(400).send({
            message: errorHandler.getErrorMessage(e)
        });
    }
}
