chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({ overlayEnabled: true }, () => {
        console.log("Overlay is enabled by default.");
    });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "toggleOverlay") {
        chrome.storage.sync.get(['overlayEnabled'], (result) => {
            const newState = !(result.overlayEnabled === false);
            chrome.storage.sync.set({ overlayEnabled: newState }, () => {
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    if (tabs[0]) {
                        chrome.scripting.executeScript(
                            {
                                target: { tabId: tabs[0].id },
                                files: ['porcay.js']
                            },
                            () => {
                                chrome.tabs.sendMessage(tabs[0].id, { overlayEnabled: newState });
                                sendResponse({ success: true, overlayEnabled: newState });
                            }
                        );
                    }
                });
            });
        });
        return true;  // Indicates that the response will be sent asynchronously
    }
});
