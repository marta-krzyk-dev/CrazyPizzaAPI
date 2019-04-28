/*
 * Worker-related tasks
 *
 */

//Dependencies
var _data = require('./data');
var helpers = require('./helpers');
var util = require('util');
var debug = util.debuglog('workers');
var config = require('./config');

var workers = {};

// Init script
workers.init = function () {

    //Send to console in yellow
    console.log('\x1b[33m%s\x1b[0m', 'Background workers are running');

    //Delete the unpaid-for orders over 12h-old and expired tokens
    workers.deleteExpiredFiles();

    //Call the loop so deleteExpiredFiles() will be executed later on too
    workers.loop();
};

workers.deleteExpiredFiles = function () {
    if (config.showMessagesInCommandLine)
        console.log("\n\nStarting to delete expired tokens and orders...\n");

    const now = Date.now();
    /*const maxOrderDate = now - config.maxOrderLifespanInMiliseconds;

    workers.gatherAll(config.ordersFolder, "orderId", function (date) {
        return (date && date < maxOrderDate) ? true : false;
    });*/
    workers.gatherAll(config.tokensFolder, "expires", function (date) {
        return (date && date <= now) ? true : false;
    });
};

//Timer to execute the deletion once time set in config
workers.loop = function () {
    setInterval(function () {
        workers.deleteExpiredFiles();
    }, config.workersLoopTime);
};

//Lookup files and send them to validator
workers.gatherAll = function (folder, fieldToValidate, validationFunction) {

    //Get all the files that exist in the folder
    _data.list(folder, function (err, fileNames) {

        if (!err && fileNames && fileNames.length > 0) {

            fileNames.forEach(function (fileName) {
                //Read in the data
                _data.read(folder, fileName, function (err, data) {

                    //Remove all the files where the field exceed maxValue
                    if (!err && data) {
                        workers.validateData(folder, fileName, data, fieldToValidate, validationFunction);
                    } else if (config.showMessagesInCommandLine) {
                        debug("Error reading from file: " + fileName);
                    }
                });
            });

        } else {
            debug("Error: Could not find any orders to process.");
        }
    });
};

workers.validateData = function (folder, fileName, data, fieldToValidate, validationFunction) {

    data = helpers.validateObject(data);
    var fieldValue = data[fieldToValidate];

    if (config.showMessagesInCommandLine) {
        console.log("Field value as date: " + (new Date(fieldValue)).toString());
        console.log("File " + fileName + " should be deleted: " + validationFunction(fieldValue));
    }

    //If the orderDate is invalid or it exceeds its lifespan, delete the file
    //If the token 'expires' is greater than Date.now(), delete the file
    if (fieldValue == null || validationFunction(fieldValue)) {
        _data.delete(folder, fileName, function (err) {

            if (!err) {
                if (config.showMessagesInCommandLine)
                    debug("Successfully deleted file by workers: " + fileName);
            } else {
                if (config.showMessagesInCommandLine)
                    debug("Error deleting one of files by workers.");
            }
        });
    }
};

module.exports = workers;