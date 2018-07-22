'use strict';

var errorHandler = require('./errors.server.controller');
var validate = require('../components/validation.js');
var logs = require('../components/logs.js');

exports.addNotification=function(req,res){
   console.log(req.body);
   try{
      var validateNotification = validate.addNotificationValidation(req,res,function(err,value){
      if(err){
           console.log("error");
           res.status(400).send(value);
      }else{
           var startDate=getDateSqlFormat(req.body.start_date);
           var endDate=getDateSqlFormat(req.body.end_date);
           var current_date = new Date();
           var created_date = current_date.getFullYear() + '-' + (parseInt(current_date.getMonth()) + 1) + '-' +
      current_date.getDate() + ' ' + current_date.getHours() + ':' + current_date.getMinutes() + ':' + current_date.getSeconds();
              req.body.created_date = created_date;
              req.body.start_date = startDate;
              req.body.end_date = endDate;
              req.getConnection(function (err, connection) {
			  var qry = connection.query('INSERT INTO notification SET ?', req.body, function (err, rows) {
					  console.log(qry.sql);
						 if (err) {
							console.log(err);
							return res.status(400).send({
								message: errorHandler.getErrorMessage(err)
							});
					     }else{
                                //rows.created_date = new Date(req.body.created_date);
                            	console.log(rows);
                                res.json(rows);
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

exports.deleteNotificationByAppId =function(req,res){
      console.log(req.body.id);
      req.getConnection(function(err,connection){
            var qry= connection.query('update notification set status="Deleted" where id=?',[req.body.id],function(err,rows){
               console.log(qry.sql);
               if(err){
                  return res.status(400).send({
                     message: errorHandler.getErrorMessage(err)
                  });
               }else{
                  if(rows){
                     console.log(rows);
                     res.json({message:"Notification deleted succesfully"});
                  }else{
                     res.json({message:"No Notifications"});
                  }
               }
            });
      });
};


exports.getAllNotificationList=function(req,res){
   try{
       var searchCondition = '';
       var paramArr = [];
       if(req.body.searchVal)
            {
                  var sArr = req.body.searchVal.split(' ');
                  searchCondition += " AND (";
                  for(var i=0; i<sArr.length; i++) {
                       searchCondition += (i == 0) ? "" : " OR ";
                       searchCondition += ' (description like ? )';
                       paramArr.push('%'+sArr[i]+'%');
                  }
                  searchCondition += ") ";
            }
       req.getConnection(function(err,connection){
       var query=connection.query('select id,description,start_date,end_date from notification where status != "Deleted" '+searchCondition,paramArr,function(err,rows){
       console.log(query.sql);
       if(err) {
                  console.log(err);
                  return res.status(400).send({
                      message: errorHandler.getErrorMessage(err)
                  });
               }else{
                      res.json(rows);
               }
       });
       });
   }catch(e){
       console.log(e);
   }
};


exports.updateNotificationList=function(req,res){
   console.log(req.body.id);
   try{
      var updateNotification = validate.updateNotificationValidation(req,res,function(err,value){
          if(err){
                console.log("error");
                res.status(400).send(value);
          }else{
                var startDate=getDateSqlFormat(req.body.start_date);
                var endDate=getDateSqlFormat(req.body.end_date);
                var current_date = new Date();
                var created_date = current_date.getFullYear() + '-' + (parseInt(current_date.getMonth()) + 1) + '-' +
          current_date.getDate() + ' ' + current_date.getHours() + ':' + current_date.getMinutes() + ':' + current_date.getSeconds();
                    req.body.created_date = created_date;
                    req.body.start_date = startDate;
                    req.body.end_date = endDate;
      req.getConnection(function (err, connection) {
          var query = connection.query("UPDATE notification SET status=? WHERE id=?",[req.body,
                      req.body.id], function (err, rows) {
                      console.log(query.sql);
                          if (err) {
                                console.log(err);
                                res.status(400).send(err);
                          } else {
                                rows.message = 'Notification Updated'
                                console.log(rows);
                                res.json(rows);
                          }
                      });
      });
          }
      });
   }
   catch(e){
      console.log(e);
   }
};

exports.getEditNotificationListById=function(req,res){
   try{
   req.getConnection(function (err, connection) {
       var query = connection.query("SELECT *  FROM notification  WHERE id = ?",
                [req.body.id], function (err, rows) {
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
   }
   catch(e){
      console.log(e);
   }
};

exports.getViewNotificationListById=function(req,res){
   try{
       req.getConnection(function (err, connection) {
       var query = connection.query("SELECT *  FROM notification  WHERE id = ?",
                [req.body.id], function (err, rows) {
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
   }
   catch(e){
      console.log(e);
   }
};


exports.getUpdateNotificationListById = function(req,res){
   try{
      req.getConnection(function (err, connection) {
      var query = connection.query("SELECT *  FROM notification  WHERE id = ?",
                [req.body.id], function (err, rows) {
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
   }catch(e){
         console.log(e);
   }
};

exports.getNotificationDescription=function(req,res){
   try{
	    req.getConnection(function(err,connection){
        var query=connection.query('select description from notification where status != "Deleted" ',function(err,rows){
        console.log(query.sql);
        if(err){
                console.log(err);
                return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
                });
		}else{
                res.json(rows);
		}
        }); 
        });
    }catch(e){
       console.log(e);
   }
};

function getDateSqlFormat(dt){
    var date="0000-00-00 00:00";
    if(dt!=undefined) {
        var str = dt.split('/');//mdy/ymd
        var date = str[2] + '-' + str[0] + '-' + str[1];
    }
    return date;
}
