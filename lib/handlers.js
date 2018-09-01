/**
 * These are the request handlers
 * @type {{}}
 */

// Dependencies
const _data = require('./data');
const helpers = require('./helpers');

// Define the handlers
const handlers = {};

// Users
handlers.users = (data, callback) => {
  const acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._users[data.method](data, callback);
  } else {
    callback(405);
  }
};

// Container for the user sub methods
handlers._users = {};

// Users - post
// Required data: firstName, lastName, phone, password, tosAgreement
// Optional dada: none
handlers._users.post = (data, callback) => {
  // Check all the required fields are filled out
  const firstName = typeof (data.payload.firstName) === 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;

  const lastName = typeof (data.payload.lastName) === 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;

  const phone = typeof (data.payload.phone) === 'string' && data.payload.phone.trim().length === 10 ? data.payload.phone.trim() : false;

  const password = typeof (data.payload.password) === 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

  const tosAgreement = typeof (data.payload.tosAgreement) === 'boolean' && data.payload.tosAgreement === true ? true : false;

  if (firstName && lastName && phone && password && tosAgreement) {
    // Make sure that the uses doesn't already exists
    _data.read('users', phone, (error, data) => {
      if(error) {
        // Hash the password
        const hashedPassword =  helpers.hash(password);

        if (hashedPassword) {
          // Create the user object
          const userObject = {
            firstName, lastName, phone, hashedPassword, tosAgreement: true
          };

          // Store the user
          _data.create('users', phone, userObject, (error) => {
            if (!error) {
              callback(200);
            } else {
              callback(500, {Error: 'Could not create the new user'});
            }
          });
        } else {
          callback(500, {Error: 'Could not hash User\'s password'});
        }
      } else {
        // User already exists
        callback(400, {Error: 'User with the phone number already exist'});
      }
    });

  } else {
    callback(400, {Error: 'Missing required fields'});
  }



};

// Users - get
// Required data: phone
// Optional data: none
handlers._users.get = (data, callback) => {
  // Check that the phone number is valid
  const phone = typeof (data.queryStringObject.phone) === 'string' && data.queryStringObject.phone.trim().length === 10 ? data.queryStringObject.phone.trim() : false;

  if(phone) {
    // get the toke from the headers
    const token = typeof (data.headers.token) === "string" ? data.headers.token : false;

    // verify that the given token from the header is valid for the phone number
    handlers._tokens.verifyTokens(token, phone, (tokenIsValid) => {
      if (tokenIsValid) {
        // Lookup the user
        _data.read('users', phone, (error, data) => {
          if (!error) {
            // Remove the hashed password from the user object before returning the user object
            delete data.hashedPassword;
            callback(200, data);
          } else {
            callback(404);
          }
        });
      } else {
        callback(403, {Error: "Missing required token in headers or token is invalid"});
      }
    });
  } else {
    callback(400, {Error: "Missing required fields"});
  }
};

// Users - put
// Required data : phone
// Optional data : firstName, lastName, password (at least one must be specified)
handlers._users.put = (data, callback) => {
  // Check for the required fields
  const phone = typeof (data.payload.phone) === 'string' && data.payload.phone.trim().length === 10 ? data.payload.phone.trim() : false;

  // Check optional fields
  const firstName = typeof (data.payload.firstName) === 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;

  const lastName = typeof (data.payload.lastName) === 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;

  const password = typeof (data.payload.password) === 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

  // Error if the phone is invalid
  if (phone) {
    // Error if nothing is send to update
    if (firstName || lastName || password) {
      // get token from the headers
      const token = typeof (data.headers.token) === "string" ? data.headers.token :  false;
      // verify token is for the currently request user
      handlers._tokens.verifyTokens(token, phone, (isValidToken) => {
        if (isValidToken) {
          // Lookup the user
          _data.read('users', phone, (error, userData) => {
            if (!error && userData) {
              const updatedUserData = Object.assign({}, userData);
              // update the user data object
              if (firstName) {
                updatedUserData.firstName = firstName;
              }
              if (lastName) {
                updatedUserData.lastName = lastName;
              }
              if (password) {
                updatedUserData.hashedPassword = helpers.hash(password);
              }

              // Store the new update
              _data.update('users',phone, updatedUserData, (error) => {
                if (!error) {
                  callback(200);
                } else {
                  console.log(error);
                  callback(500, {Error: 'Could not update the user'});
                }
              });
            } else {
              callback(400, {Error: "The specified used doesn\'t exist"});
            }
          });
        } else {
          callback(403, {Error: "Missing required token in headers or token is invalid"});
        }
      });
    }
  } else {
    callback(400, {Error: "Missing required fields"});
  }
};

