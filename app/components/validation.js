
var user_model = require('./../models/user.server.model.js');
var validate = require('./validation.js');

exports.userRegistrationValidate = function (req, res, callback) { //Validation for registration page
    var result = [];
    var errRes = false;
    var chkEmail = user_model.checkEmailExistOrNot(req, function (err, rows) {
        if (err) {
            callback(err, 0);
        } else {
            if (rows.length > 0)
            {
                result.push("Email already exist");
                errRes = true;
            }
            var validateFirstname = validate.validateAlphNumeric(req.body['first_name'], "First Name");
            if (validateFirstname != true) {
                result.push(validateFirstname);
                errRes = true;
            } else {
                var validateNameLen = validate.validateCharLength(req.body['first_name'], "First Name", 2, 32);
                if (validateNameLen != true)
                {
                    result.push(validateNameLen);
                    errRes = true;
                }
            }
            var validateLastname = validate.validateAlphNumeric(req.body['last_name'], "Last Name");
            if (validateLastname != true) {
                result.push(validateLastname);
                errRes = true;
            } else {
                var validateLNameLen = validate.validateCharLength(req.body['last_name'], "Last Name", 2, 32);
                if (validateLNameLen != true)
                {
                    result.push(validateLNameLen);
                    errRes = true;
                }
            }

            if (req.body['role_id'] == 3) {
                if (req.body['clinic_id'] == undefined || req.body['clinic_id'] == '') {
                    result.push("Please select at least one clinic");
                    errRes = true;
                }
            }

            var validatePhoneNumber = validate.validateContactNo(req.body['contact_no']);
            if (validatePhoneNumber != true) {
                result.push(validatePhoneNumber);
                errRes = true;
            }
            var validateEmail = validate.emailValidation(req.body['email']);
            if (validateEmail != true) {
                result.push(validateEmail);
                errRes = true;
            }
            var requiredPwd = (req.body['password'] == undefined)
            if (requiredPwd == true) {
                result.push('Password Required');
                errRes = true;
            }
            var validatePwdMatch = (req.body['password'] === req.body['cnfPassword'])
            if (validatePwdMatch != true) {
                result.push('Password do not match');
                errRes = true;
            }
            var validateRoleId = (req.body['role_id'] == "" || req.body['role_id'] == undefined)
            if (validateRoleId == true) {
                result.push('Role id required');
                errRes = true;
            } else if (isNaN(req.body['role_id'])) {
                result.push("Please enter valid Role id");
                errRes = true;
            } else if (parseInt(req.body['role_id']) != 2 && parseInt(req.body['role_id']) != 5 && parseInt(req.body['role_id']) != 3) {
                result.push("Please enter valid Role id");
                errRes = true;
            }

            callback(errRes, result);
        }
    });
};

exports.updateUserValidate = function (req, res, callback) { //Validation for registration page
    var result = [];
    var errRes = false;
    var val = req.body;
    var validateFirstname = validate.validateAlphNumeric(val['first_name'], "First Name");
    if (validateFirstname != true) {
        result.push(validateFirstname);
        errRes = true;
    }
    var validateLastname = validate.validateAlphNumeric(val['last_name'], "Last Name");
    if (validateLastname != true) {
        result.push(validateLastname);
        errRes = true;
    }
    var validatePhoneNumber = validate.validateContactNo(val['contact_no']);
    if (validatePhoneNumber != true) {
        result.push(validatePhoneNumber);
        errRes = true;
    }
    var validateArea = validate.validateOnlyNumber(val['area_id'], "Area");
    if (validateArea != true) {
        result.push(validateArea);
        errRes = true;
    }

    var validateAddress = validate.validateCharLength(val['address1'], "Address", 5, 500);
    if (validateAddress != true) {
        result.push(validateAddress);
        errRes = true;
    }
    callback(errRes, result);

};

