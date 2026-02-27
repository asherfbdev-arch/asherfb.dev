/* Protección cliente (solo JS)
   Uso: pega todo esto en tu bundle o en un <script src="...">.
   Nota: no existe protección 100% — esto sólo dificulta a usuarios casuales.
*/

(function () {
  "use strict";

  // ---------- CONFIG ----------
  const ACTION = "wipe"; // 'wipe'|'redirect'|'none'  -> acción cuando detecte DevTools
  const REDIRECT_URL = "/"; // si ACTION === 'redirect'
  const DEVTOOLS_CHECK_INTERVAL = 1000; // ms
  const DIM_THRESHOLD = 160; // px diferencia típica outer-inner cuando DevTools abierto

  // ---------- UTIL: no-op ----------
  function noop() {}

  // ---------- 1) bloquear menú contextual ----------
  window.addEventListener(
    "contextmenu",
    function (e) {
      e.preventDefault();
    },
    { passive: false }
  );

  // ---------- 2) bloquear selección / copiar / cortar / pegar ----------
  ["copy", "cut", "paste", "selectstart"].forEach(function (evt) {
    document.addEventListener(
      evt,
      function (e) {
        e.preventDefault();
      },
      { passive: false }
    );
  });

  // ---------- 3) bloquear atajos de teclado comunes ----------
  window.addEventListener(
    "keydown",
    function (e) {
      // F12
      if (e.key === "F12") {
        e.preventDefault();
        e.stopImmediatePropagation();
        return false;
      }

      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;
      const key = (e.key || "").toLowerCase();

      // combinaciones a bloquear
      if (ctrl && key === "u") {
        e.preventDefault();
        e.stopImmediatePropagation();
        return false;
      } // Ctrl+U
      if (ctrl && key === "s") {
        e.preventDefault();
        e.stopImmediatePropagation();
        return false;
      } // Ctrl+S
      if (ctrl && key === "p") {
        e.preventDefault();
        e.stopImmediatePropagation();
        return false;
      } // Ctrl+P
      if (ctrl && shift && key === "i") {
        e.preventDefault();
        e.stopImmediatePropagation();
        return false;
      } // Ctrl+Shift+I
      if (ctrl && shift && key === "c") {
        e.preventDefault();
        e.stopImmediatePropagation();
        return false;
      } // Ctrl+Shift+C
      if (ctrl && shift && key === "j") {
        e.preventDefault();
        e.stopImmediatePropagation();
        return false;
      } // Ctrl+Shift+J

      // bloquear Ctrl+Shift+K (Firefox DevTools), Ctrl+Shift+K sometimes
      if (ctrl && shift && key === "k") {
        e.preventDefault();
        e.stopImmediatePropagation();
        return false;
      }
    },
    { capture: true }
  );

  // ---------- 4) Sobrescribir console (después de la detección heurística) ----------
  function disableConsole() {
    try {
      const noop = function () {};
      // Intentar redefinir todo el objeto console
      Object.defineProperty(window, "console", {
        configurable: true,
        writable: true,
        value: {
          log: noop,
          info: noop,
          warn: noop,
          error: noop,
          debug: noop,
          trace: noop,
          table: noop,
          group: noop,
          groupCollapsed: noop,
          groupEnd: noop,
        },
      });
    } catch (e) {
      // Si falla, intenta asignar métodos individuales
      if (window.console) {
        [
          "log",
          "info",
          "warn",
          "error",
          "debug",
          "trace",
          "table",
          "group",
          "groupCollapsed",
          "groupEnd",
        ].forEach(function (k) {
          try {
            window.console[k] = function () {};
          } catch (_) {}
        });
      }
    }
  }

  // ---------- 5) Heurística para detectar DevTools ----------
  // combinamos dos técnicas:
  //  A) diferencia outer/inner (rápida pero puede falsear en ventanas pequeñas)
  //  B) objeto con getter que se dispara si la consola inspecciona el objeto cuando está abierta
  let devtoolsDetected = false;

  // (B) getter-based detector: crea un objeto que marcará la variable si el inspector lo accede
  function createConsoleProbe() {
    let opened = false;
    try {
      const probe = {};
      Object.defineProperty(probe, "id", {
        get: function () {
          opened = true;
          // throw para evitar revelar información accidentalmente en algunos entornos
          // (no es necesario; sólo para llamar la atención)
          return "probe";
        },
        configurable: true,
      });

      // Imprime el objeto: si la consola está abierta e inspecciona el objeto, el getter se ejecutará.
      // IMPORTANTE: esto funcionará *antes* de que sobrescribamos console.
      // No hacer esto continuamente muy seguido (puede llenar logs). Lo hacemos controladamente.
      try {
        window.console && window.console.log(probe);
      } catch (_) {}
    } catch (e) {
      // no hacer nada
    }
    return function () {
      // función que devuelve si fue abierto
      const r = opened;
      opened = false; // reset for next check
      return r;
    };
  }

  const probeCheck = createConsoleProbe();

  // (A) dimension-based check
  function dimsSuggestOpen() {
    try {
      const widthDiff = Math.abs(window.outerWidth - window.innerWidth);
      const heightDiff = Math.abs(window.outerHeight - window.innerHeight);
      return widthDiff > DIM_THRESHOLD || heightDiff > DIM_THRESHOLD;
    } catch (e) {
      return false;
    }
  }

  // Acción cuando detecte
  function onDevtoolsDetected() {
    if (devtoolsDetected) return;
    devtoolsDetected = true;

    // primero, desactivar console para evitar fugas
    disableConsole();

    // limpiar DOM sensible, destruir variables, forzar logout, etc.
    try {
      // ejemplo: sobreescribir todo el body
      if (ACTION === "wipe") {
        try {
          // eliminar event listeners básicos (mejor intentar reiniciar la app)
          document.documentElement.innerHTML = "";
          document.write(
            '<h2 style="font-family:system-ui, Arial; text-align:center; margin-top:20vh">Acceso no permitido</h2>'
          );
          document.close();
        } catch (e) {
          // en caso de fallo, forzar redirección
          window.location.href = REDIRECT_URL;
        }
      } else if (ACTION === "redirect") {
        window.location.href = REDIRECT_URL;
      } else {
        // 'none' -> solo marcar
        try {
          window.alert &&
            window.alert("Herramientas de desarrollo detectadas.");
        } catch (_) {}
      }
    } catch (e) {
      try {
        window.location.href = REDIRECT_URL;
      } catch (_) {}
    }
  }

  // Comprueba heurísticas y actúa si es necesario
  function checkDevtools() {
    try {
      // Primero la comprobación por probe (inspección de la consola)
      if (probeCheck()) {
        onDevtoolsDetected();
        return;
      }

      // Luego la comprobación por dimensiones
      if (dimsSuggestOpen()) {
        onDevtoolsDetected();
        return;
      }
    } catch (e) {
      // ignore
    }
  }

  // Ejecutar chequeos regulares
  const intervalId = setInterval(checkDevtools, DEVTOOLS_CHECK_INTERVAL);
  // También al resize
  window.addEventListener("resize", checkDevtools);

  // ---------- 6) Resiliencia: reaplicar protecciones ----------
  setInterval(function () {
    // Reaplicar clase noselect si existe razon para ello
    try {
      if (!document.body.classList.contains("noselect")) {
        document.body.classList.add("noselect");
      }
    } catch (e) {
      /* ignore */
    }
  }, 2000);

  // Export (opcional) para permitir acciones desde la consola si quieres (devs)
  try {
    window.__clientProtector = {
      disableConsole: disableConsole,
      checkDevtoolsNow: checkDevtools,
      stop: function () {
        clearInterval(intervalId);
        window.removeEventListener("resize", checkDevtools);
      },
    };
  } catch (e) {
    /* ignore */
  }
})();
