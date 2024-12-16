// insertService.js
const fs = require('fs').promises;
const path = require('path');
const {executeCurlCommand} = require('./serviceUtils'); // Importing the utility function

/**
 * Executes a curl command to insert a new service.
 * @param {string} serviceName - Name of the service.
 * @param {string} token - Initial token for the service.
 * @param {string} serviceDesc - Description of the service.
 * @returns {Promise<Object>} - Resolves with the curl command result.
 */
function insertService(serviceName, token, serviceDesc) {
    const url = 'http://localhost:3000/api/insert-service'; // Replace with your API URL
    const data = {service_name: serviceName, token, service_desc: serviceDesc};

    return executeCurlCommand(url, data, 'insert', serviceName);
}

/**
 * Main function to process services.json and insert services.
 */
async function insertServicesFromFile() {
    try {
        console.log('[UTIL] Reading services.json file...');
        const filePath = path.resolve(__dirname, 'services.json');
        const servicesData = await fs.readFile(filePath, 'utf-8');
        const services = JSON.parse(servicesData);

        console.log(`[UTIL] Found ${services.length} services to insert.`);

        const results = await Promise.allSettled(
            services.map(({service_name, token, service_desc}) =>
                insertService(service_name, token, service_desc)
            )
        );

        const summary = results.map((result) =>
            result.status === 'fulfilled'
                ? {serviceName: result.value.serviceName, status: 'success', response: result.value.response}
                : {serviceName: result.reason.serviceName, status: 'error', error: result.reason.error}
        );

        console.log('[UTIL] Insert summary:', summary);

        // Save the summary to a file
        const summaryPath = path.resolve(__dirname, 'insert-summary.json');
        await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2), 'utf-8');
        console.log(`[UTIL] Insert summary saved to ${summaryPath}`);
    } catch (error) {
        console.error('[UTIL] Error during service insert process:', error);
    }
}

insertServicesFromFile().then(() => console.log('[UTIL] Service insert process completed.'));
