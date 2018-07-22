'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var forums = require('../../app/controllers/forums.server.controller');

	// Forums Routes

    app.route('/user/addForumQuestion').post(forums.addForumQuestion);
    app.route('/user/getAllForumQuestion').post(forums.getForumQuestion);
    app.route('/user/getForumQuestionByForumId').post(forums.getForumQuestionByForumId);
    app.route('/dentist/addComment').post(forums.addComment);
    app.route('/getComment').post(forums.getComment);
    app.route('/submitReplyComment').post(forums.submitReplyComment);
    app.route('/getReplyCommentAnswer').post(forums.getReplyCommentAnswer);
    //To change status of forum
    app.route('/forumStatus').post(forums.changeStatus);
    //To update forum
    app.route('/updateForum').post(forums.updateForum);
	//To delete forum comment and reply
	app.route('/deleteForumComment').post(forums.deleteForumComment);
	app.route('/deleteForumCommentReply').post(forums.deleteForumCommentReply);
};
