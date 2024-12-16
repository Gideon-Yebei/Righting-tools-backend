// serviceUtils.js
const {exec} = require('child_process');

/**
 * Executes a curl command to interact with the API (insert/update service).
 * @param {string} url - The API URL.
 * @param {object} data - The data to send in the request.
 * @param {string} action - The action being performed ('insert' or 'update').
 * @param {string} serviceName - The name of the service.
 * @returns {Promise<Object>} - Resolves with the curl command result.
 */
function executeCurlCommand(url, data, action, serviceName) {
    const curlCommand = `curl -X POST -H "Content-Type: application/json" -d '${JSON.stringify(data)}' ${url}`;
    console.log(`[UTIL] Executing curl command for ${action}: ${curlCommand}`);

    return new Promise((resolve, reject) => {
        exec(curlCommand, (error, stdout, stderr) => {
            if (error) {
                console.error(`[UTIL] Error executing curl for ${serviceName}:`, error.message);
                return reject({serviceName, error: error.message});
            }
            if (stderr) {
                console.error(`[UTIL] Curl stderr for ${serviceName}:`, stderr);
                return reject({serviceName, error: stderr});
            }
            console.log(`[UTIL] Curl result for ${serviceName}:`, stdout);
            resolve({serviceName, response: stdout});
        });
    });
}

module.exports = {executeCurlCommand};
