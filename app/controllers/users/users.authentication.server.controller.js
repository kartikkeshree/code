'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
        errorHandler = require('../errors.server.controller')
//User = mongoose.model('User');

var config = require('../../components/config');
var logs = require('../../components/logs');
var send = require('../../components/send_mail');
var userAuth = require('./users.authentication.server.controller');
var user_model = require('../../models/user.server.model');
var validate = require('../../components/validation.js');
var rest = require('../rest.server.controller');
var coreCont = require('../core.server.controller');
/**
 * Signup
 */
exports.signup = function (req, res) {
    // Init Variables
    var message = null;
    console.log(JSON.stringify(req.body));
    if (req.body.email) {
        req.body.authkey = config.generateHash(req.body.email);
    }
    // Then save the user
    try {
        var validateUser = validate.userRegistrationValidate(req, res, function (err, value) {
            if (err) {
                /*console.log(err);
                 var desc=config.convertToJSon(value);*/
                console.log(value);
                res.status(400).send({message: value});
            } else {
                if (value.length > 0) {
                    res.json({message: value});
                } else {
                    delete req.body.cnfPassword; //To remove confirm password attribute before save in database
                    var val = user_model.addUser(req, function (err, row) {
                        if (row) {
                            var getLink = serverUrl + "/#!/activateAccount?val=" + req.body.authkey;
                            var htmlBody = "Dear " + req.body.first_name + " " + req.body.last_name
                                    + "<br><br>" + "Thank you for registering with us.<br>"
                                    + "Before we can activate your account one last step must be taken to complete your registration."
                                    + "Please note - you must complete this last step to become a registered member."
                                    + "To complete your registration, please <a href='" + getLink + "'> Click Here </a> or copy paste below URL in browser-<br><br>"
                                    + "URL- <a href='" + getLink + "'>" + getLink + "</a>"
                                    + "<br/><br/><br>Best Regards,<br>DoctorHere";
                            var mailOptions = {
                                from: 'DoctorHere  <caprium.test@gmail.com>',
                                to: req.body.email,
                                subject: 'DoctorHere Account Activation',
                                html: htmlBody
                            };
                            send.sendMail(mailOptions, res);
                            coreCont.addEvent(req, 'has been registered on DoctorHere.', req.body.first_name); //Add to event//
                            res.json({message: ["Registration successfully and verification link is sent to your mail please check"]});
                        } else {
                            res.status(400).send(err);
                        }
                    });
                }
            }
        });

    } catch (e) {
        logs.appendError(e.stack);
    }

};

/**
 * Signin after passport authentication
 */
exports.signin = function (req, res, next) {
    passport.authenticate('local-signIn', function (err, user, info) {
        if (err || !user) {
            if(info.message == 'Missing credentials')
            {
                info.message = [info.message];
            }
            res.status(400).send(info);
        } else {
            // Remove sensitive data before login
            //console.log("aaaaaaaaaaaaaaa"+JSON.stringify(user));
            user.salt = undefined;
            user.password = undefined;
            req.login(user, function (err) {
                if (err) {
                    console.log(err);
                    res.status(400).send(err);
                } else {
                    delete user[0]['password'];
                    delete user[0]['authkey'];
                    req.session = user[0];
                    //req.session.email = req.param('email');
                    user[0].display_name = user[0].first_name + ' ' + user[0].last_name;
                    //req.session.user = user[0];
                    res.json(user);
                }
            });
        }
    })(req, res, next);

    /*if(req.body.email=="" || req.body.password==""){
     res.status(400).send({message: "Invalid username or password"})
     }else {
     try {
     req.getConnection(function (err, connection) {
     req.body.password = user_model.generateHash(req.body.password);
     var query = connection.query(
     "select * from user where email=? and password=?",
     [req.body.email, req.body.password], function (err, rows) {
     console.log(query.sql);
     if (err) {
     console.log(err);
     res.status(400).send(err);
     } else {
     //console.log(rows[0].id);
     
     if (rows[0] == undefined) {
     res.status(400).send({message: "Invalid username or password"})
     } else {
     delete rows[0]['password'];
     delete rows[0]['authkey'];
     if (rows[0]['confirmation'] == 1) {
     res.json(rows);
     } else {
     res.status(400).send({message: "Your account is not verified please check your email"})
     }
     
     }
     
     }
     });
     });
     } catch (e) {
     logs.appendError(e.stack);
     }
     }*/

};

/**
 * Signout
 */
exports.signout = function (req, res) {
    req.logout();
    res.redirect('/');
};

