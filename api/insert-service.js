import {insertService} from './db.js';
import {decryptContent} from './decrypt.js';

/**
 * Main function to handle the insertion of service data.
 * @param {import('@vercel/node').VercelRequest} req - The incoming HTTP request.
 * @param {import('@vercel/node').VercelResponse} res - The outgoing HTTP response.
 */
export default async function handler(req, res) {
    console.log('[API] Request method:', req.method);

    if (req.method !== 'POST') {
        console.log('[API] Method not allowed:', req.method);
        return res.status(405).json({message: 'Only POST requests are allowed'});
    }

    const {service_name, service_desc, token} = req.body;
    console.log('[API] Request body:', req.body);

    if (!service_name || !service_desc || !token) {
        console.log('[API] Missing required fields:', {service_name, service_desc, token});
        return res.status(400).json({message: 'Service name, description, and token are required'});
    }

    try {
        console.log('[API] Decrypting token...');
        const decryptedData = decryptContent(token);

        if (!decryptedData || !decryptedData.cookies || !decryptedData.url) {
            console.log('[API] Invalid token data:', decryptedData);
            return res.status(400).json({message: 'Invalid token data'});
        }

        const {cookies, url} = decryptedData;

        const serviceData = {
            service_name,
            service_desc,
            service_url: url,
            cookies,
        };

        console.log('[API] Service data to insert:', serviceData);

        const result = await insertService(serviceData);
        console.log('[API] Insert result:', result);

        return res.status(200).json({
            message: 'Service inserted successfully',
            data: {id: result.insertedId, ...serviceData},
        });
    } catch (error) {
        if (error.message.includes('already exists')) {
            console.error('[API] Duplicate error:', error);
            return res.status(409).json({message: 'Service with the same name already exists'});
        }

        console.error('[API] Error handling request:', error);
        return res.status(500).json({message: 'Internal server error'});
    }
}
