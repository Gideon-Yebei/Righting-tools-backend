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
  fetchTokenAndProcess(service.url, service.name) // Pass the service name explicitly here
})

// Function to fetch tokens from a URL
function fetchTokenAndProcess(url, serviceName) {
  console.log(`[INFO] Fetching token from: ${url} for ${serviceName}`) // Debugging info: URL and service name

  // Open the service URL in the background and extract the token
  chrome.tabs.create({ url, active: false }, (tab) => {
    chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
      // Once the tab is fully loaded, inject the script to extract the token
      if (tabId === tab.id && changeInfo.status === 'complete') {
        chrome.scripting.executeScript(
          {
            target: { tabId },
            func: extractCopyText // Function to extract the token from page content
          },
          (results) => {
            if (chrome.runtime.lastError) {
              console.error(`[ERROR] Script injection failed for ${serviceName}:`, chrome.runtime.lastError.message)
              return
            }

            // Extracted token from the page
            const token = results?.[0]?.result
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
              console.warn(`[WARN] No token found on the page for ${serviceName}`)
            }
          }
        )

        // Wait a bit before removing the tab to ensure script execution is done
        setTimeout(() => chrome.tabs.remove(tabId), 1000) // Delay tab removal
        chrome.tabs.onUpdated.removeListener(listener) // Remove listener to prevent duplicate execution
      }
    })
  })
}


// Extract copyText from page scripts
function extractCopyText() {
  console.log('[DEBUG] Searching for copyText variable...')
  const scripts = document.querySelectorAll('script')
  for (const script of scripts) {
    const content = script.textContent || script.innerText
    const match = content.match(/var\s+copyText\s*=\s*"([^"]+)";/) // Regular expression to find copyText
    if (match) {
      console.log('[DEBUG] Found copyText:', match[1]) // Debugging info: Display extracted copyText
      return match[1]
    }
  }
  console.log('[DEBUG] copyText not found.') // Debugging info: No copyText found
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
  // Log to verify serviceName and token before sending
  console.log(`[DEBUG] Sending to MongoDB - serviceName: ${serviceName}, token: ${token}`)

  // // Check if serviceName or token is missing
  // if (!serviceName || !token) {
  //   console.error('[ERROR] Missing serviceName or token in postToMongoDB.')
  //   return;
  // }

  // Prepare the payload with correct field names
  const payload = {
    service_name: serviceName, // Ensure the backend receives 'service_name'
    token: token // Token to be sent in the request
  }

  // Make the POST request
  fetch('http://localhost:3000/api/update-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload) // Send payload with the correct field names
  })
    .then(response => {
      // Check if the response is ok (status code 200-299)
      if (!response.ok) {
        throw new Error(`Failed to update service. Status: ${response.status}`)
      }
      return response.json() // Parse the JSON response
    })
    .then(data => {
      // Handle the success response
      console.log('[INFO] MongoDB update successful:', data)

      // Optionally, display a success message to the user
      console.log(`Service '${data.data.service_name}' updated successfully.`)
    })
    .catch(error => {
      // Handle the error response or network issues
      console.error('[ERROR] Failed to update MongoDB:', error)

      // Optionally, display an error message to the user
      console.log('Failed to update the service. Please try again later.')
    })
}
