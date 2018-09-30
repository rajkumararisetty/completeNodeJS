/**
 * These are the request handlers
 * @type {{}}
 */

// Dependencies
const _data = require('./data');
const helpers = require('./helpers');
const config = require('./config');

// Define the handlers
const handlers = {};

/**
 * HTML handlers
 */

// Index handler
handlers.index = (data, callback) => {
  // Reject any request that isn't a GET
  if (data.method === 'get') {
    // Prepare data for interpolation
    const templateData = {
      'head.title': 'Uptime Monitoring - Made Simple',
      'head.description': 'We offer free simple uptime monitoring for HTTP/HTTPS sites of all kinds when your site goes down, we will send you a text to let you know',
      'body.class': 'index'
    };

    // Read in a template as a string
    helpers.getTemplate('index', templateData, (error, string) => {
      if (!error && string) {
        // Add the universal header and footer
        helpers.addUniversalTemplates(string, templateData, (error, string) => {
          if (!error && string) {
            callback(200, string, 'html');
          } else {
            callback(500, undefined, 'html');
          }
        });
      } else {
        callback(500, undefined, 'html');
      }
    });
  } else {
    callback(405, undefined, 'html');
  }
};

// Create Account
handlers.accountCreate = (data, callback) => {
  // Reject any request that isn't a GET
  if (data.method === 'get') {
    // Prepare data for interpolation
    const templateData = {
      'head.title': 'Create an Account',
      'head.description': 'Signup is easy and only takes a few seconds',
      'body.class': 'accountCreate'
    };

    // Read in a template as a string
    helpers.getTemplate('accountCreate', templateData, (error, string) => {
      if (!error && string) {
        // Add the universal header and footer
        helpers.addUniversalTemplates(string, templateData, (error, string) => {
          if (!error && string) {
            callback(200, string, 'html');
          } else {
            callback(500, undefined, 'html');
          }
        });
      } else {
        callback(500, undefined, 'html');
      }
    });
  } else {
    callback(405, undefined, 'html');
  }
};

// Create new session
handlers.sessionCreate = (data, callback) => {
  // Reject any request that isn't a GET
  if (data.method === 'get') {
    // Prepare data for interpolation
    const templateData = {
      'head.title': 'Login to your account',
      'head.description': 'Please enter your phone and password to your account',
      'body.class': 'sessionCreate'
    };

    // Read in a template as a string
    helpers.getTemplate('sessionCreate', templateData, (error, string) => {
      if (!error && string) {
        // Add the universal header and footer
        helpers.addUniversalTemplates(string, templateData, (error, string) => {
          if (!error && string) {
            callback(200, string, 'html');
          } else {
            callback(500, undefined, 'html');
          }
        });
      } else {
        callback(500, undefined, 'html');
      }
    });
  } else {
    callback(405, undefined, 'html');
  }
};

// Session has been deleted
handlers.sessionDeleted = (data, callback) => {
  // Reject any request that isn't a GET
  if (data.method === 'get') {
    // Prepare data for interpolation
    const templateData = {
      'head.title': 'Logged Uot',
      'head.description': 'You have been logged out of your account.',
      'body.class': 'sessionDeleted'
    };

    // Read in a template as a string
    helpers.getTemplate('sessionDeleted', templateData, (error, string) => {
      if (!error && string) {
        // Add the universal header and footer
        helpers.addUniversalTemplates(string, templateData, (error, string) => {
          if (!error && string) {
            callback(200, string, 'html');
          } else {
            callback(500, undefined, 'html');
          }
        });
      } else {
        callback(500, undefined, 'html');
      }
    });
  } else {
    callback(405, undefined, 'html');
  }
};

// Edit your account
handlers.accountEdit = (data, callback) => {
  // Reject any request that isn't a GET
  if (data.method === 'get') {
    // Prepare data for interpolation
    const templateData = {
      'head.title': 'Account Settings',
      'body.class': 'accountEdit'
    };

    // Read in a template as a string
    helpers.getTemplate('accountEdit', templateData, (error, string) => {
      if (!error && string) {
        // Add the universal header and footer
        helpers.addUniversalTemplates(string, templateData, (error, string) => {
          if (!error && string) {
            callback(200, string, 'html');
          } else {
            callback(500, undefined, 'html');
          }
        });
      } else {
        callback(500, undefined, 'html');
      }
    });
  } else {
    callback(405, undefined, 'html');
  }
};

