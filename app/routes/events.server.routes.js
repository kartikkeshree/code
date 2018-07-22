'use strict';

module.exports = function(app) {
	
	var events = require('../../app/controllers/events.server.controller');

	// Clinics Routes
	app.route('/listEvents').post(events.list); 
	app.route('/removeEvent').post(events.delete); 
	app.route('/eventAdd').post(events.create);
        app.route('/getEvent').post(events.getData);
        app.route('/eventUpdate').post(events.update);
	app.route('/listAllEvents').post(events.listAllEvents);
        app.route('/getTempEventImage').post(events.saveTempImage);
};