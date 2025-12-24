(function() {
  // State to track if we've already built the iframe
  let iframe = null;
  
  // NOTE: Ensure this matches your deployed Vercel URL
  // Ideally, read this from the mount element: 
  // const baseUrl = document.querySelector('[data-configurator-mount]').getAttribute('data-configurator-base-url');
  const baseUrl = "https://your-vercel-app.app"; 

  // --- 1. THE CREATOR (Opens Overlay & Injects Iframe) ---
  function openConfigurator() {
    // Lazy Load: Only create the iframe the first time needed
    if (!iframe) {
      const mount = document.querySelector('[data-configurator-mount]');
      iframe = document.createElement('iframe');
      iframe.src = baseUrl;
      iframe.style.width = '100%'; 
      iframe.style.height = '100%';
      iframe.style.border = 'none';
      mount.appendChild(iframe);
    }
    
    // Show the overlay (CSS handles the rest)
    document.body.classList.add('configurator-open');
  }

  // --- 2. THE BRIDGE (Sends the Signal) ---
  function sendSignal(type, payload) {
    if (!iframe || !iframe.contentWindow) return;
    
    // The "Bullet": A clean JSON packet fired at the React App
    const message = { type, payload };
    iframe.contentWindow.postMessage(message, '*'); // TODO: Add origin check in prod
    console.log('[Bridge] Sent:', message);
  }

  // --- 3. THE TRIGGER (Wires it all together) ---
  document.querySelectorAll('.js-open-configurator').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      
      // A. Open the UI
      openConfigurator();

      // B. Wait 1.5s for React to boot, then switch to Catcher
      // (This proves the connection works)
      setTimeout(() => {
        sendSignal('REPLACE_CONFIGURATION', { preset: 'catcher' });
      }, 1500);
    });
  });

})();