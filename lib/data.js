/*
* Library for storing and editing data
* */

// Dependencies

const fs = require('fs');
const path = require('path');
const helpers = require('./helpers');

// Container for the module (to be exported)
const lib = {};

// Base directory of the data folder
lib.baseDir = path.join(__dirname, '/../.data');

// Write data to a file
lib.create = (dir, file, data, callback) => {
  // Open the file for writing
  fs.open(`${lib.baseDir}/${dir}/${file}.json`, 'wx', (error, fileDescriptor) => {
    if(!error) {
      // Convert data to stream
      const stringData = JSON.stringify(data);

      // Write to file and close it
      fs.writeFile(fileDescriptor, stringData, (error) => {
        if(!error) {
          fs.close(fileDescriptor, (error) => {
            if(!error) {
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
      console.log(error);
      callback('Could not create new file it may already exist');
    }
  });
};

// Read data from file
lib.read = (dir, file, callback) => {
  fs.readFile(`${lib.baseDir}/${dir}/${file}.json`, 'utf8', (error, data) => {
    if (!error && data) {
      const parsedData = helpers.parseJsonToObject(data);
      callback(false, parsedData);
    } else {
      callback(error, data);
    }
  });
};

// Update data inside file
lib.update = (dir, file, data, callback) => {
  // Open the file for writing
  fs.open(`${lib.baseDir}/${dir}/${file}.json`, 'r+', (error, fileDescriptor) => {
    if(!error && fileDescriptor) {
      // Convert data to string
      const stringData = JSON.stringify(data);

      // Truncate the file
      fs.ftruncate(fileDescriptor, (error) => {
        if(!error) {
          // Write to the file and close it
          fs.writeFile(fileDescriptor, stringData, (error) => {
            if(!error) {
              fs.close(fileDescriptor, (error) => {
                if (!error) {
                  callback(false);
                } else {
                  callback('Error closing the existing file');
                }
              });
            } else {
              callback('Error in writing to the file');
            }
          });
        } else {
          callback('Error Truncating file');
        }
      });
    } else {
      callback('Could not open the file for updating, it may not exist yet');
    }
  });
};

// Delete a file
lib.delete = (dir, file, callback) => {
  // unlink the file
  fs.unlink(`${lib.baseDir}/${dir}/${file}.json`, (error) => {
    if(!error) {
      callback(false);
    } else {
      callback('Error deleting file');
    }
  });
};

// List all the items in a directory
lib.list = (dir, callback) => {
  fs.readdir(`${lib.baseDir}/${dir}/`, (error, data) => {
    if (!error && data && data.length > 0) {
      const trimmedFileNames = [];
      // Trim all files and remove .json extensions
      data.forEach((fileName) => {
        trimmedFileNames.push(fileName.replace('.json', ''));
      });
      callback(error, trimmedFileNames);
    } else {
      callback(error, data);
    }
  });
};


// Export the module
module.exports = lib;
