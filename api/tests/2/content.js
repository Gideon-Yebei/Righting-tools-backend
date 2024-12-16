// Extract the copyText variable from the current page
(function () {
    // Find all script tags in the document
    const scriptTags = document.querySelectorAll('script');
    let copyTextValue = null;

    scriptTags.forEach((script) => {
        const scriptContent = script.textContent || script.innerText;

        // Match the 'copyText' variable and extract its value
        const match = scriptContent.match(/var\s+copyText\s*=\s*"([^"]+)";/);
        if (match && match[1]) {
            copyTextValue = match[1];
        }
    });

    if (copyTextValue) {
        console.log("Extracted copyText content:", copyTextValue);

        // Send the result back to the popup or display it
        chrome.runtime.sendMessage({type: "copyText", value: copyTextValue});
        alert("Extracted content: " + copyTextValue);
    } else {
        console.error("copyText variable not found.");
        alert("No 'copyText' variable found on this page.");
    }
})();
