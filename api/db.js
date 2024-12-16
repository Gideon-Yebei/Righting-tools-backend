import {MongoClient} from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

// Database connection string from `.env`
const DEV_URL = process.env.DEV_URL;

// check if the connection string is defined
if (!DEV_URL) {
    throw new Error('[DB] DEV_URL is not defined in the environment variables');
}

/**
 * Connect to MongoDB and return the database instance.
 * @returns {Promise} - Resolves to the database instance.
 */
async function connectToDatabase() {
    try {
        console.log('[DB] Connecting to the database...');
        const client = await MongoClient.connect(DEV_URL, {useNewUrlParser: true, useUnifiedTopology: true});
        console.log('[DB] Successfully connected to the database.');
        return client.db(); // Returns the `scholars` database
    } catch (error) {
        console.error('[DB] Database connection error:', error);
        throw new Error('Failed to connect to the database');
    }
}

/**
 * Insert a new service into the 'premium_tools' collection, ensuring no duplicates.
 * @param {Object} serviceData - The service data to insert.
 * @returns {Promise} - Resolves to the result of the insert operation.
 */
async function insertService(serviceData) {
    console.log('[DB] Inserting service data:', serviceData);
    try {
        const db = await connectToDatabase();
        const collection = db.collection('premium_tools');

        // Check for existing service with the same `service_name`
        const existingService = await collection.findOne({service_name: serviceData.service_name});
        if (existingService) {
            console.log('[DB] Duplicate service found:', existingService);
            throw new Error('Service with the same name already exists');
        }

        // Insert the new service
        const result = await collection.insertOne(serviceData);
        console.log('[DB] Insert result:', result);
        return result;
    } catch (error) {
        console.error('[DB] Error inserting service:', error);
        throw error; // Let the calling code handle the error
    }
}

/**
 * Update the service data for a specific service.
 * @param {string} serviceName - The name of the service to update.
 * @param {Object} updatedData - The data to update (e.g., service_url, cookies).
 * @returns {Promise<Object>} - Result of the update operation.
 */
async function updateToken(serviceName, updatedData) {
    try {
        console.log('[DB] Updating service:', serviceName, 'with data:', updatedData);
        const db = await connectToDatabase();
        const collection = db.collection('premium_tools');

        const result = await collection.updateOne(
            {service_name: serviceName},
            {$set: updatedData}
        );

        console.log('[DB] Update result:', result);
        return result;
    } catch (error) {
        console.error('[DB] Error updating service:', error);
        throw error;
    }
}

/**
 * Retrieve all services from the 'premium_tools' collection.
 * @returns {Promise<Array>} - Resolves to an array of service documents.
 */
async function getAllServices() {
    try {
        console.log('[DB] Fetching all services from the database...');
        const db = await connectToDatabase();
        const services = await db.collection('premium_tools').find({}).toArray(); // Fetch all documents
        console.log('[DB] Fetched services:', services);
        return services;
    } catch (error) {
        console.error('[DB] Error fetching services:', error);
        throw new Error('Failed to retrieve services');
    }
}

// Export the database interaction functions
export {
    getAllServices,
    insertService,
    updateToken
};
