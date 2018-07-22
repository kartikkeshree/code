'use strict';

/**
 * Module dependencies.
 */
var errorHandler = require('./errors.server.controller'),
        _ = require('lodash');
var validate = require('../components/validation.js');
var coreCont = require('./core.server.controller');
/**
 * Create a Classified
 */
exports.create = function (req, res) {
    //console.log(req.body);
    var app_time = new Date();
    delete req.body.doctor_id;
    delete req.body.id;
    var sqlDate = app_time.getFullYear() + '-' + (parseInt(app_time.getMonth()) + 1) + '-' + app_time.getDate() + ' ' + app_time.getHours() + ':' + app_time.getMinutes() + ':00';
    try {
        var validateForum = validate.addClassfiedValidation(req, res, function (err, value) {
            if (err) {
                console.log("error");
                res.status(400).send({message: value});
            } else {
                req.getConnection(function (err, connection) {
                    connection.query('insert into classified set ?,created_date=?', [req.body, sqlDate], function (err, rows) {
                        if (err) {
                            console.log(err);
                            res.status(400).send(err);
                        } else {
                            coreCont.addEvent(req, 'has added on ad into classified', req.body.user_id); //Add to event//
                            var resData = {insertId: rows.insertId, message: ["Classified Ad inserted successully"]};
                            res.json(resData);
                        }
                    });
                });
            }
        });

    } catch (e) {
        console.log(e);
    }

};

/**
 * Show the current Classified
 */
exports.read = function (req, res) {
    res.jsonp(req.classified);
};

/**
 * Update a Classified
 */
exports.update = function (req, res) {

};

/**
 * Delete an Classified
 */
exports.delete = function (req, res) {

};

/**
 * List of Classifieds
 */
