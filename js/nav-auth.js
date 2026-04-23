(function () {
    'use strict';

    function getSesion() {
        try {
            const raw = sessionStorage.getItem('qdSession');
            return raw ? JSON.parse(raw) : null;
        } catch (e) { return null; }
    }

    function cerrarSesion() {
        sessionStorage.removeItem('qdSession');
        window.location.href = 'login.html';
    }

    function renderNavAuth() {
        const slot = document.getElementById('nav-auth-slot');
        if (!slot) return;

        const sesion = getSesion();

        if (!sesion) {
            slot.innerHTML = `
                <a href="login.html" class="nav-auth-link">
                    🔑 Iniciar Sesión
                </a>
            `;
        } else {
            const iniciales = sesion.nombre
                ? sesion.nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                : 'AD';

            const rolLabel   = sesion.rol === 'admin' ? '🛡️ Administrador' : '🧳 Huésped';
            const perfilHref = sesion.rol === 'admin' ? 'dashboard.html' : 'perfil.html';

            slot.innerHTML = `
                <div class="nav-auth-user">
                    <div class="nav-auth-avatar" title="${sesion.nombre || 'Mi cuenta'}">
                        ${iniciales}
                    </div>
                    <div class="nav-auth-dropdown">
                        <div class="nav-auth-dropdown-header">
                            <strong>${sesion.nombre || 'Usuario'}</strong>
                            <span class="nav-auth-rol">${rolLabel}</span>
                        </div>
                        <a href="${perfilHref}" class="nav-auth-dropdown-item">
                            👤 Mi Cuenta
                        </a>
                        <a href="perfil.html#mis-reservaciones" class="nav-auth-dropdown-item">
                            📋 Mis Reservaciones
                        </a>
                        <button class="nav-auth-dropdown-item nav-auth-logout"
                                id="btn-cerrar-sesion" type="button">
                            🚪 Cerrar Sesión
                        </button>
                    </div>
                </div>
            `;

            document.getElementById('btn-cerrar-sesion')
                .addEventListener('click', cerrarSesion);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderNavAuth);
    } else {
        renderNavAuth();
    }

})();