'use strict';
exports.appendError = function(text) {

	var fs = require('fs');
	fs.exists('app/errorlog.txt', function(exists) {
		if (!exists) {
			fs.openSync('app/errorlog.txt', 'w');
		}
	});
	fs.open('app/errorlog.txt', 'a', 777, function(e, id) {
	console.log(text.toString());
		fs.write(id, text.toString() + '\r\n', null, 'utf8', function() {
			fs.close(id, function() {
				console.log('file closed');
			});
		});
	});
};