exports.contactUsValidate = function (req, res, callback) { //Validation for Contact Us Page
    var result = [];
    var errRes = false;
    var validateFirstname = validate.validateAlphNumeric(req.body['first_name'], "First Name");
    if (validateFirstname != true) {
        result.push(validateFirstname);
        errRes = true;
    }
    var validateLastname = validate.validateAlphNumeric(req.body['last_name'], "Last Name");
    if (validateLastname != true) {
        result.push(validateLastname);
        errRes = true;
    }
    var validateEmail = validate.emailValidation(req.body['email'], "Email");
    if (validateEmail != true) {
        result.push(validateEmail);
        errRes = true;
    }
    var validateContact = validate.validateContactNo(req.body['contact_no'], "Contact Number");
    if (validateContact != true) {
        result.push(validateContact);
        errRes = true;
    }
    // var validateMessage = validate.validateAlphNumeric(req.body['message'], "Message");
    if (req.body['message'] == undefined || req.body['message'] == '') {
        result.push("Message required");
        errRes = true;
    }
    callback(errRes, result);
};

exports.addBlogValidation = function (req, res, callback) { //Validation for Add clinic page from doctor / admin
    var result = [];
    var errRes = false;

    var validateName = validate.validateCharLength(req.body['title'], "Blog Title", 5, 100);
    if (validateName != true) {
        result.push(validateName);
        errRes = true;
    }
    var validateNameLen = validate.validateCharLength(req.body['description'], "Description", 10);
    if (validateNameLen != true)
    {
        result.push(validateNameLen);
        errRes = true;
    }

    callback(errRes, result);
};

exports.addForumValidation = function (req, res, callback) { //Validation for Add Forum Query
    var result = [];
    var errRes = false;
    var validateQues = validate.validateCharLength(req.body['question'], "Query Title", 5, 100);
    if (validateQues != true) {
        result.push(validateQues);
        errRes = true;
    }
    var validateDesLen = validate.validateCharLength(req.body['description'], "Query Description", 10);
    if (validateDesLen != true)
    {
        result.push(validateDesLen);
        errRes = true;
    }

    callback(errRes, result);
};


exports.addClassfiedValidation = function (req, res, callback) { //Validation for Add Forum Query
    var result = [];
    var errRes = false;
    var validateQues = validate.validateCharLength(req.body['title'], "Ad Title", 5, 100);
    if (validateQues != true) {
        result.push(validateQues);
        errRes = true;
    }
    var validateDesLen = validate.validateCharLength(req.body['description'], "Ad Description", 10);
    if (validateDesLen != true)
    {
        result.push(validateDesLen);
        errRes = true;
    }

    callback(errRes, result);
};


exports.addClinicValidation = function (req, res, callback) { //Validation for Add clinic page from doctor / admin
    var result = [];
    var errRes = false;
    var validateName = validate.validateAlphNumeric(req.body['name'], "Clinic Name");
    if (validateName != true) {
        result.push(validateName);
        errRes = true;
    } else {
        var validateNameLen = validate.validateCharLength(req.body['name'], "Clinic Name", 2, 32);
        if (validateNameLen != true) {
            result.push(validateNameLen);
            errRes = true;
        }
    }
    var validateAddrLen = validate.validateCharLength(req.body['address'], "Address", 5, 500);
    if (validateAddrLen != true) {
        result.push(validateAddrLen);
        errRes = true;
    }
    var validateArea = validate.validateOnlyNumber(req.body['area_id'], "Area");
    if (validateArea != true) {
        result.push(validateArea);
        errRes = true;
    }
    var validateCity = validate.validateAlphNumeric(req.body['city'], "City");
    if (validateCity != true) {
        result.push(validateCity);
        errRes = true;
    }
    var validateZip = validate.validateOnlyNumber(req.body['zip'], "Zip code");
    if (validateZip != true) {
        result.push(validateZip);
        errRes = true;
    } else {
        var validateZipLen = validate.validateCharLength(req.body['zip'], "Zip code", 4, 20);
        if (validateZipLen != true) {
            result.push(validateZipLen);
            errRes = true;
        }
    }
    var validateContact = validate.validateOnlyNumber(req.body['contact_no'], "Contact Number");
    if (validateContact != true) {
        result.push(validateContact);
        errRes = true;
    } else {
        var validateContactLen = validate.validateCharLength(req.body['contact_no'], "Contact Number", 6, 10);
        if (validateContactLen != true) {
            result.push(validateContactLen);
            errRes = true;
        }
    }
    var validateMobile = validate.validateOnlyNumber(req.body['contact2'], "Phone Number");
    if (validateMobile != true) {
        result.push(validateMobile);
        errRes = true;
    } else {
        var validateMobileLen = validate.validateCharLength(req.body['contact2'], "Phone Number", 6, 10);
        if (validateMobileLen != true) {
            result.push(validateMobileLen);
            errRes = true;
        }
    }
    var validateDentist = validate.validateOnlyNumber(req.body['doctor_id'], "Doctor");
    if (validateDentist != true) {
        result.push(validateDentist);
        errRes = true;
    }
    var validateServiceLen = validate.validateArrLength(req.body['services'], "Clinic Services", 1);
    if (validateServiceLen != true) {
        result.push(validateServiceLen);
        errRes = true;
    }
    callback(errRes, result);
};

