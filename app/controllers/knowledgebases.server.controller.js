'use strict';

/**
 * Module dependencies.
 */
//var mongoose = require('mongoose'),
var	errorHandler = require('./errors.server.controller'),
	//Knowledgebase = mongoose.model('Knowledgebase'),
	_ = require('lodash');
var knowBase = require('./knowledgebases.server.controller.js');
var coreCont = require('./core.server.controller');
/**
 * Create a Knowledgebase
 */
exports.create = function(req, res) {
	/*var knowledgebase = new Knowledgebase(req.body);
	knowledgebase.user = req.user;

	knowledgebase.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(knowledgebase);
		}
	});*/
};

/**
 * Show the current Knowledgebase
 */
exports.read = function(req, res) {
	res.jsonp(req.knowledgebase);
};

/**
 * Update a Knowledgebase
 */
exports.update = function(req, res) {
	/*var knowledgebase = req.knowledgebase ;

	knowledgebase = _.extend(knowledgebase , req.body);

	knowledgebase.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(knowledgebase);
		}
	});*/
};

/**
 * Delete an Knowledgebase
 */
exports.delete = function(req, res) {
	/*var knowledgebase = req.knowledgebase ;

	knowledgebase.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(knowledgebase);
		}
	});*/
};

/**
 * List of Knowledgebases
 */
exports.list = function(req, res) { 
	/*Knowledgebase.find().sort('-created').populate('user', 'displayName').exec(function(err, knowledgebases) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(knowledgebases);
		}
	});*/
};

/**
 * Knowledgebase middleware
 */
exports.knowledgebaseByID = function(req, res, next, id) { 
	/*Knowledgebase.findById(id).populate('user', 'displayName').exec(function(err, knowledgebase) {
		if (err) return next(err);
		if (! knowledgebase) return next(new Error('Failed to load Knowledgebase ' + id));
		req.knowledgebase = knowledgebase ;
		next();
	});*/
};

/**
 * Knowledgebase authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	/*if (req.knowledgebase.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();*/
};


//To Create KnowledgeBase
exports.createKnowledgeBase = function(req, res) {
	try{
	    if(req.body){
            var app_time = new Date();
            req.body.created_date = app_time.getFullYear() + '-' + (parseInt(app_time.getMonth()) + 1) + '-' + app_time.getDate() + ' ' + app_time.getHours() + ':' + app_time.getMinutes() + ':00';
            req.body.description = req.body.extract;
            delete  req.body.extract;
            req.getConnection(function(err,connection){
            var query=connection.query('Insert Ignore into know_base set ?',req.body,function(err,rows){
                    console.log(query.sql);
                    if(err) {
                        console.log(err);
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    }else{
                        if(rows.affectedRows > 0){
                            //coreCont.addEvent(req,'has added knowledgeBase added', req.body.user_id); //Event
                            res.json(rows);
                        } else {
                             return res.status(400).send({
                                message: 'This Page is already saved'
                            });
                        }
                    }
                })
            });
		}
	}catch(e){
		console.log(e);
	}
};


//To get all KnowledgeBase list
exports.knowledgeBaseList = function(req, res) {
	try{
        var searchCondition = '';
        var paramArr = [];
	    if(req.body.searchVal){
	        searchCondition +=' And ('
	        var val = req.body.searchVal.split(' ');
	        for(var i = 0; i<val.length; i++){
	            searchCondition  += (i==0)?'':'OR';
	            searchCondition += '(kb.title like ?)';
	            paramArr.push('%'+val[i]+'%');

	        }
	        searchCondition += ')'
	    }


	    var sortCondition = ''
	    if(req.body.alphabet && req.body.alphabet != ''){
	        sortCondition +=' And kb.title like "'+req.body.alphabet+'%" order by kb.title';
	    }

		req.getConnection(function(err,connection){
			var query=connection.query('SELECT kb.id, kb.title, kb.description, kb.created_date, user.first_name, user.last_name,(select count(kc.ref_id) from knowbase_comment as kc where kc.ref_id = kb.id ) AS cmtCnt FROM know_base AS kb JOIN user ON kb.user_id = user.id '+searchCondition+' '+sortCondition+'',paramArr,function(err,rows){
				console.log(query.sql);
				if(err) {
					console.log(err);
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				}else{
					res.json(rows);
				}
			})
		});
	}catch(e){
		console.log(e);
	}
};

