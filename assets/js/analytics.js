/**
 * Nelsmari Sous Vide - Analytics Module
 * Captura eventos del sitio y los envía a Google Sheets vía Apps Script.
 * Sin cookies, sin dependencias externas.
 */

const Analytics = (() => {
  // ── Configuración ──────────────────────────────────────────────
  // Reemplazar con la URL del deploy de Google Apps Script
  const ENDPOINT = '';
  const FLUSH_INTERVAL = 30000; // 30 segundos
  const MAX_QUEUE = 100;

  // ── Estado ─────────────────────────────────────────────────────
  const queue = [];
  const sessionId = generateSessionId();

  // ── Helpers ────────────────────────────────────────────────────

  function generateSessionId() {
    return Math.random().toString(36).substring(2, 10);
  }

  function getDeviceType() {
    var w = window.innerWidth;
    if (w < 768) return 'mobile';
    if (w < 1024) return 'tablet';
    return 'desktop';
  }

  function now() {
    return new Date().toISOString();
  }

  // ── API pública ────────────────────────────────────────────────

  function track(eventName, properties) {
    try {
      var entry = {
        event: eventName,
        timestamp: now(),
        session_id: sessionId,
        page: location.pathname + location.search
      };

      if (properties) {
        var keys = Object.keys(properties);
        for (var i = 0; i < keys.length; i++) {
          entry[keys[i]] = properties[keys[i]];
        }
      }

      queue.push(entry);

      // Evitar acumulación excesiva
      if (queue.length > MAX_QUEUE) {
        queue.splice(0, queue.length - MAX_QUEUE);
      }
    } catch (e) {
      // Silenciar - analytics nunca debe romper el sitio
    }
  }

  function flush() {
    if (queue.length === 0 || !ENDPOINT) return;

    var batch = queue.splice(0, queue.length);
    var payload = JSON.stringify(batch);

    try {
      // Preferir sendBeacon (confiable al cerrar pestaña)
      if (navigator.sendBeacon) {
        var blob = new Blob([payload], { type: 'application/json' });
        var sent = navigator.sendBeacon(ENDPOINT, blob);
        if (sent) return;
      }

      // Fallback: fetch fire-and-forget
      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true
      }).catch(function () {});
    } catch (e) {
      // Silenciar errores de red
    }
  }

  // ── Auto-tracking ──────────────────────────────────────────────

  // Page view
  track('page_view', {
    referrer: document.referrer,
    device: getDeviceType()
  });

  // Errores JS no capturados
  window.addEventListener('error', function (e) {
    track('js_error', {
      message: e.message,
      file: e.filename,
      line: e.lineno
    });
  });

  // Flush periódico
  setInterval(flush, FLUSH_INTERVAL);

  // Flush al salir de la página (visibilitychange es más confiable en mobile)
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') flush();
  });

  // ── Accesibilidad ──────────────────────────────────────────────

  // Cerrar menú mobile con Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      var navMobile = document.getElementById('nav-mobile');
      if (navMobile && navMobile.classList.contains('is-open')) {
        navMobile.classList.remove('is-open');
        var menuBtn = document.querySelector('.header__menu-btn');
        if (menuBtn) menuBtn.focus();
      }
    }
  });

  // ── Service Worker ──────────────────────────────────────────────

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(function () {});
  }

  // ── Exponer ────────────────────────────────────────────────────

  return { track: track, flush: flush };
})();
