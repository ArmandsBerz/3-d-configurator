;(function () {
    'use strict';

    // ----------------------------
    // Loader metadata / guard
    // ----------------------------

    var LOADER_VERSION = '1.0.0';
    var INIT_FLAG = '__CONFIGURATOR_LOADER_INITIALIZED__';

    if (typeof window === 'undefined' || typeof document === 'undefined') {
        return;
    }

    if (window[INIT_FLAG]) {
        return;
    }
    window[INIT_FLAG] = true;

    // Optional external toggle: set window.CONFIGURATOR_LOADER_DEBUG = true to see extra logs.
    var DEBUG = !!window.CONFIGURATOR_LOADER_DEBUG;

    function logInfo(message) {
        if (typeof console !== 'undefined' && console.log) {
            console.log('[Configurator Loader v' + LOADER_VERSION + '] ' + message);
        }
    }

    function logDebug(message) {
        if (!DEBUG) return;
        if (typeof console !== 'undefined' && console.log) {
            console.log('[Configurator Loader DEBUG] ' + message);
        }
    }

    function logWarn(message) {
        if (typeof console !== 'undefined' && console.warn) {
            console.warn('[Configurator Loader] ' + message);
        }
    }

    logInfo('Initialized');

    // ----------------------------
    // CustomEvent polyfill
    // ----------------------------

    (function () {
        if (typeof window.CustomEvent === 'function') {
            return;
        }

        function CustomEventPolyfill(event, params) {
            params = params || { bubbles: false, cancelable: false, detail: null };
            var evt = document.createEvent('CustomEvent');
            evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
            return evt;
        }

        CustomEventPolyfill.prototype = window.Event.prototype;
        window.CustomEvent = CustomEventPolyfill;
    })();

    // ----------------------------
    // Internal state
    // ----------------------------

    var state = {
        mountEl: null,
        baseUrl: null,
        preferredMode: 'overlay', // 'overlay' | 'inline'
        effectiveMode: 'overlay',
        allowedOrigin: null,
        iframeEl: null,
        iframeWindow: null,
        overlayWrapperEl: null,
        isOpen: false,
        currentConfig: null,
        previousBodyOverflow: ''
    };

    // ----------------------------
    // Query string helpers
    // ----------------------------

    function parseQuery(search) {
        var query = search || '';
        var params = {};

        if (query.charAt(0) === '?') {
            query = query.slice(1);
        }

        if (!query) {
            return params;
        }

        var pairs = query.split('&');
        for (var i = 0; i < pairs.length; i++) {
            var part = pairs[i];
            if (!part) continue;

            var eqIndex = part.indexOf('=');
            var key, value;
            if (eqIndex === -1) {
                key = part;
                value = '';
            } else {
                key = part.slice(0, eqIndex);
                value = part.slice(eqIndex + 1);
            }

            try {
                key = decodeURIComponent(key);
            } catch (e) {
                // If key is malformed, skip
                continue;
            }

            try {
                value = decodeURIComponent(value);
            } catch (e2) {
                // If value is malformed, leave as-is
            }

            if (key) {
                params[key] = value;
            }
        }

        return params;
    }

    function buildQuery(params) {
        var parts = [];
        for (var key in params) {
            if (!Object.prototype.hasOwnProperty.call(params, key)) continue;
            var value = params[key];
            if (value === null || typeof value === 'undefined') continue;

            var encodedKey = encodeURIComponent(key);
            var encodedValue = encodeURIComponent(String(value));
            parts.push(encodedKey + '=' + encodedValue);
        }

        if (!parts.length) {
            return '';
        }
        return '?' + parts.join('&');
    }

    function withUpdatedQuery(modifierFn) {
        var loc = window.location;
        var currentParams = parseQuery(loc.search);

        try {
            modifierFn(currentParams);
        } catch (e) {
            logWarn('Error while modifying query params: ' + e.message);
        }

        var newSearch = buildQuery(currentParams);
        var newUrl =
            loc.protocol +
            '//' +
            loc.host +
            loc.pathname +
            newSearch +
            (loc.hash || '');

        try {
            window.history.replaceState(window.history.state, '', newUrl);
            logDebug('Updated URL to: ' + newUrl);
        } catch (e2) {
            logWarn('history.replaceState failed: ' + e2.message);
        }
    }

    // ----------------------------
    // Body scroll helpers (overlay)
    // ----------------------------

    function disableBodyScroll() {
        var body = document.body;
        if (!body) return;
        state.previousBodyOverflow = body.style.overflow || '';
        body.style.overflow = 'hidden';
    }

    function restoreBodyScroll() {
        var body = document.body;
        if (!body) return;
        body.style.overflow = state.previousBodyOverflow;
    }

    // ----------------------------
    // Iframe src builder
    // ----------------------------

    function buildIframeSrc(baseUrl, configValue) {
        if (!baseUrl) return '';

        // Strip hash, handle existing query string
        var hashIndex = baseUrl.indexOf('#');
        var preHash = hashIndex === -1 ? baseUrl : baseUrl.slice(0, hashIndex);
        var hash = hashIndex === -1 ? '' : baseUrl.slice(hashIndex);

        var qIndex = preHash.indexOf('?');
        var path = qIndex === -1 ? preHash : preHash.slice(0, qIndex);
        var existingSearch = qIndex === -1 ? '' : preHash.slice(qIndex);

        var params = parseQuery(existingSearch);

        if (typeof configValue === 'string' && configValue.length > 0) {
            params.config = configValue;
        }

        var finalSearch = buildQuery(params);
        return path + finalSearch + hash;
    }

    // ----------------------------
    // Iframe creation / show / hide
    // ----------------------------

    function createIframeIfNeeded() {
        if (state.iframeEl) {
            return;
        }

        var src = buildIframeSrc(state.baseUrl, state.currentConfig);
        if (!src) {
            logWarn('Cannot create iframe: invalid base URL or config.');
            return;
        }

        var iframe = document.createElement('iframe');
        iframe.setAttribute('src', src);
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allowfullscreen', 'true');
        iframe.setAttribute('scrolling', 'auto');
        iframe.style.border = '0';
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.display = 'block';

        if (state.effectiveMode === 'overlay') {
            var overlay = document.createElement('div');
            overlay.setAttribute('data-configurator-overlay', 'true');
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.right = '0';
            overlay.style.bottom = '0';
            overlay.style.zIndex = '9999';
            overlay.style.backgroundColor = 'rgba(0,0,0,0.7)';
            overlay.style.display = 'none'; // initially hidden until opened

            overlay.appendChild(iframe);
            document.body.appendChild(overlay);

            state.overlayWrapperEl = overlay;
        } else {
            // Inline mode: iframe lives inside the mount container.
            if (!state.mountEl) {
                logWarn('Mount element is missing when trying to append inline iframe.');
                return;
            }
            state.mountEl.appendChild(iframe);
        }

        state.iframeEl = iframe;
        state.iframeWindow = iframe.contentWindow || null;

        logDebug('Created configurator iframe with src: ' + src);
    }

    function showConfigurator() {
        createIframeIfNeeded();
        if (!state.iframeEl) return;

        if (state.effectiveMode === 'overlay') {
            if (state.overlayWrapperEl) {
                state.overlayWrapperEl.style.display = 'block';
                disableBodyScroll();
            }
            // Overlay usage: ensure mode=customize is set
            withUpdatedQuery(function (params) {
                params.mode = 'customize';
            });
        } else {
            // Inline: iframe is already in the mount; no URL mode changes by default
        }

        state.isOpen = true;
        logDebug('Configurator shown (' + state.effectiveMode + ' mode).');
    }

    function hideConfigurator() {
        if (!state.iframeEl) {
            return;
        }

        if (state.effectiveMode === 'overlay') {
            if (state.overlayWrapperEl) {
                state.overlayWrapperEl.style.display = 'none';
            }
            restoreBodyScroll();
        } else {
            // Inline: we keep the iframe visible by default.
            // If you ever want to hide inline, this is the place to toggle visibility.
        }

        // On close: remove mode=customize but keep config
        withUpdatedQuery(function (params) {
            if (params.mode === 'customize') {
                delete params.mode;
            }
        });

        state.isOpen = false;
        logDebug('Configurator hidden.');
    }

    // ----------------------------
    // Message handling
    // ----------------------------

    function handleCustomizerStateMessage(data) {
        var query = data && data.query;
        if (typeof query !== 'string') {
            logWarn('CUSTOMIZER_STATE message missing valid "query" string.');
            return;
        }

        var incomingParams;
        try {
            incomingParams = parseQuery(query);
        } catch (e) {
            logWarn('Unable to parse CUSTOMIZER_STATE query: ' + e.message);
            return;
        }

        if (incomingParams && typeof incomingParams.config === 'string') {
            state.currentConfig = incomingParams.config;
        }

        withUpdatedQuery(function (params) {
            for (var key in incomingParams) {
                if (!Object.prototype.hasOwnProperty.call(incomingParams, key)) continue;
                params[key] = incomingParams[key];
            }
        });
    }

    function handleExitAppMessage() {
        hideConfigurator();
    }

    function handleCompleteOrderMessage(data) {
        var payload = data && data.payload ? data.payload : {};
        var config = typeof payload.config === 'string' ? payload.config : undefined;
        var thumbnailId = typeof payload.thumbnailId === 'string' ? payload.thumbnailId : undefined;

        var detail = {};
        if (typeof config !== 'undefined') {
            detail.config = config;
        }
        if (typeof thumbnailId !== 'undefined') {
            detail.thumbnailId = thumbnailId;
        }

        try {
            var event = new CustomEvent('configurator:complete-order', {
                detail: detail
            });
            window.dispatchEvent(event);
            logDebug('Dispatched configurator:complete-order event.');
        } catch (e) {
            logWarn('Failed to dispatch configurator:complete-order event: ' + e.message);
        }
    }

    function handleMessageEvent(event) {
        // Must have iframe to care about messages
        if (!state.iframeWindow || !state.iframeEl) {
            return;
        }

        // Origin check (if configured)
        if (state.allowedOrigin && event.origin !== state.allowedOrigin) {
            logDebug('Ignoring message from disallowed origin: ' + event.origin);
            return;
        }

        // Source check
        if (event.source !== state.iframeWindow) {
            return;
        }

        var data = event.data;
        if (!data || typeof data !== 'object') {
            return;
        }

        var type = data.type;
        if (typeof type !== 'string') {
            return;
        }

        switch (type) {
            case 'CUSTOMIZER_STATE':
                handleCustomizerStateMessage(data);
                break;
            case 'EXIT_APP':
                handleExitAppMessage();
                break;
            case 'COMPLETE_ORDER':
                handleCompleteOrderMessage(data);
                break;
            default:
                // Unknown message types are safely ignored
                logDebug('Ignoring unknown message type: ' + type);
                break;
        }
    }

    // ----------------------------
    // Initialization
    // ----------------------------

    function initConfiguratorLoader() {
        // 1) Mount element discovery
        var mountEl = document.querySelector('[data-configurator-mount]');
        if (!mountEl) {
            logWarn(
                'Mount element [data-configurator-mount] not found; loader will not be active on this page.'
            );
            return;
        }

        state.mountEl = mountEl;

        // 2) Required base URL
        var baseUrl = mountEl.getAttribute('data-configurator-base-url');
        if (!baseUrl) {
            logWarn(
                'Attribute data-configurator-base-url is missing on the mount element; cannot create iframe.'
            );
            return;
        }
        state.baseUrl = baseUrl;

        // 3) Preferred display mode (inline / overlay)
        var modeAttr = (mountEl.getAttribute('data-configurator-mode') || '').toLowerCase();
        if (modeAttr !== 'inline' && modeAttr !== 'overlay') {
            modeAttr = 'overlay'; // default
        }
        state.preferredMode = modeAttr;
        state.effectiveMode = modeAttr;

        // 4) Allowed origin for postMessage (optional)
        var allowedOrigin = mountEl.getAttribute('data-configurator-allowed-origin');
        state.allowedOrigin = allowedOrigin || null;

        logDebug(
            'Mount found. baseUrl=' +
                state.baseUrl +
                ', mode=' +
                state.effectiveMode +
                ', allowedOrigin=' +
                (state.allowedOrigin || 'none')
        );

        // 5) Initial query params
        var initialParams = parseQuery(window.location.search);
        state.currentConfig =
            typeof initialParams.config === 'string' ? initialParams.config : null;
        var initialModeParam =
            typeof initialParams.mode === 'string' ? initialParams.mode.toLowerCase() : '';

        // 6) Attach message listener
        window.addEventListener('message', handleMessageEvent, false);

        // 7) Decide initial iframe behavior
        if (state.effectiveMode === 'inline') {
            // Inline mode: create and show iframe immediately
            createIframeIfNeeded();
            state.isOpen = true;
            logDebug('Inline configurator iframe created on init.');
        } else {
            // Overlay mode: create & open only if mode=customize in URL
            if (initialModeParam === 'customize') {
                showConfigurator();
            } else {
                // Lazy creation: wait until some external trigger (e.g., query param change)
                // For now we just wait; theme JS can create a link with ?mode=customize to deep-link into open state.
                logDebug('Overlay mode; iframe will be created lazily when opened.');
            }
        }
    }

    function onReady(fn) {
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    onReady(initConfiguratorLoader);
})();
