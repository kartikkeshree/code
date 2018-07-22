'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var classifieds = require('../../app/controllers/classifieds.server.controller');

	// Classifieds Routes
	app.route('/classifieds').post(classifieds.list);

	/*app.route('/classifieds')
		.get(classifieds.read)
		.put(users.requiresLogin, classifieds.hasAuthorization, classifieds.update)
		.delete(users.requiresLogin, classifieds.hasAuthorization, classifieds.delete);*/

	// Finish by binding the Classified middleware
	app.route('/classifiedById').post(classifieds.classifiedByID);
    app.route('/classified/getCategory').post(classifieds.getCategory);
    app.route('/classifieds/create').post(classifieds.create);
    /*app.route('/searchClassified').post(classifieds.searchClassified);
    app.route('/searchByCategory').post(classifieds.searchByCategory);*/
	app.route('/saveClassfiedComment').post(classifieds.saveClassfiedComment);
	app.route('/getClassfiedComment').post(classifieds.getClassfiedComment);
	//To change status of blog
	app.route('/classifiedStatus').post(classifieds.changeStatus);
    app.route('/updateClassifiedById').post(classifieds.updateClassifiedById);
	//To delete comment on classified
	app.route('/deleteClassifiedComment').post(classifieds.deleteClassifiedComment);

};
