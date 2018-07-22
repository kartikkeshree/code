'use strict';

/**
 * Module dependencies.
 */
var errorHandler = require('./errors.server.controller'),
        //Appointment = mongoose.model('Appointment'),
        _ = require('lodash');

var sendsms = require('../components/sendsms.js');
var logs = require('../components/logs.js');
var config = require('../components/config.js');
var appointment = require('./appointments.server.controller');
var coreCont = require('./core.server.controller');
var validate = require('../components/validation.js');
/**
 * Create a Appointment
 */
exports.create = function (req, res) {
    /*	var appointment = new Appointment(req.body);
     appointment.user = req.user;
     
     appointment.save(function(err) {
     if (err) {
     return res.status(400).send({
     message: errorHandler.getErrorMessage(err)
     });
     } else {
     res.jsonp(appointment);
     }
     });*/
};

/**
 * Show the current Appointment
 */
exports.read = function (req, res) {
    /*res.jsonp(req.appointment);*/

};

/**
 * Update a Appointment
 */
exports.update = function (req, res) {/*
 var appointment = req.appointment ;
 
 appointment = _.extend(appointment , req.body);
 
 appointment.save(function(err) {
 if (err) {
 return res.status(400).send({
 message: errorHandler.getErrorMessage(err)
 });
 } else {
 res.jsonp(appointment);
 }
 });*/
};

/**
 * Delete an Appointment
 */
exports.delete = function (req, res) {/*
 var appointment = req.appointment ;
 
 appointment.remove(function(err) {
 if (err) {
 return res.status(400).send({
 message: errorHandler.getErrorMessage(err)
 });
 } else {
 res.jsonp(appointment);
 }
 });*/
};

/**
 * List of Appointments
 */
exports.list = function (req, res) {/*
 Appointment.find().sort('-created').populate('user', 'displayName').exec(function(err, appointments) {
 if (err) {
 return res.status(400).send({
 message: errorHandler.getErrorMessage(err)
 });
 } else {
 res.jsonp(appointments);
 }
 });*/
};

/**
 * Appointment middleware
 */
exports.appointmentByID = function (req, res, next, id) { /*
 Appointment.findById(id).populate('user', 'displayName').exec(function(err, appointment) {
 if (err) return next(err);
 if (! appointment) return next(new Error('Failed to load Appointment ' + id));
 req.appointment = appointment ;
 next();
 });*/
};

/**
 * Appointment authorization middleware
 */
exports.hasAuthorization = function (req, res, next) {/*
 if (req.appointment.user.id !== req.user.id) {
 return res.status(403).send('User is not authorized');
 }
 next();*/
};

exports.getAppointmentTimes = function (req, res) {

    //get available appointment time for the clinic for the week days

    req.getConnection(function (err, connection) {
        connection.query('SELECT ct.*,c.slot_diff FROM clinic_time as ct JOIN clinic as c ON c.id = ct.clinic_id WHERE ct.clinic_id=? order by days asc', req.body.clinic_id, function (err, rows) {
            if (err) {
                console.log(err);
                //logs.appendError(err.toString());
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                if (rows) {
                    console.log(JSON.stringify(rows));
                    res.json(rows);
                } else {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                }
            }
        });
    });
}

exports.getBookedAppointmentTimes = function (req, res) {
    console.log(JSON.stringify(req.body));
    var date = new Date(parseInt(req.body.date));
    console.log(date);
    var sqlDate = date.toISOString().slice(0, 19).replace('T', ' ');
    console.log(sqlDate);
    date.setDate(date.getDate() + 6);
    var sqlNext7Date = date.toISOString().slice(0, 19).replace('T', ' ');
    console.log(sqlNext7Date);
    console.log('SELECT app_time FROM appointment as app WHERE app.clinic_id=' + req.body.clinic_id + ' and ((CAST(app_time AS DATE) >=(CAST(' + sqlDate + ' AS DATE)) and (CAST(app_time AS DATE) <=CAST(' + sqlNext7Date + ' AS DATE))');
    // console.log('SELECT app_time FROM appointment as app WHERE app.clinic_id='+req.body.clinic_id+' and (CAST(app_time AS DATE) >='+sqlDate+' and CAST(app_time AS DATE) <='+sqlNext7Date+' ');

    //get booked appointment for seven day
    //get next 7 day from today
    req.getConnection(function (err, connection) {
        connection.query('SELECT app_time FROM appointment as app WHERE app.clinic_id=' + req.body.clinic_id + ' and (CAST(app_time AS DATE)>=CAST(? AS DATE)) and (CAST(app_time AS DATE) <= CAST(? as DATE) ) AND app.status!="Deleted" ', [sqlDate, sqlNext7Date], function (err, rows) {

            if (err) {
                console.log(err);
                //logs.appendError(err.toString());
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                if (rows) {
                    appointment.getBlockTime(req,req.body.clinic_id, function (err, value) {
                        if (err) {
                            res.status(400).send(value);
                        } else {
                            //res.json(value);
                            var timesBlokedByDoctor = [];
                            for(var a in value){
                                timesBlokedByDoctor.push({'app_time': value[a]['date_time']});
                            }
                            console.log(timesBlokedByDoctor);
                            var arr = rows.concat(timesBlokedByDoctor);
                            console.log(arr);
                            res.json(arr);
                         }
                    });
                } else {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                }
            }
        });
    });

}