// Users - delete
// Required field :  phone
// @TODO Cleanup (delete) any other data files associated with this user
handlers._users.delete = (data, callback) => {
  // Check that the phone number is valid
  const phone = typeof (data.queryStringObject.phone) === 'string' && data.queryStringObject.phone.trim().length === 10 ? data.queryStringObject.phone.trim() :  false;
  if(phone) {
    // get token from the headers
    const token = typeof (data.headers.token) === "string" ? data.headers.token :  false;
    handlers._tokens.verifyTokens(token, phone, (isValidToken) => {
      if (isValidToken) {
        // Lookup the user
        _data.read('users', phone, (error) => {
          if (!error && data) {
            // Delete the user data
            _data.delete('users', phone, (error) => {
              if (!error) {
                callback(200);
              } else {
                callback(500, {Error: "Could not delete the user"});
              }
            });
          } else {
            callback(400, {Error: "Could not find the specified user"});
          }
        });
      } else {
        callback(403, {Error: "Missing required token in headers or token is invalid"});
      }
    });
  } else {
    callback(404, {Error: "Missing required field"});
  }
};

// Tokens
handlers.tokens = (data, callback) => {
  const acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._tokens[data.method](data, callback);
  } else {
    callback(405);
  }
};

// Container for all the token methods
handlers._tokens = {};

// Tokens - post
// Required data: phone, password
// Optional data: none
handlers._tokens.post = (data, callback) => {
  const phone = typeof (data.payload.phone) === 'string' && data.payload.phone.trim().length === 10 ? data.payload.phone.trim() : false;
  const password = typeof (data.payload.password) === 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
  if (phone && password) {
    // Lookup the user who matches phone number
    _data.read('users', phone, (error, userData) => {
      if (!error) {
        // Hash the sent password and compare it with the password stored in the user object
        const hashedPassword = helpers.hash(password);
        if (hashedPassword === userData.hashedPassword) {
          // If valid create a new token with a random name. Set expiration date 1 hour in the future
          const tokenId = helpers.createRandomString(20);
          const expires = Date.now() + 1000 * 60 * 60;
          const tokenObject = {
            phone,
            id: tokenId,
            expires
          };

          console.log(tokenObject);

          // Store the token
          _data.create('tokens', tokenId, tokenObject, (error) => {
            if (!error) {
              callback(200, tokenObject);
            } else {
              callback(500, {Error: "Could not create the new token"});
            }
          });
        } else {
          callback(400, {Error: "Password didn't match the specified user stored password"});
        }
      } else {
        callback(400, {Error: "Could not find the specified users"});
      }
    })
  } else {
    callback(400, {Error: "Missing required fields"});
  }
};

// Tokens - get
// Required data: id
// Optional data: none
handlers._tokens.get = (data, callback) => {
  // Check that the id is send is valid
  const id = typeof (data.queryStringObject.id) === 'string' && data.queryStringObject.id.trim().length === 20 ? data.queryStringObject.id.trim() : false;

  if (id) {
    _data.read('tokens', id, (error, data) => {
      if (!error && data) {
        callback(200, data);
      } else {
        callback(404);
      }
    });
  } else {
    callback(400, {Error: "Missing required fileds"});
  }
};

// Tokens - put
// Required data: id, extend
// Optional data: none
handlers._tokens.put = (data, callback) => {
  const id = typeof (data.payload.id) === "string" && data.payload.id.trim().length === 20 ? data.payload.id.trim() : false;
  const extend = data.payload.extend === true ? true : false;

  if (id && extend) {
    // Lookup the token
    _data.read("tokens", id, (error, tokenData) => {
      if (!error && tokenData) {
        // Check to make sure the token isn't already expired
        if (tokenData.expires > Date.now()) {
          // Set the expiration an from now
          const updatedTokenData = Object.assign({}, tokenData, {expires: Date.now() + 1000 * 60 * 60});
          // Store the new updates
          _data.update("tokens", id, updatedTokenData, (error) => {
            if (!error) {
              callback(200);
            } else {
              callback(500, {Error: "Could not update the token's expiration"});
            }
          });
        } else {
          callback(400, {Error: "The toke has already expired and can't be expanded"});
        }
      } else {
        callback(400, {Error: "Specified token doesn't exist"});
      }
    });
  } else {
    callback(400, {Error: "Missing required fields or invalid fields"});
  }

};

// Tokens - delete
// Required data: id
// Optional data: none
handlers._tokens.delete = (data, callback) => {
  //Check that the id is valid
  const id = typeof (data.queryStringObject.id) === "string" && data.queryStringObject.id.trim().length === 20 ? data.queryStringObject.id.trim() : false;
  if (id) {
    // Lookup the tokens
    _data.read("tokens", id, (error, tokenData) => {
      if (!error && tokenData) {
        _data.delete("tokens", id, (error) => {
          if(!error) {
            callback(200);
          } else {
            callback(500, {Error: "Could not delete the specified token"})
          }
        });
      } else {
        callback(400, {Error: "Could not find the specified token"})
      }
    });
  } else {
    callback(400, {Error: "Missing required field or invalid field"});
  }
};

// Verify if a given token id is currently valid for the given user
handlers._tokens.verifyTokens = (id, phone, callback) => {
  // Lookup the token
  _data.read("tokens", id, (error, tokenData) => {
    if (!error && tokenData) {
      // Check that the token is for the given user and has not expired
      if (tokenData.phone === phone && tokenData.expires > Date.now()) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
};

handlers.ping = (data, callback) => {
  callback(200);
};

// Not found handler
handlers.notFound = (data, callback) => {
  callback(404);
};

// Export the module
module.exports = handlers;