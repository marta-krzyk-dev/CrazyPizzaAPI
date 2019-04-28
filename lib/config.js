/* 
	Create and export configuration variables
*/
var path = require('path');

// Containter for configuration variables
var config = {};

//Variables for workers
config.workersLoopTime = 1000 * 60 * 15; // 15 minutes

//Variables for tokens
config.tokenExpirationTimeInMiliseconds = 1000 * 60 * 60; // 1 hour
config.tokenLength = 20;

//Folder names
config.usersFolder = 'users';
config.ordersFolder = 'orders';
config.tokensFolder = 'tokens';

// Paths to resources
config.menuFile = path.join(__dirname, 'menu.json');
config.logoTextFile = path.join(__dirname, 'logo.txt');

// Bussiness constants
config.maxCharsStreetAddress = 300;
config.maxEmailSubjectLength = 78;
config.maxAmountPerOrderItem = 10;
config.maxOrderItems = 10;
config.senderName = 'Crazy Pizza';

// Messages for user
config.messages = {
	'invalidToken': 'Missing required token in header or token is invalid/expired.',
	'emptyCart': 'Your shopping cart is empty. Please make an order via POST shoppingcart route :)',
	'errorCart': 'Error loading your shopping cart.',
	'invalidOrder': `Array of orders is invalid or empty.` +
		` Please send a JSON array of {\'itemId\' : number, \'amount\': number (between 1 - ${config.maxAmountPerOrderItem}) }.` +
		` Max number of items is ${config.maxOrderItems}.`,
	'errorPayment': 'Error while processing your payment. Please try again.'
};

// Environments
var environments = {};

environments.staging = {
	'httpPort': 3000,
	'httpsPort': 3001,
	'envName': 'staging',
	'isTesting': true,
	'testEmail': 'XXX@gmail.com',
	'hashingSecret': 'pizzaIsDelicious',
	'stripe': {
		'publicKey': 'XXX',
		'secretKey': 'XXX',
		'currency': 'EUR',
		'currencySign': '€',
		'source': 'tok_visa'
	},
	'mailGun': {
		'hostname': 'api.eu.mailgun.net', //european endpoint
		'domain': 'sandboxXXX.mailgun.org',
		'apiKey': 'key-XXX',
		'senderMail': "Crazy Pizza <postmaster@sandboxXXX.mailgun.org>"
	}
};

environments.production = {
	'httpPort': 5000,
	'httpsPort': 5001,
	'isTesting': false,
	'envName': 'production',
	'hashingSecret': 'pizzaIsDelicious',
	'stripe': {
		'publicKey': 'XXX',
		'secretKey': 'XXX',
		'currency': 'usd',
		'currencySign': '$',
		'source': 'tok_visa'
	},
	//To be changed in real-life solution, but never to be published
	'mailGun': {
		'hostname': 'api.mailgun.net', //us endpoint
		'domain': 'sandboxXXX.mailgun.org',
		'apiKey': 'key-XXX', //unescape the chars?
		'senderMail': 'Crazy Pizza <postmaster@sandboxXXX.mailgun.org>'
	}
};

//Determine which environment was passed as a command line arg
var currentEnvironment = typeof (process.argv[2]) == 'string' ? process.argv[2].toLowerCase() : '';

//Check that the current environment is one of the environments above, default is staging
config.env = typeof (environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

// Debugging options
config.showMessagesInCommandLine = config.env.isTesting;

//Export the module
module.exports = config;
