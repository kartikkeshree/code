66 +
        'use strict';

/**
 * Module dependencies.
 */

var errorHandler = require('./errors.server.controller'),
        /*Forum = mongoose.model('Forum'),*/
        _ = require('lodash');
var validate = require('../components/validation.js');
var coreCont = require('./core.server.controller');
/**
 * Create a Forum
 */
exports.addForumQuestion = function (req, res) {
    var validateForum = validate.addForumValidation(req, res, function (err, value) {
        if (err) {
            console.log("error");
            res.status(400).send({message: value});
        } else {
            var app_time = new Date();
            var sqlDate = app_time.getFullYear() + '-' + (parseInt(app_time.getMonth()) + 1) + '-' + app_time.getDate() + ' ' + app_time.getHours() + ':' + app_time.getMinutes() + ':00';
            req.body.created_date = sqlDate;
            req.body.status = 'Pending';
            try {
                req.getConnection(function (err, connection) {
                    connection.query('insert into forum_ques set ?', req.body, function (err, rows) {
                        if (err) {
                            console.log(err);
                            return res.status(400).send({
                                message: errorHandler.getErrorMessage(err)
                            });
                        } else {
                            console.log(rows);
                            coreCont.addEvent(req, 'has added one question on forum.', req.body.user_id); //Add to event//
                            res.json({message: ["Question post successfully"], id: rows.insertId, date: new Date(req.body.created_date)});
                        }
                    })
                });
            } catch (e) {
                console.log(e);
            }
        }
    });
};

/**
 * Show forum listing
 */
exports.getForumQuestion = function (req, res) {
    try {
        var searchCondition = '';
        var moduleQry = '';
        var paramArr = [req.body.userId, req.body.userId];
        if (req.body.searchVal) {
            var sArr = req.body.searchVal.split(' ');
            searchCondition += " AND (";
            for (var i = 0; i < sArr.length; i++) {
                searchCondition += (i == 0) ? "" : " OR ";
                searchCondition += ' (u.first_name like ? OR u.last_name like ? OR f.question like ?)';
                paramArr.push('%' + sArr[i] + '%', '%' + sArr[i] + '%', '%' + sArr[i] + '%');
            }
            searchCondition += ") ";
        }
        if (req.body.module == 'my-forum')
        {
            moduleQry += 'AND f.user_id = ?';
            paramArr.push(req.body.user_id);
        } else if (req.body.module == 'forum') {
            moduleQry += 'AND f.status = "Approved"';
        } else if (req.body.module == 'manage-forum') {
            moduleQry += 'AND (if((SELECT role_id FROM user WHERE id = ?) =  1, 1, f.user_id = ?))';
            paramArr.push(req.body.user_id, req.body.user_id);
        }

        //pagination
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
            var query = connection.query('select f.id,f.question,f.description,f.created_date,u.first_name,u.last_name, (COUNT(fc.ref_id)+COUNT(fa.ques_id)) AS cmtCnt, if(f.status != "Approved", "No", "Yes") AS fStatus from user as u join forum_ques as f on u.id=f.user_id LEFT JOIN forum_ans AS fa ON f.id = fa.ques_id LEFT JOIN forum_comment AS fc ON fa.id = fc.ref_id WHERE f.status != "Deleted" ' + moduleQry + ' ' + searchCondition + ' GROUP BY f.id LIMIT ' + ((indexFrom - 1) * countUpTo) + ',' + countUpTo, paramArr, function (err, rows) {
                console.log(query.sql);
                if (err) {
                    console.log(err);
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    //Pagination//
                    var totalQuery = connection.query('select count(f.id) AS totalRes from user as u join forum_ques as f on u.id=f.user_id WHERE f.status != "Deleted" ' + moduleQry + ' ' + searchCondition, paramArr, function (err, totalrows) {
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
                }
            });
        });
    } catch (e) {
        console.log(e);
    }
};


/**
 * Forum middleware
 */
