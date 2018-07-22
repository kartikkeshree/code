'use strict';

module.exports = function(app) {
    var rest = require('../../app/controllers/rest.server.controller');
    app.route('/rest/:functionName').post(rest.parseRequest);
    app.route('/rest/:functionName1/:functionName2').post(rest.parseRequest1);

	app.route('/rest/:functionName').get(rest.restrictGet);
    app.route('/rest/:functionName1/:functionName2').get(rest.restrictGet);
   // app.route('/rest/mob/api/generateSignature/').post(rest.generateSignature);

   // app.route('/rest/df/mob/:functionName1/:functionName2').post(rest.parseRequest2);
   // app.route('/rest/df/mob/:functionName1/').post(rest.parseRequest3);
}
