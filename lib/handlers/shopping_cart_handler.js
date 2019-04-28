/*
	Shapping cart request handlers
*/

//Dependencies
var _data = require('../data');
var helpers = require('../helpers');
var config = require('../config');
var _tokens = require('./tokens_handler');

//Private container
_shopping_cart = {};

// Shopping cart - GET
// Required header: token
// Required data: none
// Optional data: none
// Lists ordered but yet not purchased items
_shopping_cart.get = function(data, callback){

	// Verify that the given token is valid
	_tokens.verifyToken(data.headers.token, function(tokenIsValid, tokenData){
	
		if (!tokenIsValid)
		{
			callback(403, {'Error' : config.messages.invalidToken});
		}
		else
		{
			var userName = tokenData.email;
 
 			// List all items in the directory containing the userName
 			_data.listContaining(config.ordersFolder, userName, function(err, fileList){

 				if (err) {
					callback(500, {'Error' :  config.messages.errorCart });
 				}
				else {
					//if there were no orders found, notify the cart is empty
					if (fileList.length == 0)
						callback(200, {'Message' : config.messages.emptyCart });

					 //create an array to hold all orders
					 var orderArray = [];
					 //count the files processed
					 var count = 0;

					 fileList.forEach(function(fileName){
				
						_data.read(config.ordersFolder, fileName, function(err, orderData){
								
								++count;
								if (err) {
									 callback(500, {'Error' :  config.messages.errorCart });
									 return;
								}
								else if (orderData != null){
									orderArray.push(orderData);
								}
								//when all orders are processed, return the array
								if (count === fileList.length) {
									 callback(200, {'Shopping cart': orderArray});
									 return;
								}
						});
					});			
				}
			});
		}
	})
};

// Shopping cart - POST
// Required data: token, array of pizza objects (id field is required, amount is optional)
// Optional data: none
_shopping_cart.post = function(data, callback){

	// Verify that the given token is valid
	_tokens.verifyToken(data.headers.token, function(tokenIsValid, tokenData){
	
		if (!tokenIsValid)
		{
			callback(403, {'Error' : config.messages.invalidToken });
		}
		else
		{
			// validate order
			var orders = helpers.validatePizzas(data.payload);

			if (!orders) {
				callback(403, {'Error' : config.messages.invalidOrder });
				return;
			}

			const orderId = Date.now();
			const orderFileName = helpers.getOrderFileName(orderId, tokenData.email);
			const orderData =  {'orderId': orderId, 'items':orders };

			//Create a JSON file for the order
			_data.create(config.ordersFolder, orderFileName, orderData, function(err){
				if (err){
					if (config.showMessagesInCommandLine)
						console.log('Error: ' + err);
					callback(500, {'Error' : 'Error adding order to the shopping cart.'});				
				}
				else{
					if (config.showMessagesInCommandLine)
						console.log(`Order ${orderId} was saved to file: ` + JSON.stringify(orderData));
					callback(200, {'Message' : 'The order was received', 'orderId' : orderId });
				}
			});
		}
	});
};

// Shopping cart - DELETE
// Required data: token, orderId
// Optional data: none
_shopping_cart.delete = function(data, callback){

	// Verify that the given token is valid
	_tokens.verifyToken(data.headers.token, function(tokenIsValid, tokenData){
	
		if (tokenIsValid){
			
			var orderId = data.queryStringObject.orderid;

			console.log('Data received: ' + JSON.stringify(data.queryStringObject));
			console.log('Order id validated: ' + orderId);

			if (!orderId) {
				callback(403, {'Error' : 'Order id is missing or not a number.' });
				return;
			}
			
			const orderFileName = helpers.getOrderFileName(orderId, tokenData.email);

			//Delete the order file
			_data.delete(config.ordersFolder, orderFileName, function(err)
			{
				if(err) {	
					callback(500, {'Error' : 'Error deleting the order or the order does not exist.'});
					return;
				} else {
					callback(200, {'Message' : 'The order was deleted.'});
					return;
				}
			});
		} else {
			callback(403, {'Error' : config.messages.invalidToken });
			return;
		}
	});
};

//Export the module
module.exports = _shopping_cart;