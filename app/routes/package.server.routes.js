'use strict';

module.exports = function(app) {
	var packages = require('../../app/controllers/package.server.controller');
    app.route('/getAllPackageByDentist').post(packages.getAllPackageByDentist);
    app.route('/smsPackageRequest').post(packages.smsPackageRequest);
     app.route('/changePackageStatus').post(packages.changePackageStatus);


};
