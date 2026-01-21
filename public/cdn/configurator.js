(function() {
  'use strict';

  // 1. SETUP
  const mountEl = document.querySelector('[data-configurator-mount]');
  if (!mountEl) return; 

  const baseUrl = mountEl.getAttribute('data-configurator-base-url');
  if (!baseUrl) return;

  // Security: Calculate the target origin STRICTLY
  let targetOrigin = '';
  try { 
    targetOrigin = new URL(baseUrl).origin; 
  } catch (e) {
    console.error("Configurator: Invalid Base URL. Bridge disabled.");
    return; // STOP. Do not fallback to '*'. (Fixes Point 3)
  }

  let iframe = null;
  let isIframeLoaded = false;
  // Track the latest requested preset to prevent race conditions (Fixes Point 4)
  let pendingPresetId = null; 

  // --- HELPER: CAPTURE ACTIVE VARIANT (PHASE 1) ---
  function getActiveVariantId(triggerElement = null) {
    // Priority 1: URL Parameter (?variant=123)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('variant')) {
      return urlParams.get('variant');
    }
    
    // Priority 2: Contextual Form (closest to clicked button) (Fixes Point 6)
    if (triggerElement) {
      const closestForm = triggerElement.closest('form');
      if (closestForm) {
        const input = closestForm.querySelector('input[name="id"]');
        if (input) return input.value;
      }
    }

    // Priority 3: Global/Main Form Input
    const formInput = document.querySelector('form[action^="/cart/add"] input[name="id"]') || 
                      document.querySelector('input[name="id"]');
    if (formInput) return formInput.value;
    
    return null;
  }
  // -----------------------------------------------

  // 2. THE SENDER
  function sendSignal(presetId) {
    if (!iframe || !iframe.contentWindow) return;
    if (!presetId) return; 

    const message = { 
      type: 'REPLACE_CONFIGURATION', 
      payload: { preset: presetId } 
    };
    
    iframe.contentWindow.postMessage(message, targetOrigin);
  }

  // 3. THE LOADER
  function openConfigurator(presetId, triggerBtn = null) {
    // Update the pending intention
    pendingPresetId = presetId;

    // --- ENTRY HINT LOGIC (MEMORY FIX) ---
    // 1. If we have a preset (click), save it to memory.
    if (presetId) {
      try { sessionStorage.setItem('glove_entry_hint', presetId); } catch (e) {}
    }
    
    // 2. Retrieve the hint from memory OR URL param.
    // (Fixes Point 1: Added URL param reading)
    const urlParams = new URLSearchParams(window.location.search);
    let storedHint = null;
    try { storedHint = sessionStorage.getItem('glove_entry_hint'); } catch (e) {}
    
    // Priority: Clicked Button > URL Param > Session Memory
    const entryHint = presetId || urlParams.get('entry') || storedHint;
    
    // 3. Prepare the param for the iframe src
    let entryParam = entryHint ? '&entry=' + encodeURIComponent(entryHint) : '';
    
    // --- PHASE 1 ENTRY VARIANT INJECTION ---
    const activeVariant = getActiveVariantId(triggerBtn);
    if (activeVariant) {
        entryParam += '&entry_variant=' + encodeURIComponent(activeVariant);
    }
    // --------------------------------------------

    if (!iframe) {
      iframe = document.createElement('iframe');
      
      const configParam = urlParams.get('config');

      if (configParam) {
        const separator = baseUrl.includes('?') ? '&' : '?';
        iframe.src = baseUrl + separator + 'config=' + encodeURIComponent(configParam) + entryParam;
      } else {
        const separator = baseUrl.includes('?') ? '&' : '?';
        iframe.src = baseUrl + separator + (entryParam.replace('&', '') || '');
      }

      iframe.style.width = '100%'; 
      iframe.style.height = '100%';
      iframe.style.border = 'none';
      iframe.allow = "camera; microphone; fullscreen; clipboard-write; web-share";
      
      iframe.onload = () => {
        isIframeLoaded = true;
        
        // Race Condition Fix: Send the *latest* requested preset, not the stale one.
        if (pendingPresetId) sendSignal(pendingPresetId);

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
      if (pendingPresetId) sendSignal(pendingPresetId);
    }

    document.body.classList.add('configurator-open');
  }

  // 4. THE LISTENER (Click Handler)
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.js-open-configurator');
    if (btn) {
      e.preventDefault();
      const presetId = btn.getAttribute('data-preset-id');
      // Pass the button to help find the correct variant (Fixes Point 6)
      openConfigurator(presetId, btn);
    }
  });

  // 5. THE RECEIVER (Message Handler)
  window.addEventListener('message', (event) => {
    
    // 1) ORIGIN GUARD
    if (targetOrigin !== '*' && event.origin !== targetOrigin) return;
    if (iframe && event.source !== iframe.contentWindow) return;

    const data = event.data;
    if (!data) return;

    // --- CASE A: EXIT APP ---
    if (data.type === 'EXIT_APP') {
        document.body.classList.remove('configurator-open');
        return;
    }

    // --- CASE B: PHANTOM URL ---
    if (data.type === 'CUSTOMIZER_STATE') {
        const query = data.query; 
        if (query) {
            const newUrl = window.location.pathname + '?' + query;
            window.history.replaceState(null, '', newUrl);
            try {
                event.source.postMessage(
                    { type: 'PHANTOM_URL', url: window.location.href },
                    targetOrigin
                );
            } catch (e) {}
        }
        return;
    }

    // --- NEW: PHASE 2 (SECURE SYNC BACK) ---
    if (data.type === 'SYNC_BACK') {
        
        // 3) PAYLOAD SANITY
        const variantId = data.payload?.variantId;
        if (!variantId) return;

        // 4) READ + BUILD ALLOWLIST SET
        let allowedIds = [];
        try {
            allowedIds = JSON.parse(mountEl.getAttribute("data-allowed-variants") || "[]");
        } catch {
            allowedIds = [];
        }
        
        // SANDBOX LOGIC (Point 2): 
        // We implicitly allow empty lists to support Sandbox Pages.
        // We only enforce strict checks if the list has content.
        if (allowedIds.length > 0) {
            const allowedSet = new Set(allowedIds.map(String));
            
            // 5) EXPLICIT ALLOWLIST GUARD
            if (!allowedSet.has(String(variantId))) {
                console.warn("Blocked SYNC_BACK: variantId not allowed for this product page.", variantId);
                return;
            }
        }

        // 6) UPDATE THE FORM INPUT
        const masterInput =
            document.querySelector('form[action^="/cart/add"] input[name="id"]') ||
            document.querySelector('input[name="id"]');

        if (!masterInput) return;

        masterInput.value = String(variantId);
        masterInput.dispatchEvent(new Event("change", { bubbles: true }));
        masterInput.dispatchEvent(new Event("input", { bubbles: true }));
    }
  });

  // 6. AUTO-START
  const initialParams = new URLSearchParams(window.location.search);
  if (initialParams.has('config')) {
      openConfigurator(null);
  }

})();