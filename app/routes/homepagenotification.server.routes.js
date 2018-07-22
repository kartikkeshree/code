'use strict';

module.exports = function(app) {
	var notification = require('../../app/controllers/homePageNotification.server.controller');

	 app.route('/addNotification').post(notification.addNotification);
	 app.route('/deleteNotificationByAppId').post(notification.deleteNotificationByAppId);
	 app.route('/getAllNotificationList').post(notification.getAllNotificationList);
     app.route('/updateNotificationList').post(notification.updateNotificationList);
     app.route('/getEditNotificationListById').post(notification.getEditNotificationListById);
     app.route('/getViewNotificationListById').post(notification.getViewNotificationListById);
     app.route('/getNotificationDescription').post(notification.getNotificationDescription);
     app.route('/getUpdateNotificationListById').post(notification.getUpdateNotificationListById);

	 };


