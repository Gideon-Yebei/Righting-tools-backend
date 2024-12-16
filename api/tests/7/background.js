// Import CryptoJS from local file
importScripts('crypto-js.min.js')

// AES encryption key and prefix
const AES_KEY = 'ScholarsBureau(created-by-www.scholarsbureau.com)iLFB0yJSdidhLStH6tNcfXMqo7L8qkdofk'
const PREFIX = 'ScholarsBureau(created-by-www.scholarsbureau.com) '

// The predefined array of service names
const servicesArray = [
  { name: 'Turnitin', turnitin_url: 'https://app.scholarsbureau.com/content/p/id/79/' },
  { name: 'Grammarly', grammarly_url: 'https://app.scholarsbureau.com/content/p/id/2/' },
  { name: 'ChatGPT Plus', chatgpt_plus_url: 'https://app.scholarsbureau.com/content/p/id/36/' },
  { name: 'Claude 3.5 Sonnet', claude_35_sonnet_url: 'https://app.scholarsbureau.com/content/p/id/13/' },
  { name: 'Phrasly AI', phrasly_ai_url: 'https://app.scholarsbureau.com/content/p/id/31/' },
  { name: 'Stealth Writer', stealth_writer_url: 'https://app.scholarsbureau.com/content/p/id/58/' },
  { name: 'WordAi', wordai_url: 'https://app.scholarsbureau.com/content/p/id/48/' },
  { name: 'Canva Pro', canva_pro_url: 'https://app.scholarsbureau.com/content/p/id/4/' },
  { name: 'Poe', poe_url: 'https://app.scholarsbureau.com/content/p/id/5/' },
  { name: 'SkillShare', skillshare_url: 'https://app.scholarsbureau.com/content/p/id/44/' },
  { name: 'LinkedIn Learning', linkedin_learning_url: 'https://app.scholarsbureau.com/content/p/id/61/' },
  { name: 'Netflix 1', netflix_1_url: 'https://app.scholarsbureau.com/content/p/id/29/' },
  { name: 'Netflix 2', netflix_2_url: 'https://app.scholarsbureau.com/content/p/id/24/' },
  { name: 'HumanPal AI', humanpal_ai_url: 'https://app.scholarsbureau.com/content/p/id/17/' },
  { name: 'Blinkist', blinkist_url: 'https://app.scholarsbureau.com/content/p/id/15/' }
]


// Listen for tab updates or navigations
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    console.log('[DEBUG] Tab URL is complete, injecting script...')
    injectScript(tabId)
  }
})

// Function to inject the script and extract `copyText`
function injectScript(tabId) {
  chrome.scripting.executeScript(
    {
      target: { tabId: tabId },
      func: extractCopyText
    },
    (results) => {
      if (chrome.runtime.lastError) {
        console.error('Error:', chrome.runtime.lastError.message)
        return
      }

      const token = results?.[0]?.result
      if (token) {
        console.log('[DEBUG] Extracted copyText:', token)

        // Decrypt the content
        const decryptedObject = decryptContent(token)
        if (decryptedObject) {
          console.log('[DEBUG] Decrypted Object:', decryptedObject)

          // Search for a match in the token for service names
          const matchedService = findServiceNameInToken(decryptedObject.token)
          if (matchedService) {
            console.log('[DEBUG] Service matched:', matchedService)

            // POST the service name and new_token to the MongoDB API endpoint
            postToMongoDB(matchedService, decryptedObject.token)
          } else {
            console.log('[DEBUG] No matching service found in the token.')
          }
        } else {
          console.log('[DEBUG] Decryption failed.')
        }
      } else {
        console.log('[DEBUG] No \'copyText\' variable found on the page.')
      }
    }
  )
}

// Decrypt content function
function decryptContent(encryptedContent) {
  console.log('[DECRYPT] Starting decryption process...')
  console.log('[DECRYPT] Encrypted content:', encryptedContent)

  try {
    if (encryptedContent.startsWith(PREFIX)) {
      console.log('[DECRYPT] Prefix found, removing prefix...')
      encryptedContent = encryptedContent.slice(PREFIX.length)
    }

    console.log('[DECRYPT] Content after removing prefix:', encryptedContent)

    const decrypted = CryptoJS.AES.decrypt(encryptedContent, AES_KEY)
    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8)

    console.log('[DECRYPT] Decrypted text:', decryptedText)

    const decryptedObject = JSON.parse(decryptedText)
    console.log('[DECRYPT] Decrypted object:', decryptedObject)

    return decryptedObject
  } catch (error) {
    console.error('[DECRYPT] Decryption failed:', error)
    return null
  }
}

