/*
Request handlers
*/

//Dependencies
var helpers = require('./helpers');
var config = require('./config');
var _users = require('./handlers/users_handler');
var _tokens = require('./handlers/tokens_handler');
var _orders = require('./handlers/orders_handler');
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

handlers.orders = function(data,callback){
  var acceptableMethods = ['post'];
  if(acceptableMethods.indexOf(data.method) > -1){
    _orders[data.method](data,callback);
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

//Error dictionary
var callbacks = {};
callbacks.missingRequiredFields = function() { callback(400, {'Error' : 'Missing required fields.'}); };

//Export the module
module.exports = handlers;

//Helper function
_checkValidity = function(field, callback){
	var result = typeof(field) == 'string' && field.trim().length > 0 ? field.trim() : false;
	callback(null, result);
};