// Account has been deleted
handlers.sessionDeleted = (data, callback) => {
  // Reject any request that isn't a GET
  if (data.method === 'delete') {
    // Prepare data for interpolation
    const templateData = {
      'head.title': 'Account Deleted',
      'head.description': 'Your account has been deleted',
      'body.class': 'accountDeleted'
    };

    // Read in a template as a string
    helpers.getTemplate('accountDeleted', templateData, (error, string) => {
      if (!error && string) {
        // Add the universal header and footer
        helpers.addUniversalTemplates(string, templateData, (error, string) => {
          if (!error && string) {
            callback(200, string, 'html');
          } else {
            callback(500, undefined, 'html');
          }
        });
      } else {
        callback(500, undefined, 'html');
      }
    });
  } else {
    callback(405, undefined, 'html');
  }
};

// Favicon
handlers.favicon = (data, callback) => {
  // Reject any request that isn't a GET
  if (data.method === 'get') {
    // Read in the favicon's data
    helpers.getStaticAsset('favicon.ico', (error, data) => {
      if (!error && data) {
        callback(200, data, 'favicon');
      } else {
        callback(500);
      }
    });
  } else {
    callback(405);
  }
};

// Public assets
handlers.public = (data, callback) => {
  // Reject any request that isn't a GET
  if (data.method === 'get') {
    // Get the fine name being requested
    const trimmedAssetName = data.trimmedPath.replace('public/', '').trim();
    if (trimmedAssetName.length > 0) {
      // Read in the asset's data
      helpers.getStaticAsset(trimmedAssetName, (error, data) => {
        if (!error && data) {
          // Determine the content type(Default to plain text)
          let contentType = 'plain';
          if (trimmedAssetName.indexOf('.css') > -1) {
            contentType = 'css';
          } else if(trimmedAssetName.indexOf('.jpg') > -1) {
            contentType = 'jpg';
          } else if(trimmedAssetName.indexOf('.png') > -1) {
            contentType = 'png';
          } else if(trimmedAssetName.indexOf('.ico') > -1) {
            contentType = 'favicon';
          }

          callback(200, data, contentType);
        } else {
          callback(404);
        }
      });
    } else {
      callback(404);
    }
  } else {
    callback(405);
  }
};

