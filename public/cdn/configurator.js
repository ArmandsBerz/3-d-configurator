(function() {
  'use strict';

  // --- EMBEDDED MAP DATA (Step 3) ---
  const VARIANTS_DATA = {
    "version": 1,
    "keyParts": ["shell", "imageSelection", "size"],
    "default": "45807344418972",
    "map": {
      "catcher": "45807344418972",
      "first-base": "45810730729628",
      "first-base|1300": "45810730729628",
      "close-back|imgOpt1": "45807211577500",
      "close-back|imgOpt2": "45807211610268",
      "close-back|imgOpt3": "45807211643036",
      "open-back|imgOpt1|1100": "45807210528924",
      "open-back|imgOpt1|1125": "45807210627228",
      "open-back|imgOpt1|1150": "45807210725532",
      "open-back|imgOpt1|1175": "45807210823836",
      "open-back|imgOpt1|1200": "45807210922140",
      "open-back|imgOpt1|1225": "45807211020444",
      "open-back|imgOpt1|1250": "45807211118748",
      "open-back|imgOpt1|1275": "45807211217052",
      "open-back|imgOpt2|1100": "45807210561692",
      "open-back|imgOpt2|1125": "45807210659996",
      "open-back|imgOpt2|1150": "45807210758300",
      "open-back|imgOpt2|1175": "45807210856604",
      "open-back|imgOpt2|1200": "45807210954908",
      "open-back|imgOpt2|1225": "45807211053212",
      "open-back|imgOpt2|1250": "45807211151516",
      "open-back|imgOpt2|1275": "45807211249820",
      "open-back|imgOpt3|1100": "45807210594460",
      "open-back|imgOpt3|1125": "45807210692764",
      "open-back|imgOpt3|1150": "45807210791068",
      "open-back|imgOpt3|1175": "45807210889372",
      "open-back|imgOpt3|1200": "45807210987676",
      "open-back|imgOpt3|1225": "45807211085980",
      "open-back|imgOpt3|1250": "45807211184284",
      "open-back|imgOpt3|1275": "45807211282588"
    }
  };

  // --- HELPER FUNCTIONS FOR RESOLVER & HARDENING ---

  function resolveVariantId(config) {
    const shell = String(config.shell || '');
    const imageSelection = String(config.imageSelection || '');
    const size = String(config.size || '');

    // Progressive Fallback Resolution
    const candidates = [
      `${shell}|${imageSelection}|${size}`,
      `${shell}|${imageSelection}`,
      `${shell}|${size}`,
      `${shell}`
    ];

    for (const k of candidates) {
      if (VARIANTS_DATA.map[k]) return VARIANTS_DATA.map[k];
    }

    return VARIANTS_DATA.default || null;
  }

  function normalizeQuantity(qty) {
    const n = parseInt(qty, 10);
    const safe = Number.isFinite(n) ? n : 1;
    return Math.max(1, Math.min(99, safe));
  }

  function normalizeProperties(props) {
    if (!props || typeof props !== 'object' || Array.isArray(props)) return {};
    const out = {};
    for (const [k, v] of Object.entries(props)) {
      out[String(k)] = typeof v === 'string' ? v : String(v ?? '');
    }
    return out;
  }

  // 1. SETUP
  const mountEl = document.querySelector('[data-configurator-mount]');
  if (!mountEl) return;

  const baseUrl = mountEl.getAttribute('data-configurator-base-url');
  if (!baseUrl) return;

  // Security: Calculate the target origin STRICTLY
  let targetOrigin = '';
  try {
    // Fix: Handle relative paths gracefully by providing a base (current origin)
    targetOrigin = new URL(baseUrl, window.location.origin).origin;
  } catch (e) {
    console.error("Configurator: Invalid Base URL. Bridge disabled.");
    return;
  }

  let iframe = null;
  let isIframeLoaded = false;
  // Track the latest requested preset to prevent race conditions
  let pendingPresetId = null;
  // Store the element that had focus before opening the configurator
  let lastFocusedElement = null;

  // 2. THE SENDER
  function sendSignal(presetId) {
    if (!iframe || !iframe.contentWindow) return;
    if (!presetId) return;

    iframe.contentWindow.postMessage(
      { type: 'REPLACE_CONFIGURATION', payload: { preset: presetId } },
      targetOrigin
    );

    // Hardening #2: Prevent stale replays
    pendingPresetId = null;
  }

  // 3. THE LOADER
  function openConfigurator(presetId) {
    // Capture focus before opening
    lastFocusedElement = document.activeElement;

    pendingPresetId = presetId;

    // --- ENTRY HINT LOGIC ---
    // 1. If we have a preset (click), save it to memory.
    if (presetId) {
      try { sessionStorage.setItem('glove_entry_hint', presetId); } catch (e) {}
    }

    // 2. Retrieve the hint from memory OR URL param.
    const urlParams = new URLSearchParams(window.location.search);
    let storedHint = null;
    try { storedHint = sessionStorage.getItem('glove_entry_hint'); } catch (e) {}

    const entryHint = presetId || urlParams.get('entry') || storedHint;

    if (!iframe) {
      iframe = document.createElement('iframe');
      // Step 1: Add tabindex to ensure it can receive focus
      iframe.setAttribute('tabindex', '-1');

      const configParam = urlParams.get('config');
      const separator = baseUrl.includes('?') ? '&' : '?';

      // Clean URL Construction
      if (configParam) {
        let src = baseUrl + separator + 'config=' + encodeURIComponent(configParam);
        if (entryHint) src += '&entry=' + encodeURIComponent(entryHint);
        iframe.src = src;
      } else {
        iframe.src = entryHint
          ? baseUrl + separator + 'entry=' + encodeURIComponent(entryHint)
          : baseUrl;
      }

      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = 'none';
      iframe.allow = "camera; microphone; fullscreen; clipboard-write; web-share";

      iframe.onload = () => {
        isIframeLoaded = true;
        if (pendingPresetId) sendSignal(pendingPresetId);

        try {
          iframe.contentWindow.postMessage(
            { type: 'PHANTOM_URL', url: window.location.href },
            targetOrigin
          );
        } catch (e) {}
      };

      mountEl.appendChild(iframe);
    } else if (isIframeLoaded) {
      if (pendingPresetId) sendSignal(pendingPresetId);
    }

    document.body.classList.add('configurator-open');
    
    // Step 2: Force focus into the iframe immediately (using rAF for safety)
    requestAnimationFrame(() => {
      if (iframe) iframe.focus();
    });
  }

  // 4. THE LISTENER (Click Handler)
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.js-open-configurator');
    if (!btn) return;
    e.preventDefault();
    // No longer passing 'btn' as the second argument
    openConfigurator(btn.getAttribute('data-preset-id'));
  });

  // 5. THE RECEIVER (Message Handler)
  // Define Allowed Message Types
  const ALLOWED_TYPES = new Set(['EXIT_APP', 'CUSTOMIZER_STATE', 'COMPLETE_ORDER', 'PHANTOM_URL']);

  window.addEventListener('message', (event) => {
    // 1) ORIGIN GUARD (The Bouncer)
    // This strictly checks that the message comes from your trusted React App domain.
    if (event.origin !== targetOrigin) return;
    if (iframe && event.source !== iframe.contentWindow) return;

    const data = event.data;
    
    // 2) TYPE GUARD (The VIP List)
    // Filter out noise from extensions or other scripts
    if (!data || typeof data !== 'object' || !ALLOWED_TYPES.has(data.type)) return;

    // --- CASE A: EXIT APP ---
    if (data.type === 'EXIT_APP') {
      document.body.classList.remove('configurator-open');
      // Restore focus to the original button
      if (lastFocusedElement) {
        lastFocusedElement.focus();
        lastFocusedElement = null;
      }
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
    }

    // --- CASE C: COMPLETE ORDER (Secure Host Resolver) ---
    if (data.type === 'COMPLETE_ORDER') {
      const payload = data.payload;
      
      // Filter & Validate
      if (!payload || !payload.config) {
        console.error('Missing config in payload');
        return;
      }

      // Breaker #1: Use Progressive Fallback Resolution
      const variantId = resolveVariantId(payload.config);

      // Null Guard
      if (!variantId) {
        alert("Unavailable: This configuration is currently not in stock or unavailable.");
        return; // STOP execution
      }

      // Breaker #2 & Hardening #1: Normalize Inputs
      const quantity = normalizeQuantity(payload.quantity);
      const properties = normalizeProperties(payload.properties);

      // Execute: Add to Cart
      fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items: [{
            id: variantId,
            quantity: quantity,
            properties: properties // Crucial for passing text notes
          }]
        })
      })
      .then(response => response.json())
      .then(json => {
        if (json.status) {
           // Error case (Shopify returns a status field on error like 422)
           alert("Error adding to cart: " + (json.description || json.message || 'Unknown error'));
        } else {
           // Success
           window.location.href = '/cart';
        }
      })
      .catch(err => {
        console.error(err);
        alert("Failed to add to cart. Please try again.");
      });
    }
  });

  // 6. AUTO-START
  const initialParams = new URLSearchParams(window.location.search);
  // Fix: Check for either config OR entry to auto-start
  if (initialParams.has('config') || initialParams.has('entry')) {
    openConfigurator(null);
  }

})();