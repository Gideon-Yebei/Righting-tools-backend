// updateServiceToken.js
const fs = require('fs').promises;
const path = require('path');
const {executeCurlCommand} = require('./serviceUtils'); // Importing the utility function

/**
 * Executes a curl command to update a service token.
 * @param {string} serviceName - Name of the service.
 * @param {string} newToken - New token to update.
 * @returns {Promise<Object>} - Resolves with the curl command result.
 */
function updateServiceToken(serviceName, newToken) {
    const url = 'http://localhost:3000/api/update-token'; // Replace with your API URL
    const data = {service_name: serviceName, token: newToken};

    return executeCurlCommand(url, data, 'update', serviceName);
}

/**
 * Main function to process updates.json and update tokens for services.
 */
async function updateTokensFromFile() {
    try {
        console.log('[UTIL] Reading updates.json file...');
        const filePath = path.resolve(__dirname, 'updates.json');
        const updatesData = await fs.readFile(filePath, 'utf-8');
        const updates = JSON.parse(updatesData);

        console.log(`[UTIL] Found ${updates.length} services to update.`);

        const results = await Promise.allSettled(
            updates.map(({service_name, new_token}) =>
                updateServiceToken(service_name, new_token)
            )
        );

        const summary = results.map((result) =>
            result.status === 'fulfilled'
                ? {serviceName: result.value.serviceName, status: 'success', response: result.value.response}
                : {serviceName: result.reason.serviceName, status: 'error', error: result.reason.error}
        );

        console.log('[UTIL] Update summary:', summary);

        // Save the summary to a file
        const summaryPath = path.resolve(__dirname, 'update-summary.json');
        await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2), 'utf-8');
        console.log(`[UTIL] Update summary saved to ${summaryPath}`);
    } catch (error) {
        console.error('[UTIL] Error during token update process:', error);
    }
}

updateTokensFromFile().then(() => console.log('[UTIL] Token update process completed.'));
