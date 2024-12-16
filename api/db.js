import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config()

// Ensure DATABASE_URL is defined in environment variables
const { DATABASE_URL } = process.env

if (!DATABASE_URL) {
  throw new Error('[DB] DATABASE_URL is not defined in the environment variables')
}

// Global database connection variable to avoid reconnecting repeatedly
let db = null
let collection = null

/**
 * Connect to MongoDB and initialize database and collection.
 * @returns {Promise<void>} - Resolves once the connection is established.
 */
async function connectToDatabase() {
  if (db) return db // If already connected, return existing db instance

  try {
    console.log('[DB] Connecting to MongoDB...')

    const client = await MongoClient.connect(DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })

    console.log('[DB] Successfully connected to MongoDB.')
    db = client.db('scholars') // Initialize the db instance
    collection = db.collection('premium_tools') // Initialize the collection
    return db
  } catch (error) {
    console.error('[DB] Connection error:', error.message)
    throw new Error('Failed to connect to the database')
  }
}

/**
 * Insert a new service into the 'premium_tools' collection, ensuring no duplicates.
 * @param {Object} serviceData - The service data to insert.
 * @returns {Promise} - Resolves to the result of the insert operation.
 */
async function insertService(serviceData) {
  try {
    await connectToDatabase() // Ensure DB connection is established

    console.log('[DB] Inserting service data:', serviceData)

    // Check if the service already exists by 'service_name'
    const existingService = await collection.findOne({
      service_name: serviceData.service_name
    })

    if (existingService) {
      console.log('[DB] Duplicate service found:', existingService)
      throw new Error('Service with the same name already exists')
    }

    // Insert new service into the collection
    const result = await collection.insertOne(serviceData)
    console.log('[DB] Insert result:', result)
    return result
  } catch (error) {
    console.error('[DB] Error inserting service:', error.message)
    throw error // Let the calling code handle the error
  }
}

/**
 * Update the service data for a specific service by its name.
 * @param {string} serviceName - The name of the service to update.
 * @param {Object} updatedData - The updated data for the service.
 * @returns {Promise<Object>} - Resolves to the result of the update operation.
 */
async function updateToken(serviceName, updatedData) {
  try {
    await connectToDatabase() // Ensure DB connection is established

    console.log('[DB] Updating service:', serviceName, 'with data:', updatedData)

    // Update service by its name
    const result = await collection.updateOne(
      { service_name: serviceName },
      { $set: updatedData }
    )

    console.log('[DB] Update result:', result)
    return result
  } catch (error) {
    console.error('[DB] Error updating service:', error.message)
    throw error
  }
}

/**
 * Retrieve all services from the 'premium_tools' collection.
 * @returns {Promise<Array>} - Resolves to an array of service documents.
 */
async function getAllServices() {
  try {
    await connectToDatabase() // Ensure DB connection is established

    console.log('[DB] Fetching all services...')
    const services = await collection.find({}).toArray()
    console.log('[DB] Fetched services:', services)
    return services
  } catch (error) {
    console.error('[DB] Error fetching services:', error.message)
    throw new Error('Failed to retrieve services')
  }
}

// Export the database interaction functions
export {
  getAllServices,
  insertService,
  updateToken
}
