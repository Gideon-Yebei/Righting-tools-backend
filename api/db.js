import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config()

// Ensure DATABASE_URL is defined in environment variables
const { DATABASE_URL } = process.env

if (!DATABASE_URL) {
  throw new Error('[DB] DATABASE_URL is not defined in the environment variables')
}

// Global database connection variables to avoid reconnecting repeatedly
let db = null
let collection = null

/**
 * Connect to MongoDB and initialize the database and collection.
 * This function is idempotent, meaning it will only attempt to connect if not already connected.
 * @returns {Promise<void>} - Resolves once the connection is established.
 */
async function connectToDatabase() {
  if (db) return db // Return existing connection if already established

  try {
    console.log('[DB] Attempting to connect to MongoDB...')

    // MongoClient connection options
    const client = await MongoClient.connect(DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })

    console.log('[DB] Successfully connected to MongoDB.')

    db = client.db('scholars') // Initialize database instance
    collection = db.collection('premium_tools') // Initialize collection instance
    return db
  } catch (error) {
    console.error('[DB] Failed to connect to MongoDB:', error)
    throw new Error('[DB] Connection failed. Please check your DATABASE_URL and MongoDB instance.')
  }
}

/**
 * Insert a new service into the 'premium_tools' collection, ensuring no duplicates.
 * @param {Object} serviceData - The service data to insert.
 * @returns {Promise<Object>} - Resolves with the result of the insert operation.
 * @throws {Error} - Throws an error if insertion fails or if a duplicate service is found.
 */
async function insertService(serviceData) {
  try {
    await connectToDatabase() // Ensure DB connection is established

    console.log('[DB] Inserting service:', serviceData)

    // Check if a service with the same name already exists
    const existingService = await collection.findOne({
      service_name: serviceData.service_name
    })

    if (existingService) {
      console.log('[DB] Duplicate service found with the name:', serviceData.service_name)
      throw new Error(`[DB] Service with the name "${serviceData.service_name}" already exists.`)
    }

    // Insert new service into the collection
    const result = await collection.insertOne(serviceData)
    console.log('[DB] Service inserted successfully. Insert result:', result)
    return result
  } catch (error) {
    console.error('[DB] Error inserting service:', error.message)
    throw new Error(`[DB] Error inserting service: ${error.message}`)
  }
}

/**
 * Update the service data for a specific service by its name.
 * @param {string} serviceName - The name of the service to update.
 * @param {Object} updatedData - The updated data for the service.
 * @returns {Promise<Object>} - Resolves with the result of the update operation.
 * @throws {Error} - Throws an error if the update fails.
 */
async function updateToken(serviceName, updatedData) {
  try {
    await connectToDatabase() // Ensure DB connection is established

    console.log('[DB] Updating service with name:', serviceName, 'and data:', updatedData)

    // Update service by its name
    const result = await collection.updateOne(
      { service_name: serviceName },
      { $set: updatedData }
    )

    if (result.matchedCount === 0) {
      throw new Error(`[DB] Service with name "${serviceName}" not found for update.`)
    }

    console.log('[DB] Service updated successfully. Update result:', result)
    return result
  } catch (error) {
    console.error('[DB] Error updating service:', error.message)
    throw new Error(`[DB] Error updating service: ${error.message}`)
  }
}

/**
 * Retrieve all services from the 'premium_tools' collection.
 * @returns {Promise<Array>} - Resolves with an array of service documents.
 * @throws {Error} - Throws an error if fetching fails.
 */
async function getAllServices() {
  try {
    await connectToDatabase() // Ensure DB connection is established

    console.log('[DB] Fetching all services from the collection...')

    const services = await collection.find({}).toArray()

    if (services.length === 0) {
      console.warn('[DB] No services found in the collection.')
    } else {
      console.log('[DB] Fetched services:', services)
    }

    return services
  } catch (error) {
    console.error('[DB] Error fetching services:', error.message)
    throw new Error('[DB] Failed to retrieve services from the database.')
  }
}

// Export the database interaction functions
export {
  getAllServices,
  insertService,
  updateToken
}
