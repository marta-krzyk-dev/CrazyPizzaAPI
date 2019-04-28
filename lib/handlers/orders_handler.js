/*
Request handlers
*/

//Dependencies
var _data = require('../data');
var helpers = require('../helpers');
var config = require('../config');
var _tokens = require('./tokens_handler');
var https = require('https');
var querystring = require('querystring');

//Private container
_orders = {};

// ORDERS - POST - create/post an order and pay
// Required data: orderId of an existing order or a new order (pizza array)
// Optional data: none
_orders.post = function (data, callback) {

    //check if the user is logged in
    _tokens.verifyToken(data.headers.token, function (tokenIsValid, tokenData) {

        if (!tokenIsValid) {
            callback(403, { 'Error': config.messages.invalidToken });
        }
        else {
            // Check if orderId header is set
            var orderId = data.headers.orderid;
            var order = data.payload;

            if (!orderId && !order) {
                callback(500, { 'Error': 'Either orderId header or order in payload has to be sent.' });
                return;
            }

            var orderFileName = helpers.getOrderFileName(orderId, tokenData.email);

            // Depending on the data received, choose among 2 promises
            let getOrderDataPromise = (orderId) ? getOrderFromId : getOrderFromPayload;
            // Choose what param to put into the promise
            var param = (orderId) ? { 'orderId': orderId, 'orderFileName': orderFileName } : order;

            // Run the promise
            getOrderDataPromise(param).then(function (orderData) {

                //Now the order data is read, charge for it
                processOrder(tokenData.email, orderData, function (err) {
                    if (err) {
                        callback(400, { 'Error' : config.messages.errorPayment });
                    } else {

                        //Delete the order file
                        if (orderId) {
                            _data.delete(config.ordersFolder, orderFileName, function (err) {

                                if (err && config.showMessagesInCommandLine) {
                                    console.log(err);
                                } else if (config.showMessagesInCommandLine) {
                                    console.log(`Order was deleted.`);
                                }
                            });
                        }
                        callback(200, { 'Message': 'Your payment was received.' });
                    }
                });
            })
            .catch(function (error) {
                callback(500, { 'Error': error });
             });

        }
    });
};

/* Promises */

  const getOrderFromId = function (data) {

                return new Promise(function (resolve, reject) {

                    let orderId = data.orderId;
                    let orderFileName = data.orderFileName;

                    _data.read(config.ordersFolder, orderFileName, function (err, fullOrderData) {

                        if (err || fullOrderData == null) {
                            reject('Error reading the order or order id is invalid.');
                        } else {

                            orderData = helpers.validatePizzas(fullOrderData.items);
                            if (orderData) {
                                resolve(orderData);
                            } else {
                                reject('Error reading the order. Please make an order using the payload.');
                            }
                        }
                    });
                });
            };

  const getOrderFromPayload = function (order) {

                return new Promise(function (resolve, reject) {

                    let orderData = helpers.validatePizzas(order);

                    if (!orderData) {
                        reject(config.messages.invalidOrder);
                    } else {
                        resolve(orderData);
                    }
                });
            };
/*
    Helper functions
*/
const processOrder = function (receiverEmail, order, callback) {

    // In the test mode, use developer's email to send the receipt
    const receiver = config.env.isTesting ? config.env.testEmail : receiverEmail;
    let bill = calculateBill(order);
    var orderPayload = createOrderPayload(bill, receiver);
    var orderDetails = createStripeRequest(orderPayload);

    purchase(orderDetails, orderPayload, function (err) {
        if (err) {
            callback(true);
        } else {
            callback(false);

            // If the payment was accepted, send the receipt via email
            const sender = config.env.mailGun.senderMail;

            sendReceipt(sender, receiver, "Crazy Pizza receipt", bill.desc, function (err) {
                if (err) {
                    if (config.showMessagesInCommandLine)
                        console.log('Error while sending receipt: ' + err);
                } else {
                    if (config.showMessagesInCommandLine)
                        console.log('Sent receipt.');
                }
            });
        }
    });
};

const purchase = function (orderDetails, orderPayload, callback) {

    if (config.showMessagesInCommandLine)
        console.log('\nTrying to charge a card via Stripe...\n');

    if (orderDetails && orderPayload) {

        var req = https.request(orderDetails, function (res) {

            if (200 == res.statusCode || 201 == res.statusCode) {
                callback(false);
            } else {
                callback(config.messages.errorPayment);
            }
        });
        req.on('error', function (error) {
            callback(config.messages.errorPayment);
        });

        req.write(orderPayload);
        req.end();

    } else {
        callback('Missing required field or field invalid.');
    }
};