exports.addDentistValidation = function (req, res, callback) { //Validation for Add clinic page from doctor / admin
    var result = [];
    var errRes = false;

    var validateFirstName = validate.validateAlphNumeric(req.body['first_name'], "First Name");
    if (validateFirstName != true) {
        result.push(validateFirstName);
        errRes = true;
    }
    var validateLastName = validate.validateAlphNumeric(req.body['last_name'], "Last Name");
    if (validateLastName != true) {
        result.push(validateLastName);
        errRes = true;
    }
    var validateEmail = validate.emailValidation(req.body['email'], "Email");
    if (validateEmail != true) {
        result.push(validateEmail);
        errRes = true;
    }
    var validateAddress = validate.validateCharLength(req.body['address1'], "Address", 5, 500);
    if (validateAddress != true) {
        result.push(validateAddress);
        errRes = true;
    }
    var validateArea = validate.validateOnlyNumber(req.body['area_id'], "Area");
    if (validateArea != true) {
        result.push(validateArea);
        errRes = true;
    }

    var validateCity = validate.validateAlphNumeric(req.body['city'], "City");
    if (validateCity != true) {
        result.push(validateCity);
        errRes = true;
    }
    var validateState = validate.validateAlphNumeric(req.body['state'], "State");
    if (validateState != true) {
        result.push(validateState);
        errRes = true;
    }
    var validateZip = validate.validateOnlyNumber(req.body['zip'], "Zip code");
    if (validateZip != true) {
        result.push(validateZip);
        errRes = true;
    }
    var validateContact = validate.validateContactNo(req.body['contact_no'], "Contact Number");
    if (validateContact != true) {
        result.push(validateContact);
        errRes = true;
    }

    var chkEmail = user_model.checkEmailExistOrNot(req, function (err, rows) {
        if (err) {
            callback(err, 0);
        } else {
            if (rows.length > 0) {
                result.push("Email already exist");
                errRes = true;
                callback(errRes, result);
            } else {
                callback(errRes, result);
            }
        }
    });
};

exports.professionalInfoValidate = function (req, res, callback) {
    var result = [];
    var errRes = false;

    if (req.body.updateSocialLinks == undefined) {
        var validateExperience = validate.validateOnlyNumber(req.body['experience'], "Experience");
        if (validateExperience != true) {
            result.push(validateExperience);
            errRes = true;
        }
        /*var validateMonth = validate.validateOnlyNumber(req.body['exp_month'], "Month");
         if (validateMonth != true) {
         result.push(validateMonth);
         errRes = true;
         }*/
        var validateDegree = validate.validateAlphNumeric(req.body['degree'], "Degree");
        if (validateDegree != true) {
            result.push(validateDegree);
            errRes = true;
        }
        var validateDci = validate.validateAlphNumeric(req.body['dci_registration'], "Dci Number");
        if (validateDci != true) {
            result.push(validateDci);
            errRes = true;
        }

    }
    callback(errRes, result);
}


