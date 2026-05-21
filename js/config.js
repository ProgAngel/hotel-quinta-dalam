// ============================================================
//  config.js — Hotel Quinta Dalam
// ============================================================

window.QD_CONFIG = {
  // ── Detección automática de entorno ────────────────────────
  entorno:
    window.location.hostname === "localhost" ||
    window.location.hostname.includes("ngrok")
      ? "desarrollo"
      : "produccion",

  // ── URL base de la API ──────────────────────────────────
  // Si estamos en la laptop (Local o Ngrok), usamos la subcarpeta.
  // Si estamos en Hostinger, usamos la raíz.
  get API_BASE() {
    return window.location.hostname === "localhost" ||
      window.location.hostname.includes("ngrok")
      ? "/Hotel-quinta-dalam/api"
      : "/api";
  },
};

// Congelar para seguridad
Object.freeze(window.QD_CONFIG);

// Debug inteligente
if (window.QD_CONFIG.entorno === "desarrollo") {
  console.info(
    "%c[QD Config]%c Entorno detectado: %c" +
      window.QD_CONFIG.entorno.toUpperCase(),
    "color: #8c5a35; font-weight: bold;",
    "color: default;",
    "color: #43a047; font-weight: bold;",
  );
  console.log("URL Base:", window.QD_CONFIG.API_BASE);
}
