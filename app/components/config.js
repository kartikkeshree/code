'use strict';
var crypto = require('crypto');
/*var Converter=require('csvtojson').core.Converter;
var node_xj = require("xls-to-json");
var xlsxj = require("xlsx-to-json");
var fs=require("fs");*/
var config = require('./config');
var log = require('./logs.js');
var sms = require('./sendsms.js');
var sendMail = require('./send_mail.js');
exports.getHostName=function(){
	return 'localhost';
};
exports.getDefaultLink=function(){
	return 'http://localhost:3080/';
};
exports.getAdminEmail=function(){
	return 'caprium.test@gmail.com';
};
exports.getAdminPassword=function(){
	return 'caprium123456';
};
exports.generateHash = function(email) {
	return crypto.createHash('sha1').update(email).digest('hex');
};
exports.generatePatientId = function() {
    var val=Math.random().toString(9).substr(6, 6);
    return val;
};

exports.getSmsAdminUserName = function(){
    return 'DFORUM';
}

exports.getSmsAdminPassword = function(){
    return 'D@ve34';
}

exports.getSenderId = function(){
    return 'INFORM';
}

exports.getUserMessageTxt= function(name,date,time){
    return 'Your appointment has been booked with '+name+' on '+date+' at '+time+'.';
}

exports.getDentistMessageTxt= function(name,clinicName,date,time){
     return ''+name+' user booked an appointment for '+clinicName+' on '+date+' at '+time+' please confirm it.';
}

exports.getSecretKey= function(){
    return 'testSecret';
}

exports.getApiKey= function(){
    return '89567431520122000154';
}

exports.createSignature = function(obj,callback){
console.log(JSON.stringify(obj));
    if(obj != undefined && obj != null){
        var sortVal ='';
        var myObj = obj,keys=Object.keys(myObj),i,len = keys.length;
        keys.sort();
        for (i = 0; i < len; i++)
        {
           sortVal += myObj[keys[i]];
        };
        var val = config.generateHash(sortVal += config.getSecretKey());
        console.log('iff '+val);
        callback(false,val);
    } else {
        var val = config.generateHash(sortVal += config.getSecretKey());
        console.log('else '+val);
        callback(false,val);
    }

}

exports.uploadDataToDataBase=function(jsonData,user_id,req,callback){
    var role_id=5;
    var date=new Date();
    var sqlDate = date.getFullYear() + '-' + (parseInt(date.getMonth()) + 1) + '-' + date.getDate();

    var userValues = [];
    //first_name	last_name	email	password	address1	city	state	country	zip	contact_no	birth_date	gender created_by

    for(var a = 0; a < jsonData.length; a++)
    {
        var pass=jsonData[a].password;
        var patient_id = config.generatePatientId();
        var encryptedPassword = config.generateHash(jsonData[a].password.toString());
        if(jsonData[a].email==undefined || jsonData[a].email==''){
            continue;
        }

        userValues.push(
            [
                jsonData[a].first_name,
                jsonData[a].last_name,
                jsonData[a].email,
                encryptedPassword,
                jsonData[a].address1,
                jsonData[a].city,
                jsonData[a].state,
                jsonData[a].country,
                jsonData[a].zip,
                jsonData[a].contact_no,
                jsonData[a].country,
                jsonData[a].gender,
                role_id,
                sqlDate,
                user_id,
                patient_id

            ]
        );
    }
    console.log(userValues);
    if(userValues.length>0) {
        req.getConnection(function (err, connection) {
            var query = connection.query('INSERT IGNORE into user(first_name,last_name,email,password,address1' +
                ',city,state,country,zip,contact_no,birth_date,gender,role_id,created_date,created_by,patient_id) VALUES ?', [userValues, role_id, sqlDate], function (err, rows) {
                console.log(query.sql);
                if (err) {
                    console.log(err);
                    callback(true,err);
                } else {
                    console.log(rows);
                    callback(false,rows);
                }
            });
        });
    }else{
        callback(true,'no data');
    }

}

exports.convertToJSon=function(value){
    var desc={};
    for(var i=0;i<value.length;i++){
        desc[i]=value[i];
    }
    return desc;
}

exports.allocateSmsAndEmail = function(req,res) {
    try {
        console.log(req.body);
        req.getConnection(function(err,connection) {
            if(err) {
                console.log(err);
                log.appendError(err);
                return false;
            } else {
                var date = new Date();
                var sqlStartDate = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+' '+date.getHours()+':'+date.getMinutes();
                var afterSixMonthDate = new Date(date.setMonth(date.getMonth() + 6));
                var sqlEndDate = afterSixMonthDate.getFullYear()+'-'+(afterSixMonthDate.getMonth()+1)+'-'+afterSixMonthDate.getDate()+' '+date.getHours()+':'+date.getMinutes();
                var data = [];

                var sql1 = connection.query('SELECT id FROM doctor WHERE user_id = ?',req.body.doctor_id,function(err,row){
                    if(err){
                        console.log(err);
                    }else{
                        data.push(['Email', row[0].id, sqlStartDate, sqlEndDate, sqlStartDate,'Approved']);
                        data.push(['SMS', row[0].id, sqlStartDate, sqlEndDate, sqlStartDate,'Approved']);
                        var sql = connection.query('INSERT into package (type,doctor_id,start_date,end_date,created_date,status)'+
                                          'VALUES ?',[data],function(err,rows){
                            if(err) {
                                console.log(err);
                                log.appendError(err);
                                return false;
                            } else {
                                return true;
                            }
                        });
                    }
                });
            }
        });
    } catch(e) {
        console.log(e);
        log.appendError(e);
    }
}

exports.sendSmsToSelectedUser = function(req,res,contacts,message) {
    for(var i = 0; i < contacts.length; i++){
        sms.sendSms(req,contacts[i].contact_no,message,function(err,resp){
            if(err){
                 log.appendError(err);
            }else{
                console.log("Success");
            }
        });
    }
};

exports.sendEmailToSelectedUser = function(res,emails,message) {
        console.log("config email"+emails[0].email);
        var email = '';
        for(var i = 0; i < emails.length; i++) {
            email += (i==0)?'':',';
            email += emails[i].email;
        }
        console.log(JSON.stringify(email));
        var mailOptions = {
            from : 'DoctorHere<caprium.test@gmail.com>',
            to : email,
            subject : 'New Campaign',
            html : message
        };
        sendMail.sendMail(mailOptions,res);
}
/*exports.convertCsvToJson=function(inputFile,callback){
    var is = fs.createReadStream(inputFile.toString());
    var jsonObj1=[];
    var csvConverter = new Converter({constructResult: true});
    csvConverter.on("end_parsed", function (jsonObj) {
        //here is your result json object
        callback(false,jsonObj);
    });
    is.pipe(csvConverter);

}

exports.convertXlsToJson=function(inputFile,callback){
    node_xj({
        input:inputFile,  // input xls
        output: "output.json" // output json
    }, function(err, result) {
        if(err) {
            console.error(err);
            callback(true,err);
        } else {
            callback(false,result);
        }
    });
}

exports.convertXlsxToJson=function(inputFile,callback){
    xlsxj({
        input: inputFile,
        output: "output.json"
    }, function(err, result) {
        if(err) {
            console.error(err);
            callback(true,err);
        }else {
            callback(false,result)
        }
    });

}*/

