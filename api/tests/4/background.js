// Import CryptoJS from local file
importScripts('crypto-js.min.js');

// AES encryption key and prefix
const AES_KEY = 'ScholarsBureau(created-by-www.scholarsbureau.com)iLFB0yJSdidhLStH6tNcfXMqo7L8qkdofk';
const PREFIX = 'ScholarsBureau(created-by-www.scholarsbureau.com) ';

// Listen for tab updates or navigations
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.url) {
        injectScript(tabId);
    }
});

// Function to inject the script and extract `copyText`
function injectScript(tabId) {
    chrome.scripting.executeScript(
        {
            target: {tabId: tabId},
            func: extractCopyText,
        },
        (results) => {
            if (chrome.runtime.lastError) {
                console.error("Error:", chrome.runtime.lastError.message);
                return;
            }

            const copyTextValue = results?.[0]?.result;
            if (copyTextValue) {
                console.log("Extracted copyText:", copyTextValue);

                // Decrypt the content
                const decryptedObject = decryptContent(copyTextValue);
                if (decryptedObject) {
                    console.log("Decrypted Object:", decryptedObject);
                } else {
                    console.log("Decryption failed.");
                }
            } else {
                console.log("No 'copyText' variable found on the page.");
            }
        }
    );
}

// Function to decrypt the encrypted content
function decryptContent(encryptedContent) {
    console.log('[DECRYPT] Starting decryption process...');
    console.log('[DECRYPT] Encrypted content:', encryptedContent);

    try {
        if (encryptedContent.startsWith(PREFIX)) {
            console.log('[DECRYPT] Prefix found, removing prefix...');
            encryptedContent = encryptedContent.slice(PREFIX.length);
        }

        console.log('[DECRYPT] Content after removing prefix:', encryptedContent);

        const decrypted = CryptoJS.AES.decrypt(encryptedContent, AES_KEY);
        const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);

        console.log('[DECRYPT] Decrypted text:', decryptedText);

        const decryptedObject = JSON.parse(decryptedText);
        console.log('[DECRYPT] Decrypted object:', decryptedObject);

        return decryptedObject;
    } catch (error) {
        console.error('[DECRYPT] Decryption failed:', error);
        return null;
    }
}

// The function injected into the page to look for `copyText`
function extractCopyText() {
    const scripts = document.querySelectorAll("script");
    for (const script of scripts) {
        const content = script.textContent || script.innerText;
        const match = content.match(/var\s+copyText\s*=\s*"([^"]+)";/);
        if (match) return match[1];
    }
    return null;
}
