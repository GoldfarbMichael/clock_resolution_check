// Triggered when extension is installed or started
chrome.runtime.onInstalled.addListener(() => {
    ensureOffscreenDocument();
});

// This guarantees offscreen document exists
async function ensureOffscreenDocument() {
    const exists = await chrome.offscreen.hasDocument();
    if (!exists) {
        await chrome.offscreen.createDocument({
            url: "offscreen.html",
            reasons: ["BLOBS"],  // we can pick any reason; we just need a DOM context
            justification: "Running SAB timer with Web Workers"
        });
    }
}
