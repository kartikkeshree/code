
var crypto = require('crypto');
var logs = require('../components/logs.js');
var user_models = require('./user.server.model');
var config=require('../components/config');
exports.addUser = function (req, row) {
    try {
        req.getConnection(function (err, connection) {
            var date = new Date();
			if(!req.body.isRest) //if not call from web service then save without encoded//
			{
				var encryptedPassword = user_models.generateHash(req.body.password);
				req.body.password = encryptedPassword;
			}else{
				delete req.body.isRest;
			}
            var date = new Date();
            req.body.created_date = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+' '+date.getHours()+':'+date.getMinutes();
            console.log(req.body.created_date);

            //if role is staff
            var staffAccessibility = '';
            var clinicIds = '';
            //var dentist_i = '';
            if(req.body.role_id==3){
                for(var i in req.body.check){
                       if(req.body.check[i] != '')staffAccessibility += req.body.check[i]+',';
                }
                staffAccessibility = staffAccessibility.substr(0,staffAccessibility.length-1);
                console.log(staffAccessibility);
                clinicIds = req.body.clinic_id;
                doctor_id = req.body.doctor_id;
                req.body.confirmation = 1;
                req.body.status = 'Active';

                delete req.body.check;
                delete req.body.clinic_id;
                delete req.body.doctor_id;
            } else if(req.body.role_id == 5) {
                req.body.patient_id = config.generatePatientId();
            }
            var query = connection.query("INSERT INTO user set ? ", req.body,
                function (err, rows) {
                    console.log(query.sql);
                    if (err) {
                        console.log(err);
                        row(err, 0);
                    } else {
                        console.log(rows.insertId);
                        if (req.body.role_id == 2) {
                            var data = {
                                user_id: rows.insertId
                            };
                            var query1 = connection.query(
                                "INSERT INTO doctor set ? ", data,
                                function (er, row) {
                                    console.log(query1.sql);
                                    if (er) {
                                        console.log("err");
                                    } else {
                                        console.log("doctor id" + row.insertId);
                                    }

                                });
                        }
                        if(req.body.role_id == 3){
                          //insert into staff (user_id,module_access) values ()
                            var str = [];
                            for(var i = 0; i < clinicIds.length; i++) {
                                str.push([rows.insertId,staffAccessibility,doctor_id,clinicIds[i],'Approved']);
                            }
                            console.log(str);
                            var query2 = connection.query(
                                "INSERT INTO staff (user_id,module_access,doctor_id,clinic_id,status) VALUES ? ", [str],
                                function (er, row) {
                                    console.log(query2.sql);
                                    if (er) {
                                        console.log("err");
                                    } else {
                                        console.log("Staff id" + row.insertId);
                                    }

                                });
                        }
                        row(err, rows);
                    }
                });
        });
    } catch (e) {
        logs.appendError(e);
    }
};

/*exports.loginUser = function (req, row) {
    try {
        req.getConnection(function (err, connection) {
            req.body.password = user_models.generateHash(req.body.password);
            var query = connection.query(
                "select id,email,first_name,last_name,role_id from users where email=? and password=?",
                [req.body.email, req.body.password], function (err, rows) {
                    console.log(query.sql);
                    if (err) {
                        console.log("err");
                        row(err, 0);
                    } else {
                        console.log(JSON.stringify(rows));
                        if (rows.id == 'undefined') {
                            row(err, 0);
                        } else {
                            row(err, rows);
                        }

                    }
                });
        });
    } catch (e) {
        logs.appendError(e.stack);
    }
};*/

/*exports.updateIsActivated = function (req, row) {
    req.getConnection(function (err, connection) {
        var query = connection.query(
            "update user set confirmation=1 where authkey=?",
            [req.query.val], function (err, rows) {
                if (err) {
                    console.log("err");
                    row(err, 0);
                } else {
                    if (rows.id == 'undefined') {
                        row(err, 0);
                    } else {
                        row(err, rows);
                    }
                }
            });
    });
};*/

exports.checkEmailExistOrNot = function (req, callback) {
    var val = req.getConnection(function (err, connection) {
        var query = connection.query("select email from user where email=?",
            [req.body.email], function (err, rows) {
                console.log(query.sql);
                if (err) {
                    callback(err, 0);
                } else {
                    callback(err, rows);
                }
            });
    });

};

exports.forgotPassword = function (req, callback) {
    try {
        var val = req.getConnection(function (err, connection) {
            var query = connection.query("select first_name,last_name from user where email=?",
                [req.body.email], function (err, rows) {
                    if (err) {
                        callback(err, 0);
                    } else {
                        if (rows) {
                            var stringPass = module.exports.randomString();
                            var encryptPassword = user_models.generateHash(stringPass);
                            var query1 = connection.query("update user set password=? where email=?", [encryptPassword, req.body.email], function (err, rows1) {
                                if (err) {
                                    callback(err, 0);
                                } else {
                                    rows.password = stringPass;
                                    callback(err, rows);
                                }
                            });
                        }

                    }
                });
        });
    } catch (e) {
        logs.appendError(e.stack);
        callback(err, 0);
    }
};

exports.randomString=function() {
    var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var result = '';
    for (var i = 6; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;
}


exports.generateHash = function (email) {
    return crypto.createHash('sha1').update(email).digest("hex");
};