//To set token//
exports.getToken = function (req, res) {
    var dObj = new Date();
    var hash = config.generateHash(req.body.data[0].email + dObj.getTime());
    req.getConnection(function (err, connection) {
        var query = connection.query("UPDATE user SET user_token = ? WHERE id = ?", [hash, req.body.data[0].id], function (err, rows) {
            console.log(query.sql);
            if (err) {
                console.log(err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                if (rows.affectedRows > 0)
                {
                    req.body.data[0].user_token = hash;
                    //req.session.user = user[0];
                    res.json(req.body.data);
                } else {
                    res.json({status: "fail", data: {message: ["Error occurred, please try again"]}});
                }
            }
        });
    });
};


/**
 * OAuth callback
 */
exports.oauthCallback = function (strategy) {
    return function (req, res, next) {
        passport.authenticate(strategy, function (err, user, redirectURL) {
            if (err || !user) {
                return res.redirect('/#!/signin');
            }
            req.login(user, function (err) {
                if (err) {
                    return res.redirect('/#!/signin');
                }

                return res.redirect(redirectURL || '/');
            });
        })(req, res, next);
    };
};

/**
 * Helper function to save or update a OAuth user profile
 */
exports.saveOAuthUserProfile = function (req, providerUserProfile, done) {
    if (!req.user) {
        // Define a search query fields
        var searchMainProviderIdentifierField = 'providerData.' + providerUserProfile.providerIdentifierField;
        var searchAdditionalProviderIdentifierField = 'additionalProvidersData.' + providerUserProfile.provider + '.' + providerUserProfile.providerIdentifierField;

        // Define main provider search query
        var mainProviderSearchQuery = {};
        mainProviderSearchQuery.provider = providerUserProfile.provider;
        mainProviderSearchQuery[searchMainProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];

        // Define additional provider search query
        var additionalProviderSearchQuery = {};
        additionalProviderSearchQuery[searchAdditionalProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];

        // Define a search query to find existing user with current provider profile
        var searchQuery = {
            $or: [mainProviderSearchQuery, additionalProviderSearchQuery]
        };
        console.log(searchQuery);
        User.findOne(searchQuery, function (err, user) {
            if (err) {
                return done(err);
            } else {
                if (!user) {
                    var possibleUsername = providerUserProfile.username || ((providerUserProfile.email) ? providerUserProfile.email.split('@')[0] : '');

                    User.findUniqueUsername(possibleUsername, null, function (availableUsername) {
                        user = new User({
                            firstName: providerUserProfile.firstName,
                            lastName: providerUserProfile.lastName,
                            displayName: providerUserProfile.displayName,
                            email: providerUserProfile.email,
                            provider: providerUserProfile.provider,
                            providerData: providerUserProfile.providerData
                        });

                        // And save the user
                        user.save(function (err) {
                            return done(err, user);
                        });
                    });
                } else {
                    return done(err, user);
                }
            }
        });
    } else {
        // User is already logged in, join the provider data to the existing user
        var user = req.user;

        // Check if user exists, is not signed in using this provider, and doesn't have that provider data already configured
        if (user.provider !== providerUserProfile.provider && (!user.additionalProvidersData || !user.additionalProvidersData[providerUserProfile.provider])) {
            // Add the provider data to the additional provider data field
            if (!user.additionalProvidersData)
                user.additionalProvidersData = {};
            user.additionalProvidersData[providerUserProfile.provider] = providerUserProfile.providerData;

            // Then tell mongoose that we've updated the additionalProvidersData field
            user.markModified('additionalProvidersData');

            // And save the user
            user.save(function (err) {
                return done(err, user, '/#!/settings/accounts');
            });
        } else {
            return done(new Error('User is already connected using this provider'), user);
        }
    }
};

/**
 * Remove OAuth provider
 */
exports.removeOAuthProvider = function (req, res, next) {
    var user = req.user;
    var provider = req.param('provider');

    if (user && provider) {
        // Delete the additional provider
        if (user.additionalProvidersData[provider]) {
            delete user.additionalProvidersData[provider];

            // Then tell mongoose that we've updated the additionalProvidersData field
            user.markModified('additionalProvidersData');
        }

        user.save(function (err) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                req.login(user, function (err) {
                    if (err) {
                        res.status(400).send(err);
                    } else {
                        res.json(user);
                    }
                });
            }
        });
    }
};

/**
 * For user Verification via email
 **/
