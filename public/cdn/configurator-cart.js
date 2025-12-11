;(function () {
    'use strict';

    // ---------------------------------
    // Simple debug helpers (optional)
    // ---------------------------------
    var CART_VERSION = '1.0.0';
    var DEBUG = !!window.CONFIGURATOR_CART_DEBUG;

    function logDebug(message) {
        if (!DEBUG) return;
        if (typeof console !== 'undefined' && console.log) {
            console.log('[Configurator Cart v' + CART_VERSION + '] ' + message);
        }
    }

    function logWarn(message) {
        if (typeof console !== 'undefined' && console.warn) {
            console.warn('[Configurator Cart] ' + message);
        }
    }

    // ---------------------------------
    // Main handler
    // ---------------------------------

    function handleConfiguratorCompleteOrder(event) {
        var detail = (event && event.detail) || {};
        var variantId = detail.variantId;
        var quantity = detail.quantity;
        var config = detail.config;
        var thumbnailId = detail.thumbnailId;

        if (!variantId || !config) {
            logWarn('Configurator: missing variantId or config, skipping cart add');
            return;
        }

        var normalizedQuantity =
            typeof quantity === 'number' && quantity > 0 ? quantity : 1;

        var body = {
            items: [
                {
                    id: Number(variantId),
                    quantity: normalizedQuantity,
                    properties: {
                        Configuration: config,
                        _thumbnail_id: thumbnailId || '' // empty for now
                    }
                }
            ]
        };

        logDebug(
            'Adding to cart via /cart/add.js: variantId=' +
                variantId +
                ', quantity=' +
                normalizedQuantity
        );

        try {
            fetch('/cart/add.js', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                },
                body: JSON.stringify(body)
            })
                .then(function (response) {
                    if (!response.ok) {
                        return response.text().then(function (text) {
                            logWarn('Cart add failed: ' + text);
                        });
                    }

                    logDebug('Cart add succeeded.');

                    // Optional: notify other theme scripts that a configurator item was added
                    try {
                        var cartEvent = new CustomEvent('configurator:cart-added', {
                            detail: {
                                variantId: variantId,
                                quantity: normalizedQuantity,
                                config: config,
                                thumbnailId: thumbnailId || '',
                                payload: body
                            }
                        });
                        window.dispatchEvent(cartEvent);
                    } catch (e) {
                        // If CustomEvent fails for some reason, just ignore
                    }

                    // TODO: decide what UX you want here:
                    // window.location.href = '/cart';
                    // or open cart drawer, etc.
                })
                .catch(function (error) {
                    logWarn(
                        'Cart add network/JS error: ' +
                            (error && error.message ? error.message : String(error))
                    );
                });
        } catch (e) {
            logWarn(
                'Cart add threw an error: ' +
                    (e && e.message ? e.message : String(e))
            );
        }
    }

    // ---------------------------------
    // Event wiring
    // ---------------------------------

    window.addEventListener(
        'configurator:complete-order',
        handleConfiguratorCompleteOrder
    );

    logDebug('Configurator cart listener initialized.');
})();

(function initEntryContext() {
    var cachedContext = null;

    function getEntryContext() {
        if (cachedContext !== null) return cachedContext;

        var scriptEl = document.getElementById('glove-entry-context');
        if (!scriptEl) {
            cachedContext = {};
            return cachedContext;
        }

        try {
            cachedContext = JSON.parse(scriptEl.textContent);
        } catch (e) {
            console.warn('[Configurator] Failed to parse entry context JSON', e);
            cachedContext = {};
        }

        return cachedContext;
    }

    document.addEventListener('click', function(event) {
        var trigger = event.target.closest('.js-open-glove-configurator');
        if (!trigger) return;

        event.preventDefault();

        var context = getEntryContext();
        var url = new URL(window.location.href);

        url.searchParams.set('mode', 'customize');

        if (context.family) {
            url.searchParams.set('entry_family', context.family);
        }
        if (context.variantId) {
            url.searchParams.set('entry_variant', context.variantId);
        }

        window.location.href = url.toString();
    });
})();
