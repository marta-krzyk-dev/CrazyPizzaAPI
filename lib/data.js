/*
 * Library for storing, deleting and editing data
 *
 */

// Dependencies
var fs = require('fs');
var path = require('path');
var helpers = require('./helpers');

// Container for module (to be exported)
var lib = {};

// Base directory of data folder
lib.baseDir = path.join(__dirname,'/../.data/');

// Create a file with data
lib.create = function(dir,file,data,callback){

  // Open the file for writing
  fs.open(lib.baseDir+dir+'/'+file+'.json', 'w', function(err, fileDescriptor){
    if(!err && fileDescriptor){
      // Convert data to string
      var stringData = JSON.stringify(data);

      // Write to file and close it
      fs.writeFile(fileDescriptor, stringData,function(err){
        if(!err){
          fs.close(fileDescriptor,function(err){
            if(!err){
              callback(false);
            } else {
              callback('Error closing new file');
            }
          });
        } else {
          callback('Error writing to new file');
        }
      });
    } else {
      callback('Could not create new file, it may already exist', lib.baseDir+dir+'/'+file+'.json');
    }
  });
};

// Read data from a file
lib.read = function(dir,file,callback) {

  const filePath = lib.baseDir+dir+'/'+file+'.json';
  fs.readFile(filePath, 'utf8', function(err,data){
      if(!err) 
      {
        if (data) {
            console.log(`Data read from file ${filePath}:\n ${data}`);
            callback(false, helpers.parseJsonToObject(data));
        }
        else {
          console.log(`No data read from file ${filePath}.`);
          callback(false,null);
        }   
    } else {
      console.log(err, data);
      callback('Trying to read ' + filePath, data);
    }
  });
};

// Update the data
lib.update = function(dir, file, data, callback) {
	//open the file for writing
	fs.open(lib.baseDir + dir + '/'+file+'.json', 'r+', function(err, fileDescriptor) 
	{
		if (!err && fileDescriptor)
		{
			 // Convert data to string
      		var stringData = JSON.stringify(data);

      		fs.truncate(fileDescriptor, function(err){
      			if (!err)
      			{
      				//Write to the file and close it
      				fs.writeFile(fileDescriptor, stringData, function(err) {
      					if(!err)
      					{
      						fs.close(fileDescriptor, function(err) {
      							if (!err) {
      								callback(false);
      							} 
                    else {
      								callback('Error closing the file.');
      							}
      						});
      					}
      					else {
      						callback('Error writing to the existing file.');
      					}
      				});
      			}
      			else {
      				callback('Error truncating the file.');
      			}
      		});
		}
		else
		{
			callback('Could not open the file for update, it may not exist yet.');
		}
	});
};

//Delete a file
lib.delete = function(dir, file, callback){
  
  console.log('Trying to delete file: ' + lib.baseDir + dir + '/' + file + '.json');

	fs.unlink(lib.baseDir + dir + '/' + file + '.json', function(err) {
		if (!err){
			callback(false);
		}
		else {
			callback('Error deleting the file.');
		}
	});
};

//List all the items in a directory
lib.list = function(dir, callback){
  fs.readdir(lib.baseDir + dir + '/', function(err, data){
    if (!err && data && data.length > 0) {
      var trimmedFileNames = [];
      data.forEach(function(fileName){
        trimmedFileNames.push(fileName.replace('.json',''));
      });
      callback(false, trimmedFileNames);
    } else {
      callback(err, data);
    }
  });
};

//List all the items in a directory that contain a given string in the name
lib.listContaining = function(dir, containsFileName, callback){

  fs.readdir(lib.baseDir + dir + '/', function(err, data){
    if (!err && data && data.length > 0) {
      var trimmedFileNames = [];
      data.forEach(function(fileName){
        if (fileName.includes(containsFileName))
          trimmedFileNames.push(fileName.replace('.json',''));
      });
      callback(false, trimmedFileNames);
    } else {
      callback(err, data);
    }
  });
};

//Export the module
module.exports = lib;