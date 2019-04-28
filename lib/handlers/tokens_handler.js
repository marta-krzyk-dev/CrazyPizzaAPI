/*
	Token handlers
*/

//Dependencies
var _data = require('../data');
var helpers = require('../helpers');
var config = require('../config');

//Private container for token methods
var _tokens = {};

// Tokens - POST
// Required data: email, password
// Optional data: none
_tokens.post = function(data, callback){

	var email = helpers.validateString(data.payload.email);
	var password = helpers.validateString(data.payload.password);

	if (email && password)
	{
		_data.read(config.usersFolder, email, function(err, userData){
			if(!err && userData){
				var hashedPassword = helpers.hash(password);
				if (hashedPassword == userData.hashedPassword)
				{
					//Create token with a random name, set an expiration date
					var tokenId = helpers.createRandomString(config.tokenLength);
					var expires = Date.now() + config.tokenExpirationTimeInMiliseconds;
					var tokenObject = {
						'email' : email,
						'id' : tokenId,
						'expires' : expires
					};

					//Store the token
					_data.create('tokens', tokenId, tokenObject, function(err) {
						if (!err) {
							callback(200, tokenObject);
						} else {
							callback(400, {'Error' : 'Could not create the new token.'});
						}
					});
				}
				else
				{
					callback(400, {'Error' : 'Incorrect password.'});
				}
			} else {
				callback(400, {'Error' : 'Could not find the specified user.'});
			}
		});
	}
	else
	{
		callback(400, {'Error' : 'Missing required fields.'});
	}
};

// Tokens - GET
// Required data: token id
// Optional data: none
_tokens.get = function(data, callback){
	
	var id = helpers.validateString(data.queryStringObject.id);

	if (id)
	{
		//Lookup the token file
		_data.read('tokens', id, function(err, tokenData) 
		{
			if (!err && tokenData)
			{
				callback(200, tokenData);
			} 
			else 
			{
				callback(404, err);
			}
		});	
	} 
	else 
	{
		callback(400, {'Error' : 'Missing required field token id.'});
	}
};

// Tokens - PUT
// Required data: token id, extend
// Optional data: none
_tokens.put = function(data, callback){

	var id = helpers.validateStringLength(data.payload.id, config.tokenLength);
	var extend = helpers.getBoolean(data.payload.extend);

	if (id && extend)
	{
		_data.read('tokens', id, function(err, tokenData) {
			if (!err && tokenData)
			{
				//Check the token is not expired
				if (tokenData.expires > Date.now())
				{
					tokenData.expires = Date.now() + config.tokenExpirationTimeInMiliseconds; 
					_data.update('tokens', id, tokenData, function(err) {
						if (!err)
						{
							callback(200, {'Message' : 'The token has been extended till ' + new Date(tokenData.expires).toString() + '.'});
						} else {
							callback(500, {'Error' : 'Could not update the token\'s expiration.'});
						}
					});

				} else{
					callback(400, {'Error' : 'The token has expired and cannot be extended.'});
				}
			}
			else{
				callback(400, {'Error' : 'Specified token does not exist.'});
			}
		});
	}
	else
	{	
		if (!id)
			callback(400, {'Error' : 'Missing required token field or token is invalid.'});
		else
			callback(400, {'Error' : 'Missing required extend field or extend is false.'});
	}
};

// Tokens - DELETE
// Required data: token id
// Optional data: none
_tokens.delete = function(data, callback){
 
 	//Check the token is valid
 	var id = helpers.validateStringLength(data.queryStringObject.id, config.tokenLength);

	if (id)
	{
			//Lookup the token
			_data.read('tokens', id, function(err, tokenData) {
				if (!err && tokenData)
				{
					_data.delete('tokens', id, function(err) {
						if (!err) {
							callback(200, {'Message' : 'You have successfully logged out.'});
						}
						else {
							callback(500, {'Error' : 'Could not delete the token.'});
						}
					});
				} 
				else {
					callback(404, {'Error' : 'The specified token does not exist.'});
				}
			});
	}
	else {
		callback(400, {'Error' : 'Missing required id field or id invalid.'});
	}
};

/*
	Helper functions 
*/

// Verify if a given token is currently valid
_tokens.verifyToken = function(id, callback){

	if (!helpers.validateString(id))
		callback(false, null);

	_data.read('tokens',id, function(err, tokenData){
		if (!err && tokenData){
			if (tokenData.expires > Date.now()) {
				callback(true, tokenData);
			}	
			else {
				callback(false, null);
			}	
		} else {
			callback(false, null);
		}
	});
};

// Verify if a given token is currently valid for a given user
_tokens.verifyTokenAndEmail = function(id, email, callback){

	_data.read('tokens',id, function(err, tokenData){
		if (!err && tokenData){
			if (tokenData.email == email && tokenData.expires > Date.now()) {
				callback(true, tokenData);
			}	
			else {
				callback(false, null);
			}	
		} else {
			callback(false, null);
		}
	});
};



//Export the module
module.exports = _tokens;