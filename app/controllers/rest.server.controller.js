/* global exports */

'use strict';
var config = require('../components/config');
var rest = require('./rest.server.controller');
exports.restActionParams = function () {
    return {
        'dentists/update': {
            allowed: 'abt_you,achievement,associated_with,college,dci_registration,degree,exp_desc,experience,token,member_of,website',
            mandatory: 'token,experience,degree,dci_registration',
            token: true,
        },
        'dentists/socialLinksUpdate': {
            allowed: 'token,facebook_url,googleplus_url,linkedin_url,skype_name,twitter_url',
            mandatory: 'token',
            token: true,
        },
        'updateSpeciality': {
            allowed: 'token,speciality_ids',
            mandatory: 'token,speciality_ids',
            token: true,
        },
        'getSpecialityWithSpecificSpeciality': {
            allowed: 'token',
            mandatory: 'token',
            token: true,
            returnType: 'array'
        },
        'auth/signin': {
            allowed: 'email,password,role_id',
            mandatory: 'email,password',
            token: false,
            addtionalCall: 'auth/getToken',
            addtionalParam: 'isRest-true' //paramName-Value//
        },
        'auth/signup': {
            allowed: 'first_name,last_name,email,password,cnfPassword,contact_no,role_id,check,clinic_id,address1,created_by,doctor_id', //check,clinic_id,address1 is for staff only//
            mandatory: 'first_name,last_name,email,password,cnfPassword,contact_no,role_id',
            token: false,
            addtionalParam: 'isRest-true' //paramName-Value//
        },
        'changePassword': {
            allowed: 'curPassword,newPass,cpass,token',
            mandatory: 'curPassword,newPass,cpass,token',
            token: true,
            addtionalParam: 'isRest-true' //paramName-Value//
        },
        'auth/forgot': {
            allowed: 'forgotEmail',
            mandatory: 'forgotEmail',
            token: false
        },
        'getAllUserAppointmentByDentistId': {
            allowed: 'token,page',
            mandatory: 'token',
            token: true,
            returnType: 'array'
        },
        'getAllAppointmentByDate': {
            allowed: 'token',
            mandatory: 'token',
            token: true,
            returnType: 'array'
        },
        'updateAppointmentNotes': {
            allowed: 'app_id,clinical_note,perception',
            mandatory: 'app_id,clinical_note,perception',
            token: false
        },
        'bookNextAppointmentSameUser': {
            allowed: 'appTime,app_date,clinic_id,created_by,parent_appId,user_id',
            mandatory: 'appTime,app_date,clinic_id,created_by,parent_appId,user_id',
            token: false
        },
        'getAvailableAppointmentsTime': {
            allowed: 'clinic_id,date',
            mandatory: 'clinic_id,date',
            token: false,
            returnType: 'array'
        },
        'getAppointmentTimes': {
            allowed: 'clinic_id,date',
            mandatory: 'clinic_id,date',
            token: false,
            returnType: 'array'
        },
        'getBookedAppointmentTimes': {
            allowed: 'clinic_id,date',
            mandatory: 'clinic_id,date',
            token: false,
            returnType: 'array'
        },
        'deleteBookedAppointmentsByAppId': {
            allowed: 'app_id',
            mandatory: 'app_id',
            token: false
        },
        'getAllBlogTopics': {
            allowed: 'module,token,page',
            mandatory: 'module,token',
            token: true,
            returnType: 'array'
        },
        'blogs': {
            allowed: 'description,image,title,token,isImage',
            mandatory: 'description,title,token',
            token: true
        },
        'getBlogById': {
            allowed: 'blog_id',
            mandatory: 'blog_id',
            token: false
        },
        'blog/getComments': {
            allowed: 'blog_id',
            mandatory: 'blog_id',
            token: false
        },
        'blogStatus': {
            allowed: 'blog,status',
            mandatory: 'blog,status',
            token: false
        },
        'updateBlog': {
            allowed: 'description,title,id,isImage',
            mandatory: 'description,title,id',
            token: false
        },
        'blog/addComment': {
            allowed: 'description,ref_id,reference,token',
            mandatory: 'description,ref_id,reference,token',
            token: true
        },
        'addUserBYDentist': {
            allowed: 'first_name,last_name,contact_no,email,birth_date,clinic_id,appTime,app_date,address1,address2,area_id,city,state,created_by,reason,zip',
            mandatory: 'first_name,last_name,contact_no,email,clinic_id,appTime,app_date,address1,area_id,city,state',
            token: false
        },
        'getDentistDataByClinicId': {
            allowed: 'clinic_id',
            mandatory: 'clinic_id',
            token: false
        },
        'getPatientByDentistId': {
            allowed: 'token,role_id,page,clinic_id,searchVal',
            mandatory: 'token',
            token: true,
            returnType: 'array'
        },
        'getPatientDetailByAppId': {
            allowed: 'app_id,token',
            mandatory: 'app_id,token',
            token: true

        },
        'getUserByUserId': {
            allowed: 'token',
            mandatory: 'token',
            token: true
        },
        'updatePatientDetailByAppId': {
            allowed: 'address1,address2,appTime,app_date,app_id,area_id,birth_date,city,clinic_id,doctor_id,contact_no,email,last_name,first_name,reason,state,report_url,status,user_id,zip',
            mandatory: 'clinic_id,app_id,user_id,first_name,last_name,contact_no,appTime,app_date,address1,area_id,city,state,email',
            token: false
        },
        'clinicList': {
            allowed: 'token',
            mandatory: 'token',
            token: true,
            returnType: 'array'
        },
        'clinics': {
            allowed: 'token,page',
            mandatory: 'token',
            token: true,
            returnType: 'array'
        },
        'getClinicData': {
            allowed: 'id',
            mandatory: 'id',
            token: false
        },
        'getClinicServices': {
            allowed: 'id',
            mandatory: 'id',
            token: false,
            returnType: 'array'
        },
        'clinicAdd': {
            allowed: 'address,area_id,city,contact2,contact_no,token,name,services,zip,landmark,latitude,logitude',
            mandatory: 'address,area_id,city,contact2,contact_no,token,name,services,zip,latitude,logitude',
            token: true
        },
        'listCampaignByDentist': {
            allowed: 'token',
            mandatory: 'token',
            token: true,
            returnType: 'array'
        },
        'getAllPatientsByDentist': {
            allowed: 'token',
            mandatory: 'token',
            token: true,
            returnType: 'array'
        },
        'addCampaign': {
            allowed: 'token,name,patients,sms_email_txt,type',
            mandatory: 'token,name,patients,sms_email_txt,type',
            token: true
        },
        'updateClinic': {
            allowed: 'address,area_id,city,contact2,contact_no,clinic_id,landmark,name,services,zip,latitude,logitude,token',
            mandatory: 'clinic_id,name,address,area_id,city,zip,contact_no,contact2,services,latitude,logitude,token',
            token: true
        },
        'saveClinicTime': {
            allowed: 'id,timingData',
            mandatory: 'id,timingData',
            token: false
        },
        'removeClinic': {
            allowed: 'id',
            mandatory: 'id',
            token: false
        },
        'smsPackageRequest': {
            allowed: 'allocated,start_date,end_date,token',
            mandatory: 'allocated,start_date,end_date,token',
            token: true
        },
        'getAllPackageByDentist': {
            allowed: 'token,searchVal',
            mandatory: 'token',
            token: false,
            returnType: 'array'
        },
        'staffByDentistId': {
            allowed: 'id,role_id,searchVal',
            mandatory: 'id,role_id',
            token: false,
            returnType: 'array'
        },
        'updateUserAndStaffModule': {
            allowed: 'address1,check,clinic_id,contact_no,email,first_name,last_name,staff_id,user_id',
            mandatory: 'address1,check,clinic_id,contact_no,email,first_name,last_name,staff_id,user_id',
            token: false
        },
        'changeStaffStatus': {
            allowed: 'staff_id,status',
            mandatory: 'staff_id,status',
            token: false
        },
        'user/addForumQuestion': {
            allowed: 'description,token,question',
            mandatory: 'description,token,question',
            token: true
        },
        'user/getForumQuestionByForumId': {
            allowed: 'forum_id',
            mandatory: 'forum_id',
            token: false
        },
        'user/getAllForumQuestion': {
            allowed: 'userId,module,page,searchVal',
            mandatory: 'module',
            token: false,
            returnType: 'array'
        },
        'updateForum': {
            allowed: 'description,question,id',
            mandatory: 'description,question,id',
            token: false
        },
        'dentist/addComment': {
            allowed: 'ques_id,answer,token',
            mandatory: 'ques_id,answer,token',
            token: true
        },
        'submitReplyComment': {
            allowed: 'description,reference,ref_id,token',
            mandatory: 'description,reference,ref_id,token',
            token: true
        },
        'getComment': {
            allowed: 'ques_id',
            mandatory: 'ques_id',
            token: false
        },
        'forumStatus': {
            allowed: 'forum,status',
            mandatory: 'forum,status',
            token: false
        },
        'classifieds/create': {
            allowed: 'classified_category_id,description,title,token',
            mandatory: 'classified_category_id,description,title,token',
            token: true
        },
        'classifiedById': {
            allowed: 'classified_id',
            mandatory: 'classified_id',
            token: false
        },
        'classifieds': {
            allowed: 'id,page,text,val',
            mandatory: '',
            token: false,
            returnType: 'array'
        },
        'updateClassifiedById': {
            allowed: 'classified_category_id,description,title,id',
            mandatory: 'classified_category_id,description,title,id',
            token: false
        },
        'saveClassfiedComment': {
            allowed: 'classified_id,description,user_id',
            mandatory: 'classified_id,description,user_id',
            token: false
        },
        'getClassfiedComment': {
            allowed: 'classified_id',
            mandatory: 'classified_id',
            token: false
        },
        'classifiedStatus': {
            allowed: 'classified,status',
            mandatory: 'classified,status',
            token: false
        },
        'classified/getCategory': {
            allowed: 'classified_id',
            mandatory: '',
            token: false
        },
        'specialityList': {
            allowed: '',
            mandatory: '',
            token: false,
            returnType: 'array'
        },
        'users': {
            allowed: 'address1,address2,area_id,city,contact_no,first_name,token,image,imageUpdate,last_name,state,zip',
            mandatory: 'address1,area_id,city,contact_no,first_name,token,last_name,state',
            token: true
        },
        'addNewMember': {
            allowed: 'birth_date,created_by,first_name,gender,last_name,relation,parent_id',
            mandatory: 'birth_date,created_by,first_name,gender,last_name,parent_id,relation',
            token: false
        },
        'getMember': {
            allowed: 'token',
            mandatory: 'token',
            token: true
        },
        'dentist': {
            allowed: 'token',
            mandatory: 'token',
            token: true
        },
        'clinic': {
            allowed: 'token',
            mandatory: 'token',
            token: true
        },
        'getAppoinmentData': {
            allowed: 'app_id',
            mandatory: 'app_id',
            token: false,
            returnType: 'array'
        },
        'areaList': {
            allowed: '',
            mandatory: '',
            token: false,
            returnType: 'array'
        },
        'bookAppointment': {
            allowed: 'token,selectedAppointmentDateTime,clinic_id,reasons',
            mandatory: 'token,selectedAppointmentDateTime,clinic_id',
            token: true
        },
        'getAllBookedAppointmentsByUserId': {
            allowed: 'token',
            mandatory: 'token',
            token: true,
            returnType: 'array'
        },
        'updateAppointment': {
            allowed: 'token,selectedAppointmentDateTime,clinic_id,reasons',
            mandatory: 'token,selectedAppointmentDateTime,clinic_id',
            token: true
        },
        'dentists/search': {
            allowed: 'area,dentistClinic,speciality,experience,page,perPage',
            mandatory: 'area,dentistClinic,speciality,experience',
            token: false
        },
        'getDentistByUserId' : {
            allowed: 'token',
            mandatory: 'token',
            token: true
        }
    };

};
exports.restParamValidate = function (params, restAction) {
    console.log('\n in validate params\n');
    try {
        //Remove blank space from keys at start and end of key name//
        for (a in params)
        {
            if (a.indexOf(' ') >= 0)
            {
                params[a.trim()] = params[a];
                delete params[a];
            }
        }


        //End//
        var status = true;
        var message = [];
        var requiredParam = [];
        if (rest.restActionParams()[restAction].mandatory.length > 0) {
            requiredParam = rest.restActionParams()[restAction].mandatory.split(',');
        }
        requiredParam.push('api_key');
        requiredParam.push('sig');
        //Check for mandatory params//
        if (status != 'fail')
        {
            for (var a in requiredParam)
            {
                if (requiredParam[a] in params)
                {
                    if (params[requiredParam[a]] && params[requiredParam[a]] != '') //Check for empty//
                    {
                        continue;
                    } else {
                        status = 'fail';
                        message.push(requiredParam[a] + ' can not be blank');
                        //break;
                    }
                } else {
                    message = [];
                    status = 'fail';
                    message.push('Insufficient Requested Parameters');
                    break;
                }
            }
        }
        //End//
        //Check for additional//
        if (status != 'fail')
        {
            for (var a in params)
            {
                if (a == 'sig' || a == 'api_key') { //To avoid mapping of signature and api key//
                    continue;
                }
                if (rest.restActionParams()[restAction].allowed.indexOf(a) < 0)
                {
                    message = [];
                    status = 'fail';
                    message.push('Additional Parameters in request');
                    break;
                }
            }
        }
        //End//
        return {status: status, data: {message: message}};
    } catch (e) {
        console.log(e);
        console.log(e.stack);
        return{status: 'fail', data: {message: ['Invalid URL']}};
    }
};
exports.restTokenValidate = function (params, restAction, callback) {
    console.log('\n in validate token\n');
    try {
        //console.log(restAction);
        //console.log(rest.restActionParams()[restAction]);
        if (rest.restActionParams()[restAction].token) //if need to check token//
        {
            var request = require('request');
            if (!params['token'])
            {
                callback(true, {success: 'fail', data: {message: ["Invalid Token"]}});
            }
            request.post(serverUrl + '/auth/checkToken', {form: {token: params['token']}}, function (error, response, body) {
                //console.log(JSON.parse(body));
                var res = JSON.parse(body);
                callback((res.status == "fail") ? true : false, res);
            });
        } else { //No need to check token//
            callback(false, true);
        }

    } catch (e) {
        console.log(e);
        console.log(e.stack);
        return{status: 'fail', data: {message: ['Invalid URL']}};
    }
};
exports.parseRequest = function (req, res) {
    //console.log(req.body);
    //console.log(req.params.functionName);
    var paramValidate = rest.restParamValidate(req.body, req.params.functionName);
    if (paramValidate.status == 'fail')
    {
        return res.json(paramValidate);
    }

    rest.authentication(req.body, function (err, value) {
        if (err) {
            rest.getSignature(req.body, function (err, value) {
                //console.log(value);
                var str = {message: ["Authentication fail"]};
                return res.json({status: "fail", data: str, sig: value});
            });
        } else {
            //console.log(req.body)
            rest.restTokenValidate(req.body, req.params.functionName, function (err, value) { //To validate token//
                if (err) {
                    return res.json(value);
                } else {
                    if (rest.restActionParams()[req.params.functionName].addtionalParam)
                    {
                        var paramList = rest.restActionParams()[req.params.functionName].addtionalParam.split(',');
                        for (var a in paramList)
                        {
                            var valArr = paramList[a].split('-');
                            console.log(valArr);
                            req.body[valArr[0]] = valArr[1];
                        }
                    }
                    if (rest.restActionParams()[req.params.functionName].token)
                    {
                        delete req.body.token;

                        req.body.id = value.data.id;
                        req.body.user_id = value.data.id;
                        if (value.data.role_id == 2) {
                            var sql = 'select id from doctor where user_id = ' + value.data.id;
                            req.getConnection(function (err, connection) {
                                connection.query(sql, function (err, rows) {
                                    req.body.doctor_id = rows[0].id;
                                    var request = require('request');
                                    request.post(serverUrl + '/' + req.params.functionName, {form: req.body}, function (error, response, body) {
                                        if (response.statusCode == 400) {
                                            return res.json({status: "fail", data: JSON.parse(body)});
                                        } else if (response.statusCode == 200) {
                                            var resData = JSON.parse(body);
                                            if (resData.data) {
                                                return res.json({status: "success", data: resData.data});
                                            } else {
                                                if (!resData.length || (resData.length && resData.length > 1)) {
                                                    if (resData.message && typeof resData.message == 'string')
                                                    {
                                                        resData = {'message': [resData.message]};
                                                    }
                                                    return res.json({status: "success", data: resData});
                                                } else {
                                                    if (rest.restActionParams()[req.params.functionName].returnType && rest.restActionParams()[req.params.functionName].returnType == 'array')
                                                    {
                                                        return res.json({status: "success", data: resData});
                                                    } else {
                                                        return res.json({status: "success", data: resData[0]});
                                                    }
                                                }
                                            }
                                        } else {
                                            return res.json({status: "error", message: ["Something went wrong"]});
                                        }
                                    });
                                });
                            });
                        } else {
                            var request = require('request');
                            request.post(serverUrl + '/' + req.params.functionName, {form: req.body}, function (error, response, body) {
                                if (response.statusCode == 400) {
                                    return res.json({status: "fail", data: JSON.parse(body)});
                                } else if (response.statusCode == 200) {
                                    var resData = JSON.parse(body);
                                    if (resData.data) {
                                        return res.json({status: "success", data: resData.data});
                                    } else {
                                        if (!resData.length || (resData.length && resData.length > 1)) {
                                            if (resData.message && typeof resData.message == 'string')
                                            {
                                                resData = {'message': [resData.message]};
                                            }
                                            return res.json({status: "success", data: resData});
                                        } else {
                                            if (rest.restActionParams()[req.params.functionName].returnType && rest.restActionParams()[req.params.functionName].returnType == 'array')
                                            {
                                                return res.json({status: "success", data: resData});
                                            } else {
                                                return res.json({status: "success", data: resData[0]});
                                            }
                                        }
                                    }
                                } else {
                                    return res.json({status: "error", message: ["Something went wrong"]});
                                }
                            });
                        }
                    } else {
                        var request = require('request');
                        request.post(serverUrl + '/' + req.params.functionName, {form: req.body}, function (error, response, body) {
                            if (response.statusCode == 400) {
                                return res.json({status: "fail", data: JSON.parse(body)});
                            } else if (response.statusCode == 200) {
                                var resData = JSON.parse(body);
                                if (resData.data) {
                                    return res.json({status: "success", data: resData.data});
                                } else {
                                    if (!resData.length || (resData.length && resData.length > 1)) {
                                        if (resData.message && typeof resData.message == 'string')
                                        {
                                            resData = {'message': [resData.message]};
                                        }
                                        return res.json({status: "success", data: resData});
                                    } else {
                                        if (rest.restActionParams()[req.params.functionName].returnType && rest.restActionParams()[req.params.functionName].returnType == 'array')
                                        {
                                            return res.json({status: "success", data: resData});
                                        } else {
                                            return res.json({status: "success", data: resData[0]});
                                        }
                                    }
                                }
                            } else {
                                return res.json({status: "error", message: ["Something went wrong"]});
                            }
                        });
                    }
                }
            });
        }
    });
};
exports.parseRequest1 = function (req, res) {
//var router = express.Router();
// console.log(req.params.functionName1);
// console.log(req.params.functionName2);

    var paramValidate = rest.restParamValidate(req.body, req.params.functionName1 + '/' + req.params.functionName2);
    if (paramValidate.status == 'fail')
    {
        return res.json(paramValidate);
    }

    rest.authentication(req.body, function (err, value) {
        if (err) {
            rest.getSignature(req.body, function (err, value) {
                console.log(value);
                var str = {message: ["Authentication fail"]};
                return res.json({status: "fail", data: str, sig: value});
            });
        } else {
            rest.restTokenValidate(req.body, req.params.functionName1 + '/' + req.params.functionName2, function (err, value) { //To validate token//
                if (err) {
                    return res.json(value);
                } else {
                    if (rest.restActionParams()[req.params.functionName1 + '/' + req.params.functionName2].addtionalParam)
                    {
                        var paramList = rest.restActionParams()[req.params.functionName1 + '/' + req.params.functionName2].addtionalParam.split(',');
                        for (var a in paramList)
                        {
                            var valArr = paramList[a].split('-');
                            console.log(valArr);
                            req.body[valArr[0]] = valArr[1];
                        }
                    }
                    if (rest.restActionParams()[req.params.functionName1 + '/' + req.params.functionName2].token)
                    {
                        delete req.body.token;
                        req.body.id = value.data.id;
                        req.body.user_id = value.data.id;
                        if (value.data.role_id == 2) {
                            var sql = 'select id from doctor where user_id = ' + value.data.id;
                            req.getConnection(function (err, connection) {
                                connection.query(sql, function (err, rows) {
                                    req.body.doctor_id = rows[0].id;
                                    var request = require('request');
                                    request.post(serverUrl + '/' + req.params.functionName1 + '/' + req.params.functionName2, {form: req.body}, function (error, response, body) {
                                        if (response.statusCode == 400) {
                                            return res.json({status: "fail", data: JSON.parse(body)});
                                        } else if (response.statusCode == 200) {
                                            var resData = JSON.parse(body);
                                            if (rest.restActionParams()[req.params.functionName1 + '/' + req.params.functionName2].addtionalCall)
                                            {
                                                request.post(serverUrl + '/' + rest.restActionParams()[req.params.functionName1 + '/' + req.params.functionName2].addtionalCall, {form: {data: JSON.parse(body)}}, function (error, response, bodyNew) {
                                                    var resData = JSON.parse(bodyNew);
                                                    if (resData.data) {
                                                        return res.json({status: "success", data: resData.data});
                                                    } else {
                                                        if (!resData.length || (resData.length && resData.length > 1)) {
                                                            if (resData.message && typeof resData.message == 'string')
                                                            {
                                                                resData = {'message': [resData.message]};
                                                            }
                                                            return res.json({status: "success", data: resData});
                                                        } else {
                                                            if (rest.restActionParams()[req.params.functionName1 + '/' + req.params.functionName2].returnType && rest.restActionParams()[req.params.functionName1 + '/' + req.params.functionName2].returnType == 'array')
                                                            {
                                                                return res.json({status: "success", data: resData});
                                                            } else {
                                                                return res.json({status: "success", data: resData[0]});
                                                            }
                                                        }
                                                    }
                                                });
                                            } else {
                                                if (resData.data) {
                                                    return res.json({status: "success", data: resData.data});
                                                } else {
                                                    if (!resData.length || (resData.length && resData.length > 1)) {
                                                        return res.json({status: "success", data: resData});
                                                    } else {
                                                        return res.json({status: "success", data: resData[0]});
                                                    }
                                                }
                                            }
                                        } else {
                                            return res.json({status: "error", message: ["Something went wrong"]});
                                        }
                                    });

                                });
                            });
                        } else {
                            var request = require('request');
                            request.post(serverUrl + '/' + req.params.functionName1 + '/' + req.params.functionName2, {form: req.body}, function (error, response, body) {
                                if (response.statusCode == 400) {
                                    return res.json({status: "fail", data: JSON.parse(body)});
                                } else if (response.statusCode == 200) {
                                    var resData = JSON.parse(body);
                                    if (rest.restActionParams()[req.params.functionName1 + '/' + req.params.functionName2].addtionalCall)
                                    {
                                        request.post(serverUrl + '/' + rest.restActionParams()[req.params.functionName1 + '/' + req.params.functionName2].addtionalCall, {form: {data: JSON.parse(body)}}, function (error, response, bodyNew) {
                                            var resData = JSON.parse(bodyNew);
                                            if (resData.data) {
                                                return res.json({status: "success", data: resData.data});
                                            } else {
                                                if (!resData.length || (resData.length && resData.length > 1)) {
                                                    if (resData.message && typeof resData.message == 'string')
                                                    {
                                                        resData = {'message': [resData.message]};
                                                    }
                                                    return res.json({status: "success", data: resData});
                                                } else {
                                                    if (rest.restActionParams()[req.params.functionName1 + '/' + req.params.functionName2].returnType && rest.restActionParams()[req.params.functionName1 + '/' + req.params.functionName2].returnType == 'array')
                                                    {
                                                        return res.json({status: "success", data: resData});
                                                    } else {
                                                        return res.json({status: "success", data: resData[0]});
                                                    }
                                                }
                                            }
                                        });
                                    } else {
                                        if (resData.data) {
                                            return res.json({status: "success", data: resData.data});
                                        } else {
                                            if (!resData.length || (resData.length && resData.length > 1)) {
                                                return res.json({status: "success", data: resData});
                                            } else {
                                                return res.json({status: "success", data: resData[0]});
                                            }
                                        }
                                    }
                                } else {
                                    return res.json({status: "error", message: ["Something went wrong"]});
                                }
                            });
                        }

                    } else {
                        var request = require('request');
                        request.post(serverUrl + '/' + req.params.functionName1 + '/' + req.params.functionName2, {form: req.body}, function (error, response, body) {
                            if (response.statusCode == 400) {
                                return res.json({status: "fail", data: JSON.parse(body)});
                            } else if (response.statusCode == 200) {
                                var resData = JSON.parse(body);
                                if (rest.restActionParams()[req.params.functionName1 + '/' + req.params.functionName2].addtionalCall)
                                {
                                    request.post(serverUrl + '/' + rest.restActionParams()[req.params.functionName1 + '/' + req.params.functionName2].addtionalCall, {form: {data: JSON.parse(body)}}, function (error, response, bodyNew) {
                                        var resData = JSON.parse(bodyNew);
                                        if (resData.data) {
                                            return res.json({status: "success", data: resData.data});
                                        } else {
                                            if (!resData.length || (resData.length && resData.length > 1)) {
                                                if (resData.message && typeof resData.message == 'string')
                                                {
                                                    resData = {'message': [resData.message]};
                                                }
                                                return res.json({status: "success", data: resData});
                                            } else {
                                                if (rest.restActionParams()[req.params.functionName1 + '/' + req.params.functionName2].returnType && rest.restActionParams()[req.params.functionName1 + '/' + req.params.functionName2].returnType == 'array')
                                                {
                                                    return res.json({status: "success", data: resData});
                                                } else {
                                                    return res.json({status: "success", data: resData[0]});
                                                }
                                            }
                                        }
                                    });
                                } else {
                                    if (resData.data) {
                                        return res.json({status: "success", data: resData.data});
                                    } else {
                                        if (!resData.length || (resData.length && resData.length > 1)) {
                                            return res.json({status: "success", data: resData});
                                        } else {
                                            return res.json({status: "success", data: resData[0]});
                                        }
                                    }
                                }
                            } else {
                                return res.json({status: "error", message: ["Something went wrong"]});
                            }
                        });
                    }
                }
            });
        }
    });
};
//To authenticate rest api's.
exports.authentication = function (params, callback) {
    if (params != undefined) {
        var val = params.sig;
        delete params.sig;
        if (params.api_key == config.getApiKey()) {
            delete params.api_key;
            config.createSignature(params, function (err, value) {
                if (err) {
                    callback(true, value);
                } else {
                    console.log(val + ' == ' + value);
                    if (val == value) {
                        callback(false, 'success');
                    } else {
                        callback(true, value);
                    }
                }
            });
        } else {
            callback(true, 'fail');
        }
    } else {
        callback(true, 'fail');
    }
};
exports.generateSignature = function (req, res) {
    console.log('In create signature');
    console.log(JSON.stringify(req.body));
    config.createSignature(req.body, function (err, value) {
        if (err) {
            res.status(400).send(value);
        } else {
            res.json(value);
        }
    });
};
exports.getSignature = function (params, callback) {
    console.log('In create signature');
    console.log(JSON.stringify(params));
    config.createSignature(params, function (err, value) {
        callback(err, value);
    });
};
exports.restrictGet = function (req, res) {
    res.json({Error: "Invalid specified path"});
};
