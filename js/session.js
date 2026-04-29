// ============================================================
//  js/session.js — Hotel Quinta Dalam  v2.0
//  Gestor de sesión + Sistema de Toasts
//
//  SEGURIDAD (4 puntos de Beltran):
//  1. Heartbeat   — valida con PHP en cada página protegida
//  2. Fingerprint — detecta cambio de navegador, cierra sesión
//  3. Tab sync    — localStorage sincroniza logout entre pestañas
//  4. RBAC        — verificarPermisos() y guardarPagina()
//
//  EXPOSE:
//    window.QDSession  — gestor de sesión
//    window.QDToast    — notificaciones flotantes (toasts)
// ============================================================

(function () {
    'use strict';

    var TIMEOUT_MS   = 20 * 60 * 1000;
    var AVISO_MS     = 18 * 60 * 1000;
    var CLAVE_SESION = 'qdSession';
    var CLAVE_ULTIMA = 'qdLastActivity';
    var API_VALIDATE = '/Hotel-quinta-dalam/api/auth/validate.php';

    var timerExpiracion, timerAviso;
    var avisoVisible       = false;
    var listenersIniciados = false;

    // ══════════════════════════════════════════════════════════
    //  SISTEMA DE TOASTS — window.QDToast
    //  Uso: QDToast.exito('Perfil guardado'); QDToast.error('...')
    // ══════════════════════════════════════════════════════════
    window.QDToast = (function () {
        var cont    = null;
        var cnt     = 0;

        var cfg = {
            success: { icon:'✅', bg:'linear-gradient(135deg,#1a5c2e,#27ae60)', bo:'rgba(39,174,96,0.4)' },
            error:   { icon:'❌', bg:'linear-gradient(135deg,#2a1206,#6b3a1f)', bo:'rgba(196,154,108,0.4)' },
            warning: { icon:'⚠️', bg:'linear-gradient(135deg,#7c4a00,#d97706)', bo:'rgba(217,119,6,0.4)'  },
            info:    { icon:'ℹ️', bg:'linear-gradient(135deg,#1e3a6e,#2563eb)', bo:'rgba(37,99,235,0.4)'  }
        };

        function getCont() {
            if (cont && document.body.contains(cont)) return cont;
            cont = document.createElement('div');
            cont.id = 'qd-toast-cont';
            cont.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:99999;display:flex;flex-direction:column-reverse;gap:10px;max-width:360px;width:calc(100% - 48px);pointer-events:none;';
            document.body.appendChild(cont);
            return cont;
        }

        function show(msg, tipo, dur) {
            if (!document.body) { setTimeout(function(){ show(msg, tipo, dur); }, 300); return; }
            tipo = tipo || 'info';
            dur  = dur  || 4000;
            var c  = cfg[tipo] || cfg.info;
            var id = 'qd-t-' + (++cnt);

            var el = document.createElement('div');
            el.id  = id;
            el.style.cssText = [
                'display:flex;align-items:flex-start;gap:10px;',
                'background:' + c.bg + ';color:#fff;',
                'border:1px solid ' + c.bo + ';border-radius:12px;',
                'padding:14px 16px;font-family:Lato,Arial,sans-serif;',
                'font-size:0.88rem;line-height:1.45;',
                'box-shadow:0 10px 28px rgba(0,0,0,0.28);',
                'pointer-events:all;cursor:pointer;',
                'animation:qdTin 0.35s cubic-bezier(0.34,1.56,0.64,1);',
                'word-break:break-word;'
            ].join('');

            el.innerHTML =
                '<style>@keyframes qdTin{from{opacity:0;transform:translateX(22px)}to{opacity:1;transform:translateX(0)}}' +
                '@keyframes qdTout{from{opacity:1;transform:translateX(0)}to{opacity:0;transform:translateX(22px)}}</style>' +
                '<span style="font-size:1.1rem;flex-shrink:0;margin-top:1px">' + c.icon + '</span>' +
                '<span style="flex:1">' + msg + '</span>' +
                '<button style="background:none;border:none;color:rgba(255,255,255,0.55);cursor:pointer;font-size:1.1rem;line-height:1;padding:0 0 0 6px;flex-shrink:0">×</button>';

            getCont().appendChild(el);

            function remove() {
                el.style.animation = 'qdTout 0.25s ease forwards';
                setTimeout(function() { if (el.parentNode) el.remove(); }, 260);
            }
            var t = setTimeout(remove, dur);
            el.addEventListener('click', function(){ clearTimeout(t); remove(); });
        }

        return {
            mostrar: show,
            exito:   function(m,d){ show(m,'success',d||4000); },
            error:   function(m,d){ show(m,'error',  d||5000); },
            aviso:   function(m,d){ show(m,'warning',d||4500); },
            info:    function(m,d){ show(m,'info',   d||3500); }
        };
    })();

    // ══════════════════════════════════════════════════════════
    //  GESTOR DE SESIÓN — window.QDSession
    // ══════════════════════════════════════════════════════════
    window.QDSession = {

        // ── Guardar sesión en sessionStorage ────────────────
        guardar: function (u) {
            var d = { id: u.id, nombre: u.nombre, correo: u.correo, rol: u.rol };
            sessionStorage.setItem(CLAVE_SESION, JSON.stringify(d));
            try { localStorage.setItem('qdTabEvt', 'login|' + Date.now()); } catch(e){}
            QDSession.resetActividad();
        },

        // ── Leer sesión ──────────────────────────────────────
        obtener: function () {
            try {
                var r = sessionStorage.getItem(CLAVE_SESION);
                return r ? JSON.parse(r) : null;
            } catch(e) { return null; }
        },

        // ── Cerrar sesión ────────────────────────────────────
        cerrar: function (silencioso) {
            clearTimeout(timerExpiracion);
            clearTimeout(timerAviso);
            sessionStorage.removeItem(CLAVE_SESION);
            sessionStorage.removeItem(CLAVE_ULTIMA);
            QDSession.ocultarAviso();
            try { localStorage.setItem('qdTabEvt', 'logout|' + Date.now()); } catch(e){}
            try { fetch('/Hotel-quinta-dalam/api/auth/logout.php', { method:'POST', credentials:'include' }).catch(function(){}); } catch(e){}
            if (!silencioso) window.location.href = 'login.html?expired=1';
        },

        // ── Reset temporizador de inactividad ────────────────
        resetActividad: function () {
            sessionStorage.setItem(CLAVE_ULTIMA, Date.now().toString());
            clearTimeout(timerExpiracion);
            clearTimeout(timerAviso);
            QDSession.ocultarAviso();
            timerAviso      = setTimeout(function(){ QDSession.mostrarAviso(); }, AVISO_MS);
            timerExpiracion = setTimeout(function(){ QDSession.cerrar(false);  }, TIMEOUT_MS);
        },

        // ── PUNTO 1: HEARTBEAT ────────────────────────────────
        //   Envía la cookie PHPSESSID al servidor para validar
        //   la sesión PHP. PHP verifica el fingerprint (User-Agent).
        //   Si la sesión es válida y el fingerprint coincide,
        //   devuelve los datos del usuario.
        //   EXTRA: si una nueva pestaña no tiene sessionStorage
        //   pero sí tiene la cookie PHP válida, reconstituye
        //   la sesión automáticamente (soluciona tab sync).
        validarConServidor: function () {
            return fetch(API_VALIDATE, {
                method:      'POST',
                credentials: 'include',
                headers:     { 'Content-Type': 'application/json' }
            })
            .then(function(res){ return res.json(); })
            .then(function(data) {
                if (!data.ok) {
                    // Sesión PHP inválida o fingerprint no coincide
                    QDSession.cerrar(true);
                    return null;
                }
                // Refrescar sessionStorage con datos del servidor
                if (data.usuario) {
                    sessionStorage.setItem(CLAVE_SESION, JSON.stringify(data.usuario));
                    QDSession.resetActividad();
                    if (!listenersIniciados) QDSession.iniciarListeners();
                }
                return data.usuario;
            })
            .catch(function() {
                // Error de red: ser permisivo, no cerrar sesión
                return QDSession.obtener();
            });
        },

        // ── PUNTO 4a: GUARDIA DE RUTA ────────────────────────
        //   Oculta la página, valida con servidor, muestra o
        //   redirige según autenticación y rol.
        //   Uso en HTML (antes de </body>):
        //     QDSession.guardarPagina('', 'Inicia sesión para reservar.');
        //     QDSession.guardarPagina('admin', 'Solo administradores.');
        guardarPagina: function (rolRequerido, mensajeRedireccion) {
            var html = document.documentElement;
            html.style.opacity = '0';

            QDSession.validarConServidor().then(function(usuario) {
                if (!usuario) {
                    var msg = mensajeRedireccion || 'Inicia sesión para continuar.';
                    window.location.href = 'login.html?msg=' + encodeURIComponent(msg);
                    return;
                }
                if (rolRequerido && usuario.rol !== rolRequerido) {
                    window.QDToast.aviso('No tienes permisos para acceder a esta sección.');
                    setTimeout(function(){ window.location.href = 'index.html'; }, 1800);
                    return;
                }
                // Todo OK → mostrar página
                html.style.transition = 'opacity 0.35s ease';
                html.style.opacity    = '1';
            });
        },

        // ── PUNTO 4b: RBAC para componentes ──────────────────
        //   Uso dentro de React: if (!QDSession.verificarPermisos('admin')) return null;
        verificarPermisos: function (rolRequerido) {
            var s = QDSession.obtener();
            if (!s) { window.location.href = 'login.html'; return false; }
            if (rolRequerido && s.rol !== rolRequerido) {
                window.QDToast.aviso('Acceso restringido.');
                setTimeout(function(){ window.location.href = 'index.html'; }, 1800);
                return false;
            }
            return true;
        },

        estaAutenticado: function () { return QDSession.obtener() !== null; },

        // ── PUNTO 3: SINCRONIZACIÓN ENTRE PESTAÑAS ───────────
        //   localStorage es compartido entre pestañas.
        //   Al detectar 'logout' de otra pestaña, limpiar esta.
        iniciarSincronizacion: function () {
            window.addEventListener('storage', function(e) {
                if (e.key !== 'qdTabEvt') return;
                var accion = (e.newValue || '').split('|')[0];
                if (accion === 'logout') {
                    sessionStorage.removeItem(CLAVE_SESION);
                    sessionStorage.removeItem(CLAVE_ULTIMA);
                    clearTimeout(timerExpiracion);
                    clearTimeout(timerAviso);
                    var protegidas = ['reservaciones.html','dashboard.html','perfil.html'];
                    var actual = window.location.pathname.split('/').pop();
                    if (protegidas.indexOf(actual) !== -1) {
                        window.location.href = 'login.html';
                    }
                }
            });
        },

        // ── Aviso de expiración inminente ────────────────────
        mostrarAviso: function () {
            if (avisoVisible) return;
            avisoVisible = true;
            var el = document.createElement('div');
            el.id  = 'qd-session-aviso';
            el.innerHTML =
                '<div style="position:fixed;bottom:24px;right:24px;z-index:9998;' +
                'background:linear-gradient(135deg,#2a1206,#6b3a1f);color:#fff;' +
                'border-radius:14px;padding:18px 22px;box-shadow:0 8px 30px rgba(0,0,0,0.35);' +
                'font-family:Lato,Arial,sans-serif;font-size:0.9rem;max-width:320px;' +
                'border:1px solid rgba(196,154,108,0.3);animation:qdAvIn 0.3s ease;">' +
                '<style>@keyframes qdAvIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}</style>' +
                '<p style="margin:0 0 12px;font-weight:700;color:#e8c98a;">⏱ Sesión por expirar</p>' +
                '<p style="margin:0 0 14px;color:rgba(255,255,255,0.8);font-size:0.85rem;">' +
                'Tu sesión cerrará en 2 minutos por inactividad.</p>' +
                '<button id="qd-aviso-cont" style="background:linear-gradient(135deg,#c49a6c,#8c5a35);' +
                'color:#fff;border:none;border-radius:8px;padding:8px 20px;cursor:pointer;' +
                'font-weight:700;font-family:Lato,Arial,sans-serif;font-size:0.85rem;">' +
                'Continuar sesión</button></div>';
            document.body.appendChild(el);
            document.getElementById('qd-aviso-cont')
                .addEventListener('click', function(){ QDSession.resetActividad(); });
        },

        ocultarAviso: function () {
            avisoVisible = false;
            var el = document.getElementById('qd-session-aviso');
            if (el && el.parentNode) el.parentNode.removeChild(el);
        },

        iniciarListeners: function () {
            if (listenersIniciados) return;
            listenersIniciados = true;
            var throttle = false;
            function onAct() {
                if (throttle) return;
                throttle = true;
                setTimeout(function(){ throttle = false; }, 2000);
                QDSession.resetActividad();
            }
            ['mousemove','keydown','click','touchstart','scroll'].forEach(function(ev) {
                document.addEventListener(ev, onAct, { passive: true });
            });
        }
    };

    // ── Auto-init ─────────────────────────────────────────────
    if (QDSession.obtener()) {
        QDSession.resetActividad();
        QDSession.iniciarListeners();
    }

    QDSession.iniciarSincronizacion();

    // Banner en login.html cuando viene de expiración o redireccion
    window.addEventListener('DOMContentLoaded', function () {
        var p = new URLSearchParams(window.location.search);
        var m = p.get('msg') || (p.get('expired') === '1'
            ? 'Tu sesión expiró por inactividad. Inicia sesión nuevamente.'
            : null);
        if (!m) return;
        setTimeout(function() {
            var b = document.createElement('div');
            b.style.cssText = 'position:fixed;top:80px;left:50%;transform:translateX(-50%);' +
                'background:#fff3cd;color:#856404;border:1px solid #ffc107;' +
                'border-radius:10px;padding:12px 22px;font-family:Lato,Arial,sans-serif;' +
                'font-size:0.88rem;z-index:500;box-shadow:0 4px 14px rgba(0,0,0,0.1);' +
                'max-width:calc(100% - 40px);text-align:center;';
            b.textContent = '⏱ ' + m;
            document.body.appendChild(b);
            setTimeout(function(){ if (b.parentNode) b.remove(); }, 6000);
        }, 800);
    });

})();