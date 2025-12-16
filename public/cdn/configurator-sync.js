(function () {
  'use strict';

  // 1. CONFIGURATION: 3D App IDs -> Shopify Option Values
  var VALUE_MAP = {
    // Mapping 'size'
    // Your Shopify Page uses raw numbers ("11.25"), not text ("11.25 Inch")
    size: {
      '1100': '11',
      '1125': '11.25',
      '1150': '11.5',
      '1175': '11.75',
      '1200': '12',
      '1225': '12.25',
      '1250': '12.5',
      '1275': '12.75',
      '1300': 'standard', // For First Base
      '3300': '33'        // For Catchers (if you add options later)
    },
    
    // Mapping 'leather' -> Shopify 'material'
    leather: {
      'imgOpt1': 'Japanese Kip Leather',
      'imgOpt2': 'Steerhide',
      'imgOpt3': 'Cowhide'
    },

    // Mapping 'web' -> Shopify 'web'
    // Since your mock only has "H-web", most of these will "fail safe" (do nothing),
    // which is exactly what we want for a dummy option.
    webStyle: {
      'h': 'H-web',
      'i': 'I-web', // Won't find match, will stay on H-web (Correct)
      'trap': 'Trapeze',
      'basket': 'Basket'
    }
  };

  // 2. LOGIC: Find and Click
  function selectOption(value) {
    if (!value) return;
    var safeValue = value.replace(/"/g, '\\"'); // Escape quotes just in case

    // Strategy A: Radio Buttons
    var radio = document.querySelector('input[type="radio"][value="' + safeValue + '"]');
    if (radio) {
      if (!radio.checked) radio.click();
      return;
    }

    // Strategy B: Dropdowns (Selects) & Pills
    // We look for any element (option or label) that matches the text
    var allElements = document.querySelectorAll('option, label');
    for (var i = 0; i < allElements.length; i++) {
      var el = allElements[i];
      // Check for exact text match (trimmed)
      if (el.textContent.trim() === value || el.value === value) {
        
        // If it's an <option> in a dropdown
        if (el.tagName === 'OPTION') {
            var select = el.parentElement;
            if (select && select.value !== value) {
                select.value = value;
                select.dispatchEvent(new Event('change', { bubbles: true }));
            }
        } 
        // If it's a <label> (common for "pills" in Dawn theme)
        else if (el.tagName === 'LABEL') {
            el.click();
        }
        return;
      }
    }
  }

  // 3. EVENT LISTENER
  window.addEventListener('configurator:sync-back', function (event) {
    var payload = event.detail || {};

    if (payload.size) selectOption(VALUE_MAP.size[payload.size]);
    if (payload.leather) selectOption(VALUE_MAP.leather[payload.leather]);
    if (payload.webStyle) selectOption(VALUE_MAP.webStyle[payload.webStyle]);
    
    // Scroll to buy button
    var form = document.querySelector('form[action*="/cart/add"]');
    if (form) form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

})();