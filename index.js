/*
Primary file for Pizza Delivery API
*/

//Dependencies
var server = require('./lib/server');
var workers = require('./lib/workers');
var helpers = require('./lib/helpers');

//Declare the app
var app = {};

//Init
app.init = function(){

	//Print out the welcome message and logo
	helpers.printWelcomeMessage();

	//Start the server
	server.init();
	//Start the workers
	workers.init();
};

//Execute 
app.init();

//Export the app
module.exports = app;