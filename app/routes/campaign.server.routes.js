'use strict';

module.exports = function(app) {
	var campaign = require('../../app/controllers/campaign.server.controller');
    app.route('/getAllPatientsByDentist').post(campaign.getPatientByDentist);
    app.route('/addCampaign').post(campaign.addCampaign);
    app.route('/listCampaignByDentist').post(campaign.listCampaignByDentist);

};
