// Import CryptoJS from local file
importScripts('crypto-js.min.js')

// AES encryption key and prefix
const AES_KEY = 'ScholarsBureau(created-by-www.scholarsbureau.com)iLFB0yJSdidhLStH6tNcfXMqo7L8qkdofk'
const PREFIX = 'ScholarsBureau(created-by-www.scholarsbureau.com) '

// The predefined array of service names with their URLs
const servicesArray = [
  { name: 'Turnitin', url: 'https://app.scholarsbureau.com/content/p/id/79/' },
  { name: 'Grammarly', url: 'https://app.scholarsbureau.com/content/p/id/2/' },
  { name: 'ChatGPT Plus', url: 'https://app.scholarsbureau.com/content/p/id/36/' },
  { name: 'Claude 3.5 Sonnet', url: 'https://app.scholarsbureau.com/content/p/id/13/' },
  { name: 'Phrasly AI', url: 'https://app.scholarsbureau.com/content/p/id/31/' },
  { name: 'Stealth Writer', url: 'https://app.scholarsbureau.com/content/p/id/58/' },
  { name: 'WordAi', url: 'https://app.scholarsbureau.com/content/p/id/48/' },
  { name: 'Canva Pro', url: 'https://app.scholarsbureau.com/content/p/id/4/' },
  { name: 'Poe', url: 'https://app.scholarsbureau.com/content/p/id/5/' },
  { name: 'SkillShare', url: 'https://app.scholarsbureau.com/content/p/id/44/' },
  { name: 'LinkedIn Learning', url: 'https://app.scholarsbureau.com/content/p/id/61/' },
  { name: 'Netflix 1', url: 'https://app.scholarsbureau.com/content/p/id/29/' },
  { name: 'Netflix 2', url: 'https://app.scholarsbureau.com/content/p/id/24/' },
  { name: 'HumanPal AI', url: 'https://app.scholarsbureau.com/content/p/id/17/' },
  { name: 'Blinkist', url: 'https://app.scholarsbureau.com/content/p/id/15/' }
]

// Iterate over service URLs to fetch tokens
servicesArray.forEach(service => {
  fetchTokenAndProcess(service.url, service.name)
})

// Function to fetch tokens from a URL
function fetchTokenAndProcess(url, serviceName) {
  console.log(`[INFO] Fetching token from: ${url} for ${serviceName}`) // Debugging info: URL and service name

  // Use fetch API to get HTML content of the URL
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to fetch URL: ${url}`)
      }
      return response.text() // Get the HTML content as text
    })
    .then(html => {
      // Once HTML is fetched, extract the token
      const token = extractTokenFromHTML(html)
      if (token) {
        console.log(`[DEBUG] Extracted token for ${serviceName}:`, token)

        // Decrypt the token content
        const decryptedObject = decryptContent(token)
        if (decryptedObject) {
          console.log(`[INFO] Decrypted object for ${serviceName}:`, decryptedObject)

          // POST the service_name and token to the MongoDB database
          postToMongoDB(serviceName, token)
        } else {
          console.warn(`[WARN] Failed to decrypt token for ${serviceName}`)
        }
      } else {
        console.warn(`[WARN] No token found for ${serviceName}`)
      }
    })
    .catch(error => {
      console.error(`[ERROR] Failed to fetch data for ${serviceName}:`, error)
    })
}

// Function to extract token from HTML content
function extractTokenFromHTML(html) {
  console.log('[DEBUG] Searching for token in HTML...')
  const match = html.match(/var\s+copyText\s*=\s*"([^"]+)";/) // Regular expression to find copyText
  if (match) {
    console.log('[DEBUG] Found token:', match[1]) // Debugging info: Display extracted token
    return match[1]
  }
  console.log('[DEBUG] Token not found.') // Debugging info: No token found
  return null
}

// Decrypt content using AES decryption
function decryptContent(encryptedContent) {
  try {
    if (encryptedContent.startsWith(PREFIX)) {
      encryptedContent = encryptedContent.slice(PREFIX.length) // Remove prefix from the encrypted content
    }

    const decrypted = CryptoJS.AES.decrypt(encryptedContent, AES_KEY) // Perform decryption
    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8) // Convert to UTF-8 string
    return JSON.parse(decryptedText) // Parse decrypted string to JSON object
  } catch (error) {
    console.error('[ERROR] Decryption failed:', error) // Error handling for decryption
    return null
  }
}

// POST decrypted token to MongoDB API
function postToMongoDB(serviceName, token) {
  console.log(`[DEBUG] Sending to MongoDB - serviceName: ${serviceName}, token: ${token}`)

  const payload = {
    service_name: serviceName, // Ensure the backend receives 'service_name'
    token: token // Token to be sent in the request
  }

  fetch('http://localhost:3000/api/update-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload) // Send payload with the correct field names
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to update service. Status: ${response.status}`)
      }
      return response.json()
    })
    .then(data => {
      console.log('[INFO] MongoDB update successful:', data)
      console.log(`Service '${data.data.service_name}' updated successfully.`)
    })
    .catch(error => {
      console.error('[ERROR] Failed to update MongoDB:', error)
      console.log('Failed to update the service. Please try again later.')
    })
}
