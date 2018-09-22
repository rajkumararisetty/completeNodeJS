/*
 * Helpers for various helpers
 */

// Dependencies
const crypto = require('crypto');
const querystring = require('querystring');
const https = require('https');
const config = require('./config');
const path = require('path');
const fs = require('fs');

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

// Get string content of a template
helpers.getTemplate = (templateName, data, callback) => {
  templateName = typeof (templateName) === 'string' && templateName.length > 0 ? templateName : false;
  data = typeof (data) === 'object' && data !== null ? data : {};

  if (templateName) {
    const templatesDir = path.join(__dirname, '/../templates/');
    fs.readFile(`${templatesDir}${templateName}.html`, 'utf8', (error, str) => {
      if (!error && str && str.length > 0) {
        // Do interpolation on the string
        const finalString = helpers.interpolate(str, data);
        callback(false, finalString);
      } else {
        callback('No template could be found');
      }
    });
  } else {
    callback('A valid template name was not specified');
  }
};

// Add the universal header and footer to a string and pass provided object to the header and footer for interpolation
helpers.addUniversalTemplates = (string, data, callback) => {
  string = typeof (string) === 'string' && string.length > 0 ? string : '';
  data = typeof (data) === 'object' && data !== null ? data : {};
  // Get the Header
  helpers.getTemplate('_header', data, (error, headerString) => {
    if (!error && headerString) {
      // Get the Footer
      helpers.getTemplate('_footer', data, (error, footerString) => {
        if (!error && footerString) {
          // Add them all together
          const fullString = `${headerString}${string}${footerString}`;
          callback(error, fullString);
        } else {
          callback("Could not find the footer template");
        }
      });
    } else {
      callback("Could not find the header template");
    }
  });
};

// Take a given string and data object and find/replace all the keys with in it
helpers.interpolate = (string, data) => {
  string = typeof (string) === 'string' && string.length > 0 ? string : '';
  data = typeof (data) === 'object' && data !== null ? data : {};

  // Add the template globals to the data object, prepanding their key name with "global"
  for(const keyName in config.templateGlobals) {
    if (config.templateGlobals.hasOwnProperty(keyName)) {
      data[`global.${keyName}`] = config.templateGlobals[keyName];
    }
  }

  // For Each key in the data object, insert it's value into the string at the corresponding placeholder
  for (const key in data) {
    if (data.hasOwnProperty(key) && typeof (data[key]) === 'string') {
      const replace = data[key];
      const find = `{${key}}`;
      string = string.replace(find, replace);
    }
  }

  return string;
};

// Get the contents of a static (public) asset
helpers.getStaticAsset = (fileName, callback) => {
  fileName = typeof (fileName) === 'string' && fileName.length > 0 ? fileName : false;
  if (fileName) {
    const publicDir = path.join(__dirname, '/../public/');
    fs.readFile(`${publicDir}${fileName}`, 'utf8', (error, data) => {
      if (!error && data) {
        callback(false, data);
      } else {
        callback('No file could be found');
      }
    });
  } else {
    callback("A valid file name was not specified");
  }
};


// Export the module
module.exports = helpers;