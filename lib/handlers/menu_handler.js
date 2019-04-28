/*
	Menu request handlers
*/

//Dependencies
var helpers = require('../helpers');
var _tokens = require('./tokens_handler');

//Private container
_menu = {};

// Menu - GET
// Required data: none
// Optional data: none
// Required header: token
_menu.get = function(data, callback){

	// Verify that the given token is valid for the email
	_tokens.verifyToken(data.headers.token, function(tokenIsValid){
	
		if (tokenIsValid){
			callback(200, helpers.getMenu());
		} else {
			callback(403, {'Error' : 'Missing required token in header or token is invalid/expired.'});
		}
	});
};

//Export the module
module.exports = _menu;