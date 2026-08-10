(function (global) {
  'use strict';

  var VERSION = '1.0.0';
  var CONTRACT = '1';
  var readyCallbacks = [];

  function applyDocument(targetDocument) {
    if (!targetDocument || !targetDocument.documentElement) return;
    var root = targetDocument.documentElement;
    root.dataset.zenvisUi = CONTRACT;
    root.removeAttribute('data-theme');
    root.style.colorScheme = 'light';
  }

  function getToken(name, target) {
    var element = target || document.documentElement;
    return global.getComputedStyle(element).getPropertyValue(name).trim();
  }

  function onReady(callback) {
    if (typeof callback !== 'function') return function () {};
    if (document.readyState === 'loading') {
      readyCallbacks.push(callback);
    } else {
      callback(api);
    }
    return function () {
      readyCallbacks = readyCallbacks.filter(function (item) {
        return item !== callback;
      });
    };
  }

  function observeResize(target, callback) {
    if (!target || typeof callback !== 'function') return function () {};
    if ('ResizeObserver' in global) {
      var observer = new ResizeObserver(function (entries) {
        callback(entries[0] && entries[0].contentRect);
      });
      observer.observe(target);
      return function () {
        observer.disconnect();
      };
    }
    var listener = function () {
      callback(target.getBoundingClientRect());
    };
    global.addEventListener('resize', listener);
    return function () {
      global.removeEventListener('resize', listener);
    };
  }

  function hostOrigin() {
    try {
      return document.referrer ? new URL(document.referrer).origin : global.location.origin;
    } catch (_) {
      return global.location.origin;
    }
  }

  function emitReady() {
    applyDocument(document);
    document.dispatchEvent(
      new CustomEvent('zenvis:ui-ready', {
        detail: { version: VERSION, contract: CONTRACT, colorScheme: 'light' },
      }),
    );
    readyCallbacks.splice(0).forEach(function (callback) {
      callback(api);
    });
    if (global.parent !== global) {
      global.parent.postMessage(
        { type: 'zenvis:plugin-ready', version: VERSION, contract: CONTRACT },
        hostOrigin(),
      );
    }
  }

  function handleHostMessage(event) {
    if (event.source !== global.parent || event.origin !== hostOrigin()) return;
    if (!event.data || event.data.type !== 'zenvis:ui') return;
    applyDocument(document);
    document.dispatchEvent(
      new CustomEvent('zenvis:ui-sync', {
        detail: { version: event.data.version || CONTRACT, colorScheme: 'light' },
      }),
    );
  }

  var api = Object.freeze({
    version: VERSION,
    contract: CONTRACT,
    colorScheme: 'light',
    applyDocument: applyDocument,
    getToken: getToken,
    observeResize: observeResize,
    onReady: onReady,
  });

  global.ZenVisPluginUI = api;
  global.addEventListener('message', handleHostMessage);
  applyDocument(document);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', emitReady, { once: true });
  } else {
    emitReady();
  }
})(window);
