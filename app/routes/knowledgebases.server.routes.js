'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var knowledgebases = require('../../app/controllers/knowledgebases.server.controller');

	// Knowledgebases Routes
	app.route('/knowledgebases')
		.get(knowledgebases.list)
		.post(users.requiresLogin, knowledgebases.create);

	app.route('/knowledgebases/:knowledgebaseId')
		.get(knowledgebases.read)
		.put(users.requiresLogin, knowledgebases.hasAuthorization, knowledgebases.update)
		.delete(users.requiresLogin, knowledgebases.hasAuthorization, knowledgebases.delete);

	// Finish by binding the Knowledgebase middleware
	app.param('knowledgebaseId', knowledgebases.knowledgebaseByID);

	//To get Blogs list
	app.route('/getAllKnowledgeBase').post(knowledgebases.knowledgeBaseList);
	//To get Specific Blog Details from blog Id
	app.route('/getKnowledgeBaseById').post(knowledgebases.getKnowledgeBaseById);
	//To add comment for any blog
	app.route('/knowledgeBase/addComment').post(knowledgebases.addComment);
	//To get all comments of blog
	app.route('/knowledgeBase/getComments').post(knowledgebases.getCommentsByKnowledgeBaseId);
	//get Wiki Data
	app.route('/getWikiData').post(knowledgebases.getWikiData);
	//getDataUsingPageId
	app.route('/getDataUsingPageId').post(knowledgebases.getDataUsingPageId);

	//create KnowledgeBase
	app.route('/createKnowledgeBase').post(knowledgebases.createKnowledgeBase);

	//deleteKnowBaseById
	app.route('/deleteKnowBaseById').post(knowledgebases.deleteKnowBaseById);

	//recentKnowBase
	app.route('/recentKnowBase').post(knowledgebases.recentKnowBase);
	
	//To delete comment and reply
	app.route('/deleteKnowledgebaseComment').post(knowledgebases.deleteKnowledgebaseComment);
	app.route('/deleteKnowledgebaseCommentReply').post(knowledgebases.deleteKnowledgebaseCommentReply);

};
