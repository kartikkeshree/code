'use strict';

module.exports = function (app) {
    var users = require('../../app/controllers/users.server.controller');
    var appointments = require('../../app/controllers/appointments.server.controller');

    // Appointments Routes
    app.route('/appointments')
            .get(appointments.list)
            .post(users.requiresLogin, appointments.create);

    app.route('/appointments/:appointmentId')
            .get(appointments.read)
            .put(users.requiresLogin, appointments.hasAuthorization, appointments.update)
            .delete(users.requiresLogin, appointments.hasAuthorization, appointments.delete);

    // Finish by binding the Appointment middleware
    app.param('appointmentId', appointments.appointmentByID);

    app.route('/getAppointmentTimes').post(appointments.getAppointmentTimes);
    app.route('/getBookedAppointmentTimes').post(appointments.getBookedAppointmentTimes);
    app.route('/bookAppointment').post(appointments.bookAppointment);
    app.route('/updateAppointment').post(appointments.updateAppointment);

    app.route('/getAllBookedAppointmentsByUserId').post(appointments.getAllBookedAppointmentsByUserId);
    app.route('/deleteBookedAppointmentsByAppId').post(appointments.deleteBookedAppointmentsByAppId);
    app.route('/blockTime').post(appointments.saveBlockedTime);
    app.route('/getBlockedTime').post(appointments.getBlockedTime);
};
