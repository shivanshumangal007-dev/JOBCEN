"use strict";
console.log("Service Worker Loaded");
chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
    console.log("Received external message:", message, "from sender:", sender);
    if (message.action === "SYNC_TO_PLATFORM" && message.platform === "wellfound") {
        console.log("Handling Wellfound sync for data:", message.data);
        handleWellfoundSync(message.data)
            .then(() => {
            console.log("handleWellfoundSync tab creation triggered successfully");
            sendResponse({ success: true });
        })
            .catch((err) => {
            console.error("handleWellfoundSync error:", err);
            sendResponse({ success: false, error: err.toString() });
        });
    }
    else {
        console.log("Message not handled:", message);
        sendResponse({ success: false, error: "Unhandled message" });
    }
    return true; // keep the message channel open for async response
});
async function handleWellfoundSync(profileData) {
    console.log("Stashing data to storage...");
    await chrome.storage.local.set({ pendingSync: profileData });
    console.log("Data stashed. Creating new tab...");
    const tab = await chrome.tabs.create({ url: "https://wellfound.com/profile/edit" });
    console.log("Tab created with ID:", tab.id);
    // wait for the tab to finish loading before triggering the fill
    const listener = (tabId, info) => {
        if (tabId === tab.id && info.status === "complete") {
            console.log("Tab finished loading. Sending RUN_AUTOFILL message.");
            chrome.tabs.onUpdated.removeListener(listener);
            chrome.tabs.sendMessage(tab.id, { action: "RUN_AUTOFILL" });
        }
    };
    chrome.tabs.onUpdated.addListener(listener);
}
