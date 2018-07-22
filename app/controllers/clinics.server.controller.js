'use strict';
/**
 * Module dependencies.
 */
//mongoose = require('mongoose'),
var errorHandler = require('./errors.server.controller'),
        //Clinic = mongoose.model('Clinic'),
        _ = require('lodash');

var multiparty = require('multiparty'), //To save file type
//uuid = require('node-uuid'), //To create GUID of file name
        fs = require('fs');
var logs = require('../components/logs.js');
var validate = require('../components/validation.js');
var coreCont = require('./core.server.controller');

/**
 * Create a Clinic
 */
exports.create = function (req, res) {
    try {
        delete req.body.user_id;
        delete req.body.id;
        validate.addClinicValidation(req, res, function (err, value) {
            if (err) {
                console.log("error");
                res.status(400).send(value);
            } else {
                var serviceList = [];
                if (req.body.services)
                {
                    serviceList = req.body.services;
                    delete req.body.services;
                }
                req.getConnection(function (err, connection) {
                    var qry = connection.query('INSERT INTO clinic SET ?', req.body, function (err, rows) {
                        if (err) {
                            console.log(err);
                            //logs.appendError(err.toString());
                            return res.status(400).send({
                                message: errorHandler.getErrorMessage(err)
                            });
                        } else {
                            if (rows.affectedRows > 0) {
                                if (serviceList.length > 0)
                                {
                                    var serviceValues = [];
                                    for (var a = 0; a < serviceList.length; a++)
                                    {
                                        serviceValues.push([rows.insertId, serviceList[a]]);
                                    }
                                    connection.query('INSERT INTO clinic_service (clinic_id, service_id) VALUES ?', [serviceValues], function (err, rows1) {
                                        if (err) {
                                            console.log(err);
                                            //logs.appendError(err.toString());
                                            return res.status(400).send({
                                                message: errorHandler.getErrorMessage(err)
                                            });
                                        } else {
                                            coreCont.addEvent(req, 'has added one clinic', req.body.doctor_id, 'doctor'); //Add to event//
                                            res.json({'insertId': rows.insertId, 'message': "Clinic added successfully"});
                                        }
                                    });
                                } else {
                                    coreCont.addEvent(req, 'has added one clinic', req.body.doctor_id, 'doctor'); //Add to event//
                                    res.json({'insertId': rows.insertId, message: "Clinic added successfully"});
                                }
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
 * Show the current Clinic
 */
exports.read = function (req, res) {
    req.getConnection(function (err, connection) {
        connection.query('SELECT id, name, landmark, contact_no, contact2, address, area_id, city, zip, doctor_id, latitude,logitude,slot_diff FROM clinic WHERE id = ?', req.body.id, function (err, rows) {
            if (err) {
                console.log(err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                if (rows) {
                    connection.query('SELECT id, image FROM clinic_image WHERE clinic_id = ?', req.body.id, function (err, rows1) {
                        if (err) {
                            console.log(err);
                            return res.status(400).send({
                                message: errorHandler.getErrorMessage(err)
                            });
                        } else {
                            if (rows) {
                                res.json({clinic: rows, clinic_images: rows1});
                            }
                        }
                    });
                    //res.json(rows);
                }
            }
        });
    });
};

/**
 * Update a Clinic
 */
exports.update = function (req, res) {
    try {
        var validateClinic = validate.addClinicValidation(req, res, function (err, value) {
            if (err) {
                console.log("error");
                res.status(400).send(value);
            } else {
                var serviceList = [];
                if (req.body.services)
                {
                    serviceList = req.body.services;
                    delete req.body.services;
                }
                delete req.body.user_id;
                delete req.body.id;
                req.body.id = req.body.clinic_id;
                delete req.body.clinic_id;
                req.getConnection(function (err, connection) {
                    var updateQry = connection.query('UPDATE clinic SET ? WHERE id=?', [req.body, req.body.id], function (err, rows) {
                        console.log(updateQry.sql);
                        if (err) {
                            console.log(err);
                            //logs.appendError(err.toString());
                            return res.status(400).send({
                                message: errorHandler.getErrorMessage(err)
                            });
                        } else {
                            if (rows) {
                                if (serviceList.length > 0)
                                {
                                    var serviceValues = [];
                                    for (var a = 0; a < serviceList.length; a++)
                                    {
                                        serviceValues.push([req.body.id, serviceList[a]]);
                                    }
                                    connection.query('DELETE FROM clinic_service WHERE clinic_id = ?', [req.body.id], function (err, rows1) {
                                        if (err) {
                                            return res.status(400).send({
                                                message: errorHandler.getErrorMessage(err)
                                            });
                                        } else {
                                            connection.query('INSERT INTO clinic_service (clinic_id, service_id) VALUES ?', [serviceValues], function (err, rows2) {
                                                if (err) {
                                                    return res.status(400).send({
                                                        message: errorHandler.getErrorMessage(err)
                                                    });
                                                } else {
                                                    res.json({message: "Clinic updated successfully"});
                                                }
                                            });
                                        }
                                    });
                                } else {
                                    res.json({message: "Clinic updated successfully"});
                                }
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
 * Delete an Clinic
 */
exports.delete = function (req, res) {
    req.getConnection(function (err, connection) {
        connection.query('UPDATE clinic SET clinic.status = "Deleted" WHERE id = ?', req.body.id, function (err, rows) {
            if (err) {
                console.log(err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                if (rows.affectedRows) {
                    console.log(rows);
                    res.json({message: "Clinic deleted succesfully"});
                    //res.json(rows);
                } else {
                    res.json({message: "No Clinics"});
                }
            }
        });
    });
};

exports.saveClinicTiming = function (req, res) {
    try {
        if (req.body) {
            req.getConnection(function (err, connection) {
                var query = connection.query('delete from clinic_time where clinic_id=?', req.body.id, function (err, rows) {
                    if (err) {
                        res.status(400).send(err);
                    } else {
                        var timeValues = [];
                        for (var a = 0; a < req.body.timingData.length; a++)
                        {
                            req.body.timingData[a].time.shift1_start_time = req.body.timingData[a].time.shift1_start_time || '00:00:00';
                            req.body.timingData[a].time.shift1_end_time = req.body.timingData[a].time.shift1_end_time || '00:00:00';
                            req.body.timingData[a].time.shift2_start_time = req.body.timingData[a].time.shift2_start_time || '00:00:00';
                            req.body.timingData[a].time.shift2_end_time = req.body.timingData[a].time.shift2_end_time || '00:00:00';

                            timeValues.push([req.body.id, req.body.timingData[a].day, req.body.timingData[a].time.shift1_start_time, req.body.timingData[a].time.shift1_end_time, req.body.timingData[a].time.shift2_start_time, req.body.timingData[a].time.shift2_end_time]);
                        }
                        var queryTxt = 'INSERT INTO clinic_time (clinic_id, days, shift1_start_time, shift1_end_time, shift2_start_time, shift2_end_time) VALUES ?';
                        var query1 = connection.query('INSERT INTO clinic_time (clinic_id, days, shift1_start_time, shift1_end_time, shift2_start_time, shift2_end_time) VALUES ?', [timeValues], function (err, rows) {
                            console.log(query1.sql);
                            if (err) {
                                console.log(err);
                                res.status(400).send(err);
                            } else {
                                if (rows.affectedRows) {
                                    res.jsonp({message: "Clinic time updated successfully"});
                                } else {
                                    res.status(400).send({message: "Clinic time not updated"});
                                }
                            }
                        });
                    }
                });
            });

        } else {
            res.status(400).send({message: "Something went wrong"});
        }
    } catch (e) {

    }
};


exports.saveImageData = function (req, res) {
    try {
        var srcValues = [];
        for (var a = 0; a < req.body.images.length; a++)
        {
            srcValues.push([req.body.id, req.body.images[a]]);
        }
        req.getConnection(function (err, connection) {
            var queryTxt = "INSERT INTO clinic_image (clinic_id, image) VALUES ?";
            var query1 = connection.query(queryTxt, [srcValues], function (err, rows) {
                console.log(query1.sql);
                if (err) {
                    console.log(err);
                    res.status(400).send(err);
                } else {
                    if (rows.affectedRows) {
                        for (var b = 0; b < srcValues.length; b++)
                        {
                            //console.log(srcValues[b]);
                            //console.log(srcValues[b][1]);
                            var srcVal = srcValues[b][1];
                            var source = fs.createReadStream(appRoot + '/../public/images/clinic_images/tmp/' + srcValues[b][1]),
                                    destination = fs.createWriteStream(appRoot + '/../public/images/clinic_images/' + srcValues[b][1]);
                            source.pipe(destination, {end: false});
                            source.on("end", function () {
                                console.log(srcVal);
                                fs.unlink(appRoot + '/../public/images/clinic_images/tmp/' + srcVal);
                            });
                            source.on('close', function () {
                                console.log("Upload Finished");
                            });
                        }
                        res.jsonp({message: "Clinic image saved successfully"});
                    } else {
                        res.status(400).send({message: "Clinic image not saved"});
                    }
                }
            });
        });
    } catch (e) {

    }
};

exports.saveClinicImages = function (req, res) {
    try {
        var form = new multiparty.Form();
        form.parse(req, function (err, fields, files) {
            var fileNames = fields.data[0].replace('[', '').replace(']', '').replace(/"/g, '').split(',');
            var resData = [];
            /*console.log(files.file.length);
             console.log(typeof files.file);
             console.log(typeof files.file[0]);
             console.log(files.file[0].length)*/
            for (var a = 0; a < files.file.length; a++)
            {
                var file = files.file[a];
                var contentType = file.headers['content-type'];
                var tmpPath = file.path;
                var extIndex = tmpPath.lastIndexOf('.');
                var extension = (extIndex < 0) ? '' : tmpPath.substr(extIndex);
                var destPath = appRoot + '/../public/images/clinic_images/tmp/' + fileNames[a] + extension;
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
                    resData.push({File: 'Image ' + (a + 1) + ' Uploaded successfully', 'src': fileNames[a] + extension})//return res.json(fields.data[a] + extension);
                    is.on('close', function () {
                        console.log("Upload Finished");
                    });
                } else
                    resData.push('File ' + a + ' : ' + fileNames[a] + extension + ' Not uploaded.'); //return res.json('File not uploaded');
            }
            return res.json(resData);
        });
    } catch (e) {

    }
};

/**
 * List of Clinics
 */
exports.list = function (req, res) {
    req.getConnection(function (err, connection) {
        var searchCondition = '';
        var adminQry = '';
        var paramArr = [req.body.doctor_id];
        if (req.body.searchVal)
        {
            var sArr = req.body.searchVal.split(' ');
            searchCondition += "(";
            for (var i = 0; i < sArr.length; i++) {
                searchCondition += (i == 0) ? "" : " OR ";
                searchCondition += ' ((clinic.name like ?) OR (area_list.area_name like ?))';
                paramArr.push('%' + sArr[i] + '%', '%' + sArr[i] + '%');
            }
            searchCondition += ") ";
        }
        if (req.body.doctor_id == 'admin')
        {

            adminQry += ((searchCondition == '') ? '' : 'AND') + '  (clinic.status != "Deleted" OR doctor_id = ?) ';

        } else {
            adminQry += ((searchCondition == '') ? '' : 'AND') + ' (clinic.status != "Deleted" AND doctor_id = ?) ';

        }
        //Pagination
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
        console.log(req.body.status);
        var strStatus = '';
        if (req.body.status) {

            if (req.body.doctor_id == 'admin')
            {

                strStatus = ((searchCondition == '') ? '' : 'AND') + '  ( doctor_id = ? OR clinic.status = ? ) ';
                adminQry = '';
                paramArr.push(req.body.status);
            } else {

                strStatus = ((searchCondition == '') ? '' : 'AND') + ' ( doctor_id = ? AND clinic.status = ?)';
                adminQry = '';
                paramArr.push(req.body.status);
            }
        }
        //End//

        var qrr = connection.query('SELECT clinic.id, clinic.name, clinic.contact_no, clinic.address, clinic.city, user.first_name, user.last_name, user.email, clinic.status, area_list.area_name, clinic_time.shift1_start_time AS startTime, clinic_time.shift2_end_time AS endTime FROM clinic LEFT JOIN clinic_time ON clinic.id = clinic_time.clinic_id JOIN area_list ON clinic.area_id = area_list.id JOIN doctor ON clinic.doctor_id = doctor.id JOIN user ON doctor.user_id = user.id WHERE ' + searchCondition + adminQry + strStatus + ' GROUP BY clinic.id LIMIT ' + ((indexFrom - 1) * countUpTo) + ', ' + countUpTo, paramArr, function (err, rows) {
            console.log(qrr.sql);
            if (err) {
                console.log(err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                if (rows) {
                    var totalQuery = connection.query('SELECT count(*) totalRes FROM clinic JOIN area_list ON clinic.area_id = area_list.id JOIN doctor ON clinic.doctor_id = doctor.id JOIN user ON doctor.user_id = user.id WHERE ' + adminQry + searchCondition + strStatus, paramArr, function (err, totalrows) {
                        console.log('Pagination :-> ' + totalQuery.sql);
                        if (err) {
                            console.log(err);
                            return res.status(400).send({
                                message: errorHandler.getErrorMessage(err)
                            });
                        } else {
                            if (rows) {
                                for (var a in rows)
                                {
                                    if (rows[a].startTime)
                                    {
                                        var dt = rows[a].startTime.split(':');
                                        rows[a].startTime = new Date('', '', '', dt[0], dt[1], dt[2]);
                                    } else {
                                        rows[a].startTime = 'not';
                                    }
                                    if (rows[a].endTime)
                                    {
                                        var dt1 = rows[a].endTime.split(':');
                                        rows[a].endTime = new Date('', '', '', dt1[0], dt1[1], dt1[2]);
                                    } else {
                                        rows[a].endTime = 'not';
                                    }
                                }
                                res.json({'data': rows, 'total': totalrows[0]});
                            } else {
                                return res.status(400).send({
                                    message: errorHandler.getErrorMessage(err)
                                });
                            }
                        }
                    });


                    //res.json(rows);
                } else {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                }
            }
        });
    });
};

//To change clinic status
exports.changeStatus = function (req, res) {
    try {
        req.getConnection(function (err, connection) {
            var query = connection.query("UPDATE clinic SET status = ? WHERE id = ?",
                    [req.body.status, req.body.clinic_id], function (err, rows) {
                if (err) {
                    console.log(err);
                    res.status(400).send(err);
                } else {
                    res.json({message: "Clinic " + req.body.status + " successfully"});
                }
            });
        });
    } catch (e) {
        logs.appendError(e.stack);
    }
};

//To get clinic services
exports.getClinicServices = function (req, res) {
    try {
        req.getConnection(function (err, connection) {
            var query = connection.query("SELECT service_id FROM clinic_service WHERE clinic_id = ?",
                    [req.body.id], function (err, rows) {
                //console.log(query.sql);
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

/**
 * Clinic middleware
 */
exports.clinicByID = function (req, res, next, id) {
    //Clinic.findById(id).populate('user', 'displayName').exec(function(err, clinic) {
    //	if (err) return next(err);
    //	if (! clinic) return next(new Error('Failed to load Clinic ' + id));
    //	req.clinic = clinic ;
    //	next();
    //});
};

/**
 * Clinic authorization middleware
 */
exports.hasAuthorization = function (req, res, next) {
    //if (req.clinic.user.id !== req.user.id) {
    //	return res.status(403).send('User is not authorized');
    //}
    //next();
};

exports.removeUploadedFile = function (req, res) {
    try {
        req.getConnection(function (err, connection) {
            var qry = connection.query('DELETE FROM clinic_image WHERE id = ?', req.body.imageId, function (err, rows) {
                console.log(qry.sql);
                if (err) {
                    console.log(err);
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    if (rows) {
                        res.json({message: "Images deleted successfully"});
                    }
                }
            });
        })
    } catch (e) {
        logs.appendError(e.stack);
    }
};


exports.getClinicStatus = function (req, res) {
    console.log(req.body.user_id);
    try {
        var sql = 'SELECT COUNT(c.status) as status_cnt,c.status FROM clinic AS c JOIN doctor AS d  ON c.doctor_id = d.id JOIN user AS u ON  d.user_id = u.id GROUP BY c.status';
        req.getConnection(function (err, connection) {
            var query = connection.query(sql, function (err, rows) {
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

