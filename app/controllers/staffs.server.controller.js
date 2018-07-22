'use strict';

/**
 * Module dependencies.
 */
var errorHandler = require('./errors.server.controller'),
	_ = require('lodash');
var validate = require('../components/validation.js');
var config = require('../components/config.js');

exports.staffByStaffId = function(req,res) {
    try {
    	    console.log(req.body);
    	    var sql='SELECT u.id as user_id,u.first_name,u.last_name,u.email,u.address1,'+
    	            'u.contact_no,s.module_access,s.status,s.id as staffId, '+
    	            'c.id as clinic_id FROM user as u JOIN staff as s on s.user_id = u.id '+
    	            ' JOIN clinic as c on s.clinic_id = c.id AND '+
    	            'u.status != "deleted" AND c.status != "Deleted" AND s.id = ? AND u.role_id = 3'
    	    req.getConnection(function(err,connection) {
    	        var query = connection.query(sql,[req.body.staff_id],function(err,rows) {
    	        console.log(query.sql)
    	            if(err) {
    	                console.log(err);
    	                return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
    	            } else {
    	               res.jsonp(rows);
    	            }
    	        })
    	    });
    	} catch(e) {

    	}
}

exports.getModulesAccessByStaff = function (req,res){
    try{
    var sql='SELECT module_access,Group_Concat(clinic_id) as clinicIds,doctor_id FROM staff WHERE user_id = ? and status = "Approved" ';
        req.getConnection(function(err,connection){
            var qry = connection.query(sql,[req.body.id],function(err,rows){
            console.log(qry.sql);
                if(err){
                    console.log(err);
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    res.jsonp(rows);
                }
            })
        });
    }catch(e){

    }
}

/**
 * List of Staffs
 */
exports.staffByDentistId = function(req, res) {
	try {
	    var searchCondition = '';
	    var paramArr = [];
	    paramArr.push(req.body.id);
	    console.log(req.body);
	    if(req.body.searchVal != ''){
	        searchCondition = 'AND ('
	        var searchTxt = req.body.searchVal.split(' ');
            for(var i = 0; i < searchTxt.length; i++) {
                searchCondition += (i == 0)?'':' OR ';
                searchCondition += '((u.first_name like ?) OR (u.last_name like ?) OR (c.name like ?))';
                paramArr.push('%'+searchTxt[i]+'%','%'+searchTxt[i]+'%','%'+searchTxt[i]+'%');
            }
            searchCondition += ')';
	    }
	    console.log(searchCondition);
		
		//Status//
		var strStatus='';
			if(req.body.status){
				strStatus ='AND s.status = ?';
				paramArr.push(req.body.status);
			}else{
				strStatus ='AND s.status!="Deleted" ';
			}
			
	    var sql='SELECT u.id as user_id,u.first_name,u.last_name,u.email,u.address1,'+
	            'u.contact_no,s.module_access,s.status,s.id as staffId, '+
	            'c.name as clinic_name FROM user as u JOIN staff as s on s.user_id = u.id '+
	            ' JOIN clinic as c on s.clinic_id = c.id AND '+
	            'u.status != "deleted" AND c.status != "Deleted" AND u.created_by = ? AND u.role_id = 3 ' + searchCondition + strStatus+ ''
	    req.getConnection(function(err,connection) {
	        var query = connection.query(sql,paramArr,function(err,rows) {
	        console.log(query.sql)
	            if(err) {
	                console.log(err);
	                return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
	            } else {
	               res.jsonp(rows);
	            }
	        })
	    });
	} catch(e) {

	}
};

/**
 * Staff authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.staff.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};


//change status
exports.changeStaffStatus = function(req, res) {
	try {
		req.getConnection(function (err, connection) {
			var query = connection.query("UPDATE staff SET status = ? WHERE id = ?",
				[req.body.status, req.body.staff_id], function (err, rows) {
					if (err) {
						console.log(err);
						res.status(400).send(err);
					} else {
						res.json({message:"Staff "+ req.body.status +" successfully"});
					}
				});
		});
	} catch (e) {
		logs.appendError(e.stack);
	}
};

//get Staff status
exports.getStaffStatus = function(req,res){
	try{
		var sql='SELECT COUNT(s.status) as status_cnt,s.status FROM staff AS s JOIN doctor AS d  ON s.doctor_id = d.id JOIN user AS u ON  d.user_id = u.id WHERE u.id = ? GROUP BY s.status';
			req.getConnection(function (err, connection) {
            var query = connection.query(sql,req.body.user_id,function (err, rows) {
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
	}catch (e){
		logs.appendError(e.stack);
	}
};

//edit user details and modules access
exports.updateUserAndStaffModule = function(req,res) {
    console.log(req.body);
    try {
        var staffAccessibility = '';
        var staff_id = '';
        var clinic_id = '';
        var user_id = ''
        for(var i in req.body.check){
           if(req.body.check[i] != '')staffAccessibility += req.body.check[i]+',';
        }
        staffAccessibility = staffAccessibility.substr(0,staffAccessibility.length-1);
        console.log(staffAccessibility);
        staff_id = req.body.staff_id;
        clinic_id = req.body.clinic_id;
        user_id = req.body.user_id
        delete req.body.check;
        delete req.body.doctor_id;
        delete req.body.staff_id;
        delete req.body.staffId;
        delete req.body.module_access;
        delete req.body.status;
        delete req.body.email;
        delete req.body.user_id;

        /*var data = {
            first_name:req.body.first_name,
            last_name:req.body.last_name,
            contact_no:req.body.contact_no,
            address1:req.body.address1,
            clinic_id:req.body.clinic_id
        }*/
        var validateUser = validate.staffValidate(req,res,function(err, value) {
            if (err) {
                console.log(err)
                res.status(400).send({message:value});
            } else {
                delete req.body.clinic_id;
                req.getConnection(function (err, connection) {
                var query1 = connection.query( "UPDATE user SET ? WHERE id = ? ", [req.body, user_id], function (err, rows) {
                    console.log(query1.sql);
                        if (err) {
                            console.log("err");
                            return res.status(400).send({
                                message: errorHandler.getErrorMessage(err)
                            });
                        } else {
                            var query = connection.query("UPDATE staff SET module_access = ?,clinic_id = ? WHERE id = ?",
                            [staffAccessibility,clinic_id,staff_id], function (err, row) {
                            console.log(query.sql)
                                if (err) {
                                    console.log(err);
                                    res.status(400).send(err);
                                } else {
                                    res.json({message:"Staff detail updated successfully"});
                                }
                            });
                        }
                    });
                });
            }
        });
    } catch (e) {
        //logs.appendError(e.stack);
    }
}
