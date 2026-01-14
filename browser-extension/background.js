// Background service worker for AutoApply extension

// Listen for extension installation
chrome.runtime.onInstalled.addListener(() => {
    console.log('AutoApply extension installed');
});

// Handle messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'ping') {
        sendResponse({ status: 'ok' });
    }
    return true;
});
