'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var blogs = require('../../app/controllers/blogs.server.controller');

	// Blogs Routes
	app.route('/blogs')
		.get(blogs.list)
		.post(blogs.create); //users.requiresLogin,

	app.route('/blogs/:blogId')
		.get(blogs.read)
		.put(users.requiresLogin, blogs.hasAuthorization, blogs.update)
		.delete(users.requiresLogin, blogs.hasAuthorization, blogs.delete);

	// Finish by binding the Blog middleware
	app.param('blogId', blogs.blogByID);

    //To get Blogs list
    app.route('/getAllBlogTopics').post(blogs.blogList);
	//To get Specific Blog Details from blog Id
    app.route('/getBlogById').post(blogs.getBlogById);
	//To add comment for any blog
    app.route('/blog/addComment').post(blogs.addComment);
	//To get all comments of blog
    app.route('/blog/getComments').post(blogs.getCommentsByBlogId);
    //To change status of blog
    app.route('/blogStatus').post(blogs.changeStatus);
    //To save blog image
    app.route('/getTempBlogUrl').post(blogs.saveTempImage);
    //To update blog
    app.route('/updateBlog').post(blogs.updateBlog);
    //Recent blgs list (only titles)
    app.route('/recentBlog').post(blogs.recentBlogs);
	//To delete blog comment
    app.route('/deleteBlogComment').post(blogs.deleteBlogComment);
	//To delete reply on comment
    app.route('/deleteBlogCommentReply').post(blogs.deleteBlogCommentReply);
	};