exports.getForumQuestionByForumId = function (req, res) {

    if (req.body) {

        try {
            req.getConnection(function (err, connection) {
                var query = connection.query('select f.id,f.question,f.created_date,f.description, f.user_id, u.first_name,u.last_name,u.image' +
                        ' from user as u join forum_ques as f on u.id=f.user_id and f.id = ?', [req.body.forum_id], function (err, rows) {
                    console.log(query.sql);
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
    }
};

/**
 * Forum authorization middleware
 */
exports.addComment = function (req, res) {

    if (req.body) {
        var app_time = new Date();
        var sqlDate = app_time.getFullYear() + '-' + (parseInt(app_time.getMonth()) + 1) + '-' + app_time.getDate() + ' ' + app_time.getHours() + ':' + app_time.getMinutes() + ':00';
        console.log(req.body.ques_id);
        var data = {
            ques_id: req.body.ques_id,
            user_id: req.body.user_id,
            answer: req.body.answer,
            created_date: sqlDate
        }
        try {
            req.getConnection(function (err, connection) {
                var query = connection.query('insert into forum_ans set ?', [data], function (err, rows) {
                    console.log(query.sql);
                    if (err) {
                        console.log(err);
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    } else {
                        var query1 = connection.query('select u.first_name,u.last_name,u.image,fa.id' +
                                ',fa.user_id,fa.answer,fa.created_date from user as u join forum_ans as fa' +
                                ' on u.id=fa.user_id and fa.id=?', [rows.insertId], function (err, rows1) {
                            console.log(query1.sql);
                            if (err) {
                                console.log(err);
                                return res.status(400).send({
                                    message: errorHandler.getErrorMessage(err)
                                });
                            } else {
                                coreCont.addEvent(req, 'has added on comment on forum.', data.user_id); //Add to event//
                                res.json(rows1);
                            }
                        });

                    }
                });
            });

        } catch (e) {

        }
    } else {
        return res.status(400).send({message: "something went wrong"});
    }
};


exports.getComment = function (req, res) {

    try {
        req.getConnection(function (err, connection) {
            var query = connection.query('select u.first_name,u.last_name,u.image,fa.id' +
                    ',fa.user_id,fa.answer,fa.created_date from user as u join forum_ans as fa' +
                    ' on u.id=fa.user_id where fa.status != "Deleted" and fa.ques_id=?', [parseInt(req.body.ques_id)], function (err, rows) {
                console.log(query.sql);
                if (err) {
                    console.log(err);
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    var data = [];
                    var dat = [];
                    data.push(rows);
                    if (rows.length > 0) { //If rows contains result
                        var ansIds = '';
                        for (var i = 0; i < rows.length; i++) {
                            ansIds += ((i != 0) ? ',' : '') + rows[i].id;
                            //dat.push(((i != 0) ? ',' : '') + rows[i].id);
                        }
                        var query1 = connection.query('select fc.id,fc.ref_id,fc.user_id,fc.description,fc.created_date,' +
                                'u.first_name,u.last_name,u.image ' +
                                'from forum_comment as fc join user as u on fc.user_id=u.id ' +
                                'where fc.status != "Deleted" and fc.ref_id IN (' + ansIds + ') ', function (err, rows1) {
                                    console.log(query1.sql);
                                    if (err) {
                                        console.log(err);
                                        return res.status(400).send({
                                            message: errorHandler.getErrorMessage(err)
                                        });
                                    } else {
                                        data.push(rows1);
                                        res.json(data);
                                    }
                                });
                    } else {
                        res.json(data);
                    }

                }
            });
        });

    } catch (e) {

    }
};

exports.submitReplyComment = function (req, res) {
    var app_time = new Date();
    var sqlDate = app_time.getFullYear() + '-' + (parseInt(app_time.getMonth()) + 1) + '-' + app_time.getDate() + ' ' + app_time.getHours() + ':' + app_time.getMinutes() + ':00';
    delete req.body.doctor_id;
    delete req.body.id;
    try {
        req.getConnection(function (err, connection) {
            var query = connection.query('Insert into forum_comment set ? ,created_date=?', [req.body, sqlDate], function (err, rows) {
                console.log(query.sql);
                if (err) {
                    console.log(err);
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    var query1 = connection.query('select fc.id,fc.ref_id,fc.user_id,fc.description,fc.created_date, u.first_name, u.last_name,u.image from forum_comment as fc join user as u on fc.user_id=u.id where fc.id = ? ', [rows.insertId], function (err, rows1) {
                        if (err) {
                            console.log(err);
                            return res.status(400).send({
                                message: errorHandler.getErrorMessage(err)
                            });
                        } else {
                            coreCont.addEvent(req, 'has replied on one question of forum.', req.body.user_id); //Event
                            res.json(rows1);
                        }
                    });

                }
            });
        });

    } catch (e) {

    }
};


exports.getReplyCommentAnswer = function (req, res) {

    try {
        req.getConnection(function (err, connection) {
            var query = connection.query('select fc.id,fc.ref_id,fc.user_id,fc.description,fc.created_date,' +
                    'u.first_name,u.last_name,u.image ' +
                    'from forum_comment as fc join user as u on fc.user_id=u.id ' +
                    'where fc.user_id=? and fc.ref_id=? ', [req.body.user_id, req.body.ref_id], function (err, rows) {
                console.log(query.sql);
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
//To change forum status
exports.changeStatus = function (req, res) {
    try {
        if (req.body.status == 'delete') {
            req.body.status = 'Deleted';
        }
        req.getConnection(function (err, connection) {
            var query = connection.query("UPDATE forum_ques SET status = ? WHERE id = ?",
                    [req.body.status, req.body.forum], function (err, rows) {
                console.log(query.sql);
                if (err) {
                    console.log(err);
                    res.status(400).send(err);
                } else {
                    var resArr = {};
                    if (req.body.status == 'Approved') {
                        resArr.message = ['Forum topic approved successfully'];
                        resArr.status = 'Yes';
                    } else if (req.body.status == 'Rejected') {
                        resArr.message = ['Forum topic rejected successfully'];
                        resArr.status = 'No';
                    } else if (req.body.status == 'Deleted') {
                        resArr.message = ['Forum topic Deleted successfully'];
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

exports.updateForum = function (req, res) {
    console.log(req.body);
    try {
        var validateForum = validate.addForumValidation(req, res, function (err, value) {
            if (err) {
                console.log("error");
                res.status(400).send({message: value});
            } else {
                var forumId = req.body.id;
                delete req.body.id;
                req.body.status = 'Pending';
                req.getConnection(function (err, connection) {
                    var query = connection.query("UPDATE forum_ques SET ? WHERE id = ?",
                            [req.body, forumId], function (err, rows) {
                        console.log(query.sql);
                        if (err) {
                            console.log(err);
                            res.status(400).send(err);
                        } else {
                            rows.message = 'Forum query updated successfully! Your query needs admin approval before being posted'
                            res.json(rows);
                        }
                    });
                });
            }
        });
    } catch (e) {
        logs.appendError(e.stack);
    }
}

exports.deleteForumComment = function (req, res) {
	console.log(req.body.id);
    try {
        req.getConnection(function (err, connection) {
            var query = connection.query('update forum_ans set status="Deleted" where id=?',[req.body.id],function (err, rows) {
               console.log(query.sql);
               if(err){
                  return res.status(400).send({
                     message: errorHandler.getErrorMessage(err)
                  });
               }else{
                  if(rows){
                     console.log(rows);
                     res.json({message:"Forum comment deleted succesfully"});
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


exports.deleteForumCommentReply = function (req, res) {
	console.log(req.body.id);
    try {
        req.getConnection(function (err, connection) {
            var query = connection.query('update forum_comment set status="Deleted" where id=?',[req.body.id],function (err, rows) {
               console.log(query.sql);
               if(err){
                  return res.status(400).send({
                     message: errorHandler.getErrorMessage(err)
                  });
               }else{
                  if(rows){
                     console.log(rows);
                     res.json({message:"Reply on forum comment deleted succesfully"});
                  }else{
                     res.json({message:"No Reply"});
                  }
               }
            });
        });
    } catch (e) {
        console.log(e);
    }
};