exports.validateUserAddByDentist = function (req, res, callback) { //Validation for Add user page from doctor
    var result = [];
    var errRes = false;


    var validateFirstName = validate.validateAlphNumeric(req.body['first_name'], "First Name");
    if (validateFirstName != true) {
        result.push(validateFirstName);
        errRes = true;
    }
    var validateLastName = validate.validateAlphNumeric(req.body['last_name'], "Last Name");
    if (validateLastName != true) {
        result.push(validateLastName);
        errRes = true;
    }
    var validateClinic = validate.validateOnlyNumber(req.body['clinic_id'], "Clinic");
    if (validateClinic != true) {
        result.push(validateClinic);
        errRes = true;
    }
    var validateEmail = validate.emailValidation(req.body['email'], "Email");
    if (validateEmail != true) {
        result.push(validateEmail);
        errRes = true;
    }
    var validateAddress = validate.validateCharLength(req.body['address1'], "Address", 5, 500);
    if (validateAddress != true) {
        result.push(validateAddress);
        errRes = true;
    }

    var validateArea = validate.validateOnlyNumber(req.body['area_id'], "Area");
    if (validateArea != true) {
        result.push(validateArea);
        errRes = true;
    }

    var validateDate = validate.dateValidate(req.body['app_date'], "Date");
    if (validateDate != true) {
        result.push(validateDate);
        errRes = true;
    }
    /*var validateTime=validate.requiredFieldOnly(req.body['appTime'],"Time");
     if(validateTime!=true){
     result.push(validateTime);
     errRes = true;
     }*/
    var validateContact = validate.validateContactNo(req.body['contact_no'], "Contact Number");
    if (validateContact != true) {
        result.push(validateContact);
        errRes = true;
    }
    var validateCity = validate.validateAlphNumeric(req.body['city'], "City");
    if (validateCity != true) {
        result.push(validateCity);
        errRes = true;
    }
    var validateState = validate.validateAlphNumeric(req.body['state'], "State");
    if (validateState != true) {
        result.push(validateState);
        errRes = true;
    }
    console.log(req.body['user_id']);
    if (req.body['user_id'] == undefined) {
        var chkEmail = user_model.checkEmailExistOrNot(req, function (err, rows) {
            if (err) {
                callback(err, 0);
            } else {
                if (rows.length > 0) {
                    result.push("Email already exist");
                    errRes = true;
                    callback(errRes, result);
                } else {
                    callback(errRes, result);
                }
            }
        });
    } else {
        callback(errRes, result);
    }

};

exports.requiredFieldOnly = function (inputtxt, name) {
    if (inputtxt != undefined && inputtxt != '') {
        return "Required " + name;
    } else {
        return true;
    }
}
exports.validateAlphNumericWithoutReq = function (inputtxt, name) {
    var letters = /^[0-9a-zA-Z]+$/;
    if (inputtxt != undefined) {
        if (!inputtxt.match(letters)) {
            return "Please enter valid " + name;
        } else {
            return true;
        }
    }

};

exports.validateAlphNumeric = function (inputtxt, name) {
    console.log(inputtxt);
    var letters = /^[0-9a-zA-Z ]+$/;
    if (inputtxt == undefined || inputtxt.trim() == "") {
        return "Required " + name;
    } else if (!inputtxt.match(letters)) {
        return "Please enter valid " + name;
    } else {
        return true;
    }

};

exports.validateContactNo = function (inputtxt) {
    if (inputtxt != undefined && inputtxt != "") {
        var phoneno = /^\d{10}$/;
        if (inputtxt.toString().match(phoneno)) {
            return true;
        } else {
            return "Please enter valid mobile number ";
        }
    }
    else
    {
        return "Required mobile number";
    }
};

exports.validateOnlyNumber = function (inputtxt, name) {
    if (inputtxt != undefined && inputtxt != '') {
        if (isNaN(inputtxt)) {
            return "Please enter valid " + name;
        } else {

            return true;
        }
    }
    else
    {
        return "Required " + name;
    }
};

exports.emailValidation = function (inputtxt) {
    if (inputtxt != undefined) {
        var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (inputtxt.match(mailformat)) {
            return true;
        } else {
            return "Please enter valid email";
        }
    }
    else
    {
        return "Required email";
    }
};