const sendReceipt = function (sender, receiver, subject, message, callback) {

    if (config.showMessagesInCommandLine)
        console.log(`\nTrying to send a receipt from ${sender} to ${receiver}.\n`);

    // Validate fields
    sender = helpers.validateEmail(sender);
    receiver = helpers.validateEmail(receiver);
    subject = helpers.validateString(subject, 1, config.maxEmailSubjectLength);
    message = helpers.validateString(message);

    if (sender && receiver && subject && message) {

        // Create the request payload
        const payload = {
            from: sender,
            to: receiver,
            subject: subject,
            text: message
        };

        // Stringify the payload
        var stringPayload = querystring.stringify(payload);

        if (config.showMessagesInCommandLine)
            console.log("\nMail payload:\n" + stringPayload + "\n");

        // Configure the request details
        const requestDetails = {
            'protocol': 'https:',
            'hostname': config.env.mailGun.hostname,
            'method': 'post',
            'path': `/v2/${config.env.mailGun.domain}/messages`,
            'headers': {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(stringPayload),
                'Authorization': 'Basic ' + Buffer.from('api:' + config.env.mailGun.apiKey, 'utf8').toString('base64')
            }
        };

        // Instantiate the request object
        var req = https.request(requestDetails, function (res) {

            res.on('data', function (data) {
                if (config.showMessagesInCommandLine)
                    console.log("\nData from MailGun:\n" + data + "\n");
            });

            res.on('end', function () {
                var status = res.statusCode;
                if (status === 200 || status === 201) {
                    callback(false);
                } else {
                    callback('Status code returned was ' + status, JSON.stringify(res.headers));
                }
            });
        });

        // In case of an error, bubble it up
        req.on('error', function (error) {
            callback(error);
        });

        // Add the payload
        req.write(stringPayload);
        req.end();

    } else {
        callback(`Error: Missing required field. Input data:\nSender: ${sender}\nReceiver: ${receiver}\nSubject: ${subject}\nMessage: ${message}\n`);
    }
};

/*
    Helper functions
*/
// Returns tuple of { charge : number, desc : string }
const calculateBill = function (order) {
    var menu = helpers.getMenu(); //array of pizzas

    if (config.showMessagesInCommandLine)
        console.log(`\nThe following order was made:\n${JSON.stringify(order)}\n`);

    var sum = 0.0;
    var desc = "Your order: ";

    for (var i = 0; i < order.length; ++i) {
        var pizza = menu.find(pizza => pizza.Id === order[i].id);
        if (pizza == undefined) //ignore pizzas with unknown ids
            continue;

        var totalPrice = order[i].amount * pizza.Price;
        desc += `\n${order[i].amount} * ${pizza.Name} (${pizza.Price.toFixed(2)} ${config.env.stripe.currencySign}) = ${totalPrice.toFixed(2)} ${config.env.stripe.currencySign}`;
        sum += totalPrice;
    }

    desc += `\n==========\nTOTAL: ${sum.toFixed(2)} ${config.env.stripe.currencySign}\n
Your red-hot freshly-baked pizza is on its way!`;

    if (config.showMessagesInCommandLine)
        console.log(`\nThe bill:\n${desc}\n`);

    return {
        charge: (sum * 100).toFixed(0), //return the price in cents, set precision to 0
        desc: desc
    };
}


const createOrderPayload = function (bill, email) {

    var payload = {
        'currency': config.env.stripe.currency,
        'source': config.env.stripe.source,
        'amount': bill.charge,
        'description': bill.desc,
        'receipt_email': email,
    };

    // Stringify the payload
    return querystring.stringify(payload);
};

const createStripeRequest = function (content) {

    if (config.showMessagesInCommandLine)
        console.log(`\nSending request to Stripe:\n${content}\n`);

    var requestDetails = {
        'protocol': 'https:',
        'hostname': 'api.stripe.com',
        'method': 'POST',
        'path': '/v1/charges',
        'headers':
        {
            'Authorization': `Bearer ${config.env.stripe.secretKey}`,
            'Content-Length': Buffer.byteLength(content),
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };

    return requestDetails;
}

//Export the module
module.exports = _orders;