exports.bookAppointment = function (req, res) {
    console.log(JSON.stringify(req.body));
    console.log(req.body.selectedAppointmeuntDateTime);
    if (!req.body.selectedAppointmentDateTime) {
        return res.status(400).send({message: 'Please select date time for an appointmnent'});
    }
    var current_date = new Date();
    var app_time = new Date(parseInt(req.body.selectedAppointmentDateTime));
    var created_date = current_date.getFullYear() + '-' + (parseInt(current_date.getMonth()) + 1) + '-' + current_date.getDate() + ' ' + current_date.getHours() + ':' + current_date.getMinutes() + ':' + current_date.getSeconds();
    console.log(app_time);
    if (app_time > current_date) {
        var sqlDate = app_time.getFullYear() + '-' + (parseInt(app_time.getMonth()) + 1) + '-' + app_time.getDate() + ' ' + app_time.getHours() + ':' + app_time.getMinutes() + ':00';
        console.log(sqlDate);
        var user_id = 0;
        if (req.body.member_id) {
            user_id = req.body.member_id;
        } else {
            user_id = req.body.id;
        }
        console.log(user_id);

        var data = {
            clinic_id: req.body.clinic_id,
            user_id: user_id,
            reason: req.body.reasons,
            app_time: sqlDate,
            created_date: created_date,
            created_by: req.body.id,
            status: 'Pending'
        }

        appointment.checkAvailableTimeAndDate(req, req.body.clinic_id, sqlDate, app_time.getHours() + ':' + app_time.getMinutes() + ':00', app_time.getDay(), 0, function (err, value) {
            if (err) {
                logs.appendError(err.toString());
                return res.status(400).send({
                    message: value
                });
            } else {
                req.getConnection(function (err, connection) {
                    connection.query('Insert into appointment set ?', data, function (err, rows) {
                        if (err) {
                            logs.appendError(err.toString());
                            return res.status(400).send({
                                message: errorHandler.getErrorMessage(err)
                            });
                        } else {
                            if (rows) {
                                var sql = 'SELECT concat(u.first_name," ",u.last_name) AS user,' +
                                        'concat(uu.first_name," ",uu.last_name) As dentist,' +
                                        'u.contact_no AS userContact,uu.contact_no AS dentistContact,c.name as clinicName ' +
                                        'From user AS u JOIN appointment AS app ON u.id = app.user_id ' +
                                        'JOIN clinic AS c ON app.clinic_id = c.id JOIN doctor AS d ' +
                                        'on c.doctor_id = d.id JOIN user AS uu ON uu.id = d.user_id ' +
                                        'WHERE app.id = ?'
                                connection.query(sql, [rows.insertId], function (err, row) {
                                    if (err) {
                                        logs.appendError(err.toString());
                                        return res.status(400).send({
                                            message: errorHandler.getErrorMessage(err)
                                        });
                                    } else {
                                        var onlyDate = app_time.getFullYear() + '-' + (parseInt(app_time.getMonth()) + 1) + '-' + app_time.getDate();
                                        var time = app_time.getHours() + ':' + app_time.getMinutes();
                                        var msgUser = config.getUserMessageTxt(row[0].user, onlyDate, time);
                                        var msgDentist = config.getDentistMessageTxt(row[0].dentist, row[0].clinicName, onlyDate, time);
                                        sendsms.sendSms(req, row[0].userContact, msgUser, function (err, resp) {
                                            if (err) {
                                                res.json({message: "Appointment booked successfully"});
                                            } else {
                                                sendsms.sendSms(req, row[0].dentistContact, msgDentist, function (err, resp) {
                                                    if (err) {
                                                        res.json({message: "Appointment booked successfully"});
                                                    } else {
                                                        coreCont.addEvent(req, 'has booked an appointment', data.user_id); //Add to event//
                                                        res.json({message: "Appointment booked successfully"});
                                                    }
                                                });
                                            }
                                        });
                                    }
                                })

                            } else {
                                return res.status(400).send({
                                    message: errorHandler.getErrorMessage(err)
                                });
                            }
                        }
                    });
                });
            }
        });
    } else {
        return res.status(400).send({message: 'Invalid date time'});
    }
};

