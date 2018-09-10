/**
 * Library for storing and rotating logs
 * */

// Dependencies
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Container for the module
const lib = {};

// Base directory of the logs folder
lib.baseDir = path.join(__dirname, '../.logs/');


// Append a string to a file, create the file if it doesn't exist.
lib.append = (filename, string, callback) => {
  // Opening the file
  fs.open(`${lib.baseDir}${filename}.log`, 'a', (error, fileDescriptor) => {
    if (!error && fileDescriptor) {
      // Append to the file and close it
      fs.appendFile(fileDescriptor, `${string}\n`, (error) => {
        if (!error) {
          fs.close(fileDescriptor, (error) => {
            if (!error) {
              callback(false);
            } else {
              callback("Error closing file that was being appended");
            }
          });
        } else {
          callback("Error apending to file");
        }
      })
    } else {
      callback("Could not open file for appending");
    }
  });
};

// List all the logs, and optionally include compressed file
lib.list = (includeCompressedLogs, callback) => {
  fs.readdir(lib.baseDir, (error, data) => {
    if (!error && data.length > 0) {
      const trimmedFileNames = [];
      data.forEach((fileName) => {
        // Add the .log Files
        if (fileName.indexOf('.log') > -1) {
          trimmedFileNames.push(fileName.replace('.log', ''));
        }

        // Add on the .gz file
        if (includeCompressedLogs && fileName.indexOf('.gz.b64') > -1) {
          trimmedFileNames.push(fileName.replace('.gz.b64', ''));
        }
      });
      callback(false, trimmedFileNames);
    } else {
      callback(error, data);
    }
  });
};


// Compress the content of one .log file into a .gz.b64 file within the same directory
lib.compress = (logId, newFileId, callback) => {
  const sourceFile = `${logId}.log`;
  const destinationFile = `${newFileId}.gz.b64`;

  // Read the resource file
  fs.readFile(`${lib.baseDir}${sourceFile}`, 'utf8', (error, inputString) => {
    if (!error && inputString) {
      // Compress the data using gzip
      zlib.gzip(inputString, (error, buffer) => {
        if (!error && buffer) {
          // Send the data to the destination file
          fs.open(`${lib.baseDir}${destinationFile}`, 'wx', (error, fileDescriptor) => {
            if (!error && fileDescriptor) {
              // Write to the destination file
              fs.writeFile(fileDescriptor, buffer.toString('base64'), (error) => {
                if (!error) {
                  // Close the destination file
                  fs.close(fileDescriptor, (error) => {
                    if (!error) {
                      callback(false);
                    } else {
                      callback(error);
                    }
                  });
                } else {
                  callback(error);
                }
              });
            } else {
              callback(error);
            }
          });
        } else {
          callback(error)
        }
      });
    } else {
      callback(error);
    }
  });
};

// Decompress the contents of a .gz.b64 file into a variable
lib.decompress = (fileId, callback) => {
  const fileName = `${fileId}.gz.b64`;
  fs.readFile(`${lib.baseDir}${fileName}`, 'utf8', (error, string) => {
    if (!error && string) {
      // Decompress the data
      const inputBuffer = Buffer.from(string, 'base64');
      zlib.unzip(inputBuffer, (error, outputBuffer) => {
        if (!error && outputBuffer) {
          // callback
          const string = outputBuffer.toString();
          callback(false, string);
        } else {
          callback(error);
        }
      });
    } else {
      callback(error);
    }
  });
};

// Truncating a logfil
lib.truncate = (logId, callback) => {
  fs.truncate(`${lib.baseDir}${logId}.log`, (error) => {
    if (!error) {
      callback(false);
    } else {
      callback(error);
    }
  })
};

// Export the module
module.exports = lib;