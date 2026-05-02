(function () {
  "use strict";

  // ── Si ya se mostró en esta sesión, no hacer nada
  if (sessionStorage.getItem("qdIntroVisto")) return;

  // ── SVG del logo incrustado
  const LOGO_SVG = `
    <svg xmlns="http://www.w3.org/2000/svg" width="130" height="130"
         viewBox="0 0 300 300" role="img">
      <title>Hotel Quinta Dalam</title>
      <defs>
        <linearGradient id="gold-i" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stop-color="#c49a6c"/>
          <stop offset="40%"  stop-color="#e8c98a"/>
          <stop offset="70%"  stop-color="#b07d52"/>
          <stop offset="100%" stop-color="#8c5a35"/>
        </linearGradient>
      </defs>
      <circle cx="150" cy="150" r="145" fill="#1a0d06"/>
      <circle cx="150" cy="150" r="138" fill="none" stroke="url(#gold-i)" stroke-width="1.5"/>
      <circle cx="150" cy="150" r="128" fill="none" stroke="url(#gold-i)" stroke-width="0.5" opacity="0.6"/>
      <polygon points="150,10 155,18 150,26 145,18"      fill="url(#gold-i)" opacity="0.9"/>
      <polygon points="150,274 155,282 150,290 145,282"  fill="url(#gold-i)" opacity="0.9"/>
      <polygon points="4,150 12,155 20,150 12,145"       fill="url(#gold-i)" opacity="0.9"/>
      <polygon points="280,150 288,155 296,150 288,145"  fill="url(#gold-i)" opacity="0.9"/>
      <path d="M100,80 L100,220 L128,220 C185,220 210,190 210,150 C210,110 185,80 128,80 Z"
            fill="url(#gold-i)" opacity="0.95"/>
      <path d="M118,98 L118,202 L130,202 C176,202 192,180 192,150 C192,120 176,98 130,98 Z"
            fill="#1a0d06"/>
      <rect x="128" y="80"  width="20" height="115" fill="url(#gold-i)" opacity="0.95"/>
      <rect x="128" y="195" width="72" height="25" rx="2" fill="url(#gold-i)" opacity="0.95"/>
      <line x1="80" y1="236" x2="220" y2="236" stroke="url(#gold-i)" stroke-width="0.75" opacity="0.5"/>
      <text x="150" y="256" text-anchor="middle"
            font-family="Georgia, serif" font-size="11" letter-spacing="4"
            fill="url(#gold-i)" opacity="0.85">QUINTA DALAM</text>
    </svg>`;

  // ── Partículas de fondo
  function crearParticulas(contenedor) {
    const cantidad = 18;
    for (let i = 0; i < cantidad; i++) {
      const p = document.createElement("span");
      p.className = "qd-particle";
      const size = Math.random() * 3 + 1.5;
      const left = Math.random() * 100;
      const dur = Math.random() * 6 + 5;
      const delay = Math.random() * 4;
      const opac = Math.random() * 0.25 + 0.1;
      p.style.cssText = `
                width:${size}px; height:${size}px;
                left:${left}%;
                animation-duration:${dur}s;
                animation-delay:-${delay}s;
                opacity:${opac};
            `;
      contenedor.appendChild(p);
    }
  }

  // ── Construir el HTML del splash
  function construirIntro() {
    const wrap = document.createElement("div");
    wrap.id = "qd-intro";
    wrap.setAttribute("role", "dialog");
    wrap.setAttribute(
      "aria-label",
      "Pantalla de bienvenida Hotel Quinta Dalam",
    );

    wrap.innerHTML = `
            <div class="qd-particles" id="qd-particles-container"></div>

            <div class="qd-content">

                <!-- Logo -->
                <div class="qd-logo-wrap" aria-hidden="true">
                    ${LOGO_SVG}
                </div>

                <!-- Línea dorada ornamental -->
                <div class="qd-line" aria-hidden="true"></div>

                <!-- Texto de bienvenida -->
                <p class="qd-welcome-text">Bienvenido a</p>

                <!-- Nombre del hotel -->
                <h1 class="qd-hotel-name">Hotel Quinta Dalam</h1>

                <!-- Tagline -->
                <p class="qd-tagline">Michoacán · México</p>

                <!-- Barra de progreso -->
                <div class="qd-progress-wrap" aria-hidden="true">
                    <div class="qd-progress-track">
                        <div class="qd-progress-bar" id="qd-bar"></div>
                    </div>
                </div>

                <!-- Botón Saltar -->
                <button class="qd-skip-btn" id="qd-skip-btn" type="button"
                        aria-label="Saltar pantalla de bienvenida">
                    Saltar
                </button>

            </div>
        `;

    return wrap;
  }

  // ── Función para ocultar / desmontar el splash
  function cerrarIntro(overlay) {
    // Marcar como visto para no mostrarlo de nuevo en esta sesión
    sessionStorage.setItem("qdIntroVisto", "1");

    // Fade out con CSS
    overlay.classList.add("qd-hiding");

    // Remover del DOM después de la transición
    overlay.addEventListener("transitionend", function handler() {
      overlay.removeEventListener("transitionend", handler);
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      // Restaurar scroll del body
      document.body.style.overflow = "";
    });
  }

  // ── Inicializar cuando el DOM esté listo
  function init() {
    // Bloquear scroll mientras el splash esté visible
    document.body.style.overflow = "hidden";

    // Crear e insertar el overlay
    const overlay = construirIntro();
    document.body.insertBefore(overlay, document.body.firstChild);

    // Agregar partículas
    crearParticulas(document.getElementById("qd-particles-container"));

    // Botón Saltar
    document
      .getElementById("qd-skip-btn")
      .addEventListener("click", function () {
        cerrarIntro(overlay);
      });

    // Auto-cerrar después de 3.2 segundos
    setTimeout(function () {
      cerrarIntro(overlay);
    }, 3200);

    // Accesibilidad: cerrar con tecla Escape
    document.addEventListener("keydown", function handler(e) {
      if (e.key === "Escape") {
        document.removeEventListener("keydown", handler);
        cerrarIntro(overlay);
      }
    });
  }

  // ── Ejecutar
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
