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
    return;
  }

  let iframe = null;
  let isIframeLoaded = false;
  // Track the latest requested preset to prevent race conditions
  let pendingPresetId = null;

  // 2. THE SENDER
  function sendSignal(presetId) {
    if (!iframe || !iframe.contentWindow) return;
    if (!presetId) return;

    iframe.contentWindow.postMessage(
      { type: 'REPLACE_CONFIGURATION', payload: { preset: presetId } },
      targetOrigin
    );
  }

  // 3. THE LOADER
  function openConfigurator(presetId) {
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
  window.addEventListener('message', (event) => {
    // 1) ORIGIN GUARD
    if (event.origin !== targetOrigin) return;
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
    }
    // SYNC_BACK listener has been removed intentionally.
  });

  // 6. AUTO-START
  const initialParams = new URLSearchParams(window.location.search);
  if (initialParams.has('config')) {
    openConfigurator(null);
  }

})();