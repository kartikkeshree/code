'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var staffs = require('../../app/controllers/staffs.server.controller');

	// Finish by binding the Staff middleware
	app.route('/staffByDentistId').post(staffs.staffByDentistId);

	//change Staff Status
	app.route('/changeStaffStatus').post(staffs.changeStaffStatus);

	// get staff data By StaffId
	app.route('/staffByStaffId').post(staffs.staffByStaffId);

	//get Modules Access By Staff
	app.route('/getModulesAccessByStaff').post(staffs.getModulesAccessByStaff);

	//update User And StaffModule
    app.route('/updateUserAndStaffModule').post(staffs.updateUserAndStaffModule);
	
	//get Staff Status
	app.route('/getStaffStatus').post(staffs.getStaffStatus);
};
