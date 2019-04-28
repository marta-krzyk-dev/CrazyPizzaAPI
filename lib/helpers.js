/*
Helpers for various tasks.
*/

//Dependencies
var crypto = require('crypto');
var config = require('./config');
var https = require('https');
var fs = require('fs');
var querystring = require('querystring');

//Container for all the helpers
var helpers = {};

//Get menu as a JSON array
helpers.getMenu = function(){

	var menuText = fs.readFileSync(config.menuFile, 'utf8');
	return JSON.parse(menuText);
}

helpers.getOrderFileName = function(orderId, userName)
{
	return `order_${orderId}_for_${userName}`;
}

// Create a SHA256 hash
helpers.hash = function(str) {

	if (typeof(str) == 'string' && str.length > 0) {
		var hash = crypto.createHmac('sha256', config.env.hashingSecret).update(str).digest('hex');
		return hash;
	} else {
		return false;
	}
};

// Parse a JSON string into an object without throwing
helpers.parseJsonToObject = function(str){

	try {
		var object = JSON.parse(str);
		return object;
	} 
	catch(e) {
		return {};
	}
};

helpers.validateArrayAndFields = function(input, requiriedFields = []) {
	
	//check if input is an array
	const isValid = helpers.validateArray(input);
	if (!isValid)
		return false;

	//check if all elements have the required fields
	input.forEach(function(element) {

		var elementIsValid = helpers.hasAllProperties(element, requiriedFields);
		
		if (!elementIsValid)
			return false;
	});

	return input;
};


helpers.validateArray = function(input) {
	
	return typeof(input) == 'object' && input instanceof Array && input.length > 0 ? input : false;
};

helpers.validateArrayOfNumbers = function(input){
	
	var isValid = helpers.validateArray(input);
	if (isValid)
	{
		input.forEach(function(element) {
			if (!validateInteger(element))
				return false;
		});
		return true;
	}
	else
		return false;
};

helpers.validateArrayOrEmpty = function(input){

	return typeof(input) == 'object' && input instanceof Array && input.length > 0 ? input : [];
};

//Validate string
helpers.validateString = function(input, minLength = 1, maxLength = Number.MAX_SAFE_INTEGER){
	
	minLength = typeof(minLength) == 'number'&& minLength > 0 ? minLength : 1;
	maxLength = typeof(maxLength) == 'number'&& maxLength > 0 ? maxLength : Number.MAX_SAFE_INTEGER;

	if (typeof(input) != 'string')
		return false;
	else
	{
		input = input.trim();
		return input.length >= minLength && input.length <= maxLength ? input : false;
	}
};

helpers.validateString = function(input, possibleValues, defaultOutput = false){

	var result = typeof(input) == 'string' ? input.trim() : false;

	if (possibleValues instanceof Array && possibleValues != null)
		result = possibleValues.indexOf(result) > -1 ? result : false;

	if (result == false)
		return defaultOutput;
	else
		return result;
};

helpers.validateStringLength = function(input, exactLength){
	if (typeof(exactLength) != 'number')
		return false;
		
	return typeof(input) == 'string' && input.trim().length == exactLength ? input.trim() : false;
};

helpers.validateEmail = function(input){

	input = typeof(input) == 'string' ? input.trim() : false;
 	const regex = /(?:"?([^"]*)"?\s)?(?:<?(.+@[^>]+)>?)/;

	if (input && regex.test(String(input).toLowerCase())){
    	return input;
	} else {
    	return false;
    }
};

helpers.getBoolean = function(input){

	return typeof(input) == 'boolean' ? input : false;
};

helpers.validateInteger = function(input, minValue = false, maxValue = false){

	var result = typeof(input) == 'number' && input % 1 === 0 ? input : false;

	if (typeof(minValue) == 'number')
		result = input >= minValue ? input : false;

	if (typeof(maxValue) == 'number')
		result = input <= maxValue ? input : false;

	return result;
};

helpers.validateObject = function(input){

	return typeof(input) == 'object' && input != null ? input : false;
};

helpers.createRandomString = function(strLength){
		strLength = typeof(strLength) == 'number'&& strLength > 0 ? strLength : false;

		if (strLength)
		{
			var possibleCharacters = 'abcdefghijklmnoprstuvwxyz0123456789';
			var str = '';
			for(i = 1; i <= strLength; ++i)
			{
				var randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
				str += randomCharacter;
			}
			return str;
		}
		else 
		{
			return false;
		}
};

helpers.hasAllProperties = function(element, fields)
{
	if (fields == 'undefined' || fields == null)
		return false;
	
	fields.forEach(function(field) {
		
		if (!element.hasOwnProperty(field))
			return false; 
	});
	return true;
};

helpers.printWelcomeMessage = function(){

	console.log('\n---Welcome to CRAZY PIZZA API---\n');
	console.log(fs.readFileSync(config.logoTextFile, 'utf8') + '\n');
};


helpers.validatePizzas = function(pizzaArray){

	//check if array is valid
	var isValid = helpers.validateArrayAndFields(pizzaArray, ["id"]);
	if (!isValid)
		return false;

	if (pizzaArray.length > config.maxOrderItems)
		return false;

	var menu = helpers.getMenu();

	//check if field values are valid
	pizzaArray.forEach(function(element) {

	    if (!menu.some(pizza => pizza.Id == element.id)) //the id doesn't exist
	    {
	    	pizzaArray = false;
	    	return;
	    }
	    if (('amount' in element) && (element.amount < 1 || element.amount > config.maxAmountPerOrderItem))
	    {
	    	pizzaArray = false;
	    	return;
	    }
	    if (!helpers.validateInteger(element.amount))
	    	element.amount = 1;
	});

	return pizzaArray;
};

//Export the module
module.exports = helpers;