'use strict';

// Configuring the Articles module
angular.module('clinics').run(['Menus',
	function(Menus) {
		// Set top bar menu items
		Menus.addMenuItem('topbar', 'Clinics', 'clinics', 'dropdown', '/clinics(/create)?');
		Menus.addSubMenuItem('topbar', 'clinics', 'List Clinics', 'clinics');
		Menus.addSubMenuItem('topbar', 'clinics', 'New Clinic', 'clinics/create');
	}
]);