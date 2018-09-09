/*
 * Worker-related tasks
 */

// Dependencies
const path = require('path');
const fs = require('fs');
const _data = require('./data');
const http = require('http');
const https = require('https');
const helpers = require('./helpers');
const url = require('url');

// Instantiate worker object
const workers = {};

// Sanity-check the check-data
workers.validateCheckData = (checkData) => {
  const originalCheckData = typeof (checkData) === 'object' && checkData  !== null ? Object.assign({}, checkData) : [];
  originalCheckData.id = typeof (checkData.id) === 'string' && checkData.id.trim().length === 20 ? checkData.id.trim() : false;
  originalCheckData.userPhone = typeof (checkData.userPhone) === 'string' && checkData.userPhone.trim().length === 10 ? checkData.userPhone.trim() : false;
  originalCheckData.protocol = typeof (checkData.protocol) === 'string' && ['http', 'https'].indexOf(checkData.protocol.trim()) > -1 ? checkData.protocol.trim() : false;
  originalCheckData.url = typeof (checkData.url) === 'string' && checkData.url.trim().length > 0 ? checkData.url.trim() : false;
  originalCheckData.method = typeof (checkData.method) === 'string' && ['get', 'post', 'put', 'delete'].indexOf(checkData.method.trim()) > -1 ? checkData.method.trim() : false;
  originalCheckData.succssCode = typeof (checkData.succssCode) === 'object' && checkData.succssCode instanceof Array && checkData.succssCode.length > 0 ? checkData.succssCode.trim() : false;
  originalCheckData.timeoutSeconds = typeof (checkData.timeoutSeconds) === 'number' && checkData.timeoutSeconds % 1 === 0 && checkData.timeoutSeconds >= 1 && checkData.timeoutSeconds <= 5 ? checkData.timeoutSeconds : false;

  // Set the keys that may not be set (if the workers have never seen this check before)
  originalCheckData.state = typeof (checkData.state) === 'string' && ['up', 'down'].indexOf(checkData.state.trim()) > -1 ? checkData.state.trim() : "down";
  originalCheckData.lastChecked = typeof (checkData.lastChecked) === 'number' && checkData.lastChecked > 0  ? checkData.lastChecked : false;
  // console.log(originalCheckData);
  // If all checks passed, pass the data along to the next step in the process
  if (originalCheckData.id &&
    originalCheckData.userPhone &&
    originalCheckData.protocol &&
    originalCheckData.url &&
    originalCheckData.method &&
    originalCheckData.successCode &&
    originalCheckData.timeoutSeconds
  ) {
    workers.performCheck(originalCheckData);
  } else {
    console.log("Error: One of the checks is not properly formatted, skipping it.");
  }
};

// Perform the check and send the origin check data and the outcome of the check process to the next step in the process
workers.performCheck = (checkData) => {
  // Prepare the initial check outcome
  const checkOutCome = {
    error: false,
    responseCode: false
  };

  // Mark that the outcome has not been sent yet
  let outcomeSent = false;

  // Parse the hostname and the path out of the origin check data
  const parsedUrl = url.parse(`${checkData.protocol}://${checkData.url}`, true);
  const hostName = parsedUrl.hostname;
  const path = parsedUrl.path; // Using path and not "pathname" because we want the query string

  // Construct the request
  const requestDetails = {
    protocol: `${checkData.protocol}:`,
    hostName,
    method: checkData.method.toUpperCase(),
    path,
    timeout: checkData.timeoutSeconds * 1000
  };

  // Instantiate the request object (using either the http or https module)
  const _moduleToUse = checkData.protocol === 'http' ? http : https;
  console.log(_moduleToUse);
  const request = _moduleToUse.request(requestDetails, (res) => {
    // Grab the status of the sent request && Update the checkOutcome and pass the data along
    checkOutCome.responsecode = res.statusCode;
    if (!outcomeSent) {
      workers.processCheckOutCome(checkData, checkOutCome);
      outcomeSent = true;
    }
  });

  // Bind to the error event, so it doesn't get thrown
  request.on('error', (error) => {
    // Update the checkOutcome and pass the data along
    checkOutCome.error = {error: true, value: error};
    if (!outcomeSent) {
      workers.processCheckOutCome(checkData, checkOutCome);
      outcomeSent = true;
    }
  });

  // Bind to the timeout event
  request.on('timeout', (error) => {
    // Update the checkOutcome and pass the data along
    checkOutCome.error = {error: true, value: 'timeout'};
    if (!outcomeSent) {
      workers.processCheckOutCome(checkData, checkOutCome);
      outcomeSent = true;
    }
  });

  // End the request
  request.end();
};

// Process the check outcome and update the check data as needed and trigger an alert to the user if needed
// Special logic for accomodating a check that has never been tested before (don't  want to alert the user)
workers.processCheckOutCome = (checkData, checkOutCome) => {
  // Decide if the check is considered up and down
  const state = !checkOutCome.error && checkOutCome.responseCode && checkData.succssCode.indexOf(checkOutCome.responseCode) > -1 ? 'up' : 'down';

  console.log(checkOutCome);
  // Decide if an alert is warranted
  const alertWarranted = checkData.lastChecked && checkData.state !== state;

  // update the check data
  const newCheckData = Object.assign({}, checkData);
  newCheckData.state = state;
  newCheckData.lastChecked = Date.now();

  //Save the updates
  _data.update("checks", newCheckData.id, newCheckData, (error) => {
    if (!error) {
      // Send the new check data to the next phase in the process if needed
      if (alertWarranted) {
        workers.alertUserToStatusChange(newCheckData);
      } else {
        console.log("Check outcome has not changed, no alert needed");
      }
    } else {
      console.log("Error trying to save updates to one of the checks");
    }
  });
};

// Alert the user as to a change in their check status
workers.alertUserToStatusChange = (newCheckData) => {
  const msg = `Alert: Your check for ${newCheckData.method.toUpperCase()} ${newCheckData.protocol}://${newCheckData.url} is currently ${newCheckData.state}`;
  helpers.sendTwilioSms(newCheckData.userPhone, msg, (error) =>{
    if (!error) {
      console.log("Success: User was alerted to a status change in their check, via sms", msg);
    } else {
      console.log("Error: Cloud not send sms alert to user who had a state change");
    }
  });
};

// Lookup all checks, get their data, send to a validator
workers.gatherAllChecks = () => {
  // Get all the functions
  _data.list("checks", (error, checks) => {
    if (!error && checks && checks.length > 0) {
      checks.forEach((check) => {
        // Read in check here
        _data.read("checks", check, (error, checkData) => {
          if (!error && checkData) {
            // Pass it the check validator, and let that function continue or log errors as needed
            workers.validateCheckData(checkData);
          } else {
            console.log('Error reading of the check\'s data');
          }
        });
      });
    } else {
      console.log("Error cloud not find any checks to process");
    }
  });
};

// Timer to execute the worker-process once per minute
workers.loop = () => {
  setInterval(() => {
    workers.gatherAllChecks();
  }, 1000 * 60)
};

// Init Script
workers.init = () => {
  // Execute all the checks immediately
  workers.gatherAllChecks();
  // Call the loop so the checks will exclusive later on
  workers.loop();
};

module.exports = workers;