exports.dateValidate = function (inputtxt, name) {
    if (inputtxt != undefined && inputtxt != '') {
        var str = inputtxt.split('/');
        //var start1_date = new Date(date.getFullYear(), date.getMonth(), date.getDate() + i, startTime[0], startTime[1], startTime[2], "");

        var date = new Date(str[2], str[0] - 1, str[1], 0, 0, 0);
        if (date == 'Invalid Date') {
            return "Please enter valid date";
        } else {
            var curDate = new Date();
            var datenext = new Date();
            var next3Monthdate = new Date(datenext.setMonth(datenext.getMonth() + 3));
            var curOnlydate = new Date(curDate.getFullYear(), curDate.getMonth(), curDate.getDate(), 0, 0, 0);
            if (date != 'Invalid Date' && date < next3Monthdate && date >= curOnlydate) {
                return true;
            } else {
                return "Please enter valid " + name + " date";
            }
        }
    }
    else
    {
        return "Required " + name;
    }
}


exports.onlyDateValidate = function (inputtxt, name) {
    if (inputtxt != undefined && inputtxt != '') {
        var str = inputtxt.split('/');
        //var start1_date = new Date(date.getFullYear(), date.getMonth(), date.getDate() + i, startTime[0], startTime[1], startTime[2], "");
        if (str[0] > 0 && str[0] <= 12) {
            var date = new Date(str[2], str[0] - 1, str[1], 0, 0, 0);
            console.log(date);
            if (date == 'Invalid Date') {
                if (name == "" || name == undefined) {
                    return "Please enter valid date";
                } else {
                    return "Please enter valid " + name;
                }

            } else {
                return true;
            }
        } else {
            if (name == "" || name == undefined) {
                return "Please enter valid date";
            } else {
                return "Please enter valid " + name;
            }
        }
    }
    else {
        console.log("Required " + name);
        return "Required " + name;
    }
}


exports.validateCharLength = function (inputtxt, name, minlen, maxlen) {
    if (!inputtxt)
    {
        return name + " Required";
    }
    else if (inputtxt.length < minlen) {
        return "Please use minimum " + minlen + " characters for " + name;
    }
    else if (inputtxt.length > maxlen)
    {
        return "Please use maximum " + maxlen + " characters for " + name;
    } else {
        return true;
    }
};

exports.validateArrLength = function (inputtxt, name, minlen) {
    if (!inputtxt)
    {
        return name + " Required";
    }
    else if (inputtxt.length < minlen) {
        return "Please select at least " + minlen + " " + name;
    }
    else {
        return true;
    }
};


exports.staffValidate = function (req, res, callback) { //Validation for registration page
    var result = [];
    var errRes = false;

    var validateFirstname = validate.validateAlphNumeric(req.body['first_name'], "First Name");
    if (validateFirstname != true) {
        result.push(validateFirstname);
        errRes = true;
    } else {
        var validateNameLen = validate.validateCharLength(req.body['first_name'], "First Name", 2, 32);
        if (validateNameLen != true)
        {
            result.push(validateNameLen);
            errRes = true;
        }
    }
    var validateLastname = validate.validateAlphNumeric(req.body['last_name'], "Last Name");
    if (validateLastname != true) {
        result.push(validateLastname);
        errRes = true;
    } else {
        var validateLNameLen = validate.validateCharLength(req.body['last_name'], "Last Name", 2, 32);
        if (validateLNameLen != true)
        {
            result.push(validateLNameLen);
            errRes = true;
        }
    }

    if (req.body['role_id'] == 3) {
        if (req.body['clinic_id'] == undefined || req.body['clinic_id'] == '') {
            result.push("Please select at least one clinic");
            errRes = true;
        }
    }

    var validatePhoneNumber = validate.validateContactNo(req.body['contact_no']);
    if (validatePhoneNumber != true) {
        result.push(validatePhoneNumber);
        errRes = true;
    }
    /* var validateEmail=validate.emailValidation(req.body['email']);
     if(validateEmail!=true){
     result.push(validateEmail);
     errRes = true;
     }*/
    /* var requiredPwd= (req.body['password'] == undefined)
     if(requiredPwd==true){
     result.push('Password Required');
     errRes = true;
     }*/
    /*var validatePwdMatch= (req.body['password'] === req.body['cnfPassword'])
     if(validatePwdMatch!=true){
     result.push('Password do not match');
     errRes = true;
     }*/
    callback(errRes, result);


};

