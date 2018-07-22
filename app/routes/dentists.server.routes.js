'use strict';

module.exports = function (app) {
    var users = require('../../app/controllers/users.server.controller');
    var dentists = require('../../app/controllers/dentists.server.controller');

    // Doctors Routes
    app.route('/dentists/list').post(dentists.list);

    app.route('/getDentist').post(dentists.getDentistData);
    app.route('/dentists/create').post(dentists.create); //users.requiresLogin,

    app.route('/dentists/update').post(dentists.update);
    app.route('/dentists/socialLinksUpdate').post(dentists.socialLinksUpdate)

    //Doctors search result data
    app.route('/dentists/search').post(dentists.search);

    //to get specialities list
    app.route('/specialityList').post(dentists.spciality);

    //to get specialities list
    app.route('/areaList').post(dentists.areaList);

    //to get doctor detail
    app.route('/dentist').post(dentists.getDentist);

    //to get doctor detail
    app.route('/clinic').post(dentists.getClinic);

    // Finish by binding the Doctor middleware
    //app.param('dentistId', dentists.dentistByID);

    app.route('/GetDentistDataByClinicId').post(dentists.GetDentistDataByClinicId);

    app.route('/changePassword').post(dentists.changeUserPassword);

    app.route('/getDentistByUserId').post(dentists.getDentistByUserId);
    app.route('/getSpecialityWithSpecificSpeciality').post(dentists.getSpecialityWithSpecificSpeciality);
    app.route('/updateSpeciality').post(dentists.updateSpeciality);
    //To get doctor data
    app.route('/dentistIdData').post(dentists.dentistDataById);
    app.route('/changeStatus').post(dentists.changeStatus);
    app.route('/removeDentist').post(dentists.delete);
    //to get all appointments by doctor
    app.route('/getAllUserAppointmentByDentistId').post(dentists.getAllUserAppointmentByDentistId);

    //
    app.route('/getUserByUserId').post(dentists.getUserByUserId);

    //to get All patient by doctor id
    app.route('/getPatientByDentistId').post(dentists.getPatientByDentistId);

    //Add a user by doctor
    app.route('/addUserBYDentist').post(dentists.addUserBYDentist);

    //clinic list by doctor id
    app.route('/clinicList').post(dentists.clinicList);

    //get Available Appointments Time
    app.route('/getAvailableAppointmentsTime').post(dentists.getAvailableAppointmentsTime);

    //get Patient Detail By appointmentId
    app.route('/getPatientDetailByAppId').post(dentists.getPatientDetailByAppId);

    //update Patient Detail By appointmentId
    app.route('/updatePatientDetailByAppId').post(dentists.updatePatientDetailByAppId);

    //update Patient Data with all appointments By appointmentId and appoitnment parent id
    app.route('/getAppoinmentData').post(dentists.getAppoinmentData);

    //update Appointment Note and Perception
    app.route('/updateAppointmentNotes').post(dentists.updateAppointmentNotes);

    //book Next Appointment for Same User
    app.route('/bookNextAppointmentSameUser').post(dentists.bookNextAppointmentSameUser);

    //deleteAppointMentWithParentAppId
    app.route('/deleteAppointMentWithParentAppId').post(dentists.deleteAppointMentWithParentAppId);

    //to get all services list
    app.route('/getServiceList').post(dentists.getServices);

    //saveCsvFile
    app.route('/saveCsvFile').post(dentists.saveCsvFile);

    //uploadReportToDataBase
    app.route('/uploadReportToDataBase').post(dentists.uploadReportToDataBase);

    //saveAllReportToAppointmentTable
    app.route('/saveAllReportToAppointmentTable').post(dentists.saveAllReportToAppointmentTable);

    //get All Appointment By Date
    app.route('/getAllAppointmentByDate').post(dentists.getAllAppointmentByDate);

    //get All Appointment By Selected Date
    app.route('/getAllAppointmentBySelectedDate').post(dentists.getAllAppointmentBySelectedDate);

    //get doctors category list
    app.route('/doctorCategoryList').post(dentists.doctorCategory);

    //Get appointment status
    app.route('/getAppointmentStatus').post(dentists.getAppointmentStatus);

    //Get doctor status
    app.route('/getDentistStatus').post(dentists.getDentistStatus);
    
    //Get doctor list to refer
    app.route('/referDoctorList').post(dentists.getReferList);
    
    //refer to doctor
    app.route('/referToDoctor').post(dentists.referToDoctor);
};
