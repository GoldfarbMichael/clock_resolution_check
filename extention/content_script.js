

window.addEventListener("message", (event) => {
    if (event.source !== window)
        return;

    if (event.data.type && event.data.type === "SITE_NAME_UPDATE") {
        chrome.runtime.sendMessage({ siteName: event.data.siteName });
    }
});