exports.memberValidate = function (req, res, callback) {

    var result = [];
    if (req.body.status) {
        callback(false, result);
    } else {
        var errRes = false;
        var validateFirstname = validate.validateAlphNumeric(req.body['first_name'], "First Name");
        if (validateFirstname != true) {
            result.push(validateFirstname);
        } else {
            var validateNameLen = validate.validateCharLength(req.body['first_name'], "First Name", 2, 32);
            if (validateNameLen != true)
            {
                result.push(validateNameLen);
                errRes = true;
            }
        }
        var validateLastname = validate.validateAlphNumeric(req.body['last_name'], "Last Name");
        if (validateLastname != true) {
            result.push(validateLastname);
            errRes = true;
        } else {
            var validateLNameLen = validate.validateCharLength(req.body['last_name'], "Last Name", 2, 32);
            if (validateLNameLen != true)
            {
                result.push(validateLNameLen);
                errRes = true;
            }
        }

        if (req.body['gender'] == undefined) {
            result.push("Required gender");
            errRes = true;
        }

        var validateBirthDate = validate.onlyDateValidate(req.body['birth_date'], "Birth date");
        if (validateBirthDate != true) {
            result.push(validateBirthDate);
            errRes = true;
        }

        callback(errRes, result);
    }

}

exports.addNotificationValidation = function (req, res, callback) {
    var result = [];
    var errRes = false;
    var validateNameLen = validate.validateCharLength(req.body['description'], "Description", 10);
    if (validateNameLen != true)
    {
        result.push(validateNameLen);
        errRes = true;
    }

    var validateDate = validate.onlyDateValidate(req.body['start_date'], "Date");
    if (validateDate != true) {
        result.push(validateDate);
        errRes = true;
    }

    var validateDate = validate.onlyDateValidate(req.body['end_date'], "Date");
    if (validateDate != true) {
        result.push(validateDate);
        errRes = true;
    }

    callback(errRes, result);
};

exports.updateNotificationValidation = function (req, res, callback) {
    var result = [];
    var errRes = false;
    var validateNameLen = validate.validateCharLength(req.body['description'], "Description", 10);
    if (validateNameLen != true)
    {
        result.push(validateNameLen);
        errRes = true;
    }

    var validateDate = validate.onlyDateValidate(req.body['start_date'], "Date");
    if (validateDate != true) {
        result.push(validateDate);
        errRes = true;
    }

    var validateDate = validate.onlyDateValidate(req.body['end_date'], "Date");
    if (validateDate != true) {
        result.push(validateDate);
        errRes = true;
    }

    callback(errRes, result);

};
/*doctor_id
 1
 
 name
 "asd"
 
 patients
 ["23", "24"]
 
 sms_email_txt
 "asdsad"
 
 type
 "Email"*/
exports.campaignValidation = function (req, callback) {
    var result = [];
    var errRes = false;
    var validateNameLen = validate.validateCharLength(req.body['name'], "Campaign name", 2);
    if (validateNameLen != true)
    {
        result.push(validateNameLen);
        errRes = true;
    }
    var validateType = validate.validateAlphNumeric(req.body['type'], "Campaign type");
    if (validateType != true)
    {
        result.push(validateType);
        errRes = true;
    }
    var validateSms_email_txt = validate.validateAlphNumeric(req.body['sms_email_txt'], "SMS/Email Text");
    if (validateSms_email_txt != true)
    {
        result.push(validateSms_email_txt);
        errRes = true;
    }
    if (req.body['type'] != 'Email' && req.body['type'] != 'Sms') {
        result.push("Please select valid campaign type");
        errRes = true;
    }
    if (!req.body['patients']) {
        result.push("Please select atleast one user");
        errRes = true;
    }
    callback(errRes, result);
};

