(function() {
  'use strict';

  // 1. SETUP
  const mountEl = document.querySelector('[data-configurator-mount]');
  if (!mountEl) return; 

  const baseUrl = mountEl.getAttribute('data-configurator-base-url');
  if (!baseUrl) return;

  // Security: Calculate the target origin
  let targetOrigin = '*';
  try { targetOrigin = new URL(baseUrl).origin; } catch (e) {}

  let iframe = null;
  let isIframeLoaded = false;

  // 2. THE SENDER
  function sendSignal(presetId) {
    if (!iframe || !iframe.contentWindow) return;
    
    // --- FIX FROM CHATGPT: Don't send if presetId is missing ---
    if (!presetId) return; 
    // -----------------------------------------------------------

    const message = { 
      type: 'REPLACE_CONFIGURATION', 
      payload: { preset: presetId } 
    };
    
    iframe.contentWindow.postMessage(message, targetOrigin);
  }

  // 3. THE LOADER
  function openConfigurator(presetId) {
    // --- ENTRY HINT LOGIC (MEMORY FIX) ---
    // 1. If we have a preset (click), save it to memory.
    if (presetId) {
      try { sessionStorage.setItem('glove_entry_hint', presetId); } catch (e) {}
    }
    
    // 2. Retrieve the hint from memory (or URL param) to survive reloads.
    let storedHint = null;
    try { storedHint = sessionStorage.getItem('glove_entry_hint'); } catch (e) {}
    
    const urlParams = new URLSearchParams(window.location.search);
    // Priority: Clicked Button > URL Param > Session Memory
    const entryHint = presetId || storedHint;
    
    // 3. Prepare the param for the iframe src
    const entryParam = entryHint ? '&entry=' + encodeURIComponent(entryHint) : '';
    // -------------------------------------

    if (!iframe) {
      iframe = document.createElement('iframe');
      
      const configParam = urlParams.get('config');

      if (configParam) {
        const separator = baseUrl.includes('?') ? '&' : '?';
        // Pass config AND entry hint (with encoding safety)
        iframe.src = baseUrl + separator + 'config=' + encodeURIComponent(configParam) + entryParam;
      } else {
        const separator = baseUrl.includes('?') ? '&' : '?';
        // Pass entry hint even without config (remove leading & if it's the first param)
        iframe.src = baseUrl + separator + (entryParam.replace('&', '') || '');
      }

      iframe.style.width = '100%'; 
      iframe.style.height = '100%';
      iframe.style.border = 'none';
      // PERMISSION: Web-Share enabled
      iframe.allow = "camera; microphone; fullscreen; clipboard-write; web-share";
      
      iframe.onload = () => {
        isIframeLoaded = true;
        
        // --- FIX: Only send preset if it exists ---
        if (presetId) sendSignal(presetId);

        // --- NEW: Send initial Phantom URL immediately ---
        try {
          iframe.contentWindow.postMessage(
            { type: 'PHANTOM_URL', url: window.location.href },
            targetOrigin
          );
        } catch (e) {}
      };
      
      mountEl.appendChild(iframe);
    } 
    else if (isIframeLoaded) {
      if (presetId) sendSignal(presetId);
    }

    document.body.classList.add('configurator-open');
  }

  // 4. THE LISTENER (Click Handler)
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.js-open-configurator');
    if (btn) {
      e.preventDefault();
      const presetId = btn.getAttribute('data-preset-id');
      openConfigurator(presetId);
    }
  });

  // 5. THE RECEIVER (Message Handler)
  window.addEventListener('message', (event) => {
    // --- FIX FROM CHATGPT: SECURITY GUARDS ---
    // 1. Only accept messages from OUR iframe
    if (!iframe || event.source !== iframe.contentWindow) return;
    // 2. Only accept messages from the expected app origin
    if (targetOrigin !== '*' && event.origin !== targetOrigin) return;
    // -----------------------------------------

    if (event.data && event.data.type === 'EXIT_APP') {
        document.body.classList.remove('configurator-open');
    }

    if (event.data && event.data.type === 'CUSTOMIZER_STATE') {
        const query = event.data.query; 
        if (query) {
            const newUrl = window.location.pathname + '?' + query;
            window.history.replaceState(null, '', newUrl);

            // --- Echo Phantom URL back to iframe ---
            try {
                event.source.postMessage(
                    { type: 'PHANTOM_URL', url: window.location.href },
                    targetOrigin
                );
            } catch (e) {}
        }
    }
  });

  // 6. AUTO-START
  const initialParams = new URLSearchParams(window.location.search);
  if (initialParams.has('config')) {
      openConfigurator(null);
  }

})();