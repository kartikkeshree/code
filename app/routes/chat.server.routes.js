'use strict';

module.exports = function (app) {
    // Root routing
    var chat = require('../../app/controllers/chat.server.controller');
    app.route('/pushMessage').post(chat.saveChatMessage);
    app.route('/groupChat').post(chat.getGroupMessage);
    app.route('/getMessage').post(chat.getPersonalMessage);
};