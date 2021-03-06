'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var clinics = require('../../app/controllers/clinics.server.controller');

	// Clinics Routes
	app.route('/clinics').post(clinics.list); //.post(users.requiresLogin, clinics.create);
	app.route('/clinicAdd').post(clinics.create);

	app.route('/clinics/:clinicId')
		.get(clinics.read)
		.put(users.requiresLogin, clinics.hasAuthorization, clinics.update)
		.delete(users.requiresLogin, clinics.hasAuthorization, clinics.delete);

	// Finish by binding the Clinic middleware
	app.param('clinicId', clinics.clinicByID);
	// To delete clinic
	app.route('/removeClinic').post(clinics.delete);
	app.route('/getClinicData').post(clinics.read);
	app.route('/updateClinic').post(clinics.update);
	app.route('/saveClinicTime').post(clinics.saveClinicTiming);
	app.route('/saveClinicImages').post(clinics.saveClinicImages);
	app.route('/saveImageData').post(clinics.saveImageData);
	app.route('/changeClinicStatus').post(clinics.changeStatus);
	app.route('/getClinicServices').post(clinics.getClinicServices);
	app.route('/removeUploadedFile').post(clinics.removeUploadedFile);
	app.route('/getClinicStatus').post(clinics.getClinicStatus);
	
};
