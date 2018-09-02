/*
 * Create and export configuration variable
 *
 */

// Container for all the environments
const environments = {};

// staging (default) environment
environments.staging = {
  httpPort: 3000,
  httpsPort: 3001,
  envName: 'staging',
  hashingSecret: 'thisIsASecret',
  maxChecksLimit: 5
};

// Production environment
environments.production = {
  httpPort: 5000,
  httpsPort: 5001,
  envName: 'production',
  hashingSecret: 'thisIsAlsoASecret',
  maxChecksLimit: 5
};

// Determine which environment was passed as command-line argument
const currentEnv = typeof (process.env.NODE_ENV) === 'string' ? process.env.NODE_ENV.toLowerCase() : '';


// Check that the current environment is one of the environments above, if not, default to staging
const environmentToExport = typeof (environments[currentEnv]) === 'object' ? environments[currentEnv] : environments.staging;

// Export the module
module.exports = environmentToExport;
