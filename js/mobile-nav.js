(function () {
    'use strict';

    function initMobileNav() {
        const btn     = document.getElementById('nav-ham-btn');
        const nav     = document.querySelector('nav');
        const overlay = document.getElementById('nav-overlay');

        if (!btn || !nav) return;

        function openMenu() {
            nav.classList.add('nav-open');
            btn.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';
        }

        function closeMenu() {
            nav.classList.remove('nav-open');
            btn.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }

        function toggleMenu() {
            nav.classList.contains('nav-open') ? closeMenu() : openMenu();
        }

        btn.addEventListener('click', toggleMenu);

        if (overlay) {
            overlay.addEventListener('click', closeMenu);
        }

        // Cerrar al hacer click en un link del nav
        nav.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) closeMenu();
            });
        });

        // Cerrar si la ventana se agranda
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) closeMenu();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMobileNav);
    } else {
        initMobileNav();
    }

})();