/*
Request handlers
*/

//Dependencies
var helpers = require('./helpers');
var config = require('./config');
var _users = require('./handlers/users_handler');
var _tokens = require('./handlers/tokens_handler');
var _purchase = require('./handlers/purchase_handler');
var _menu = require('./handlers/menu_handler');
var _shoppingcarts = require('./handlers/shopping_cart_handler');

//Define handlers
var handlers = {};

handlers.users = function(data, callback){
	var acceptableMethods = ['post','get','put','delete'];
	if (acceptableMethods.indexOf(data.method) > -1) {
		_users[data.method](data, callback);
	} else {
		callback(405);
	}
};

handlers.tokens = function(data, callback){
	var acceptableMethods = ['post','get','put','delete'];
	if (acceptableMethods.indexOf(data.method) > -1) {
		_tokens[data.method](data, callback);
	} else {
		callback(405);
	}
};

handlers.purchase = function(data,callback){
  var acceptableMethods = ['post'];
  if(acceptableMethods.indexOf(data.method) > -1){
    _purchase[data.method](data,callback);
  } else {
    callback(405);
  }
};

handlers.menu = function(data,callback){
  var acceptableMethods = ['get'];
  if(acceptableMethods.indexOf(data.method) > -1){
    _menu[data.method](data,callback);
  } else {
    callback(405);
  }
};

handlers.shoppingcarts = function(data,callback){
  var acceptableMethods = ['post','get','delete'];
  if(acceptableMethods.indexOf(data.method) > -1){
    _shoppingcarts[data.method](data,callback);
  } else {
    callback(405);
  }
};

handlers.notFound = function(data, callback){
	callback(404, {'Error' : 'Invalid route.'});
};

//Export the module
module.exports = handlers;