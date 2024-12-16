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
  console.log(`[INFO] Fetching token from: ${url}`)
  chrome.tabs.create({ url, active: false }, (tab) => {
    chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
      if (tabId === tab.id && changeInfo.status === 'complete') {
        chrome.scripting.executeScript(
          {
            target: { tabId },
            func: extractCopyText
          },
          (results) => {
            if (chrome.runtime.lastError) {
              console.error(`[ERROR] Script injection failed for ${serviceName}:`, chrome.runtime.lastError.message)
              return
            }

            const token = results?.[0]?.result
            if (token) {
              console.log(`[DEBUG] Extracted token for ${serviceName}:`, token)

              const decryptedObject = decryptContent(token)
              if (decryptedObject) {
                console.log(`[INFO] Decrypted object for ${serviceName}:`, decryptedObject)

                // POST token to the database
                postToMongoDB(serviceName, decryptedObject.token)
              } else {
                console.warn(`[WARN] Failed to decrypt token for ${serviceName}`)
              }
            } else {
              console.warn(`[WARN] No token found on the page for ${serviceName}`)
            }
          }
        )
        chrome.tabs.onUpdated.removeListener(listener)
        chrome.tabs.remove(tabId)
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
    const match = content.match(/var\s+copyText\s*=\s*"([^"]+)";/)
    if (match) {
      console.log('[DEBUG] Found copyText:', match[1])
      return match[1]
    }
  }
  console.log('[DEBUG] copyText not found.')
  return null
}

// Decrypt content
function decryptContent(encryptedContent) {
  try {
    if (encryptedContent.startsWith(PREFIX)) {
      encryptedContent = encryptedContent.slice(PREFIX.length)
    }

    const decrypted = CryptoJS.AES.decrypt(encryptedContent, AES_KEY)
    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8)
    return JSON.parse(decryptedText)
  } catch (error) {
    console.error('[ERROR] Decryption failed:', error)
    return null
  }
}

// POST data to MongoDB API
function postToMongoDB(serviceName, token) {
  console.log(`[INFO] Sending data to MongoDB for ${serviceName}`)
  fetch('http://localhost:3000/api/update-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ service: serviceName, token })
  })
    .then(response => response.json())
    .then(data => console.log('[INFO] Successfully updated MongoDB:', data))
    .catch(error => console.error('[ERROR] Failed to update MongoDB:', error))
}
