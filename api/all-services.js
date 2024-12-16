import {getAllServicesWithDetails} from './db';
import {decryptContent} from './decrypt'; // Ensure this function works as expected

/**
 * Serverless function to get all services and return the formatted data.
 * @param {import('@vercel/node').VercelRequest} req - The incoming HTTP request.
 * @param {import('@vercel/node').VercelResponse} res - The outgoing HTTP response.
 */
export default async function handler(req, res) {
    console.log('Request method:', req.method);

    if (req.method !== 'GET') {
        console.log('Method not allowed:', req.method);
        return res.status(405).json({error: 'Method Not Allowed'});
    }

    try {
        console.log('Fetching all services from the database...');
        const rows = await getAllServicesWithDetails();
        console.log('Database rows fetched:', rows);

        const servicesWithFormattedData = rows.map((row) => {
            const service = {
                service_name: row.service_name,
                service_desc: row.service_desc,
                service_url: null,
                cookies: [],
            };

            try {
                const decryptedToken = decryptContent(row.token);

                if (decryptedToken) {
                    console.log(`Decrypted token for ${row.service_name}:`, decryptedToken);

                    // Validate and assign the decrypted URL
                    if (decryptedToken.url) {
                        service.service_url = decryptedToken.url;
                    } else {
                        console.warn(`No URL found in decrypted token for ${row.service_name}`);
                    }

                    // Validate cookies
                    if (Array.isArray(decryptedToken.cookies)) {
                        service.cookies = decryptedToken.cookies.filter((cookie) => {
                            return (
                                cookie &&
                                typeof cookie === 'object' &&
                                cookie.name &&
                                cookie.value
                            );
                        });
                    }
                } else {
                    console.warn(`Decryption failed for service: ${row.service_name}`);
                }
            } catch (decryptionError) {
                console.error(`Error decrypting token for ${row.service_name}:`, decryptionError);
            }

            return service;
        });

        console.log('Formatted services:', servicesWithFormattedData);

        // Sanity check: Ensure all services have proper URLs and cookies
        const validatedServices = servicesWithFormattedData.map((service) => {
            if (!service.service_url) {
                console.warn(`Service ${service.service_name} is missing a URL.`);
            }

            if (service.cookies.length === 0) {
                console.info(`Service ${service.service_name} has no cookies.`);
            }

            return service;
        });

        res.status(200).json(validatedServices);
    } catch (error) {
        console.error('Error in handler:', error);
        res.status(500).json({error: 'Internal server error'});
    }
}