exports.list = function (req, res) {
    console.log(req.body.id);
    var subString = '';
    var searchCondition = '';
    var paramArr = [];
    if (req.body.text)
    {

        var sArr = req.body.text.split(' ');
        searchCondition += " AND (";
        for (var i = 0; i < sArr.length; i++) {
            console.log(sArr[i]);
            searchCondition += (i == 0) ? "" : " OR ";
            if (req.body.id > 0) {

                searchCondition += ' (cl.title LIKE ?)';
                paramArr.push('%' + sArr[i] + '%');
            } else {
                searchCondition += ' (u.first_name LIKE ? OR u.last_name LIKE ? OR cl.title LIKE ?)';
                paramArr.push('%' + sArr[i] + '%', '%' + sArr[i] + '%', '%' + sArr[i] + '%');
            }
        }
        if (req.body.id > 0) {
            subString = ' AND cl.user_id=?';
            paramArr.push(req.body.id);
        } else if (req.body.id == 'admin') {
            subString = '';
        } else {
            subString = 'AND cl.status="Approved" ';
        }
        searchCondition += ") " + subString + " ";
        if (req.body.val) {
            searchCondition += 'AND cl.classified_category_id = ?'
            paramArr.push(req.body.val);
        }

    } else {
        if (req.body.id > 0) {
            subString = ' AND cl.user_id=?';
            paramArr.push(req.body.id);
        } else if (req.body.id == 'admin') {
            subString = '';
        } else {
            subString = 'and cl.status="Approved" ';
        }
        searchCondition = subString;
        if (req.body.val) {
            searchCondition += 'and cl.classified_category_id = ?'
            paramArr.push(req.body.val);
        }
    }

    //pagination
    if (req.body.page)
    {
		if(typeof req.body.page != 'object')
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

    try {
        req.getConnection(function (err, connection) {
            var qry = connection.query('select concat(u.first_name," ",u.last_name) as display_name,cl.id, cl.title,' +
                    'cc.name as category_name,cl.description,cl.created_date, COUNT(clcm.classified_id) AS cmtCnt,' +
                    ' if(cl.status != "Approved", "No", "Yes") AS cStatus from classified as cl join classified_category ' +
                    'as cc on cl.classified_category_id=cc.id join user as u on u.id=cl.user_id' +
                    ' LEFT JOIN classified_comment AS clcm ON cl.id = clcm.classified_id' +
                    ' WHERE cl.status != "Deleted" ' + searchCondition + ' GROUP BY cl.id LIMIT ' + ((indexFrom - 1) * countUpTo) + ',' + countUpTo, paramArr, function (err, rows) {
                console.log(qry.sql);
                if (err) {
                    console.log(err);
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {

                    //Pagination//
                    var totalQuery = connection.query('select count(cl.id)  as totalRes from classified as cl join classified_category ' +
                            'as cc on cl.classified_category_id=cc.id join user as u on u.id=cl.user_id' +
                            ' LEFT JOIN classified_comment AS clcm ON cl.id = clcm.classified_id' +
                            ' WHERE cl.status != "Deleted" ' + searchCondition, paramArr, function (err, totalrows) {
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

                    // res.json(rows);
                }
            });
        });

    } catch (e) {

    }
};

/**
 * Classified middleware
 */
exports.classifiedByID = function (req, res) {
    try {
        req.getConnection(function (err, connection) {
            connection.query('select concat(u.first_name," ",u.last_name) as display_name,cl.id,cl.user_id,cl.title as title,cl.title as display_title,cl.classified_category_id,cc.name as category_name,cl.description,cl.description as display_description,cl.created_date,u.image from classified as cl' +
                    ' join classified_category as cc on cl.classified_category_id=cc.id' +
                    ' join user as u on u.id=cl.user_id and cl.id=?', [req.body.classified_id], function (err, rows) {
                if (err) {
                    console.log(err);
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    res.json(rows);

                }
            });
        });

    } catch (e) {

    }
};

/**
 * Classified authorization middleware
 */
exports.hasAuthorization = function (req, res, next) {

};


/**
 * Classified category name with id
 */
exports.getCategory = function (req, res, next) {
    var sql = '';
    if (req.body.classified_id && parseInt(req.body.classified_id) !== 0) {
        sql = 'select id,name from classified_category where id=?';
    } else {
        sql = 'select id,name from classified_category';
    }

    try {
        req.getConnection(function (err, connection) {
            connection.query(sql, [req.body.classified_id], function (err, rows) {
                if (err) {
                    console.log(err);
                    res.status(400).send(err);
                } else {
                    res.json(rows);
                }
            });
        });


    } catch (e) {

    }

};

/*exports.searchClassified=function(req,res){
 var subString='';
 console.log(req.body.id);
 if(req.body.id > 0){
 subString='and cl.user_id=?';
 }else{
 subString='and cl.status="Approved"';
 }
 var searchCondition = '';
 //var adminQry = '';
 var paramArr = [];
 if(req.body.text)
 {
 
 var sArr = req.body.text.split(' ');
 searchCondition += " AND (";
 for(var i=0; i<sArr.length; i++) {
 console.log(sArr[i]);
 searchCondition += (i == 0) ? "" : " OR ";
 if(req.body.id > 0) {
 searchCondition += ' (cl.title like ?)';
 paramArr.push('%'+sArr[i]+'%');
 }else{
 searchCondition += ' (u.first_name like ? OR u.last_name like ? OR cl.title like ?)';
 paramArr.push('%'+sArr[i]+'%', '%'+sArr[i]+'%', '%'+sArr[i]+'%');
 }
 
 }
 paramArr.push(req.body.id);
 searchCondition += ") "+subString+" ";
 }else{
 paramArr.push(req.body.id);
 searchCondition += subString;
 }
 try{
 req.getConnection(function(err,connection){
 var query=connection.query('select concat(u.first_name," ",u.last_name) as display_name,cl.id,cl.title,' +
 'cc.name as category_name,cl.description,cl.created_date from classified as cl' +
 ' join classified_category as cc on cl.classified_category_id=cc.id ' +
 'join user as u on u.id=cl.user_id and cl.status!="Deleted" '+searchCondition+' ',paramArr
 ,function(err,rows){
 console.log(query.sql);
 if(err){
 console.log(err);
 res.status(400).send(err);
 }else{
 res.json(rows);
 }
 });
 });
 
 }catch(e){
 
 }
 };
 exports.searchByCategory=function(req,res){
 console.log(req.body);
 var searchCondition = '';
 //var adminQry = '';
 var paramArr = [];
 if(req.body.text)
 {
 var sArr = req.body.text.split(' ');
 searchCondition += " AND (";
 for(var i=0; i<sArr.length; i++) {
 searchCondition += (i == 0) ? "" : " OR ";
 searchCondition += '(u.first_name like ? OR u.last_name like ? OR cl.title like ?)';
 paramArr.push('%'+sArr[i]+'%', '%'+sArr[i]+'%', '%'+sArr[i]+'%');
 }
 searchCondition += ") and cl.status='Approved' ";
 }else{
 searchCondition += " and cl.status='Approved' ";
 }
 if(req.body.val=='All'){
 try{
 req.getConnection(function(err,connection){
 var query=connection.query('select concat(u.first_name," ",u.last_name) as display_name,cl.id,cl.title,' +
 'cc.name as category_name,cl.description,cl.created_date from classified as cl' +
 ' join classified_category as cc on cl.classified_category_id=cc.id ' +
 'join user as u on u.id=cl.user_id '+searchCondition+'',paramArr,function(err,rows){
 console.log(query.sql);
 if(err){
 console.log(err);
 res.status(400).send(err);
 }else{
 res.json(rows);
 }
 });
 });
 
 }catch(e){
 
 }
 }else{
 try{
 req.getConnection(function(err,connection){
 var query=connection.query('select concat(u.first_name," ",u.last_name) as display_name,cl.id,cl.title,' +
 'cc.name as category_name,cl.description,cl.created_date from classified as cl' +
 ' join classified_category as cc on cl.classified_category_id=cc.id ' +
 'join user as u on u.id=cl.user_id and cl.classified_category_id = ? ' +
 ' '+searchCondition+''
 ,[parseInt(req.body.val),'%'+req.body.text+'%','%'+req.body.text+'%','%'+req.body.text+'%','%'+req.body.text+'%'],function(err,rows){
 console.log(query.sql);
 if(err){
 console.log(err);
 res.status(400).send(err);
 }else{
 res.json(rows);
 }
 });
 });
 
 }catch(e){
 
 }
 }
 };*/
exports.saveClassfiedComment = function (req, res) {

    console.log(req.body);
    var app_time = new Date();
    var sqlDate = app_time.getFullYear() + '-' + (parseInt(app_time.getMonth()) + 1) + '-' + app_time.getDate() + ' ' + app_time.getHours() + ':' + app_time.getMinutes() + ':00';
    try {
        req.getConnection(function (err, connection) {
            connection.query('insert into classified_comment set ?,created_date=?', [req.body, sqlDate], function (err, rows) {
                if (err) {
                    console.log(err);
                    res.status(400).send(err);
                } else {
                    console.log(rows);
                    coreCont.addEvent(req,'has commented on classified Ad.', req.body.user_id); //Add to event//
                    res.json({id: rows.insertId, created_date: app_time,description:req.body.description});
                }
            });
        });


    } catch (e) {

    }
};
exports.getClassfiedComment = function (req, res) {
    console.log(req.body);
    try {
        req.getConnection(function (err, connection) {
            connection.query('select concat(u.first_name," ",u.last_name) as display_name,u.image ' +
                    ',cc.description ,cc.created_date,cc.id from user as u join classified_comment as cc on u.id=cc.user_id where cc.status != "Deleted"  and classified_id=?', [req.body.classified_id], function (err, rows) {
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

    }
};

//To change classified status
exports.changeStatus = function (req, res) {
    try {
        if (req.body.status == 'delete')
        {
            req.body.status = 'Deleted';
        }
        req.getConnection(function (err, connection) {
            var query = connection.query("UPDATE classified SET status = ? WHERE id = ?",
                    [req.body.status, req.body.classified], function (err, rows) {
                console.log(query.sql);
                if (err) {
                    console.log(err);
                    res.status(400).send(err);
                } else {
                    var resArr = {};
                    if (req.body.status == 'Approved')
                    {
                        resArr.message = 'Classified topic approved successfully';
                        resArr.status = 'Yes';
                    } else if (req.body.status == 'Rejected')
                    {
                        resArr.message = 'Classified topic rejected successfully';
                        resArr.status = 'No';
                    } else if (req.body.status == 'Deleted')
                    {
                        resArr.message = 'Classified topic Deleted successfully';
                        resArr.status = 'deleted';
                    }
                    res.json(resArr);
                }
            });
        });
    } catch (e) {
        logs.appendError(e.stack);
    }
};

//update Classified By classfied Id
exports.updateClassifiedById = function (req, res) {
    try {
        if (req.body) {
            req.getConnection(function (err, connection) {
                var query = connection.query("UPDATE classified SET  ?,status=? WHERE id = ?",
                        [req.body, 'Pending', req.body.id], function (err, rows) {
                    console.log(query.sql);
                    if (err) {
                        console.log(err);
                        res.status(400).send(err);
                    } else {

                        //rows.messages = 'Add updated successfully! Your ad needs admin approval before being posted';
                        res.json({message: 'Ad updated successfully! Your ad needs admin approval before being posted'});
                    }
                });
            });
        }
    } catch (e) {
        logs.appendError(e.stack);
    }
};

exports.deleteClassifiedComment = function (req, res) {
	console.log(req.body.id);
    try {
        req.getConnection(function (err, connection) {
            var query = connection.query('update classified_comment set status="Deleted" where id=?',[req.body.id],function (err, rows) {
               console.log(query.sql);
               if(err){
                  return res.status(400).send({
                     message: errorHandler.getErrorMessage(err)
                  });
               }else{
                  if(rows){
                     console.log(rows);
                     res.json({message:"Classified comment deleted succesfully"});
                  }else{
                     res.json({message:"No Comments"});
                  }
               }
            });
        });
    } catch (e) {
        console.log(e);
    }
};
