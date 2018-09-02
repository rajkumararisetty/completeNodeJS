/*
 * Helpers for various helpers
 */

// Dependencies
const crypto = require('crypto');
const querystring = require('querystring');
const https = require('https');
const config = require('./config');

// Container for all helpers
const helpers = {};

// Create a sha256 hash
helpers.hash = (str) => {
  if (typeof (str) === "string" && str.length > 0) {
    return crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
  }
};

// Parse Json string to an object in all cases, without throwing
helpers.parseJsonToObject = (str) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    return {}
  }
};

//Create a string of random alphanumeric characters, of a given length
helpers.createRandomString = (stringLength) => {
  stringLength = typeof (stringLength) === 'number' && stringLength > 0 ? stringLength : false;

  if(stringLength) {
    // Define all the possible characters that cloud go into a string
    const possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

    // Start the final string
    let str = '';
    for (i=1; i <=stringLength; i++) {
      // Get random character from the possibleCharacters string and Append this character to the final string
      str += possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
    }

    //return the final string
    return str;
  } else {
    return false
  }
};

// Send an sms message via Twilio
helpers.sendTwilioSms = (phone, message, callback) => {
  // Validate parameters
  const phoneNumber = typeof (phone) === "string" && phone.trim().length === 10 ? phone.trim(): false;
  const msg = typeof (message) === "string" && message.trim().length > 0 ? message.trim() : false;
  if (phoneNumber && msg) {
    // Configure the request paylaod
    const payload = {
      from: config.twilio.fromPhone,
      to: `+91${phoneNumber}`,
      Body: msg
    };

    // Stringify the payload
    const stringPayload = querystring.stringify(payload);

    // Configure the request details
    const requestDetails = {
      protocol: 'https:',
      hostname: 'api.twilio.com',
      method: 'POST',
      path: `/2010-04-01/Accounts/${config.twilio.accountSid}/Messages.json`,
      auth: `${config.twilio.accountSid}:${config.twilio.authToken}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(stringPayload)
      }
    };

    // Instanciate the request object
    const req = https.request(requestDetails, (res) => {
      // Grab the status of sent request
      const status = res.statusCode;
      // callback successfully if the request went throght
      if (status === 200 || status === 201) {
        callback(false);
      } else {
        callback(`Status Code returned was ${status}`);
      }
    });

    // Bind to the error event, so it doesn't get through
    req.on('error', (error) => {
      callback(error);
    });

    // Add the payload
    req.write(stringPayload);

    // End the request(send the request)
    req.end();
  } else {
    callback("Given parameters are missing or invalid");
  }

};

// Export the module
module.exports = helpers;