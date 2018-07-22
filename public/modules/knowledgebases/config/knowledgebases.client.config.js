'use strict';

// Configuring the Articles module
angular.module('knowledgebases').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Knowledgebases', 'knowledgebases', 'dropdown', '/knowledgebases(/create)?');
		Menus.addSubMenuItem('topbar', 'knowledgebases', 'List Knowledgebases', 'knowledgebases');
		Menus.addSubMenuItem('topbar', 'knowledgebases', 'New Knowledgebase', 'knowledgebases/create');
	}
]);