//To get a Knowledge details
exports.getKnowledgeBaseById = function(req, res) {
	try {
		req.getConnection(function (err, connection) {
			var query = connection.query('SELECT kb.id, kb.title, kb.description, kb.created_date, user.first_name, user.last_name FROM know_base AS kb JOIN user ON kb.user_id = user.id WHERE kb.id = ?', [req.body.knowbase_id], function (err, rows) {
				//console.log(query.sql);
				if (err) {
					console.log(err);
					return res.status(400).send({
						message: errorHandler.getErrorMessage(err)
					});
				} else {
					res.json(rows);
				}
			})
		});
	} catch (e) {
		console.log(e);
	}
};

//To add comment
exports.addComment = function(req, res) {
	if(req.body) {
		var app_time = new Date();
		var sqlDate = app_time.getFullYear() + '-' + (parseInt(app_time.getMonth()) + 1) + '-' + app_time.getDate() + ' ' + app_time.getHours() + ':' + app_time.getMinutes() + ':00';
		console.log(req.body[0].ref_id);
		var data= {
			reference: req.body[0].reference,
			ref_id: req.body[0].ref_id,
			user_id: req.body[0].user_id,
			description: req.body[0].description,
			created_date: sqlDate
		}
		try {
			req.getConnection(function (err, connection) {
				var query = connection.query('insert into knowbase_comment set ?',[data], function (err, rows) {
					console.log(query.sql);
					if (err) {
						console.log(err);
						return res.status(400).send({
							message: errorHandler.getErrorMessage(err)
						});
					} else {
						var query1 = connection.query('select u.first_name,u.last_name,u.image,cm.id,cm.ref_id,cm.user_id,cm.description,cm.created_date from user as u join knowbase_comment as cm on u.id=cm.user_id and cm.id=?',[rows.insertId], function (err, rows1) {
							console.log(query1.sql);
							if (err) {
								console.log(err);
								return res.status(400).send({
									message: errorHandler.getErrorMessage(err)
								});
							} else {
								//coreCont.addEvent(req,'Comment on KnowledgeBase added successfully', 'user'); //Event
								res.json(rows1);
							}
						});

					}
				});
			});

		} catch (e) {

		}
	}else{
		return res.status(400).send({message:"something went wrong"});
	}
};

//To get a KnowledgeBase's comments details
exports.getCommentsByKnowledgeBaseId = function(req, res) {
	try {
		req.getConnection(function (err, connection) {
			var query = connection.query('SELECT cm.id, cm.reference, cm.ref_id, cm.description, cm.created_date, user.first_name, user.last_name, user.image FROM knowbase_comment AS cm JOIN user ON cm.user_id = user.id WHERE cm.reference = "knowbase" AND cm.status !="Deleted" AND cm.ref_id = ?', [req.body.knowbase_id], function (err, rows) {
				//console.log(query.sql);
				if (err) {
					console.log(err);
					return res.status(400).send({
						message: errorHandler.getErrorMessage
					});
				} else {
					var data=[];
					data.push(rows);
					if(rows.length > 0) { //If rows contains result
						var commentIds = '';
						for (var i = 0; i < rows.length; i++) {
							commentIds += ((i != 0) ? ',' : '') + rows[i].id;
						}
						var query1 = connection.query('SELECT cm.id,cm.ref_id,cm.user_id,cm.description,cm.created_date, u.first_name, u.last_name,u.image from knowbase_comment as cm JOIN knowbase_comment AS cm1 ON cm.ref_id = cm1.id JOIN user as u on cm.user_id=u.id where cm.reference = "comment" AND cm.status !="Deleted" AND cm.ref_id IN ('+commentIds+') ', function (err, rows1) {
							console.log(query1.sql);
							if (err) {
								console.log(err);
								return res.status(400).send({
									message: errorHandler.getErrorMessage(err)
								});
							} else {
								data.push(rows1);
							}
						});
					}
                    res.json(data);

				}
			})
		});
	} catch (e) {
		console.log(e);
	}
};

