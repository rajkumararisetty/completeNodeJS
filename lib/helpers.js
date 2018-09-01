/*
 * Helpers for various helpers
 */

// Dependencies
const crypto = require('crypto');
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

// Export the module
module.exports = helpers;