exports.validateSmsPackageRequest = function (req, callback) {
    var result = [];
    var errRes = false;
    var validateAllocated = validate.validateOnlyNumber(req.body['allocated'], "No of Sms");
    if (validateAllocated != true) {
        result.push(validateAllocated);
        errRes = true;
    }
    var validateDate = validate.onlyDateValidate(req.body['start_date'], "Start date");
    if (validateDate != true) {
        result.push(validateDate);
        errRes = true;
    }

    var validatEndDate = validate.onlyDateValidate(req.body['end_date'], "End date");
    if (validatEndDate != true) {
        result.push(validatEndDate);
        errRes = true;
    }

    callback(errRes, result);
};

exports.addEventValidation = function (req, res, callback) { //Validation for Add event
    var result = [];
    var errRes = false;

    var validateTitle = validate.validateCharLength(req.body['title'], "Event Title", 5, 100);
    if (validateTitle != true) {
        result.push(validateTitle);
        errRes = true;
    }
    var validateDesc = validate.validateCharLength(req.body['description'], "Event Description", 10);
    if (validateDesc != true)
    {
        result.push(validateDesc);
        errRes = true;
    }
    var validateAddr = validate.validateCharLength(req.body['address'], "Event Address", 10);
    if (validateAddr != true)
    {
        result.push(validateAddr);
        errRes = true;
    }
    var validateSdate = validate.onlyDateValidate(req.body['start_date'], "Event Start Date");
    if (validateSdate != true)
    {
        result.push(validateSdate);
        errRes = true;
    }
    if (req.body['start_time'] == undefined || req.body['start_time'] == '') {
        result.push("Event start time required");
        errRes = true;
    }
    var validateSdate = validate.onlyDateValidate(req.body['end_date'], "Event End Date");
    if (validateSdate != true)
    {
        result.push(validateSdate);
        errRes = true;
    }
    if (req.body['end_time'] == undefined || req.body['end_time'] == '') {
        result.push("Event end time required");
        errRes = true;
    }
    if (errRes == false)
    {
        var date1 = new Date(req.body.start_date + ' ' + req.body.start_time);
        var date2 = new Date(req.body.end_date + ' ' + req.body.end_time);
        if (date1.getTime() >= date2.getTime()) {
            result.push("Event start date must be earlier than event end date");
            errRes = true;
        }
    }
    callback(errRes, result);
};

exports.referToDoctorValidate = function (req, res, callback) { //Validation for refer to doctor
    var result = [];
    var errRes = false;

    if (req.body['referTo'] == undefined || req.body['referTo'] == '') {
        result.push("Please select a doctor to refer");
        errRes = true;
    }
    if (req.body['reason'] == undefined || req.body['reason'] == '') {
        result.push("Please give reason to refer");
        errRes = true;
    }
    callback(errRes, result);
};

exports.blockTimeValidate = function (req, res, callback) { //Validation for refer to doctor
    var result = [];
    var errRes = false;

    if (req.body['id'] == undefined || req.body['id'] == '') {
        result.push("Invalid user id");
        errRes = true;
    }
    if (req.body['clinic'] == undefined || req.body['clinic'] == '') {
        result.push("Invalid clinic detail");
        errRes = true;
    }
    if (req.body['blockTimeList'] == undefined || req.body['blockTimeList'] == '' || req.body['blockTimeList'].length < 1) {
        result.push("Please provide proper time details to block the slots");
        errRes = true;
    }
    if (req.body['reason'] == undefined || req.body['reason'] == '') {
        result.push("Please provide reason to block the slots");
        errRes = true;
    }
    callback(errRes, result);
};

exports.chatMessageValidate = function (req, res, callback) { //Validation for add chat message//
    var result = [];
    var errRes = false;

    if (req.body['client'] == undefined || req.body['client'] == '') {
        result.push("Insufficient data");
        errRes = true;
    }
    if (req.body['clientNext'] != undefined && req.body['clientNext'] == '') {
        result.push("Insufficient data");
        errRes = true;
    }
    if (req.body['message'] == undefined || req.body['message'] == '') {
        result.push("Message can not be blank");
        errRes = true;
    }
    callback(errRes, result);
};