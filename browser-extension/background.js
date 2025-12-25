// Background service worker for AutoApply extension

chrome.runtime.onInstalled.addListener(() => {
  console.log('AutoApply extension installed');
});

// Handle messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'log') {
    console.log('[AutoApply]', request.message);
  }
  return true;
});

