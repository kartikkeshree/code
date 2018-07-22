'use strict';

/**
 * Module dependencies.
 */

var errorHandler = require('./errors.server.controller'),
        //Blog = mongoose.model('Blog'),
        _ = require('lodash');
var validate = require('../components/validation.js');
var multiparty = require('multiparty'), //To save file type
        fs = require('fs');
var coreCont = require('./core.server.controller');
/**
 * Create a Blog
 */
exports.create = function (req, res) {
    try {
        validate.addBlogValidation(req, res, function (err, value) {
            if (err) {
                console.log("error" + value);
                res.status(400).send({message: value});
            } else {
                var isImage = false;
                if (req.body.isImage == true)
                {
                    isImage = true;
                }
                delete req.body.isImage;
                delete req.body.doctor_id;
                delete req.body.id;
                var current_date = new Date();
                req.body.created_date = current_date.getFullYear() + '-' + (parseInt(current_date.getMonth()) + 1) + '-' + current_date.getDate() + ' ' + current_date.getHours() + ':' + current_date.getMinutes() + ':' + current_date.getSeconds();
                req.body.status = 'Pending';
                req.getConnection(function (err, connection) {
                    var qry = connection.query('INSERT INTO blog SET ?', req.body, function (err, rows) {
                        console.log(qry.sql);
                        if (err) {
                            console.log(err);
                            return res.status(400).send({
                                message: errorHandler.getErrorMessage(err)
                            });
                        } else {
                            if (isImage == true)
                            {
                                var source = fs.createReadStream(appRoot + '/../public/images/blog_images/tmp/' + req.body.image),
                                        destination = fs.createWriteStream(appRoot + '/../public/images/blog_images/' + req.body.image);
                                source.pipe(destination, {end: false});
                                source.on("end", function () {
                                    fs.unlink(appRoot + '/../public/images/blog_images/tmp/' + req.body.image);
                                });
                                source.on('close', function () {
                                    console.log("Upload Finished");
                                });
                            }
                            var created_date = new Date(req.body.created_date);
                            coreCont.addEvent(req, 'has added new blog.', req.body.user_id); //Add to event//
                            var resData = {insertedId: rows.insertId, created_date: created_date, message: "Blog inserted successully"};
                            res.json(resData);

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
 * Show the current Blog
 */
exports.read = function (req, res) {
    res.jsonp(req.blog);
};

/**
 * Update a Blog
 */
exports.update = function (req, res) {
    /*var blog = req.blog ;
     
     blog = _.extend(blog , req.body);
     
     blog.save(function(err) {
     if (err) {
     return res.status(400).send({
     message: errorHandler.getErrorMessage(err)
     });
     } else {
     res.jsonp(blog);
     }
     });*/
};

/**
 * Delete an Blog
 */
exports.delete = function (req, res) {
    /*var blog = req.blog ;
     
     blog.remove(function(err) {
     if (err) {
     return res.status(400).send({
     message: errorHandler.getErrorMessage(err)
     });
     } else {
     res.jsonp(blog);
     }
     });*/
};

/**
 * List of Blogs
 */
exports.list = function (req, res) {
    /*Blog.find().sort('-created').populate('user', 'displayName').exec(function(err, blogs) {
     if (err) {
     return res.status(400).send({
     message: errorHandler.getErrorMessage(err)
     });
     } else {
     res.jsonp(blogs);
     }
     });*/
};

/**
 * Blog middleware
 */
exports.blogByID = function (req, res, next, id) {
    /*	Blog.findById(id).populate('user', 'displayName').exec(function(err, blog) {
     if (err) return next(err);
     if (! blog) return next(new Error('Failed to load Blog ' + id));
     req.blog = blog ;
     next();
     });*/
};

/**
 * Blog authorization middleware
 */
exports.hasAuthorization = function (req, res, next) {
    /*	if (req.blog.user.id !== req.user.id) {
     return res.status(403).send('User is not authorized');
     }
     next();*/
};

//To get all blogs list
exports.blogList = function (req, res) {
    try {
        var searchCondition = '';
        var moduleQry = '';
        var paramArr = [];
        if (req.body.searchVal)
        {
            var sArr = req.body.searchVal.split(' ');
            searchCondition += " AND (";
            for (var i = 0; i < sArr.length; i++) {
                searchCondition += (i == 0) ? "" : " OR ";
                searchCondition += ' (user.first_name like ? OR user.last_name like ? OR blog.title like ?)';
                paramArr.push('%' + sArr[i] + '%', '%' + sArr[i] + '%', '%' + sArr[i] + '%');
            }
            searchCondition += ") ";
        }
        if (req.body.module == 'my-blog')
        {
            moduleQry += 'AND blog.user_id = ?';
            paramArr.push(req.body.user_id);
        } else if (req.body.module == 'blog') {
            moduleQry += 'AND blog.status = "Approved"';
        } else if (req.body.module == 'manage-blog') {
            moduleQry += 'AND (if((SELECT role_id FROM user WHERE id = ?) =  1, 1, blog.user_id = ?))';
            paramArr.push(req.body.user_id, req.body.user_id);
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
        //End//
        req.getConnection(function (err, connection) {
            var query = connection.query('SELECT blog.id, blog.title, blog.description, blog.created_date, blog.image, user.first_name, user.last_name, COUNT(blog_comment.id) AS commentCnt, if(blog.status != "Approved", "No", "Yes") AS blogStatus FROM blog JOIN user ON blog.user_id = user.id LEFT JOIN blog_comment ON blog.id = blog_comment.ref_id WHERE blog.status != "Deleted" ' + searchCondition + ' ' + moduleQry + ' GROUP BY blog.id LIMIT ' + ((indexFrom - 1) * countUpTo) + ',' + countUpTo, paramArr, function (err, rows) {
                console.log(query.sql);
                if (err) {
                    console.log(err);
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    //res.json(rows);
                    var totalQuery = connection.query('SELECT count(blog.id) AS totalRes FROM blog JOIN user ON blog.user_id = user.id WHERE blog.status != "Deleted" ' + searchCondition + ' ' + moduleQry, paramArr, function (err, totalrows) {
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
                }
            });
        });
    } catch (e) {
        console.log(e);
    }
};

//To get a blog details
exports.getBlogById = function (req, res) {
    try {
        req.getConnection(function (err, connection) {
            var query = connection.query('SELECT blog.id, blog.user_id, blog.title, blog.description, blog.created_date, blog.image, user.first_name, user.last_name FROM blog JOIN user ON blog.user_id = user.id WHERE blog.id = ?', [req.body.blog_id], function (err, rows) {
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
exports.addComment = function (req, res) {
    if (req.body) {
        if (req.body.reference != 'blog' && req.body.reference != 'comment')
        {
            return res.status(400).send({message: "Some values are wrong"});
            return false;
        }
        var app_time = new Date();
        var sqlDate = app_time.getFullYear() + '-' + (parseInt(app_time.getMonth()) + 1) + '-' + app_time.getDate() + ' ' + app_time.getHours() + ':' + app_time.getMinutes() + ':00';
        var data = {
            reference: req.body.reference,
            ref_id: req.body.ref_id,
            user_id: req.body.user_id,
            description: req.body.description,
            created_date: sqlDate
        }
        try {
            req.getConnection(function (err, connection) {
                var query = connection.query('insert into blog_comment set ?', [data], function (err, rows) {
                    console.log(query.sql);
                    if (err) {
                        console.log(err);
                        return res.status(400).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    } else {
                        var query1 = connection.query('select u.first_name,u.last_name,u.image,cm.id,cm.ref_id,cm.user_id,cm.description,cm.reference,cm.created_date from user as u join blog_comment as cm on u.id=cm.user_id and cm.id=?', [rows.insertId], function (err, rows1) {
                            console.log(query1.sql);
                            if (err) {
                                console.log(err);
                                return res.status(400).send({
                                    message: errorHandler.getErrorMessage(err)
                                });
                            } else {
                                coreCont.addEvent(req, 'has posted a comment on blog.', data.user_id); //Add to event//
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

//To get a blog's comments details
exports.getCommentsByBlogId = function (req, res) {
    try {
        req.getConnection(function (err, connection) {
            var query = connection.query('SELECT cm.id, cm.reference, cm.ref_id, cm.description, cm.created_date, user.first_name, user.last_name, user.image FROM blog_comment AS cm JOIN user ON cm.user_id = user.id WHERE cm.status != "Deleted" AND cm.reference = "blog" AND cm.ref_id = ?', [req.body.blog_id], function (err, rows) {
                //console.log(query.sql);
                if (err) {
                    console.log(err);
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage
                    });
                } else {
                    var data = [];
                    data.push(rows);
                    if (rows.length > 0) { //If rows contains result
                        var commentIds = '';
                        for (var i = 0; i < rows.length; i++) {
                            commentIds += ((i != 0) ? ',' : '') + rows[i].id;
                        }
                        var query1 = connection.query('SELECT cm.id,cm.ref_id,cm.user_id,cm.description,cm.created_date, u.first_name, u.last_name,u.image from blog_comment as cm JOIN blog_comment AS cm1 ON cm.ref_id = cm1.id JOIN user as u on cm.user_id=u.id where cm.reference = "comment" AND cm.ref_id IN (' + commentIds + ') AND cm.status != "Deleted"', function (err, rows1) {
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
            })
        });
    } catch (e) {
        console.log(e);
    }
};

//To change blog status
exports.changeStatus = function (req, res) {
    try {
        if (req.body.status == 'delete')
        {
            req.body.status = 'Deleted';
        }
        req.getConnection(function (err, connection) {
            var query = connection.query("UPDATE blog SET status = ? WHERE id = ?",
                    [req.body.status, req.body.blog], function (err, rows) {
                console.log(query.sql);
                if (err) {
                    console.log(err);
                    res.status(400).send(err);
                } else {
                    var resArr = {};
                    if (req.body.status == 'Approved')
                    {
                        resArr.message = ['Blog approved successfully'];
                        resArr.status = 'Yes';
                    } else if (req.body.status == 'Rejected')
                    {
                        resArr.message = ['Blog rejected successfully'];
                        resArr.status = 'No';
                    } else if (req.body.status == 'Deleted')
                    {
                        resArr.message = ['Blog Deleted successfully'];
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

exports.saveTempImage = function (req, res) {
    var form = new multiparty.Form();
    form.parse(req, function (err, fields, files) {
        var file = files.file[0];
        var contentType = file.headers['content-type'];
        var tmpPath = file.path;
        var extIndex = tmpPath.lastIndexOf('.');
        var extension = (extIndex < 0) ? '' : tmpPath.substr(extIndex);
        var destPath = appRoot + '/../public/images/blog_images/tmp/' + fields.data[0] + extension;
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
            is.on('close', function () {
                console.log("Upload Finished");
            });
            return res.json(fields.data[0] + extension);
        } else
            return res.json('File not uploaded');
    });
}

exports.updateBlog = function (req, res) {
    try {
        var validateClinic = validate.addBlogValidation(req, res, function (err, value) {
            if (err) {
                console.log("error");
                res.status(400).send({message: value});
            } else {
                var blogId = req.body.id;
                delete req.body.id;
                req.body.status = 'Pending';
                var isImage = req.body.isImage;
                delete req.body.isImage;
                req.getConnection(function (err, connection) {
                    var query = connection.query("UPDATE blog SET ? WHERE id = ?",
                            [req.body, blogId], function (err, rows) {
                        console.log(query.sql);
                        if (err) {
                            console.log(err);
                            res.status(400).send(err);
                        } else {
                            if (isImage == true)
                            {
                                var source = fs.createReadStream(appRoot + '/../public/images/blog_images/tmp/' + req.body.image),
                                        destination = fs.createWriteStream(appRoot + '/../public/images/blog_images/' + req.body.image);
                                source.pipe(destination, {end: false});
                                source.on("end", function () {
                                    fs.unlink(appRoot + '/../public/images/blog_images/tmp/' + req.body.image);
                                });
                                source.on('close', function () {
                                    console.log("Upload Finished");
                                });
                                rows.image = req.body.image;
                            }
                            rows.message = 'Blog updated successfully! Your blog needs admin approval before being posted'
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

//To get a blog details
exports.recentBlogs = function (req, res) {
    try {
        req.getConnection(function (err, connection) {
            var query = connection.query('SELECT id, title FROM blog WHERE status = "Approved" ORDER BY updated_date DESC', function (err, rows) {
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

exports.deleteBlogComment = function (req, res) {
	console.log(req.body.id);
    try {
        req.getConnection(function (err, connection) {
            var query = connection.query('update blog_comment set status="Deleted" where id=?',[req.body.id],function (err, rows) {
               console.log(query.sql);
               if(err){
                  return res.status(400).send({
                     message: errorHandler.getErrorMessage(err)
                  });
               }else{
                  if(rows){
                     console.log(rows);
                     res.json({message:"Blog comment deleted succesfully"});
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

exports.deleteBlogCommentReply = function (req, res) {
	console.log(req.body.id);
    try {
        req.getConnection(function (err, connection) {
            var query = connection.query('update blog_comment set status="Deleted" where id=?',[req.body.id],function (err, rows) {
               console.log(query.sql);
               if(err){
                  return res.status(400).send({
                     message: errorHandler.getErrorMessage(err)
                  });
               }else{
                  if(rows){
                     console.log(rows);
                     res.json({message:"Reply on comment deleted succesfully"});
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