exports.userVerification = function (req, res) {
    req.getConnection(function (err, connection) {
        var query = connection.query(
                "update user set confirmation=1 where authkey=?",
                [req.body.authkey], function (err, rows) {
            if (err) {
                console.log(err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                if (rows.id == 'undefined') {
                    row(err, 0);
                } else {
                    res.json({msg: 'Account activated successfully, please wait while redirecting....'});
                }
            }
        });
    });

};
exports.checkUserVerificationDoneByEmail = function (req, res, resp) {
    console.log(req.body.username);
    var searchQuery = {
        $and: [{verified: true}, {email: req.body.username}, {password: req}]
    };
    User.find(searchQuery, function (err, user) {
        if (err) {
            console.log(err);
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            console.log(user);
            if (user) {
                resp("", "", user);
            }

        }
    });

};

//To add a new member from user
exports.addNewMember = function (req, res) {
    try {
        var validateUser = validate.memberValidate(req, res, function (err, value) {
            if (err) {
                console.log(err);
                res.status(400).send(value);
            } else {
                if (!req.body.id) {
                    req.body.patient_id = config.generatePatientId();
                }
                if (!req.body.status) {
                    req.body.birth_date = getSqlDate(req.body.birth_date);
                }
                req.body.role_id = 5;
                console.log(req.body.birth_date);
                req.getConnection(function (err, connection) {
                    var sql = connection.query('INSERT INTO user SET ? ON DUPLICATE KEY Update ?', [req.body, req.body], function (err, rows) {
                        console.log(sql.sql);
                        if (err) {
                            console.log(err);
                            return res.status(400).send({
                                message: errorHandler.getErrorMessage(err)
                            });
                        } else {
                            if (!req.body.id) {
                                coreCont.addEvent(req, 'has added one family member.', req.body.parent_id, 'user'); //Add to event//
                                res.json({message: "Member Added Successfully"});
                            } else if (req.body.status) {
                                res.json({message: "Member Deleted Successfully"});
                            } else {
                                res.json({message: "Member Updated Successfully"});
                            }
                        }
                    })
                })
            }
        });

    } catch (e) {
        logs.appendError(e.stack);
    }

};

exports.getMember = function (req, res) {
    console.log(JSON.stringify(req.body));
    try {
        var str = '';
        var param = '';
        if (req.body.member_id) {
            str += 'id = ?';
            param += req.body.member_id
        } else {
            str += 'parent_id = ?';
            param += req.body.id
        }
        req.getConnection(function (err, connection) {
            connection.query('Select id,first_name,last_name,birth_date,relation,gender FROM user where ' + str + ' and status != "deleted"', param, function (err, rows) {
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
        logs.appendError(e.stack);
    }

};

exports.selectMember = function (req, res) {
    console.log("asdasd"+JSON.stringify(req.body));
    console.log("asdasd"+req.body.memberId);
    console.log("asdasd"+req.body.app_id);
    try {
        var sql = '';
        if(req.body.app_id > 0){
            sql = 'Select u.first_name,u.last_name,app.app_email as email,app.app_contact as contact_no FROM user AS u JOIN appointment as app ON app.user_id = u.id where u.id=? AND app.id = ? and u.status != "deleted" AND app.status != "Deleted" '
        } else {
            sql = 'Select u.first_name,u.last_name,u.email as email,u.contact_no as contact_no FROM user AS u where u.id = ? AND u.status != "deleted" '
        }
        req.getConnection(function (err, connection) {
            var qry = connection.query(sql, [req.body.memberId,req.body.app_id], function (err, rows) {
                console.log("select memberrrrrrrrrrrr"+qry.sql);
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
        logs.appendError(e.stack);
    }

};


exports.deleteMember = function (req, res) {
    console.log(JSON.stringify(req.body));
    try {
        req.getConnection(function (err, connection) {
            connection.query('Select id,first_name,last_name,birth_date,relation,gender FROM user where id = ? and status != "deleted"', req.body.id, function (err, rows) {
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
        logs.appendError(e.stack);
    }

};

exports.checkToken = function (req, res) {
    try {
        req.getConnection(function (err, connection) {
            var qry = connection.query('SELECT id,role_id FROM user WHERE user_token = ?', req.body.token, function (err, rows) {
                console.log(qry.sql);
                if (err) {
                    console.log(err);
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    if (rows[0])
                    {
                        res.json({status: 'success', data: rows[0]});
                    } else {
                        res.json({status: 'fail', data: {message: ["Invalid Token"]}});
                    }
                }
            })
        })
    } catch (e) {
        logs.appendError(e.stack);
    }
};



function getSqlDate(inputtxt) {
    var str = inputtxt.split('/');
    return str[2] + '-' + str[0] + '-' + str[1];
}