/**
 * Json API Handlers
 * @param data
 * @param callback
 */
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
handlers._users.delete = (data, callback) => {
  // Check that the phone number is valid
  const phone = typeof (data.queryStringObject.phone) === 'string' && data.queryStringObject.phone.trim().length === 10 ? data.queryStringObject.phone.trim() :  false;
  if(phone) {
    // get token from the headers
    const token = typeof (data.headers.token) === "string" ? data.headers.token :  false;
    handlers._tokens.verifyTokens(token, phone, (isValidToken) => {
      if (isValidToken) {
        // Lookup the user
        _data.read('users', phone, (error, userData) => {
          if (!error && userData) {
            // Delete the user data
            _data.delete('users', phone, (error) => {
              if (!error) {
                // Delete all checks associated with user
                const userChecks = typeof (userData.checks) ==='object' && userData.checks instanceof Array ? userData.checks : false;
                const checksToDelete = userChecks.length;
                if (checksToDelete > 0) {
                  let checksDeleted = 0;
                  let deletionErrors = false;
                  // Loop through the checks
                  userChecks.forEach((checkId) => {
                    _data.delete("checks", checkId, (error) => {
                      if (!error) {
                        checksDeleted++;
                        if (checksDeleted === checksToDelete) {
                          if (!deletionErrors) {
                            callback(200);
                          } else {
                            callback(500, {Error: "Error is encountered to delete the checks all check's may not deleted from the system successfully"});
                          }
                        }
                      } else {
                        deletionErrors = true;
                      }
                    });
                  })
                } else {
                  callback(200);
                }
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

// Checks
handlers.checks = (data, callback) => {
  const acceptableMethods = ['get', 'post', 'put', 'delete'];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._checks[data.method](data, callback);
  } else {
    callback(405);
  }
};

// Container for all the checks methods
handlers._checks = {};

// Check - Post
// Required data: protocol, url, method, successCode, timeoutSeconds
// Optional data: none
handlers._checks.post = (data, callback) => {
  const protocol = typeof (data.payload.protocol) === 'string' && ['http', 'https'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol :  false;
  const url = typeof (data.payload.url) === 'string' && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false;
  const method = typeof (data.payload.method) === 'string' && ['get', 'post', 'put', 'delete'].indexOf(data.payload.method) > -1 ? data.payload.method :  false;
  const successCode = typeof (data.payload.successCode) === 'object' && data.payload.successCode instanceof Array && data.payload.successCode.length > 0 ? data.payload.successCode : false;
  const timeoutSeconds = typeof (data.payload.timeoutSeconds) === 'number' && data.payload.timeoutSeconds % 1 === 0 && data.payload.timeoutSeconds >=0 && data.payload.timeoutSeconds <= 5 ? data.payload.timeoutSeconds : false;

  if (protocol && url && method && successCode && timeoutSeconds) {
    // Get the token from the headers
    const token = typeof (data.headers.token) === 'string' && data.headers.token.trim().length === 20 ? data.headers.token.trim(): false;
    _data.read("tokens", token, (error, tokenData) => {
      const userPhone = tokenData.phone;
      // Lookup the user data
      _data.read("users", userPhone, (error, userData) => {
        if (!error && userData) {
          handlers._tokens.verifyTokens(token, userData.phone, (tokenIsValid) => {
            if (tokenIsValid) {
              const userChecks = typeof (userData.checks) === 'object' && userData.checks instanceof Array ? userData.checks : [];
              // Verify that the user has less than the number of max-checks-per-user
              if (userChecks.length < config.maxChecksLimit) {
                // Create a random id for the check
                const checkId = helpers.createRandomString(20);

                // Create the check object, and include the user's phone
                const checkObject = {
                  id: checkId,
                  userPhone,
                  protocol,
                  url,
                  method,
                  successCode,
                  timeoutSeconds
                };

                // Save the object
                _data.create("checks", checkId, checkObject, (error) => {
                  if (!error) {
                    // Add the check id to the user object
                    const userObjectWithChecks = Object.assign({}, userData);
                    userObjectWithChecks.checks = userChecks;
                    userObjectWithChecks.checks.push(checkId);

                    // Save the new user data
                    _data.update("users", userPhone, userObjectWithChecks, (error) => {
                      if (!error) {
                        // Return the data about the new object
                        callback(200, checkObject);
                      } else {
                        callback(500, {Error: "Could not update the user with new check"});
                      }
                    });
                  } else {
                    callback(500, {Error: "Could not create the new check"});
                  }
                });
              } else {
                callback(400, {Error: `The user already has the maximum number of checks(${config.maxChecksLimit})`});
              }
            } else {
              callback(403);
            }
          });
        } else {
          callback(403);
        }
      });
    });
  } else {
    callback(400, {Error: "Missing required inputs or inputs are invalid"});
  }

};

// Check - Get
// Required data: id
// Optional: None
handlers._checks.get = (data, callback) => {
  // Check that the id is valid
  const id = typeof (data.queryStringObject.id) === 'string' && data.queryStringObject.id.trim().length === 20 ? data.queryStringObject.id.trim() : false;

  if(id) {
    // Lookup the check
    _data.read("checks", id, (error, checkData) => {
      if (!error && checkData) {
        // get the toke from the headers
        const token = typeof (data.headers.token) === "string" ? data.headers.token : false;

        // verify that the given token from the header is valid and belongs to the user who created it
        handlers._tokens.verifyTokens(token, checkData.userPhone, (tokenIsValid) => {
          if (tokenIsValid) {
            // Return the check data
            callback(200, checkData);
          } else {
            callback(403);
          }
        });
      } else {
        callback(404);
      }
    });
  } else {
    callback(400, {Error: "Missing required fields"});
  }
};

// Check - Put
// Required data: id
// Optional data: protocol, url, method, successCode, timeoutSeconds (one of these must be sent)
handlers._checks.put = (data, callback) => {
  // Check for the required fields
  const id = typeof (data.payload.id) === 'string' && data.payload.id.trim().length === 20 ? data.payload.id.trim() : false;

  // Check optional fields
  const protocol = typeof (data.payload.protocol) === 'string' && ['http', 'https'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol :  false;
  const url = typeof (data.payload.url) === 'string' && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false;
  const method = typeof (data.payload.method) === 'string' && ['get', 'post', 'put', 'delete'].indexOf(data.payload.method) > -1 ? data.payload.method :  false;
  const successCode = typeof (data.payload.successCode) === 'object' && data.payload.successCode instanceof Array && data.payload.successCode.length > 0 ? data.payload.successCode : false;
  const timeoutSeconds = typeof (data.payload.timeoutSeconds) === 'number' && data.payload.timeoutSeconds % 1 === 0 && data.payload.timeoutSeconds >=0 && data.payload.timeoutSeconds <= 5 ? data.payload.timeoutSeconds : false;
  console.log();
  if (id) {
    // Check for the fields to update(one of must be in request)
    if (protocol || url || method || successCode || timeoutSeconds) {
      // Lookup the check
      _data.read("checks", id, (error, checkData) => {
        if (!error && checkData) {
          // get the toke from the headers
          const token = typeof (data.headers.token) === "string" ? data.headers.token : false;

          // verify that the given token from the header is valid and belongs to the user who created it
          handlers._tokens.verifyTokens(token, checkData.userPhone, (tokenIsValid) => {
            if (tokenIsValid) {
              const updatedTokenData = Object.assign({}, checkData);
              // updated fields based on request fields
              if (protocol) {
                updatedTokenData.protocol = protocol;
              }
              if (url) {
                updatedTokenData.url = url;
              }
              if (method) {
                updatedTokenData.method = method;
              }
              if (successCode) {
                updatedTokenData.successCode = successCode;
              }
              if (timeoutSeconds) {
                updatedTokenData.timeoutSeconds = timeoutSeconds;
              }
              // Store the new updates
              _data.update("checks", id, updatedTokenData, (error) => {
                if (!error) {
                  callback(200, updatedTokenData);
                } else {
                  callback(500, {Error: "Could not update the specified token"});
                }
              });
            } else {
              callback(403);
            }
          });
        } else {
          callback(400, {Error: "check id did not exist"});
        }
      });
    } else {
      callback(400, {Error: "Missing fields to update"});
    }
  } else {
    callback(400, {Error: "Missing required fields"});
  }
};
// Check - Delete
// Required fields - tokenId
// Optional Fields: none
handlers._checks.delete = (data, callback) => {
  //Check that the id is valid
  const id = typeof (data.queryStringObject.id) === "string" && data.queryStringObject.id.trim().length === 20 ? data.queryStringObject.id.trim() : false;
  if (id) {

    // Lookup the check
    _data.read("checks", id, (error, checkData) => {
      if (!error && checkData) {
        // get token from the headers
        const token = typeof (data.headers.token) === "string" ? data.headers.token :  false;
        handlers._tokens.verifyTokens(token, checkData.userPhone, (isValidToken) => {
          if (isValidToken) {
            // Delete the specified check data
            _data.delete("checks", id, (error) => {
              if (!error) {
                _data.read("users", checkData.userPhone, (error, userData) => {
                  if (!error && userData) {
                    const userChecks = typeof (userData.checks) === 'object' && userData.checks instanceof Array ? userData.checks : [];

                    // Remove the deleted check from the list of checks
                    const checkIndex = userChecks.indexOf(id);
                    if (checkIndex > -1) {
                      const updatedUserChecks = Object.assign([], userChecks);
                      updatedUserChecks.splice(checkIndex, 1);
                      const updatedUserData = Object.assign({}, userData, {'checks': updatedUserChecks});
                      // Update checks in user object
                      _data.update("users", checkData.userPhone, updatedUserData, (error) => {
                        if (!error) {
                          callback(200, updatedUserData);
                        } else {
                          callback(500, {Error: "Could not update the user checks"});
                        }
                      });
                    } else {
                      callback(500, {Error: "Couldn't find the check in user object so, could't delete the check"});
                    }
                  } else {
                    callback(500, {Error:"Could not find the specified user who created the check, So could not remove the check from the list for user object"});
                  }
                });
              } else {
                callback(500, {Error: "Could not delete the specified token"});
              }
            });
          } else {
            callback(403, {Error: "Missing required token in headers or token is invalid"});
          }
        });
      } else {
        callback(400, {Error: "check id does not exist"});
      }
    });
  } else {
    callback(400, {Error: "Missing required field or invalid field"});
  }
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