exports.updateAppointment = function (req, res) {
    console.log(JSON.stringify(req.body));
    console.log(req.body.selectedAppointmentDateTime);
    var current_date = new Date();
    var app_id = req.body.app_id;
    var app_time = new Date(parseInt(req.body.selectedAppointmentDateTime));
    console.log(app_time);
    if (app_time > current_date) {
        var sqlDate = app_time.getFullYear() + '-' + (parseInt(app_time.getMonth()) + 1) + '-' + app_time.getDate() + ' ' + app_time.getHours() + ':' + app_time.getMinutes() + ':00';
        console.log(sqlDate);
        var data = {
            clinic_id: req.body.clinic_id,
            user_id: req.body.id,
            reason: req.body.reasons,
            status: req.body.appStatus,
            app_time: sqlDate
        }
        appointment.checkAvailableTimeAndDate(req, req.body.clinic_id, sqlDate, app_time.getHours() + ':' + app_time.getMinutes() + ':00', app_time.getDay(), app_id, function (err, value) {
            if (err) {
                logs.appendError(err.toString());
                return res.status(400).send({
                    message: value
                });
            } else {
                console.log('Update appointment set ' + JSON.stringify(data) + ' where id=' + app_id);
                req.getConnection(function (err, connection) {
                    connection.query('Update appointment set ? where id=?', [data, app_id], function (err, rows) {
                        if (err) {
                            console.log(err);
                            return res.status(400).send({
                                message: errorHandler.getErrorMessage(err)
                            });
                        } else {
                            if (rows) {
                                console.log(rows);
                                coreCont.addEvent(req, 'has booked an appointment', data.user_id); //Add to event//
                                res.json({message: "Appointment updated successfully"});
                            } else {
                                return res.status(400).send({
                                    message: errorHandler.getErrorMessage(err)
                                });
                            }
                        }
                    });
                });
            }
        });

    } else {
        return res.status(400).send({message: 'Invalid date time'});
    }
};
exports.getAllBookedAppointmentsByUserId = function (req, res) {

    req.getConnection(function (err, connection) {
        var sql = connection.query('SELECT u.first_name,u.last_name,u.email,u.contact_no,app.app_time,' +
                'app.reason,app.status,app.id as app_Id,app.clinic_id, d.id AS dentistId FROM user AS u JOIN doctor AS d ON u.id=d.user_id JOIN' +
                ' clinic AS c ON c.doctor_id=d.id JOIN appointment AS app ON app.clinic_id=c.id' +
                ' WHERE u.role_id=2 AND (app.user_id = ? || app.created_by= ?) AND app.status !="Deleted" order by app.app_time', [req.body.user_id, req.body.user_id], function (err, rows) {
            console.log(sql.sql);
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                if (rows) {
                    console.log(rows);
                    res.json(rows);
                } else {
                    res.json({message: "No appointments"});
                }
            }

        });
    });
};

exports.deleteBookedAppointmentsByAppId = function (req, res) {
    console.log(req.body.app_id);
    req.getConnection(function (err, connection) {
        connection.query('update appointment set status="Deleted" where id=?', [req.body.app_id], function (err, rows) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                if (rows) {
                    console.log(rows);
                    res.json({message: "Appointment deleted succesfully"});
                    //res.json(rows);
                } else {
                    res.json({message: "No appointments"});
                }
            }

        });
    });
};

