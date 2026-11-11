/**
 * SmartMail AI - Background Service Worker (Manifest V3)
 * Handles background lifecycle and extension messaging.
 */

chrome.runtime.onInstalled.addListener(() => {
  console.log('[SmartMail AI] Extension installed successfully.')
})

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'PING') {
    sendResponse({ status: 'PONG', time: Date.now() })
    return true
  }
})

