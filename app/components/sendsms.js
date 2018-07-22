'use strict';

var log = require('./logs.js');
var config = require('./config.js')
exports.sendSms = function(req,contact_no,message,callback){
    console.log(message +' http://mainadmin.dove-sms.com/sendsms.jsp?user='+config.getSmsAdminUserName()+' '+
                                       '&password='+config.getSmsAdminPassword()+'&mobiles='+contact_no+'&sms='+message+'&senderid='+config.getSenderId()+' ');
    var request = require('request');
    var parseString = require('xml2js').parseString;
    request('http://mainadmin.dove-sms.com/sendsms.jsp?user='+config.getSmsAdminUserName()+''+
            '&password='+config.getSmsAdminPassword()+'&mobiles='+contact_no+'&sms='+message+'&senderid='+config.getSenderId()+'', function (error, response, body) {
      if (!error && response.statusCode == 200) {
           parseString(body, function (err, result) {
               if(result.smslist.error != undefined){
                    log.appendError('Sending sms error is \n' + result.smslist.error[0]['error-code'] +'\n' +
                                   result.smslist.error[0]['error-description'] +'\n');
                  callback(false,result.smslist.error[0]['error-description']);
               }else{
                  callback(false,result.smslist.error[0]['error-description']);
               }
           });

      } else {
        parseString(body, function (err, result) {
           console.dir(result);
           callback(true,body);
        });
      }
    })
}