exports.checkAvailableTimeAndDate = function (req, clinic_id, date, time, day, app_id, callback) {
    console.log('In checkAvailableTimeAndDate');
    var dayVal = (day == 0) ? 7 : day;

    var sql = 'SELECT id FROM clinic_time WHERE clinic_id = ? AND days = ? AND ((CAST(? AS time) BETWEEN shift1_start_time AND shift1_end_time ) OR (CAST(? AS time) BETWEEN shift2_start_time AND shift2_end_time ))';
    req.getConnection(function (err, connection) {
        var qry = connection.query(sql, [clinic_id, dayVal, time, time], function (err, rows) {
            console.log(qry.sql);
            if (err) {
                callback(true, errorHandler.getErrorMessage(err));
            } else {
                console.log(rows);
                console.log(rows.length);
                if (rows.length > 0) {
                    var sql1 = '';
                    if (app_id > 0) {
                        sql1 = 'SELECT app_time from appointment where app_time = ? and clinic_id = ? AND (status = "Pending" OR status = "Approved") AND id !=' + app_id + ' ';
                    } else {
                        sql1 = 'SELECT app_time from appointment where app_time = ? and clinic_id = ? AND (status = "Pending" OR status = "Approved")';
                    }

                    var qrry = connection.query(sql1, [date, clinic_id], function (err, row) {
                        console.log(qrry.sql);
                        if (err) {
                            callback(true, errorHandler.getErrorMessage(err));
                        } else {
                            if (row.length > 0) {
                                callback(true, "Selected date time is not available");
                            } else {
                                callback(false, "");
                            }
                        }
                    });
                } else {
                    callback(true, "Selected clinic or time are invalid");
                }
            }
        })
    });
}

exports.saveBlockedTime = function (req, res) {
    try {
        validate.blockTimeValidate(req, res, function (err, value) {
            if (err) {
                console.log("error" + value);
                res.status(400).send({message: value});
            } else {
                var data = [];
                var current_date = new Date();
                var create_date = current_date.getFullYear() + '-' + (parseInt(current_date.getMonth()) + 1) + '-' + current_date.getDate() + ' ' + current_date.getHours() + ':' + current_date.getMinutes() + ':' + current_date.getSeconds();
                for (var i in req.body.blockTimeList)
                {
                    var bDate = new Date(req.body.blockTimeList[i]);
                    var block_date = bDate.getFullYear() + '-' + (parseInt(bDate.getMonth()) + 1) + '-' + bDate.getDate() + ' ' + bDate.getHours() + ':' + bDate.getMinutes() + ':' + bDate.getSeconds();
                    data.push([req.body.id, req.body.clinic, block_date, req.body.reason, create_date]);
                }
                req.getConnection(function (err, connection) {
                    var delQry = connection.query('DELETE FROM blocked_time WHERE date_time >= ? AND clinic_id = ?', [create_date, req.body.clinic], function (err, rows) {
                        //console.log(delQry.sql);
                        if (err) {
                            res.status(400).send(err);
                        } else {
                            var qry = connection.query('INSERT INTO blocked_time (user_id, clinic_id, date_time, reason, create_date) VALUES ?', [data], function (err, rows) {
                                //console.log(qry.sql);
                                if (err) {
                                    return res.status(400).send({
                                        message: errorHandler.getErrorMessage(err)
                                    });
                                } else {
                                    if (rows) {
                                        res.json({message: ["Time slots blocked succesfully"]});
                                    } else {
                                        res.json({message: ["Error occurred while processing your request"]});
                                    }
                                }
                            });
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


exports.getBlockedTime = function (req, res) {
    appointment.getBlockTime(req,req.body.clinic, function (err, value) {
        if (err) {
            res.status(400).send(value);
        } else {
            res.json(value);
        }
    })
};


exports.getBlockTime = function (req,clinic_id, callback) {
    try {
        var current_date = new Date();
        var create_date = current_date.getFullYear() + '-' + (parseInt(current_date.getMonth()) + 1) + '-' + current_date.getDate() + ' ' + current_date.getHours() + ':' + current_date.getMinutes() + ':' + current_date.getSeconds();

        req.getConnection(function (err, connection) {
            var qry = connection.query('SELECT clinic_id, date_time, reason FROM blocked_time WHERE date_time >= ? AND clinic_id = ?', [create_date, clinic_id], function (err, rows) {
                console.log(qry.sql);
                if (err) {
                    callback(true, errorHandler.getErrorMessage(err));

                } else {
                    if (rows) {
                        //res.json(rows);
                        callback(false, rows);
                    } else {
                        callback(true, "Error occurred while processing your request");
                        //res.json({message: ["Error occurred while processing your request"]});
                    }
                }
            });
        });
    } catch (e) {
        console.log(e);
        logs.appendError(e.stack);
        callback(true, e.stack);
    }
}