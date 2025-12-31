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
      
      // --- READER LOGIC: Sync to App ---
      // Check if there is a saved design in the parent URL
      const urlParams = new URLSearchParams(window.location.search);
      const configParam = urlParams.get('config');

      // Append it to the iframe src so React boots with it
      if (configParam) {
        const separator = baseUrl.includes('?') ? '&' : '?';
        iframe.src = baseUrl + separator + 'config=' + configParam;
      } else {
        iframe.src = baseUrl;
      }
      // ---------------------------------

      iframe.style.width = '100%'; 
      iframe.style.height = '100%';
      iframe.style.border = 'none';
      
      // 1. UPDATE PERMISSIONS
      // Add 'web-share' to allow the iframe to use the native mobile share sheet
      iframe.allow = "camera; microphone; fullscreen; clipboard-write; web-share";
      
      // 2. UPDATE ONLOAD
      // THE EVENT: Wait for load, then send
      iframe.onload = () => {
        isIframeLoaded = true;
        sendSignal(presetId);

        // --- NEW: Send initial Phantom URL immediately ---
        try {
          iframe.contentWindow.postMessage(
            { type: 'PHANTOM_URL', url: window.location.href },
            targetOrigin
          );
        } catch (e) {}
        // ------------------------------------------------
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

  // 5. THE RECEIVER: Listen for messages from React
  window.addEventListener('message', (event) => {
    // Logic Check: Is this the specific "EXIT_APP" command?
    if (event.data && event.data.type === 'EXIT_APP') {
        console.log('[Bridge] Closing Configurator');
        
        // The Action: Remove the class that shows the overlay
        document.body.classList.remove('configurator-open');
    }

    // --- WRITER LOGIC: Sync to Browser ---
    // Update the address bar when the user clicks options in the app
    // 3. UPDATE LISTENER: Send the phantom URL back to the iframe
    if (event.data && event.data.type === 'CUSTOMIZER_STATE') {
        const query = event.data.query; // e.g. "config=v1:abc..."
        if (query) {
            const newUrl = window.location.pathname + '?' + query;
            window.history.replaceState(null, '', newUrl);

            // --- NEW: Send updated Phantom URL to iframe ---
            try {
                // Send back to the specific iframe that messaged us
                event.source.postMessage(
                    { type: 'PHANTOM_URL', url: window.location.href },
                    targetOrigin
                );
            } catch (e) {}
            // ----------------------------------------------
        }
    }
    // -------------------------------------
  });

  // 6. AUTO-START: Open immediately if a config exists in the URL
  const initialParams = new URLSearchParams(window.location.search);
  if (initialParams.has('config')) {
      // Pass 'null' because the Reader logic will grab the config from the URL automatically.
      openConfigurator(null);
  }

})();