/**
 * SmartMail AI - Content Script (Gmail Integration Architecture)
 * Injects non-intrusive action triggers when composing emails in Gmail.
 * Respects user privacy: only triggers upon explicit user clicks.
 */

console.log('[SmartMail AI] Gmail content script initialized.')

const SMARTMAIL_BTN_CLASS = 'smartmail-ai-compose-btn'

/**
 * Searches the DOM for Gmail compose toolbars and injects an assistant button.
 */
function injectSmartMailToolbarButton(toolbarElement) {
  if (toolbarElement.querySelector(`.${SMARTMAIL_BTN_CLASS}`)) {
    return // Already injected
  }

  const btn = document.createElement('div')
  btn.className = SMARTMAIL_BTN_CLASS
  btn.title = 'SmartMail AI Assistant'
  btn.innerHTML = `
    <div style="
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      background: #10b981;
      color: white;
      font-weight: 500;
      font-size: 12px;
      border-radius: 4px;
      cursor: pointer;
      user-select: none;
      margin-left: 8px;
    ">
      <span>✨ SmartMail</span>
    </div>
  `

  btn.addEventListener('click', (e) => {
    e.preventDefault()
    e.stopPropagation()
    // Open prompt or trigger extension popup message
    alert('SmartMail AI: Please open the extension popup in your browser toolbar to generate or polish your email draft.')
  })

  toolbarElement.appendChild(btn)
}

/**
 * Mutation observer to detect Gmail compose windows dynamically.
 */
function observeGmailCompose() {
  const observer = new MutationObserver(() => {
    // Gmail formatting bar selectors typically include role="toolbar" or .btC inside compose boxes
    const toolbars = document.querySelectorAll('.btC, [role="toolbar"]')
    toolbars.forEach((tb) => {
      if (tb && !tb.querySelector(`.${SMARTMAIL_BTN_CLASS}`)) {
        injectSmartMailToolbarButton(tb)
      }
    })
  })

  observer.observe(document.body, { childList: true, subtree: true })
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', observeGmailCompose)
} else {
  observeGmailCompose()
}

