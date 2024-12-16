import {getAllServices} from './db.js';

/**
 * Main function to handle retrieval of premium tools.
 * @param {import('@vercel/node').VercelRequest} req - The incoming HTTP request.
 * @param {import('@vercel/node').VercelResponse} res - The outgoing HTTP response.
 */
export default async function handler(req, res) {
    console.log('[API] Request method:', req.method);

    if (req.method !== 'GET') {
        console.log('[API] Method not allowed:', req.method);
        return res.status(405).json({message: 'Only GET requests are allowed'});
    }

    try {
        // Retrieve all services
        console.log('[API] Retrieving all services...');
        const services = await getAllServices();

        console.log('[API] Retrieved services:', services);

        // Send success response
        return res.status(200).json({
            message: 'Services retrieved successfully',
            data: services,
        });

    } catch (error) {
        console.error('[API] Error handling request:', error);
        return res.status(500).json({message: 'Internal server error'});
    }
}
