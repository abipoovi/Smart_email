console.log("[SmartMail AI] Gmail content script initialized.");const r="smartmail-ai-compose-btn";function i(o){if(o.querySelector(`.${r}`))return;const e=document.createElement("div");e.className=r,e.title="SmartMail AI Assistant",e.innerHTML=`
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
  `,e.addEventListener("click",t=>{t.preventDefault(),t.stopPropagation(),alert("SmartMail AI: Please open the extension popup in your browser toolbar to generate or polish your email draft.")}),o.appendChild(e)}function n(){new MutationObserver(()=>{document.querySelectorAll('.btC, [role="toolbar"]').forEach(t=>{t&&!t.querySelector(`.${r}`)&&i(t)})}).observe(document.body,{childList:!0,subtree:!0})}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",n):n();
