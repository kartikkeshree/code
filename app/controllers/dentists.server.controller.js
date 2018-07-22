'use strict';

/**
 * Module dependencies.
 */
var errorHandler = require('./errors.server.controller'),
        user_model = require('../models/user.server.model'),
        validate = require('../components/validation.js'),
        _ = require('lodash');
var crypto = require('crypto');
var logs = require('../components/logs.js');
var config = require('../components/config.js');
var send = require('../components/send_mail');
var multiparty = require('multiparty'), //To save file type
//uuid = require('node-uuid'), //To create GUID of file name
        fs = require('fs');
var Converter = require('csvtojson').core.Converter;
var node_xj = require("xls-to-json");
var xlsxj = require("xlsx-to-json");
var appointment = require('./appointments.server.controller');
var coreCont = require('./core.server.controller');
/**
 * Create a Doctor
 */
exports.create = function (req, res) {
    try {
        var validateClinic = validate.addDentistValidation(req, res, function (err, value) {
            if (err) {
                console.log(value);
                res.status(400).send(value);
            } else {
                var curDate = new Date();
                req.body.role_id = '2';
                req.body.password = 'password';
                req.body.created_date = curDate.getFullYear() + '-' + (parseInt(curDate.getMonth()) + 1) + '-' + curDate.getDate() + ' ' + curDate.getHours() + ':' + curDate.getMinutes() + ':' + curDate.getSeconds();
                req.getConnection(function (err, connection) {
                    connection.query('INSERT INTO user SET ?', req.body, function (err, rows) {
                        if (err) {
                            console.log(err);
                            //logs.appendError(err.toString());
                            return res.status(400).send({
                                message: errorHandler.getErrorMessage(err)
                            });
                        } else {
                            if (rows) {
                                connection.query('INSERT INTO doctor SET ?', {user_id: rows.insertId}, function (err1, rows1) {
                                    if (err1) {
                                        console.log(err1);
                                        return res.status(400).send({
                                            message: errorHandler.getErrorMessage(err)
                                        });
                                    } else {
                                        if (rows1) {
                                            res.json(rows);
                                        }
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
        });
    } catch (e) {
        console.log(e);
        logs.appendError(e.stack);
    }
};

/**
 * Show the current Doctor
 */
exports.read = function (req, res) {
    try {
        req.getConnection(function (err, connection) {
            connection.query('select * from doctor where user_id=?', req.body.id, function (err, rows) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    res.jsonp(rows);
                }
            })
        });
    } catch (e) {

    }
};

/**
 * Update a Doctor
 */
exports.update = function (req, res) {
    console.log(req.body);
    var data = validate.professionalInfoValidate(req, res, function (err, value) {
        if (err) {
            console.log("error");
            res.status(400).send(value);
        } else {
            delete req.body.updateSocialLinks;
            delete req.body.user_id;
            if (req.body.doctor_id) {
                var id = req.body.doctor_id;
            } else {
                var id = req.body.id;
            }
            delete req.body.doctor_id;
            delete req.body.id;
            req.getConnection(function (err, connection) {
                var query = connection.query('update doctor set ? where id=?', [req.body, id], function (err, rows) {
                    console.log(query.sql);
                    if (err) {
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    } else {
                        res.jsonp({message: "Professional Information updated successfully "});
                    }
                });
            });
        }
    });
};

exports.socialLinksUpdate = function (req, res) {

    var id = req.body.doctor_id;
    delete req.body.doctor_id;
    delete req.body.id;
    delete req.body.user_id;
    if (req.body.length > 0) {
        req.getConnection(function (err, connection) {

            var query = connection.query('update doctor set ? where id=?', [req.body, id], function (err, rows) {
                console.log(query.sql);
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    res.jsonp({message: "Social Links updated successfully"});
                }
            });
        });
    } else {
        res.jsonp({message: "Please provide atleast any one social link"});
    }

}

/**
 * Delete an Doctor
 */
exports.delete = function (req, res) {
    req.getConnection(function (err, connection) {
        connection.query('UPDATE user SET status = "deleted" WHERE id = ?', req.body.id, function (err, rows) {
            if (err) {
                console.log(err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                if (rows.affectedRows) {
                    console.log(rows);
                    res.json({message: "Doctor deleted succesfully"});
                    //res.json(rows);
                } else {
                    res.json({message: "No Doctor"});
                }
            }
        });
    });
};


/**
 * List of Doctor
 */
exports.list = function (req, res) {
    req.getConnection(function (err, connection) {
        var searchCondition = '';
        var searchStatus = '';
        var paramArr = [];
        if (req.body.searchVal) {
            var sArr = req.body.searchVal.split(' ');
            searchCondition += " AND (";
            for (var i = 0; i < sArr.length; i++) {
                searchCondition += (i == 0) ? "" : " OR ";
                searchCondition += ' ((user.first_name like ?) OR (user.last_name like ?) OR (user.email LIKE ?) or (area_list.area_name LIKE ?))';
                paramArr.push('%' + sArr[i] + '%', '%' + sArr[i] + '%', '%' + sArr[i] + '%', '%' + sArr[i] + '%');
            }
            searchCondition += ") ";
        }
        if (req.body.searchStatus)
        {
            searchStatus += ' AND user.status = "Active" ';
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

        //Status//
        var strStatus = '';
        if (req.body.status) {
            strStatus = 'AND user.status = ?';
            paramArr.push(req.body.status);
        } else {
            strStatus = 'and user.status!="deleted" ';
        }

        //End//
        var queryStr = connection.query('SELECT user.id, user.first_name, user.last_name, user.email, user.address1, area_list.area_name, user.contact_no, user.status, doctor.id AS dentistId, doctor.experience FROM user JOIN doctor ON doctor.user_id = user.id LEFT JOIN area_list ON area_list.id = user.area_id WHERE user.role_id = 2 ' + searchStatus + searchCondition + strStatus + ' LIMIT ' + ((indexFrom - 1) * countUpTo) + ',' + countUpTo, paramArr, function (err, rows) {
            console.log(queryStr.sql);
            if (err) {
                console.log(err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                if (rows) {
                    //res.json(rows);
                    //Get total for Pagination//
                    var totalQuery = connection.query('SELECT count(*) AS totalRes FROM user JOIN doctor ON doctor.user_id = user.id LEFT JOIN area_list ON area_list.id = user.area_id WHERE user.role_id = 2 ' + searchStatus + searchCondition + strStatus, paramArr, function (err, totalrows) {
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
                    //End//
                } else {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                }
            }
        });
    });
};

/**
 * Doctor middleware
 */
exports.dentistDataById = function (req, res) {
    req.getConnection(function (err, connection) {
        var query = connection.query("SELECT id, user_id, experience  FROM doctor WHERE user_id = ?", [req.body.user_id], function (err, rows) {
            console.log(query.sql);
            if (err) {
                console.log(err);
                res.status(400).send(err);
            } else {
                console.log(rows);
                res.json(rows);
            }
        });
    });
};

/**
 * Doctor authorization middleware
 */
exports.hasAuthorization = function (req, res, next) {
    if (req.dentist.user.id !== req.user.id) {
        return res.status(403).send('User is not authorized');
    }
    next();
};

//Search Clinics and Doctors based on @specialty, @clinic name/@dentist name, @area
exports.search = function (req, res) {
    try {
        req.getConnection(function (err, connection) {
            var strQry = "";
            var startQry = "";
            var countStartQry = "";
            //if doctor name or clinic name have value
            if (req.body.dentistClinic != '' && req.body.dentistClinic.toLowerCase() != 'all' && req.body.dentistClinic != undefined)
            {
                var dcVal = req.body.dentistClinic.split(' ');
                strQry += " AND (";
                for (var a = 0; a < dcVal.length; a++)
                {
                    strQry += (a == 0) ? "" : " OR ";
                    strQry += "((user.first_name like '%" + dcVal[a] + "%' OR user.last_name like '%" + dcVal[a] + "%') OR (clinic.name like '%" + dcVal[a] + "%'))";
                }
                strQry += ") "
            }
            //End
            //if area name has value ; area name may be comma separated for multiple values
            if (req.body.area != '' && req.body.area.toLowerCase() != 'all' && req.body.area != undefined)
            {
                startQry = " JOIN area_list ON area_list.id = clinic.area_id ";
                var areaArr = req.body.area.split(",");
                var subQry = '';
                for (var a in areaArr) {
                    subQry += ((a > 0) ? " OR " : "") + " area_list.area_name like '%" + areaArr[a] + "%'";
                }
                strQry += " AND (" + subQry + ")";
            }
            //End
            //if speciality name has value
            if (req.body.speciality != '' && req.body.speciality.toLowerCase() != 'all' && req.body.speciality != undefined)
            {
                countStartQry += "JOIN doctor_speciality ON doctor_speciality.doctor_id = doctor.id";
                strQry += " AND (doctor_speciality.speciality_id IN(" + req.body.speciality + "))";
            }
            //End
            //if category name has value
            if (req.body.category != '' && req.body.category.toLowerCase() != 'all' && req.body.category != undefined)
            {
                strQry += " AND (doctor.category_id IN(" + req.body.category + "))";
            }
            //End
            //if experience has value
            if (req.body.experience != undefined && req.body.experience != '' && req.body.experience.toString() != '0')
            {
                var expStr = req.body.experience.replace(/\+/g, "");
                var expArr = expStr.split(",");
                strQry += " AND (doctor.experience >= " + (Math.min.apply(null, expArr) * 12) + ")";
            }
            var qry = '';
            var strSelect = 'clinic.name, clinic.contact_no, clinic.address, clinic.latitude, clinic.logitude, user.first_name, user.last_name, user.image, clinic.id AS clinicId, doctors_category.name AS doctorCategory, (SELECT GROUP_CONCAT(speciality_id)';
            var strLimit = '';
            //Pagination//
            if (req.body.page)
            {
                if (req.body.page == 'map')
                {
                    strSelect = 'clinic.name, clinic.contact_no, clinic.address, clinic.latitude, clinic.logitude, user.first_name, user.last_name, clinic.id AS clinicId, doctors_category.name AS doctorCategory';
                } else {
                    var indexFrom = (req.body.page) ? req.body.page : 1;
                    var countUpTo = (req.body.perPage) ? req.body.perPage : 10;
                    strLimit = "LIMIT " + ((indexFrom - 1) * countUpTo) + ", " + countUpTo;
                }
            } else {
                var indexFrom = 1;
                var countUpTo = 10;
                strLimit = "LIMIT " + ((indexFrom - 1) * countUpTo) + ", " + countUpTo;
            }
            //End//
            if (req.body.latitude != 0 && req.body.latitude != undefined && req.body.longitude != 0 && req.body.longitude != undefined) {
                qry = "SELECT clinic.name, clinic.contact_no, clinic.address, clinic.latitude, clinic.logitude, user.first_name, user.last_name, user.image, clinic.id AS clinicId, doctors_category.name AS doctorCategory, (SELECT GROUP_CONCAT(speciality_id) FROM doctor_speciality WHERE doctor_id = doctor.id) AS dSpeciality,( 3959 * acos( cos( radians(" + req.body.latitude + ") ) * cos( radians( clinic.latitude ) ) * cos( radians( clinic.logitude ) - radians(" + req.body.longitude + ") ) + sin( radians(" + req.body.latitude + ") ) * sin( radians( clinic.latitude ) ) ) )  AS distance, MIN(clinic_time.days) AS startDay, MAX(clinic_time.days) AS endDay, clinic_time.shift1_start_time AS startTime, clinic_time.shift2_end_time AS endTime, doctor.id AS dentistId FROM clinic  " + startQry + " JOIN doctor ON doctor.id = clinic.doctor_id JOIN user ON user.id = doctor.user_id JOIN doctor_speciality ON doctor_speciality.doctor_id = doctor.id JOIN clinic_time ON clinic.id = clinic_time.clinic_id JOIN doctors_category ON doctor.category_id = doctors_category.id WHERE user.status = 'Active' AND clinic.status = 'Approved' AND user.role_id = 2 " + strQry + " GROUP BY clinic.id having distance < 25 ORDER BY distance " + strLimit;

            } else {
                qry = "SELECT clinic.name, clinic.contact_no, clinic.address, clinic.latitude, clinic.logitude, user.first_name, user.last_name, user.image, clinic.id AS clinicId, doctors_category.name AS doctorCategory, (SELECT GROUP_CONCAT(speciality_id) FROM doctor_speciality WHERE doctor_id = doctor.id) AS dSpeciality, MIN(clinic_time.days) AS startDay, MAX(clinic_time.days) AS endDay, clinic_time.shift1_start_time AS startTime, clinic_time.shift2_end_time AS endTime, doctor.id AS dentistId FROM clinic  " + startQry + " JOIN doctor ON doctor.id = clinic.doctor_id JOIN user ON user.id = doctor.user_id JOIN doctor_speciality ON doctor_speciality.doctor_id = doctor.id JOIN clinic_time ON clinic.id = clinic_time.clinic_id JOIN doctors_category ON doctor.category_id = doctors_category.id WHERE user.status = 'Active' AND clinic.status = 'Approved' AND user.role_id = 2 " + strQry + " GROUP BY clinic.id " + strLimit;
            }
            //End ( 3959 * acos( cos( radians('+req.body.latitude+') ) * cos( radians( lat ) ) * cos( radians( lng ) - radians(73.792221) ) + sin( radians(37) ) * sin( radians( lat ) ) ) ) AS distance FROM clinic HAVING distance < 4 ORDER BY distance';

            var query = connection.query(qry, [req.body.dentistClinic], function (err, rows) {
                console.log(query.sql);
                if (err) {
                    console.log(err);
                    res.status(400).send(err);
                } else {
                    //To get Total Count//
                    var totalQry = '';
                    if (req.body.latitude != 0 && req.body.latitude != undefined && req.body.longitude != 0 && req.body.longitude != undefined) {
                        totalQry = "SELECT COUNT(cntTotal) totalRes from (SELECT count(clinic.id) AS cntTotal FROM clinic  " + startQry + " JOIN doctor ON doctor.id = clinic.doctor_id JOIN user ON user.id = doctor.user_id JOIN doctor_speciality ON doctor_speciality.doctor_id = doctor.id JOIN clinic_time ON clinic.id = clinic_time.clinic_id JOIN doctors_category ON doctor.category_id = doctors_category.id WHERE user.status = 'Active' AND clinic.status = 'Approved' AND user.role_id = 2 AND ( 3959 * acos( cos( radians(18.520430299999997) ) * cos( radians( clinic.latitude ) ) * cos( radians( clinic.logitude ) - radians(73.8567437) ) + sin( radians(18.520430299999997) ) * sin( radians( clinic.latitude ) ) ) ) < 25 " + strQry + " GROUP BY clinic.id) AS cnt";
                    } else {
                        totalQry = "SELECT COUNT(cntTotal) totalRes from (SELECT count(clinic.id) AS cntTotal FROM clinic  " + startQry + " JOIN doctor ON doctor.id = clinic.doctor_id JOIN user ON user.id = doctor.user_id JOIN doctor_speciality ON doctor_speciality.doctor_id = doctor.id JOIN clinic_time ON clinic.id = clinic_time.clinic_id JOIN doctors_category ON doctor.category_id = doctors_category.id WHERE user.status = 'Active' AND clinic.status = 'Approved' AND user.role_id = 2 " + strQry + " GROUP BY clinic.id) AS cnt";
                    }
                    var totalQuery = connection.query(totalQry, [req.body.dentistClinic], function (err, totalrows) {
                        console.log(totalQuery.sql);
                        if (err) {
                            console.log(err);
                            res.status(400).send(err);
                        } else {
                            res.json({'data': rows, 'total': totalrows[0]});
                        }
                    });
                    //End//
                }
            });
        });
    } catch (e) {
        logs.appendError(e.stack);
    }
};

exports.spciality = function (req, res) {
    var sql = '';
    if (req.body.clinic_id && parseInt(req.body.clinic_id) !== 0) {
        sql = "SELECT id, category_id, name FROM speciality as s WHERE s.id in" +
                " (select ds.speciality_id from doctor_speciality as ds join " +
                "doctor as d on ds.doctor_id=d.id join clinic as c on " +
                "c.doctor_id=d.id and c.id=" + req.body.clinic_id + ")";
    } else {
        sql = "SELECT id, category_id, name FROM speciality"
    }
    try {
        req.getConnection(function (err, connection) {
            var query = connection.query(
                    sql, function (err, rows) {
                        if (err) {
                            console.log(err);
                            res.status(400).send(err);
                        } else {
                            res.json(rows);
                        }
                    });
        });
    } catch (e) {
        logs.appendError(e.stack);
    }
};

exports.areaList = function (req, res) {
    try {
        req.getConnection(function (err, connection) {
            var query = connection.query(
                    "SELECT id, area_name FROM area_list", function (err, rows) {
                        if (err) {
                            console.log(err);
                            res.status(400).send(err);
                        } else {
                            res.json(rows);
                        }
                    });
        });
    } catch (e) {
        logs.appendError(e.stack);
    }
};

//Get doctor Data
exports.getDentist = function (req, res) {
    try {
        //console.log(req.body);
        req.getConnection(function (err, connection) {
            var query = connection.query("SELECT user.first_name, user.last_name, user.image, doctor.id," +
                    " doctor.degree, doctor.experience, doctors_category.name AS doctorCategory," +
                    " GROUP_CONCAT(doctor_speciality.speciality_id) AS dSpeciality" +
                    " FROM user JOIN doctor ON user.id = doctor.user_id JOIN doctor_speciality" +
                    " ON doctor_speciality.doctor_id = doctor.id JOIN doctors_category ON doctor.category_id = doctors_category.id WHERE doctor.id = ?",
                    [req.body.id], function (err, rows) {
                //console.log(query.sql);
                if (err) {
                    console.log(err);
                    res.status(400).send(err);
                } else {
                    //console.log(rows);
                    res.json(rows);
                }
            });
        });
    } catch (e) {
        logs.appendError(e.stack);
    }
};

//Get Clinics of Doctor
exports.getClinic = function (req, res) {
    try {
        req.getConnection(function (err, connection) {
            var query = connection.query("SELECT clinic.id, clinic.name, clinic.contact_no, clinic.address, clinic.city, clinic.zip, area_list.area_name, clinic_image.image AS image,(select GROUP_CONCAT(DISTINCT image) from clinic_image where clinic_image.clinic_id = clinic.id ) as clinic_images, (SELECT GROUP_CONCAT(service.name) FROM clinic_service JOIN service ON service.id = clinic_service.service_id WHERE clinic_id = clinic.id) AS cServices, MIN(clinic_time.days) AS startDay, MAX(clinic_time.days) AS endDay, clinic_time.shift1_start_time AS startTime, clinic_time.shift2_end_time AS endTime FROM clinic JOIN area_list ON clinic.area_id = area_list.id JOIN clinic_time ON clinic_time.clinic_id = clinic.id LEFT JOIN clinic_image ON clinic.id = clinic_image.clinic_id LEFT JOIN clinic_service ON clinic.id = clinic_service.clinic_id LEFT JOIN service ON service.id = clinic_service.service_id WHERE clinic.status = 'Approved' AND clinic.doctor_id = ? GROUP BY clinic.id HAVING startDay ORDER BY clinic_image.id ASC",
                    [req.body.id], function (err, rows) {
                //console.log(query.sql);
                if (err) {
                    console.log(err);
                    res.status(400).send(err);
                } else {
                    //console.log(rows);
                    res.json(rows);
                }
            });
        });
    } catch (e) {
        logs.appendError(e.stack);
    }
};


exports.GetDentistDataByClinicId = function (req, res) {
    try {
        req.getConnection(function (err, connection) {
            var query = connection.query(
                    "SELECT clinic.name, clinic.contact_no, clinic.address,clinic.slot_diff, user.first_name," +
                    " user.last_name, user.image, clinic.id AS clinicId," +
                    " MIN(clinic_time.days) AS startDay, MAX(clinic_time.days) AS endDay,doctor.experience,doctor.degree, doctor.id as dentistId " +
                    " FROM clinic JOIN doctor ON doctor.id = clinic.doctor_id JOIN" +
                    " user ON user.id = doctor.user_id  JOIN clinic_time ON" +
                    " clinic.id = clinic_time.clinic_id WHERE user.role_id = 2 and clinic.id=? " +
                    " GROUP BY clinic.id",
                    [req.body.clinic_id], function (err, rows) {
                if (err) {
                    console.log(err);
                    res.status(400).send(err);
                } else {
                    res.json(rows);
                }
            });
        });
    } catch (e) {
        logs.appendError(e.stack);
    }
};

exports.changeUserPassword = function (req, res) {
    if (req.body.newPass) {
        var curPass = (!req.body.isRest) ? user_model.generateHash(req.body.curPassword) : req.body.curPassword;
        req.getConnection(function (err, connection) {
            var query = connection.query("select password from user where id=? and password=? ", [req.body.id, curPass], function (err, rows) {
                //console.log(rows);
                if (!err && rows) {
                    if (req.body.newPass === req.body.cpass) {

                        if (req.body.newPass != req.body.curPassword) {

                            var encryptedPassword = (!req.body.isRest) ? user_model.generateHash(req.body.newPass) : req.body.newPass;
                            var updatePass = connection.query('update user set ? where id=? and password=?', [
                                {password: encryptedPassword},
                                req.body.id,
                                curPass
                            ], function (err, row) {
                                //console.log(updatePass.sql);
                                if (err) {
                                    return res.status(400).send({
                                        message: errorHandler.getErrorMessage(err)
                                    });
                                } else {
                                    //console.log(row);
                                    if (row.affectedRows) {
                                        res.send({
                                            message: ['Password changed successfully']
                                        });
                                    } else {
                                        res.status(400).send({
                                            message: ['Old password is incorrect']
                                        });
                                    }
                                }
                            });
                        } else {
                            res.status(400).send({
                                message: ['Old Passwords and New password are same']
                            });
                        }
                    } else {
                        res.status(400).send({
                            message: ['Passwords and Confirm password do not match']
                        });
                    }
                } else {
                    res.status(400).send({
                        message: ['Current password is incorrect']
                    });
                }
            });
        });

    } else {
        res.status(400).send({
            message: ['Please provide a new password']
        });
    }
};


//Get doctor Data by user_id
exports.getDentistByUserId = function (req, res) {
    try {
        req.getConnection(function (err, connection) {
            var query = connection.query("SELECT *  FROM doctor  WHERE user_id = ?",
                    [req.body.id], function (err, rows) {
                console.log(query.sql);
                if (err) {
                    console.log(err);
                    res.status(400).send(err);
                } else {
                    //console.log(rows);
                    res.jsonp(rows);
                }
            });
        });
    } catch (e) {
        logs.appendError(e.stack);
    }
};

//get All Speciality with specific doctor speciality
exports.getSpecialityWithSpecificSpeciality = function (req, res) {
    try {
        var subQry = "";
        if (req.body.category_id && parseInt(req.body.category_id)) {
            subQry = " WHERE category_id = " + req.body.category_id;
        }
        req.getConnection(function (err, connection) {
            var query = connection.query("SELECT id, name FROM speciality" + subQry, function (err, rows) {
                if (err) {
                    console.log(err);
                    res.status(400).send(err);
                } else {
                    var query1 = connection.query("SELECT s.id,s.name  FROM speciality as s " +
                            " join doctor_speciality as ds on s.id=ds.speciality_id join doctor as d" +
                            " on d.id=ds.doctor_id" +
                            " and d.user_id=?", [req.body.user_id], function (err, rows1) {
                        console.log(query1.sql);
                        if (err) {
                            console.log(err);
                            res.status(400).send(err);
                        } else {
                            var data = [];
                            var flag = false;
                            for (var i = 0; i < rows.length; i++) {
                                for (var j = 0; j < rows1.length; j++) {
                                    if (rows[i].id == rows1[j].id) {
                                        flag = true;
                                        data.push({id: rows[i].id, name: rows[i].name, flag: true})
                                    }
                                }
                                if (flag == false) {
                                    data.push({id: rows[i].id, name: rows[i].name, flag: false})
                                }
                                flag = false;
                            }
                            res.jsonp(data);
                        }
                    });
                }
            });
        });
    } catch (e) {
        // logs.appendError(e.stack);
    }
};

//upadate the speciality
exports.updateSpeciality = function (req, res) {
    console.log(JSON.stringify(req.body));
    try {
        if (req.body) {
            req.getConnection(function (err, connection) {
                if (req.body.category_id && parseInt(req.body.category_id)) //To update doctor category//
                {
                    var query = connection.query("UPDATE doctor SET category_id = ? WHERE id = ?", [req.body.category_id, req.body.doctor_id], function (err, rows) {
                        if (err) {
                            console.log(err);
                            res.status(400).send(err);
                            return false;
                        }
                    });
                }
                var query = connection.query('delete from doctor_speciality where doctor_id=?', req.body.doctor_id, function (err, rows) {
                    if (err) {
                        res.status(400).send(err);
                    } else {

                        if (typeof req.body.speciality_ids != 'object') {
                            req.body.speciality_ids = JSON.parse(req.body.speciality_ids);
                        }

                        if (req.body.speciality_ids != undefined) {
                            var val = '';
                            for (var i = 0; i < req.body.speciality_ids.length; i++) {

                                val += ((i != 0) ? ',' : '') + '(' + req.body.doctor_id + ',' + req.body.speciality_ids[i] + ')';
                            }
                            console.log(val);
                            var query1 = connection.query('insert into doctor_speciality (doctor_id,speciality_id) values ' + val + '',
                                    function (err, rows) {
                                        if (err) {
                                            console.log(err);
                                            res.status(400).send(err);
                                        } else {
                                            if (rows.affectedRows) {
                                                res.jsonp({message: "Specialty updated successfully"});
                                            } else {
                                                res.status(400).send({message: "No specialty inserted"});
                                            }
                                        }
                                    });
                        } else {
                            res.jsonp({message: "Specialty updated successfully"});
                        }
                    }
                });
            });

        } else {
            res.status(400).send({message: "doctor id cannot be blank"});
        }
    } catch (e) {

    }
};


//Get all appointments for doctor by id
exports.getAllUserAppointmentByDentistId = function (req, res) {
    if (req.body) {
        console.log(req.body);
        try {
            var sql = '';
            var searchVal = '';
            var paramArr = [];
            if (req.body.searchVal == undefined || req.body.searchVal == '') {
                searchVal = "";
                paramArr.push(req.body.doctor_id);
            } else {
                var sArr = req.body.searchVal.split(' ');
                console.log(sArr);
                searchVal += " AND (";
                paramArr.push(req.body.doctor_id);
                for (var i = 0; i < sArr.length; i++) {
                    console.log(sArr[i]);
                    searchVal += (i == 0) ? "" : " OR ";
                    searchVal += ' (u.first_name like ? OR u.last_name like ?)';
                    paramArr.push('%' + sArr[i] + '%', '%' + sArr[i] + '%');
                }
                searchVal += ")";
                if (req.body.clinic_id != undefined && req.body.clinic_id != '') {
                    searchVal += ' AND c.id IN (' + req.body.clinic_id + ')';
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
            var strStatus = '';
            if (req.body.status != undefined && req.body.status != '') {
                strStatus = 'AND app.status = ?';
                paramArr.push(req.body.status);
            } else {
                strStatus = ' AND app.status!="Deleted" ';
            }

            //End//
            if (req.body.date == '' || req.body.date == undefined) {
                sql = 'select app.id as app_id,u.id as user_id,c.id as clinic_id,u.first_name,u.last_name' +
                        ',u.contact_no,app.app_time,app.reason,app.status from clinic' +
                        ' as c join appointment as app on app.clinic_id=c.id join ' +
                        ' user as u on app.user_id=u.id and c.doctor_id=? and app.parent_appId = 0' +
                        ' and u.status!="deleted"' + searchVal + ' ' + strStatus + ' LIMIT ' + ((indexFrom - 1) * countUpTo) + ',' + countUpTo;
            } else {
                var current_date = new Date();
                var todayDate = current_date.getFullYear() + '-' + (parseInt(current_date.getMonth()) + 1) + '-' + current_date.getDate();
                sql = 'select app.id as app_id,u.id as user_id,c.id as clinic_id,u.first_name,u.last_name' +
                        ',u.contact_no,app.app_time,app.reason,app.status from clinic' +
                        ' as c join appointment as app on app.clinic_id=c.id join ' +
                        ' user as u on app.user_id=u.id and c.doctor_id=? and app.parent_appId = 0' +
                        ' and app.status!="Deleted"  and u.status!="deleted" and cast(app.app_time as date)="' + todayDate + '" ' +
                        ' ' + searchVal + ' LIMIT ' + ((indexFrom - 1) * countUpTo) + ',' + countUpTo;
            }
            req.getConnection(function (err, connection) {
                if (err) {
                    console.log(err);
                } else {
                    var query = connection.query(sql, paramArr, function (err, rows) {
                        console.log(query.sql);
                        if (err) {
                            res.status(400).send("err");
                        } else {
                            if (rows) {
                                //res.json(rows);
                                var totalSql = ''
                                if (req.body.date == '') {
                                    totalSql = 'select count(*) AS totalRes from clinic as c join appointment as app on app.clinic_id=c.id join user as u on app.user_id=u.id and c.doctor_id=? and app.parent_appId = 0 and u.status!="deleted" ' + searchVal + ' ' + strStatus + ' ';
                                } else {
                                    var current_date = new Date();
                                    var todayDate = current_date.getFullYear() + '-' + (parseInt(current_date.getMonth()) + 1) + '-' + current_date.getDate();
                                    totalSql = 'select count(*) AS totalRes from clinic as c join appointment as app on app.clinic_id=c.id join user as u on app.user_id=u.id and c.doctor_id=? and app.parent_appId = 0 and app.status!="Deleted"  and u.status!="deleted" and cast(app.app_time as date)="' + todayDate + '" ' + ' ' + searchVal + ' ';
                                }
                                var totalQuery = connection.query(totalSql, paramArr, function (err, totalrows) {
                                    console.log('Pagination :-> ' + totalQuery.sql);
                                    if (err) {
                                        res.status(400).send("err");
                                    } else {
                                        res.json({'data': rows, 'total': totalrows[0]});
                                    }
                                });
                            } else {
                                res.json({message: "No appointments"});
                            }
                        }
                    });
                }
            })
        } catch (e) {

        }
    } else {
        res.status(400).send({message: "dentist id cannot be blank"});
    }

};

//get patient list by doctor id
exports.getPatientByDentistId = function (req, res) {
    if (req.body) {
        var searchCondition = '';
        var searchCondition2 = '';
        var paramArr = [];
        if (req.body.searchVal)
        {

            var sArr = req.body.searchVal.split(' ');
            searchCondition += " AND (";
            for (var i = 0; i < sArr.length; i++) {
                searchCondition += (i == 0) ? "" : " OR ";
                if (req.body.id > 0) {
                    searchCondition += ' (u.first_name like ? OR u.last_name like ?)';
                    paramArr.push('%' + sArr[i] + '%', '%' + sArr[i] + '%');
                } else {
                    searchCondition += ' (u.first_name like ? OR u.last_name like ?)';
                    paramArr.push('%' + sArr[i] + '%', '%' + sArr[i] + '%');
                }

            }
            searchCondition += ")";
            searchCondition2 = searchCondition;
            if (req.body.role_id == 2) {
                searchCondition += "and d.id=?";
                searchCondition2 = searchCondition;
                paramArr.push(req.body.doctor_id);
            }

            if (req.body.role_id == 3) {
                searchCondition2 = searchCondition + "and d.id=?";
                searchCondition += "and d.id=? and c.id IN (" + req.body.clinic_id + ") ";
                paramArr.push(req.body.doctor_id);
            }

        } else {
            if (req.body.role_id == 2) {
                searchCondition += "and d.id=?";
                searchCondition2 = searchCondition;
                paramArr.push(req.body.doctor_id);
            }

            if (req.body.role_id == 3) {
                searchCondition2 = searchCondition + "and d.id=?";
                searchCondition += "and d.id=? and c.id IN (" + req.body.clinic_id + ") ";
                paramArr.push(req.body.doctor_id);
            }
        }
        paramArr = paramArr.concat(paramArr, paramArr);
        //Pagination//
        if (req.body.page)
        {
            var indexFrom = (req.body.page.page) ? req.body.page.page : 1;
            var countUpTo = (req.body.page.perPage) ? req.body.page.perPage : 10;
        } else {
            var indexFrom = 1;
            var countUpTo = 10;
        }
        //End//
        req.getConnection(function (err, connection) {
            var query = connection.query('select u.first_name,u.email,u.zip,u.state,u.city,' +
                    'u.last_name,u.contact_no,u.address1,u.address2,u.area_id,u.birth_date,c.doctor_id' +
                    ',(select area_name from area_list where id=u.area_id) as area_name' +
                    ',(select app_time from appointment where (parent_appId=app.id or id=app.id)' +
                    ' and status="Visited" order by app_time desc limit 1) as last_visited_date' +
                    ',u.id as user_id,c.id as clinic_id,app.id as app_id,app.app_time,app.reason,app.status,app.updated_date,app.display_file_name,app.report_url' +
                    ' from user as u join appointment as app on u.id=app.user_id join clinic as c on app.clinic_id=c.id' +
                    ' join doctor as d on d.id=c.doctor_id ' +
                    ' where parent_appId = 0 and app.status!="Deleted" and u.status!="deleted" ' +
                    ' ' + searchCondition + ' union select u.first_name,u.email,u.zip,u.state,u.city,u.last_name,u.contact_no,u.address1,u.address2' +
                    ',u.area_id,u.birth_date,null,(select area_name from area_list where id=u.area_id) as area_name,null,' +
                    'u.id as user_id,null,null,null,null,null,null,null,null from user as u join doctor as d on u.created_by=d.user_id left join appointment as a on u.id=a.user_id' +
                    ' where a.user_id is null and u.role_id != 3 ' +
                    ' and u.status!="deleted" ' + searchCondition2 + ' LIMIT ' + ((indexFrom - 1) * countUpTo) + ', ' + countUpTo, paramArr, function (err, rows) {
                console.log(query.sql);
                if (err) {
                    console.log(err);
                    res.status(400).send(err);
                } else {
                    //res.json(rows);
                    //Get total count for Pagination, By Arv //
                    var totalQuery = connection.query('SELECT (select count(*) from user as u join appointment as app on u.id=app.user_id join clinic as c on app.clinic_id=c.id join doctor as d on d.id=c.doctor_id where parent_appId = 0 and app.status!="Deleted" and u.status!="deleted" ' + searchCondition + ') + (select count(*) from user as u join doctor as d on u.created_by=d.user_id left join appointment as a on u.id=a.user_id where a.user_id is null and u.role_id != 3 and u.status!="deleted" ' + searchCondition2 + ') AS totalRes', paramArr, function (err, totalrows) {
                        console.log('Pagination :-> ' + totalQuery.sql);
                        if (err) {
                            console.log(err);
                            res.status(400).send(err);
                        } else {
                            res.json({'data': rows, 'total': totalrows[0]});
                        }
                    });
                    //End//
                }
            });
        });
    } else {
        res.status(400).send({message: "doctor id cannot be blank"});
    }
};

//add user and booked appointment
exports.addUserBYDentist = function (req, res) {
    if (req.body) {
        var validateUser = validate.validateUserAddByDentist(req, res, function (err, value) {
            if (err) {
                console.log("error");
                res.status(400).send({message: value});
            } else {
                var stringPass = user_model.randomString();
                var encryptPassword = user_model.generateHash(stringPass);
                var birthDate = getDateSqlFormat(req.body.birth_date);
                var current_date = new Date();
                var created_date = current_date.getFullYear() + '-' + (parseInt(current_date.getMonth()) + 1) + '-' + current_date.getDate() + ' ' + current_date.getHours() + ':' + current_date.getMinutes() + ':' + current_date.getSeconds();
                req.body.birth_date = birthDate;
                req.body.status = 'pending';
                req.body.created_date = created_date;
                req.body.authkey = user_model.generateHash(req.body.email);
                req.body.password = encryptPassword;
                req.body.patient_id = config.generatePatientId()
                var app_time = getDateSqlFormat(req.body.app_date) + ' ' + req.body.appTime;
                var day = getDayByDate(req.body.app_date);
                var clinic_id = req.body.clinic_id;
                var time = req.body.appTime;
                console.log("day of   " + day);
                var data = {
                    clinic_id: req.body.clinic_id,
                    app_time: app_time,
                    reason: req.body.reason,
                    created_by: req.body.created_by,
                    created_date: created_date,
                    status: 'pending'
                }
                delete req.body.reason;
                delete req.body.clinic_id;
                delete req.body.app_date;
                delete req.body.appTime;
                delete req.body.doctor_id;
                delete req.body.month;
                delete req.body.year;
                delete req.body.date;
                appointment.checkAvailableTimeAndDate(req, clinic_id, app_time, time + ':00', day, 0, function (err, value) {
                    if (err) {
                        logs.appendError(err.toString());
                        return res.status(400).send({
                            message: value
                        });
                    } else {
                        try {
                            req.getConnection(function (err, connection) {
                                var query1 = connection.query('insert into user set ?,role_id=5', req.body, function (err, rows) {
                                    console.log(query1.sql);
                                    if (err) {
                                        console.log(err);
                                        return res.status(400).send({
                                            message: errorHandler.getErrorMessage(err)
                                        });
                                    } else {
                                        if (rows.affectedRows) {
                                            var query = connection.query('insert into appointment set ?,user_id=?', [data, rows.insertId], function (err, row) {
                                                console.log(query.sql);
                                                if (err) {
                                                    console.log(err);
                                                    return res.status(400).send({
                                                        message: errorHandler.getErrorMessage(err)
                                                    });
                                                } else {
                                                    var getLink = serverUrl + "/#!/activateAccount?val=" + req.body.authkey;
                                                    var htmlBody = "Dear " + req.body.first_name + " " + req.body.last_name
                                                            + "<br><br>" + "Thank you for registering with us.<br>"
                                                            + "Before we can activate your account one last step must be taken to complete your registration."
                                                            + "Please note - you must complete this last step to become a registered member."
                                                            + "To complete your registration, please <a href='" + getLink + "'>Click Her</a>e or copy past below URL in browser-<br><br>"
                                                            + "URL-" + getLink
                                                            + "<br>Best Regards,<br>DoctorHere";
                                                    var mailOptions = {
                                                        from: 'DoctorHere  <caprium.test@gmail.com>',
                                                        to: req.body.email,
                                                        subject: 'DoctorHere Account Activation',
                                                        html: htmlBody
                                                    };
                                                    send.sendMail(mailOptions, res);

                                                    if (rows.affectedRows) {
                                                        res.json({message: "User creation and appointment booked successfully"});
                                                    }
                                                }
                                            });
                                        } else {
                                            res.status(400).send({message: "Something went wrong"});
                                        }
                                    }
                                });
                            })
                        } catch (e) {
                            res.status(400).send({message: "Something went wrong"});
                        }
                    }
                });
            }
        });
    } else {
        res.status(400).send({message: "Something went wrong"});
    }
}

exports.clinicList = function (req, res) {
    if (req.body) {
        var condition = '';
        if (req.body.doctor_id > 0) {
            condition = 'and d.id=?';
        }
        req.getConnection(function (err, connection) {
            connection.query('select distinct c.id,c.name from clinic as c' +
                    ' join doctor as d on c.doctor_id=d.id join clinic_time as ct on ct.clinic_id=c.id and c.status="Approved" ' + condition + '', req.body.doctor_id, function (err, rows) {
                        if (err) {
                            console.log(err);
                            return res.status(400).send({
                                message: errorHandler.getErrorMessage(err)
                            });
                        } else {
                            res.json(rows);
                        }
                    })
        })
    } else {
        req.status(400).send({message: "doctor id cannot be blank"})
    }
};

//getAppointments by date
exports.getAvailableAppointmentsTime = function (req, res) {
    var dt = req.body.date;
    console.log(dt);
    var curDate = new Date();
    var datenext = new Date();
    var next3Monthdate = new Date(datenext.setMonth(datenext.getMonth() + 3));
    var curOnlydate = new Date(curDate.getFullYear(), curDate.getMonth(), curDate.getDate(), 0, 0, 0);

    console.log(new Date(next3Monthdate));
    var str = dt.split('/');
    //var start1_date = new Date(date.getFullYear(), date.getMonth(), date.getDate() + i, startTime[0], startTime[1], startTime[2], "");

    var date = new Date(str[2], str[0] - 1, str[1], 0, 0, 0);
    if (!req.body.clinic_id) {
        return res.json({message: "please select clinic"});
    }
    console.log(date + '!=Invalid Date &&' + date + '<' + next3Monthdate + '&&' + date + '>' + curOnlydate);
    if (date != 'Invalid Date' && date < next3Monthdate && date >= curOnlydate) {
        //if()
        console.log('incoming date' + date);
        var sqlDate = date.getFullYear() + '-' + (parseInt(date.getMonth()) + 1) + '-' + date.getDate();
        var curSqlDateTime = curDate.getFullYear() + '-' + (parseInt(curDate.getMonth()) + 1) + '-' + curDate.getDate() + ' ' + curDate.getHours() + ':' + curDate.getMinutes();
        console.log(date);
        console.log(date.getDay());
        var day = 0;
        if (date.getDay() == 0) {
            day = 7;
        } else {
            day = date.getDay();
        }
        req.getConnection(function (err, connection) {
            var qry = connection.query('select * from clinic_time where clinic_id=? and ' +
                    'days=?', [req.body.clinic_id, day], function (err, rows) {
                console.log(qry.sql);
                if (err) {
                    console.log(err);
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    console.log(rows);
                    var query = connection.query('select app_time from appointment where' +
                            ' clinic_id=? and CAST(app_time AS DATE) = ?', [req.body.clinic_id, sqlDate], function (err, row) {
                        console.log(query.sql);
                        if (err) {
                            console.log(err);
                            return res.status(400).send({
                                message: errorHandler.getErrorMessage(err)
                            });
                        } else {
                            if (rows.length > 0) {
                                var timePush = [];
                                console.log(rows[0].shift1_start_time);
                                var startTime = rows[0].shift1_start_time.split(":");
                                var endTime = rows[0].shift1_end_time.split(":");
                                var startTime_2nd = rows[0].shift2_start_time.split(":");
                                var endTime_2nd = rows[0].shift2_end_time.split(":");

                                var start1_date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), startTime[0], startTime[1], startTime[2], "");
                                var start1End_date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), endTime[0], endTime[1], endTime[2], "");

                                var start2_date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), startTime_2nd[0], startTime_2nd[1], startTime_2nd[2], "");
                                var start2End_date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), endTime_2nd[0], endTime_2nd[1], endTime_2nd[2], "");

                                var absDiff = (start1End_date.getTime() - start1_date.getTime()) / 3600000;
                                var absDiff2nd = (start2End_date.getTime() - start2_date.getTime()) / 3600000;

                                var times1 = getTimes(start1_date, absDiff * 2, row);
                                var times2 = getTimes(start2_date, absDiff2nd * 2, row);
                                timePush = times1.concat(times2);
                                res.json(timePush);
                            } else {
                                res.json({message: "The day you have selected is not available for appointments please select another date"});
                            }
                        }
                    });

                }
            })
        })
    } else {
        res.json({message: "please select valid date"});
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

function getDayByDate(dt) {
    var date = "0000-00-00 00:00";
    if (dt != undefined) {
        var str = dt.split('/');//mdy/ymd
        // var date = str[2] + '-' + str[0] + '-' + str[1];
        date = new Date(str[2], (str[0] - 1), str[1]);
        console.log(date);
    }
    return date.getDay();
}

function getTimes(start1_date, absDiff, bookedApptTime) {
    var timePush = [];
    var date = new Date();
    var val = 0;
    var flag = false;
    for (var j = 0; j < absDiff; j++) {
        if (start1_date > date) {
            var date1 = new Date(start1_date.setMinutes(start1_date.getMinutes() + val));
            val = 30;
            flag = false;
            if (bookedApptTime) {
                for (var k in bookedApptTime) {
                    var dt = new Date(Date.parse(bookedApptTime[k].app_time));
                    if (start1_date.getTime() == dt.getTime()) {
                        flag = true;
                    }
                }
            }
            if (flag == false) {
                timePush.push({'dt': date1});
            }
        }
        if (start1_date.getDate() == date.getDate() && start1_date.getMonth() == date.getMonth() && start1_date.getFullYear() == date.getFullYear()) {
            if (start1_date.getHours() >= date.getHours() && start1_date.getMinutes() >= date.getMinutes()) {
                var date1 = new Date(start1_date.setMinutes(start1_date.getMinutes() + val));
                val = 30;
                flag = false;
                for (var k in bookedApptTime) {
                    var dt = new Date(Date.parse(bookedApptTime[k].app_time));
                    if (date1.getTime() == dt.getTime()) {
                        flag = true;
                    }
                }
                if (flag == false) {
                    timePush.push({'dt': date1});
                }


                flag = false;
            } else {
                val = 30;
                start1_date.setMinutes(start1_date.getMinutes() + val);
                val = 0;
            }
        }


    }
    return timePush;
}

//get Patient Detail By AppId
exports.getPatientDetailByAppId = function (req, res) {
    console.log(req.body);
    if (req.body) {
        var val = '';
        if (req.body.app_id != '' && req.body.app_id != undefined) {
            val = 'select u.first_name,u.email,u.zip,u.state,u.city,' +
                    'u.last_name,u.contact_no,u.address1,u.address2,u.birth_date,c.doctor_id,u.area_id' +
                    ',u.id as user_id,u.patient_id,c.id as clinic_id,app.id as app_id,app.app_time,app.reason,app.status' +
                    ',app.updated_date,app.perception,app.clinical_note,app.display_file_name,app.report_url' +
                    ' from user as u join appointment as app on u.id=app.user_id join clinic as c on app.clinic_id=c.id' +
                    ' and app.id = ? and app.status!="Deleted" and u.status!="deleted" '
        } else {
            val = 'select u.first_name,u.email,u.zip,u.state,u.city,' +
                    'u.last_name,u.contact_no,u.address1,u.address2,u.birth_date,null as doctor_id,u.area_id' +
                    ',u.id as user_id,u.patient_id,null as clinic_id,null as app_id,null as app_time,null as reason,null status' +
                    ',null as updated_date,null as perception,null as clinical_note,null as display_file_name,null as report_url' +
                    ' from user as u where u.id=' + req.body.user_id + ' and u.status!="deleted" ';
        }
        try {
            req.getConnection(function (err, connection) {
                var query = connection.query(val, req.body.app_id, function (err, rows) {
                    console.log(query.sql);
                    if (err) {
                        console.log(err);
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    } else {
                        res.json(rows);
                    }
                })
            })
        } catch (e) {

        }

    } else {
        return res.status(400).send({
            message: "bad request"
        });
    }
}

exports.updatePatientDetailByAppId = function (req, res) {

    console.log(req.body);
    if (req.body) {
        var validateUser = validate.validateUserAddByDentist(req, res, function (err, value) {
            if (err) {
                console.log("error");
                res.status(400).send({message: value});
            } else {
                delete req.body.email;
                var birthDate = getDateSqlFormat(req.body.birth_date);
                req.body.birth_date = birthDate;
                var dt = new Date(Date.parse(req.body.appTime));
                //var dtt = new Date()
                var app_time = "";
                var time = "";
                if (dt == 'Invalid Date') {
                    app_time = getDateSqlFormat(req.body.app_date) + ' ' + req.body.appTime;
                    time = req.body.appTime
                } else {
                    app_time = getDateSqlFormat(req.body.app_date) + ' ' + dt.getHours() + ':' + dt.getMinutes();
                    time = dt.getHours() + ':' + dt.getMinutes() + ':00'
                }
                var curDate = new Date();
                var day = getDayByDate(req.body.app_date);
                console.log("day of   " + day);
                console.log(dt);
                var app_id = req.body.app_id;
                var user_id = req.body.user_id;
                var clinic_id = req.body.clinic_id;
                var data = {};
                var sql = '';
                if (app_id == undefined) {
                    data = {
                        clinic_id: req.body.clinic_id,
                        app_time: app_time,
                        reason: req.body.reason,
                        user_id: user_id,
                        status: 'Pending',
                        created_date: curDate.getFullYear() + '-' + (parseInt(curDate.getMonth()) + 1) + '-' + curDate.getDate() + ' ' + curDate.getHours() + ':' + curDate.getMinutes()
                    }

                    sql = 'Insert into appointment set ?';
                } else {
                    data = {
                        clinic_id: req.body.clinic_id,
                        app_time: app_time,
                        reason: req.body.reason,
                        status: 'Pending'

                    }
                    sql = 'update appointment set ? where id=?';
                }
                delete req.body.reason;
                delete req.body.clinic_id;
                delete req.body.app_date;
                delete req.body.appTime;
                delete req.body.area;
                delete req.body.user_id;
                delete req.body.app_id;
                delete req.body.doctor_id;
                delete req.body.perception;
                delete req.body.clinical_note;
                delete req.body.patient_id;
                delete req.body.display_file_name;
                delete req.body.report_url;
                console.log(data);
                appointment.checkAvailableTimeAndDate(req, clinic_id, app_time, time, day, app_id, function (err, value) {
                    if (err) {
                        logs.appendError(err.toString());
                        return res.status(400).send({
                            message: value
                        });
                    } else {
                        try {
                            req.getConnection(function (err, connection) {
                                var query1 = connection.query('update user set ? where id=?', [req.body, user_id], function (err, rows) {
                                    console.log(query1.sql);
                                    if (err) {
                                        console.log(err);
                                        return res.status(400).send({
                                            message: errorHandler.getErrorMessage(err)
                                        });
                                    } else {
                                        if (rows.affectedRows) {
                                            var query = connection.query(sql, [data, app_id], function (err, row) {
                                                console.log(query.sql);
                                                if (err) {
                                                    console.log(err);
                                                    return res.status(400).send({
                                                        message: errorHandler.getErrorMessage(err)
                                                    });
                                                } else {

                                                    if (rows.affectedRows) {
                                                        res.json({message: "Update successfully"});
                                                    }
                                                }
                                            });
                                        } else {
                                            res.status(400).send({message: "User Id is not valid"});
                                        }
                                    }
                                });
                            })
                        } catch (e) {
                            res.status(400).send({message: "Something went wrong"});
                        }
                    }
                });
            }
        });

    } else {
        res.status(400).send({message: "Something went wrong"});
    }

}

exports.getAppoinmentData = function (req, res) {
    if (req.body) {
        try {
            req.getConnection(function (err, connection) {
                var query = connection.query('select clinical_note,perception,updated_date,app_time,status,id as app_id,display_file_name,report_url' +
                        ' from appointment where parent_appId=? and status!="deleted" order by app_time desc', req.body.app_id, function (err, rows) {
                            console.log(query.sql);
                            if (err) {
                                console.log(err);
                                return res.status(400).send({
                                    message: errorHandler.getErrorMessage(err)
                                });
                            } else {
                                res.json(rows);
                            }
                        })
            })
        } catch (e) {

        }
    } else {
        res.status(400).send({message: "Something went wrong"});
    }
}

exports.updateAppointmentNotes = function (req, res) {
    if (req.body) {
        var app_id = req.body.app_id;
        delete req.body.app_id;
        if (req.body.isRest)
            delete req.body.isRest;
        try {
            req.getConnection(function (err, connection) {
                var query = connection.query('update appointment set ? where id=?', [req.body, app_id], function (err, rows) {
                    console.log(query.sql);
                    if (err) {
                        console.log(err);
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    } else {
                        res.json({message: "Update successfully"});
                    }
                });
            });
        } catch (e) {

        }
    } else {
        res.status(400).send({message: "Something went wrong"});
    }
};

//book next appointment of an appointments
exports.bookNextAppointmentSameUser = function (req, res) {
    if (req.body) {
        var app_time = getDateSqlFormat(req.body.app_date) + ' ' + req.body.appTime;
        var current_date = new Date();
        var created_date = current_date.getFullYear() + '-' + (parseInt(current_date.getMonth()) + 1) + '-' + current_date.getDate() + ' ' + current_date.getHours() + ':' + current_date.getMinutes() + ':' + current_date.getSeconds();
        delete req.body.app_date;
        delete req.body.appTime;
        req.body.status = 'Pending';
        try {
            req.getConnection(function (err, connection) {
                var query = connection.query('insert appointment set ?,app_time=?,created_date=? ', [req.body, app_time, created_date], function (err, rows) {
                    console.log(query.sql);
                    if (err) {
                        console.log(err);
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    } else {
                        res.json({app_id: rows.insertId, app_time: app_time});
                    }
                });
            });
        } catch (e) {

        }
    } else {
        res.status(400).send({message: "Something went wrong"});
    }
}


//Change doctor's status : active/inactive
exports.changeStatus = function (req, res) {
    try {
        req.getConnection(function (err, connection) {
            var query = connection.query("UPDATE user SET status = ? WHERE id = ?",
                    [req.body.status, req.body.doctor_id], function (err, rows) {
                console.log(query.sql);
                if (err) {
                    console.log(err);
                    res.status(400).send(err);
                } else {
                    console.log(rows);
                    console.log(req.body.status);
                    if (req.body.status == 'Active') {
                        config.allocateSmsAndEmail(req, res);
                    }
                    res.json(rows);
                }
            });
        });
    } catch (e) {
        logs.appendError(e.stack);
    }
};

//delete all appointments by appointMent id and parent_appId
exports.deleteAppointMentWithParentAppId = function (req, res) {
    try {
        req.getConnection(function (err, connection) {
            var query = connection.query("UPDATE appointment SET status = ? WHERE (id = ? or parent_appId=?)",
                    ['Deleted', req.body.app_id, req.body.app_id], function (err, rows) {
                console.log(query.sql);
                if (err) {
                    console.log(err);
                    res.status(400).send(err);
                } else {
                    console.log(rows);
                    res.json(rows);
                }
            });
        });
    } catch (e) {
        logs.appendError(e.stack);
    }
};

//get User by user Id
exports.getUserByUserId = function (req, res) {
    try {
        req.getConnection(function (err, connection) {
            var query = connection.query("select id,first_name,last_name,contact_no,email," +
                    "address1,birth_date,gender,area_id,state,zip,city,patient_id,image" +
                    ",concat(first_name,' ',last_name) as display_name from user where id=?",
                    [req.body.user_id], function (err, rows) {
                console.log(query.sql);
                if (err) {
                    console.log(err);
                    res.status(400).send(err);
                } else {
                    console.log(rows);
                    res.json(rows);
                }
            });
        });
    } catch (e) {
        logs.appendError(e.stack);
    }
}

//get Service list
exports.getServices = function (req, res) {
    try {
        req.getConnection(function (err, connection) {
            var query = connection.query("SELECT id, name FROM service", function (err, rows) {
                if (err) {
                    console.log(err);
                    res.status(400).send(err);
                } else {
                    res.json(rows);
                }
            });
        });
    } catch (e) {
        logs.appendError(e.stack);
    }
}


//saveCsvFile
exports.saveCsvFile = function (req, res) {
    var form = new multiparty.Form();
    form.parse(req, function (err, fields, files) {
        var file = files.file[0];
        var contentType = file.headers['content-type'];
        var tmpPath = file.path;
        var extIndex = tmpPath.lastIndexOf('.');
        var extension = (extIndex < 0) ? '' : tmpPath.substr(extIndex);
        var destPath = appRoot + '/../public/csv/' + fields.data[0] + extension;
        var is = fs.createReadStream(tmpPath);
        //var os = fs.createWriteStream(destPath);
        var data = {};
        if (extension == '.csv') {
            var csvConverter = new Converter({constructResult: true});
            csvConverter.on("end_parsed", function (jsonObj) {
                //here is your result json object
                config.uploadDataToDataBase(jsonObj, fields.data[0], req, function (err, rows) {
                    if (err) {
                        return res.status(400).send(err);
                    } else {
                        return res.json(rows);
                    }
                });
            })
            is.pipe(csvConverter);
        }
        else if (extension == '.xls') {
            node_xj({
                input: tmpPath, // input xls
                output: "output.json" // output json
            }, function (err, result) {
                if (err) {
                    return res.status(400).send(err);
                } else {
                    config.uploadDataToDataBase(result, fields.data[0], req, function (err, rows) {
                        if (err) {
                            return res.status(400).send(err);
                        } else {
                            return res.json(rows);
                        }
                    });

                }
            });
        }
        else if (extension == '.xlsx') {
            xlsxj({
                input: tmpPath,
                output: "output.json"
            }, function (err, result) {
                if (err) {
                    return res.status(400).send(err);
                } else {
                    config.uploadDataToDataBase(result, fields.data[0], req, function (err, rows) {
                        if (err) {
                            console.log(err);
                            return res.status(400).send(err);
                        } else {
                            return res.json(rows);
                        }
                    });
                }
            });
        } else {
            fs.unlink(tmpPath);
            return res.status(400).send({message: 'Supported file(s) to upload .xlx , .xlsx and .csv'});
        }



        fs.unlink(tmpPath, function (err) { //To unlink the file from temp path after copy
            if (err) {
                return res.status(400).send(err);
            }
        });
        is.on('close', function () {
            console.log("Upload Finished");
        });


    });
};

exports.uploadReportToDataBase = function (req, res) {
    try {
        /* var property = req._passport.instance._userProperty || 'user';
         req[property] = user;
         console.log("testtttttttttttttt"+req[property]);*/

        var form = new multiparty.Form();
        form.parse(req, function (err, fields, files) {
            var fileNames = JSON.parse(fields.data[0]);
            console.log(fileNames.files[0]);
            console.log(fileNames.name);
            var resData = [];
            var dirName = appRoot + '/../public/reports/' + fileNames.name + '_' + fileNames.app_id;

            fs.exists(dirName, function (exists) {
                if (!exists) {
                    fs.mkdir(dirName, 777);
                }
            });
            for (var a = 0; a < files.file.length; a++)
            {
                var file = files.file[a];
                console.log(file.originalFilename);
                var contentType = file.headers['content-type'];
                var tmpPath = file.path;
                var extIndex = tmpPath.lastIndexOf('.');
                var extension = (extIndex < 0) ? '' : tmpPath.substr(extIndex);
                var destPath = dirName + '/' + fileNames.files[a] + extension;
                console.log(fileNames.files[a]);
                // Server side file type checker.
                console.log(contentType);
                if (contentType !== 'image/png' && contentType !== 'image/jpeg'
                        && contentType !== 'application/pdf') {
                    fs.unlink(tmpPath);
                    return res.status(400).send({message: 'Supported file(s) format to upload:-  .jpg , .png and .pdf'});
                }

                var is = fs.createReadStream(tmpPath);
                var os = fs.createWriteStream(destPath);
                // this.saveAllReportToAppointTable();
                if (is.pipe(os)) {
                    fs.unlink(tmpPath, function (err) { //To unlink the file from temp path after copy
                        if (err) {
                            console.log(err);
                        }
                    });
                    resData.push({File: (a + 1) + ' Uploaded successfully', 'src': fileNames[a] + extension})//return res.json(fields.data[a] + extension);
                    is.on('close', function () {
                        console.log("Upload Finished");
                    });
                } else
                    resData.push('File ' + a + ' : ' + fileNames[a] + extension + ' Not uploaded.'); //return res.json('File not uploaded');*/

            }

            return res.json(resData);
        });
    } catch (e) {
        console.log();
        return res.status(400).send({
            message: errorHandler.getErrorMessage(e)
        });
    }
}

//save report name in database
exports.saveAllReportToAppointmentTable = function (req, res) {
    try {
        if (req.body) {
            var srcFileName = '';
            var srcActualFileName = '';
            var dirName = appRoot + '/../public/reports/' + req.body.name + '_' + req.body.app_id;
            var url = config.getDefaultLink() + 'reports/' + req.body.name + '_' + req.body.app_id + '.zip';
            for (var i = 0; i < req.body.file.length; i++) {
                var extIndex = req.body.file[i].lastIndexOf('.');
                var extension = (extIndex < 0) ? '' : req.body.file[i].substr(extIndex);
                srcFileName += (i == 0) ? '' : ',';
                srcActualFileName += (i == 0) ? '' : ',';
                srcFileName += req.body.file[i];
                srcActualFileName += req.body.tmpFile[i] + extension;
            }
            ;
            req.getConnection(function (err, connection) {
                // update `appointment` set `display_file_name`=If(`display_file_name` is NULL,'asdf',concat(display_file_name,',asdfg')) where id=36
                var qry = connection.query('update appointment value' +
                        ' set display_file_name=If(display_file_name is NULL,"' + srcFileName + '",concat(display_file_name,' + '",' + srcFileName + '")),' +
                        ' actual_file_name=If(actual_file_name is NULL,"' + srcActualFileName + '",concat(actual_file_name,' + '",' + srcActualFileName + '")),' +
                        ' report_url=? where id=?', [url, req.body.app_id], function (err, rows) {
                    console.log(qry.sql);
                    if (err) {
                        console.log(err);
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    } else {
                        var EasyZip = require('easy-zip').EasyZip;
                        var zip = new EasyZip();
                        zip.zipFolder(dirName, function () {
                            var val = zip.writeToFile(dirName + '.zip');
                        });
                        return res.json({status: true});
                    }
                })
            })
        }
    } catch (e) {

    }
}

exports.getAllAppointmentByDate = function (req, res) {
    try {
        var sql = 'SELECT CAST(app.app_time as date) AS  appointmentDate,app.app_time,c.id AS clinic_id,d.id as doctor_id,count(CAST(app.app_time AS DATE)) AS appointmentCnt ' +
                'FROM appointment AS app JOIN clinic AS c  ON app.clinic_id = c.id JOIN doctor AS d ON c.doctor_id = d.id ' +
                'JOIN user AS u ON u.id =app.user_id WHERE d.id = ? AND app.status != "Deleted" AND c.status != "Deleted" ' +
                'AND u.status != "deleted" GROUP BY appointmentDate';
        req.getConnection(function (err, connection) {
            if (err) {
                console.log(err);
                logs.appendError(err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                var qry = connection.query(sql, [req.body.doctor_id], function (err, rows) {
                    if (err) {
                        console.log(err);
                        logs.appendError(err);
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    } else {
                        return res.json(rows);
                    }
                });
            }
        });
    } catch (e) {
        logs.appendError(e.toString);
        console.log(e);
    }

}

exports.getAllAppointmentBySelectedDate = function (req, res) {
    try {
        if (req.body) {
            var date = new Date(parseInt(req.body.date));
            var sqlDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
            var searchCondition = '';
            var paramArr = [];
            paramArr.push(req.body.doctor_id);
            paramArr.push(sqlDate);
            if (req.body.searchVal) {
                var sArr = req.body.searchVal.split(' ');
                searchCondition += " AND (";
                for (var i = 0; i < sArr.length; i++) {
                    searchCondition += (i == 0) ? "" : " OR ";
                    searchCondition += ' ((u.first_name like ?) OR (u.last_name like ?))';
                    paramArr.push('%' + sArr[i] + '%', '%' + sArr[i] + '%');
                }
                searchCondition += ") ";
            }

            var sql = 'SELECT u.first_name,u.last_name,app.app_time,u.contact_no,app.reason,app.status, ' +
                    'u.id AS user_id,app.id AS app_id,c.id AS clinic_id ' +
                    'FROM user AS u JOIN appointment AS app ON u.id = app.user_id JOIN clinic as c ' +
                    'ON c.id = app.clinic_id JOIN doctor AS d on d.id = c.doctor_id WHERE d.id = ? AND ' +
                    'CAST(app.app_time AS DATE)  = ? and app.status != "Deleted" and u.status != "deleted" ' + searchCondition + ''
            req.getConnection(function (err, connection) {
                if (err) {
                    console.log(err);
                    logs.appendError(err);
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    var qry = connection.query(sql, paramArr, function (err, rows) {
                        console.log(qry.sql);
                        if (err) {
                            console.log(err);
                            logs.appendError(err);
                            return res.status(400).send({
                                message: errorHandler.getErrorMessage(err)
                            });
                        } else {
                            return res.json(rows);
                        }
                    });
                }
            });
        } else {
            return res.status(400).send({message: "Body cannot be blank"});
        }
    } catch (e) {
        logs.appendError(e.toString);
        console.log(e);
    }
}
exports.doctorCategory = function (req, res) {
    try {
        var sqlStr = "SELECT id, name FROM doctors_category";
        req.getConnection(function (err, connection) {
            var query = connection.query(sqlStr, function (err, rows) {
                if (err) {
                    console.log(err);
                    res.status(400).send(err);
                } else {
                    res.json(rows);
                }
            });
        });
    } catch (e) {
        logs.appendError(e.stack);
    }
};

exports.getAppointmentStatus = function (req, res) {
    console.log(req.body.user_id);
    try {
        // var sql = 'SELECT app.status,c.id AS clinic_id,d.id as doctor_id ' +
        // 'FROM appointment AS app JOIN clinic AS c  ON app.clinic_id = c.id JOIN doctor AS d ON c.doctor_id = d.id ' +
        // 'JOIN user AS u ON d.user_id = u.id WHERE u.role_id = ? ';
        var sql = 'SELECT COUNT(app.status) as status_cnt,app.status FROM appointment AS app JOIN clinic AS c ON app.clinic_id = c.id JOIN doctor AS d  ON c.doctor_id = d.id JOIN user AS u ON  d.user_id = u.id WHERE u.id = ? AND app.parent_appId = 0 AND u.status!="deleted"  GROUP BY app.status';
        req.getConnection(function (err, connection) {
            var query = connection.query(sql, req.body.user_id, function (err, rows) {
                console.log(query.sql);
                if (err) {
                    console.log(err);
                    res.status(400).send(err);
                } else {
                    res.json(rows);
                    console.log(rows);
                }
            });
        });
    } catch (e) {
        logs.appendError(e.stack);
    }
};

exports.getDentistData = function (req, res) {
    try {
        //Pagination//

        var indexFrom = (req.body.page) ? req.body.page : 1;
        //var countUpTo = (req.body.page.perPage) ? req.body.page.perPage : 4;

        //End//
        var sql = 'SELECT d.id,u.first_name,u.last_name,u.image,d.facebook_url,d.linkedin_url,d.googleplus_url,d.twitter_url,(SELECT GROUP_CONCAT(speciality_id) FROM doctor_speciality WHERE doctor_id = d.id) AS dSpeciality from user as u join doctor as d ON d.user_id = u.id where u.role_id = 2 AND u.status = "Active" limit ' + ((indexFrom - 1) * 4) + ', 4';
        req.getConnection(function (err, connection) {
            if (err) {
                console.log(err);
                logs.appendError(err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                var qry = connection.query(sql, function (err, rows) {
                    console.log(qry.sql);
                    if (err) {
                        console.log(err);
                        logs.appendError(err);
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    } else {
                        return res.json(rows);
                    }
                });
            }
        });
    } catch (e) {
        logs.appendError(e.toString);
        console.log(e);
        return res.status(400).send({message: "Something went wrong"});
    }
};

exports.getDentistStatus = function (req, res) {
    try {
        req.getConnection(function (err, connection) {
            var query = connection.query('SELECT COUNT(status) as status_cnt,status FROM user WHERE role_id = 2 GROUP BY status', function (err, rows) {
                console.log(query.sql);
                if (err) {
                    console.log(err);
                    res.status(400).send(err);
                } else {
                    res.json(rows);
                    console.log(rows);
                }
            });
        });
    } catch (e) {
        logs.appendError(e.stack);
    }
};

exports.getReferList = function (req, res) {
    try {
        req.getConnection(function (err, connection) {
            var sText = '';
            console.log(req.body.searchText);
            if(req.body.searchText && req.body.searchText != '')
            {
                sText = ' AND (user.first_name like "%'+ req.body.searchText +'%" OR user.last_name like "%'+ req.body.searchText +'%")';
            } else {
                sText = ' LIMIT 20';
            }
            var query = connection.query('SELECT doctor.id, user.first_name, user.last_name FROM doctor JOIN user ON doctor.user_id = user.id WHERE user.role_id = 2 AND user.status = "Active" AND user.id != ?'+sText, req.body.doctor, function (err, rows) {
                console.log(query.sql);
                if (err) {
                    console.log(err);
                    res.status(400).send(err);
                } else {
                    res.json(rows);
                }
            });
        });
    } catch (e) {
        logs.appendError(e.stack);
    }
};


exports.referToDoctor = function (req, res) {
    try {
        validate.referToDoctorValidate(req, res, function (err, value) {
            if (err) {
                console.log("error" + value);
                res.status(400).send({message: value});
            } else {
                req.getConnection(function (err, connection) {
                    var query = connection.query('SELECT first_name, last_name, email FROM user WHERE id = ?', req.body.patient, function (err, rows) {
                        console.log(query.sql);
                        if (err) {
                            console.log(err);
                            res.status(400).send(err);
                        } else {
                            var doctorQuery = connection.query('SELECT user.first_name, user.last_name FROM user JOIN doctor ON user.id = doctor.user_id WHERE doctor.id = ?', req.body.referFrom, function (err, dRows) {
                                console.log(doctorQuery.sql);
                                if (err) {
                                    console.log(err);
                                    return res.status(400).send({
                                        message: errorHandler.getErrorMessage(err)
                                    });
                                } else {
                                    var getLink = serverUrl + "/#!/dentistDetail/" + req.body.referTo;
                                    var htmlBody = "Dear " + rows[0].first_name + " " + rows[0].last_name
                                            + "<br><br>" + "Thank you for booking your appointment with one of our doctor. You have booked an appointment with Dr. " + dRows[0].first_name + " " + dRows[0].last_name + ", and he has refered to another doctor for your better treatment. Please check refered doctor dtails and book a new appointment with refered doctor. <br> To book new appointment <a href='" + getLink + "'>Click Here</a> or copy past below URL in browser-<br>"
                                            + "URL-" + getLink
                                            + "<br>Reason for refer given by Dr. " + dRows[0].first_name + " " + dRows[0].last_name + " - " + req.body.reason
                                            + "<br><br>Best Regards,<br>DoctorHere";
                                    var mailOptions = {
                                        from: 'DoctorHere  <caprium.test@gmail.com>',
                                        to: rows[0].email,
                                        subject: 'DoctorHere Appointment',
                                        html: htmlBody
                                    };
                                    //console.log(mailOptions);
                                    send.sendMail(mailOptions, res);
                                    res.json(rows);
                                }
                            });
                        }
                    });
                });
            }
        });
    } catch (e) {
        logs.appendError(e.stack);
    }
};