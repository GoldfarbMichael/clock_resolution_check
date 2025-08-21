


let SITE_NAME;

// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//     if (message.siteName) {
//         console.log("Received site name from WebDriver:", message.siteName);
//         SITE_NAME = message.siteName;
//
//         chrome.offscreen.createDocument({
//             url: "offscreen.html",
//             reasons: ["BLOBS"],
//             justification: "Data collection"
//         });
//     }
// });
//
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//     if (message.action === "save_csv") {
//         const csvContent = message.samples.join("\n");
//         const blob = new Blob([csvContent], { type: "text/csv" });
//         const filename = `${SITE_NAME}.csv`;
//
//         const reader = new FileReader();
//         reader.onload = () => {
//             const url = reader.result;
//             chrome.downloads.download({
//                 url: url,
//                 filename: filename,
//                 saveAs: false
//             });
//         };
//         reader.readAsDataURL(blob);
//     }
// });

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
