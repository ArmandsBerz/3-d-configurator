(function() {
  'use strict';

  // 1. SETUP: Find the mount point from your Liquid file
  const mountEl = document.querySelector('[data-configurator-mount]');
  
  // Safety Check: If Liquid didn't render the mount, stop.
  if (!mountEl) return; 

  const baseUrl = mountEl.getAttribute('data-configurator-base-url');
  if (!baseUrl) return;

  // Security: Calculate the target origin (e.g. "https://armandsstudio.com")
  let targetOrigin = '*';
  try { targetOrigin = new URL(baseUrl).origin; } catch (e) {}

  let iframe = null;
  let isIframeLoaded = false;

  // 2. THE SENDER: The actual postMessage logic
  function sendSignal(presetId) {
    if (!iframe || !iframe.contentWindow) return;
    
    const message = { 
      type: 'REPLACE_CONFIGURATION', 
      payload: { preset: presetId } // <--- SEND THE ACTUAL ID
    };
    
    iframe.contentWindow.postMessage(message, targetOrigin);
    console.log('[Bridge] Sent:', presetId);
  }

  // 3. THE LOADER: Handles creating the iframe safely
  function openConfigurator(presetId) {
    // Scenario A: First click (Create Iframe)
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.src = baseUrl;
      iframe.style.width = '100%'; 
      iframe.style.height = '100%';
      iframe.style.border = 'none';
      iframe.allow = "camera; microphone; fullscreen; clipboard-write";
      
      // THE EVENT: Wait for load, then send
      iframe.onload = () => {
        isIframeLoaded = true;
        sendSignal(presetId);
      };
      
      mountEl.appendChild(iframe);
    } 
    // Scenario B: Second click (Iframe exists)
    else if (isIframeLoaded) {
      sendSignal(presetId);
    }

    document.body.classList.add('configurator-open');
  }

  // 4. THE LISTENER: Global click handler
  document.addEventListener('click', (e) => {
    // Did we click a Configurator Button?
    const btn = e.target.closest('.js-open-configurator');
    
    if (btn) {
      e.preventDefault();
      
      // READ THE DATA from the Block
      const presetId = btn.getAttribute('data-preset-id');
      
      // EXECUTE
      openConfigurator(presetId);
    }
  });

})();