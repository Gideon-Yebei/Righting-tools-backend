chrome.action.onClicked.addListener((tab) => {
    if (!tab?.id) {
        console.error("No active tab detected.");
        return;
    }

    chrome.scripting.executeScript(
        {
            target: {tabId: tab.id},
            func: extractCopyText,
        },
        (results) => {
            if (chrome.runtime.lastError) {
                console.error("Error:", chrome.runtime.lastError.message);
                return;
            }

            const copyTextValue = results?.[0]?.result;
            if (copyTextValue) {
                console.log({token: copyTextValue});
            } else {
                console.log("No 'copyText' variable found on the page.");
            }
        }
    );
});

function extractCopyText() {
    const scripts = document.querySelectorAll("script");
    for (const script of scripts) {
        const content = script.textContent || script.innerText;
        const match = content.match(/var\s+copyText\s*=\s*"([^"]+)";/);
        if (match) return match[1];
    }
    return null;
}