exports.getWikiData = function(req,res){
    try {
        if(req.body.keyword && req.body.keyword != ''){
            var request = require('request');
            request('http://en.wikipedia.org/w/api.php?format=json&action=query&rawcontinue=&gapfrom='+req.body.keyword+'&generator=allpages&gaplimit=20&prop=info', function (error, response, body) {
                  if (!error && response.statusCode == 200) {

                       var data = JSON.parse(body);
                       var wiki_data = [];
                       for(var i in data.query.pages){
                            wiki_data.push(data.query.pages[i].pageid);
                       }
                       res.json(wiki_data);
                  } else {
                        console.log(error);
                        console.log(response);
                        console.log(body);
                        return res.status(400).send({
                            message: 'Something went wrong'
                        });
                  }
            });
        } else {
            return res.status(400).send({
                message: 'Keyword cannot be blank'
            });
        }
    } catch(e) {

    }
}

exports.getDataUsingPageId = function(req,res){
     console.log(req.body.pageids);
     var request = require('request');
     request('https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&explaintext=&pageids='+req.body.pageids+'', function (error1, response1, body1) {
         if (!error1 && response1.statusCode == 200) {
             var data1 = JSON.parse(body1);
             for(var j in data1.query.pages){
                if(data1.query.pages[j].extract != ""){
                    var dat = {
                        pageid : data1.query.pages[j].pageid,
                        title : data1.query.pages[j].title,
                        initial_char: data1.query.pages[j].title.charAt(0),
                        extract : data1.query.pages[j].extract
                    }
                    res.json(dat);
                }
             }
         } else {
              return res.status(400).send({
                 message: 'Something went wrong'
             });
         }
    });
}


exports.deleteKnowBaseById = function(req,res) {
    try{
        req.getConnection(function(err,connection){
            var sql = connection.query('DELETE know_base,knowbase_comment FROM know_base,knowbase_comment'+
                             ' WHERE know_base.id = knowbase_comment.ref_id AND know_base.id= ?',req.body.id,function(err,rows){
                console.log(sql.sql);
                if(err){
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

exports.recentKnowBase = function(req,res){
try {
        req.getConnection(function (err, connection) {
            var query = connection.query('SELECT id, title FROM know_base WHERE status = "Approved" ORDER BY updated_date DESC', function (err, rows) {
                if (err) {
                    console.log(err);
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    res.json(rows);
                }
            })
        });
    } catch (e) {
        console.log(e);
    }
    }
	
exports.deleteKnowledgebaseComment = function (req, res) {
	console.log(req.body.id);
    try {
        req.getConnection(function (err, connection) {
            var query = connection.query('update knowbase_comment set status="Deleted" where id=?',[req.body.id],function (err, rows) {
               console.log(query.sql);
               if(err){
                  return res.status(400).send({
                     message: errorHandler.getErrorMessage(err)
                  });
               }else{
                  if(rows){
                     console.log(rows);
                     res.json({message:"Knowledgebase comment deleted succesfully"});
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


exports.deleteKnowledgebaseCommentReply = function (req, res) {
	console.log(req.body.id);
    try {
        req.getConnection(function (err, connection) {
            var query = connection.query('update knowbase_comment set status="Deleted" where id=?',[req.body.id],function (err, rows) {
               console.log(query.sql);
               if(err){
                  return res.status(400).send({
                     message: errorHandler.getErrorMessage(err)
                  });
               }else{
                  if(rows){
                     console.log(rows);
                     res.json({message:"Reply on knowledgebase comment deleted succesfully"});
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
/*exports.getWikiDataWithAllPageIds = function(req,res,wiki_data,callback){
    var wiki_datas = [];

    for(var i = 0; i < wiki_data.length; i++){
        knowBase.getDataUsingPageId(wiki_data[i],function(err,value){
             if(err){
                 callback(true,"Something went wrong");
             } else {
                wiki_datas.push(value);
             }
        });
    }
    console.log(wiki_datas);
    if(i == wiki_data.length-1){
        callback(false,wiki_datas);
    }
}

exports.getDataUsingPageId = function(pageId,callback){
    var wiki_data = [];
    var flag = false;
     var request = require('request');
    request('https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&explaintext=&pageids='+pageId+'', function (error1, response1, body1) {
         if (!error1 && response1.statusCode == 200) {
             var data1 = JSON.parse(body1);
             for(var j in data1.query.pages){
                var dat = {
                    pageids : data1.query.pages[j].pageid,
                    title : data1.query.pages[j].title,
                    extract : data1.query.pages[j].extract
                }
                flag = true;
             }
             if(flag == true){
                callback(false,dat);
             }
         } else {
             callback(true,"Something went wrong");
         }
    });
}*/
