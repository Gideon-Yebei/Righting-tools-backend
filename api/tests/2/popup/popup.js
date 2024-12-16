document.getElementById("extract").addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});

    chrome.scripting.executeScript(
        {
            target: {tabId: tab.id},
            function: extractCopyText
        },
        (results) => {
            const output = document.getElementById("output");
            if (results && results[0] && results[0].result) {
                output.innerText = "Extracted content: " + results[0].result;
            } else {
                output.innerText = "No 'copyText' variable found.";
            }
        }
    );
});

// Function to run in the page context
function extractCopyText() {
    const scriptTags = document.querySelectorAll("script");
    let copyTextValue = null;

    scriptTags.forEach((script) => {
        const scriptContent = script.textContent || script.innerText;
        const match = scriptContent.match(/var\s+copyText\s*=\s*"([^"]+)";/);
        if (match && match[1]) {
            copyTextValue = match[1];
        }
    });

    return copyTextValue || null;
}