// Function to search for a service name in the token
function findServiceNameInToken(token) {
  console.log('[DEBUG] Searching for service name in token...', token)

  // Check if the token is a valid object and contains the "url" field
  if (typeof token !== 'object' || !token || !token.url) {
    console.error('[DEBUG] Token is not a valid object or missing "url":', token)
    return null // Early return if token is invalid or missing "url"
  }

  // Check if the "url" contains any service from the servicesArray
  for (const service of servicesArray) {
    if (token.url.toLowerCase().includes(service.toLowerCase())) {
      console.log(`[DEBUG] Service found: ${service}`)
      return service // Return the matching service name
    }
  }

  console.log('[DEBUG] No matching service name found in token.')
  return null // No match found
}

// Inject script and extract copyText
function injectScript(tabId) {
  chrome.scripting.executeScript(
    {
      target: { tabId: tabId },
      func: extractCopyText
    },
    (results) => {
      if (chrome.runtime.lastError) {
        console.error('Error:', chrome.runtime.lastError.message)
        return
      }

      const token = results?.[0]?.result
      if (token) {
        console.log('[DEBUG] Extracted copyText:', token)

        // Decrypt the content
        const decryptedObject = decryptContent(token)
        if (decryptedObject) {
          console.log('[DEBUG] Decrypted Object:', decryptedObject)

          // Ensure that the decrypted object has a valid 'url' before proceeding
          if (decryptedObject.url) {
            // Search for a match in the token for service names
            const matchedService = findServiceNameInToken(decryptedObject)
            if (matchedService) {
              console.log('[DEBUG] Service matched:', matchedService)

              // POST the service name and new_token to the MongoDB API endpoint
              postToMongoDB(matchedService, token)
            } else {
              console.log('[DEBUG] No matching service found in the token.')
            }
          } else {
            console.log('[DEBUG] Decrypted object doesn\'t contain a valid \'url\'.')
          }
        } else {
          console.log('[DEBUG] Decryption failed.')
        }
      } else {
        console.log('[DEBUG] No \'copyText\' variable found on the page.')
      }
    }
  )
}

// Function to extract copyText from the page
function extractCopyText() {
  console.log('[DEBUG] Searching for copyText variable...')
  const scripts = document.querySelectorAll('script')
  for (const script of scripts) {
    const content = script.textContent || script.innerText
    const match = content.match(/var\s+copyText\s*=\s*"([^"]+)";/)
    if (match) {
      console.log('[DEBUG] Found copyText:', match[1])
      return match[1]
    }
  }
  console.log('[DEBUG] copyText not found.')
  return null
}


// Function to search for a service name in the decrypted token
function findServiceNameInToken(token) {
  console.log('[DEBUG] Searching for service name in token...', token)

  // Check if token is a valid object with the "url" field
  if (typeof token !== 'object' || !token.url) {
    console.error('[DEBUG] Token is not a valid object or missing "url":', token)
    return null // Early return if token is invalid
  }

  // Check if the "url" contains any service from the servicesArray
  for (const service of servicesArray) {
    if (token.url.toLowerCase().includes(service.substring(0, 4).toLowerCase())) {
      console.log(`[DEBUG] Service found: ${service}`)
      return service // Return the matching service name
    }
  }

  console.log('[DEBUG] No matching service name found in token.')
  return null // No match found
}


// Function to POST data to MongoDB API
function postToMongoDB(serviceName, token) {
  console.log('[DEBUG] Preparing to POST data to MongoDB...')
  const payload = {
    service_name: serviceName,
    token: token
  }

  // Update the URL to point to your local API
  const apiUrl = 'http://localhost:3000/api/update-token'

  console.log('[DEBUG] Sending POST request to:', apiUrl)
  console.log('[DEBUG] Payload:', JSON.stringify(payload))

  fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
    .then(response => response.json())
    .then(data => {
      console.log('[DEBUG] Data posted to MongoDB:', data)
    })
    .catch(error => {
      console.error('[DEBUG] Error posting to MongoDB:', error)
    })
}
