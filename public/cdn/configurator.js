(function() {
  'use strict';

  // --- 1. CONFIGURATION (Read from Liquid) ---
  const mountEl = document.querySelector('[data-configurator-mount]');
  
  // Ask the HTML: "What is the URL?"
  const baseUrl = mountEl ? mountEl.getAttribute('data-configurator-base-url') : null;

  // Validation: If no URL is set in Theme Editor, stop here.
  if (!baseUrl) {
    console.warn('[Configurator] No App URL found. Please configure it in the Theme Editor.');
    return;
  }

  // Security: Extract the origin (e.g., "https://armandsstudio.com") for safe messaging
  let targetOrigin = '*';
  try {
    targetOrigin = new URL(baseUrl).origin;
  } catch (e) {
    console.error('[Configurator] Invalid App URL format:', baseUrl);
    return;
  }

  let iframe = null;

  // --- 2. THE CREATOR (Opens Overlay & Injects Iframe) ---
  function openConfigurator() {
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.src = baseUrl;
      iframe.style.width = '100%'; 
      iframe.style.height = '100%';
      iframe.style.border = 'none';
      iframe.allow = "camera; microphone; fullscreen; clipboard-write"; 
      mountEl.appendChild(iframe);
    }
    
    document.body.classList.add('configurator-open');
  }

  // --- 3. THE BRIDGE (Sends the Signal) ---
  function sendSignal(type, payload) {
    if (!iframe || !iframe.contentWindow) return;
    
    const message = { type, payload };
    // Securely send only to our trusted App URL
    iframe.contentWindow.postMessage(message, targetOrigin);
    console.log('[Bridge] Sent:', message, 'to', targetOrigin);
  }

  // --- 4. THE TRIGGER (Wires it all together) ---
  document.querySelectorAll('.js-open-configurator').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      
      // A. Open the UI
      openConfigurator();

      // B. Wait 1.5s for React to boot, then switch to Catcher
      setTimeout(() => {
        sendSignal('REPLACE_CONFIGURATION', { preset: 'catcher' });
      }, 1500);
    });
  });

})();