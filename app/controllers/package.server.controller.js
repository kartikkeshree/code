
var log = require('../components/logs.js');
var campaign = require('./campaign.server.controller');
var config = require('../components/config.js');
var errorHandler = require('./errors.server.controller'),
        //Blog = mongoose.model('Blog'),
        _ = require('lodash');
var validate = require('../components/validation.js');

exports.getAllPackageByDentist = function (req, res) {
    try {
        req.getConnection(function (err, connection) {
            if (err) {
                log.appendError(err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                var searchCondition = '';
                var paramArr = [];
                if (req.body.searchVal)
                {
                    var sArr = req.body.searchVal.split(' ');
                    searchCondition += " AND (";
                    for (var i = 0; i < sArr.length; i++) {
                        searchCondition += (i == 0) ? "" : " OR ";
                        searchCondition += ' ((u.first_name like ?) OR (u.last_name like ?))';
                        paramArr.push('%' + sArr[i] + '%', '%' + sArr[i] + '%');
                    }
                    if (req.body.doctor_id > 0) {
                        searchCondition += ") and d.id =? ";
                        paramArr.push(req.body.doctor_id);
                    } else {
                        searchCondition += ") ";
                    }
                } else {
                    if (req.body.doctor_id > 0) {
                        searchCondition += " AND d.id = ?";
                        paramArr.push(req.body.doctor_id);
                    }
                }

                var sql = 'SELECT u.first_name,u.last_name,u.id as user_id,d.id as doctor_id,u.email,p.allocated,p.sent, ' +
                        '(p.allocated - p.sent) as remaining,p.start_date,p.end_date,p.status,p.id ' +
                        'FROM user AS u JOIN doctor as d ON u.id = d.user_id ' +
                        'JOIN package AS p ON p.doctor_id = d.id where type = "Sms" ' + searchCondition + '';
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
        })
    } catch (e) {
        log.appendError(e);
        return res.status(400).send({
            message: errorHandler.getErrorMessage(e)
        });
    }
}


exports.smsPackageRequest = function (req, res) {
    try {
        validate.validateSmsPackageRequest(req, function (err, value) {
            if (err) {
                //log.appendError(err);
                return res.status(400).send({message:value});
            } else {
                req.getConnection(function (err, connection) {
                    if (err) {
                        log.appendError(err);
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    } else {
                        console.log(req.body);
                        var curDate =new Date();
                        req.body.created_date =  curDate.getFullYear() + '-' + (parseInt(curDate.getMonth()) + 1) + '-' + curDate.getDate()+' '+curDate.getHours()+':'+curDate.getMinutes()+':'+curDate.getSeconds();
                        req.body.start_date = getDateSqlFormat(req.body.start_date);
                        req.body.status = 'Pending';
                        req.body.end_date = getDateSqlFormat(req.body.end_date);
                        req.body.type = 'Sms';
                        
                        delete req.body.id;
                        delete req.body.user_id;
                        
                        var sql = "INSERT into package set ?";
                        var qry = connection.query(sql, req.body, function (err, rows) {
                            if (err) {
                                log.appendError(err);
                                return res.status(400).send({
                                    message: errorHandler.getErrorMessage(err)
                                });
                            } else {
                                res.json({message:"Request sent successfully"});
                            }
                        });
                    }
                })
            }

        });

    } catch (e) {
        log.appendError(e);
        return res.status(400).send({
            message: errorHandler.getErrorMessage(e)
        });
    }
}

exports.changePackageStatus = function (req, res) {
    try {
        req.getConnection(function (err, connection) {
            if (err) {
                log.appendError(err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                console.log(req.body);

                var sql = "UPDATE package SET  status = ? WHERE id = ?";
                var qry = connection.query(sql, [req.body.status, req.body.id], function (err, rows) {
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

function getDateSqlFormat(dt) {
    var date = "0000-00-00 00:00";
    if (dt != undefined) {
        var str = dt.split('/');//mdy/ymd
        var date = str[2] + '-' + str[0] + '-' + str[1];
    }
    return date;
}
