const { useState, useEffect, useRef } = React;

// URL base de la API
// En XAMPP local apunta a localhost.
// En Hostinger simplemente cambia a '/Hotel-quinta-dalam/api/auth/login.php'
// porque el dominio ya es el correcto.
const API_LOGIN = window.QD_CONFIG.API_BASE + "/auth/login.php";

// ── Íconos SVG ─────────────────────────────────────────────
const IconEmail = () => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M2 7l10 7 10-7" />
  </svg>
);
const IconLock = () => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const IconEye = () => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const IconEyeOff = () => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);
const IconShield = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const IconCheck = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconAlert = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

// ── Componente Principal
function LoginPage() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [recordarme, setRecordarme] = useState(false);
  const [captchaOk, setCaptchaOk] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [errors, setErrors] = useState({});

  const submittingRef = useRef(false);

  // Si ya hay sesión activa, redirigir directamente
  useEffect(() => {
    const sesion = window.QDSession && window.QDSession.obtener();
    if (sesion) {
      window.location.href =
        sesion.rol === "admin" ? "dashboard.html" : "index.html";
    }
  }, []);

  // Limpiar alerta automáticamente después de 5s
  useEffect(() => {
    if (!alert) return;
    const t = setTimeout(() => setAlert(null), 5000);
    return () => clearTimeout(t);
  }, [alert]);

  // ── Validación del lado cliente
  function validar() {
    const errs = {};
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!correo.trim()) errs.correo = "El correo es obligatorio.";
    else if (!emailRx.test(correo)) errs.correo = "Ingresa un correo válido.";

    if (!password) errs.password = "La contraseña es obligatoria.";
    else if (password.length < 6) errs.password = "Mínimo 6 caracteres.";

    if (!captchaOk) errs.captcha = "Por favor confirma que no eres un robot.";

    return errs;
  }

  // ── Submit — conectado a la API real
  async function handleSubmit(e) {
    e.preventDefault();
    if (submittingRef.current) return;

    const errs = validar();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    submittingRef.current = true;
    setLoading(true);
    setAlert(null);

    try {
      // Petición real a la API PHP
      const res = await fetch(API_LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          correo: correo.trim().toLowerCase(),
          contrasena: password,
        }),
      });

      const data = await res.json();

      // Si la API devuelve ok: false → mostrar el error
      if (!data.ok) {
        setAlert({
          tipo: "error",
          msg: data.mensaje || "Credenciales incorrectas.",
        });
        return;
      }

      // Login exito
      // Guardar sesión usando el gestor compartido
      // QDSession activa automáticamente el temporizador
      // de inactividad de 20 minutos
      if (window.QDSession) {
        window.QDSession.guardar(data.usuario);
        window.QDSession.iniciarListeners();
      } else {
        // Fallback si session.js no cargó
        sessionStorage.setItem("qdSession", JSON.stringify(data.usuario));
      }

      setAlert({
        tipo: "success",
        msg: `¡Bienvenido, ${data.usuario.nombre}! Redirigiendo...`,
      });

      // Redirigir según rol después de 1.2s
      setTimeout(() => {
        window.location.href =
          data.usuario.rol === "admin" ? "dashboard.html" : "index.html";
      }, 1200);
    } catch (err) {
      // Error de red o servidor caído
      setAlert({
        tipo: "error",
        msg: "No se pudo conectar con el servidor. Verifica tu conexión.",
      });
    } finally {
      setLoading(false);
      submittingRef.current = false;
    }
  }

  // RENDER
  return (
    <div className="login-page-wrapper">
      <div className="login-card">
        {/*Panel Izquierdo — Branding*/}
        <div className="login-panel-brand">
          <div className="brand-ornament"></div>
          <div className="brand-ornament-bottom"></div>

          <span className="brand-float-icon">🏨</span>
          <span className="brand-float-icon">🌿</span>
          <span className="brand-float-icon">✨</span>

          <div className="brand-logo-wrap">
            <div className="brand-logo-circle">
              {/* Logo actualizado — SVG nuevo */}
              <img
                src="./img/logo/logo-quinta-dalam-dark.svg"
                alt="Logo Hotel Quinta Dalam"
              />
            </div>
          </div>

          <h2 className="brand-hotel-name">Hotel Quinta Dalam</h2>
          <p className="brand-tagline">Michoacán · México</p>
          <div className="brand-divider"></div>
          <p className="brand-message">
            "Tu refugio temático en el corazón de Michoacán"
          </p>
          <p className="brand-message-sub">
            Inicia sesión para gestionar tus reservaciones,
            <br />
            preferencias y perfil de huésped.
          </p>
        </div>

        {/* ── Panel Derecho — Formulario ── */}
        <div className="login-panel-form">
          <h1 className="login-form-title">Iniciar Sesión</h1>
          <p className="login-form-subtitle">Accede a tu cuenta de huésped</p>

          {/* Alerta global */}
          {alert && (
            <div className={`login-alert login-alert-${alert.tipo}`}>
              {alert.tipo === "error" ? <IconAlert /> : <IconCheck />}
              {alert.msg}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Correo */}
            <div className="login-field-group">
              <label className="login-label" htmlFor="login-correo">
                Correo Electrónico
              </label>
              <div className="login-input-wrap">
                <input
                  id="login-correo"
                  type="email"
                  className={`login-input${errors.correo ? " input-error" : ""}`}
                  placeholder="ejemplo@correo.com"
                  value={correo}
                  onChange={(e) => {
                    setCorreo(e.target.value);
                    if (errors.correo) setErrors((p) => ({ ...p, correo: "" }));
                  }}
                  autoComplete="email"
                />
                <span className="login-input-icon">
                  <IconEmail />
                </span>
              </div>
              {errors.correo && (
                <p className="login-field-error">
                  <IconAlert /> {errors.correo}
                </p>
              )}
            </div>

            {/* Contraseña */}
            <div className="login-field-group">
              <label className="login-label" htmlFor="login-password">
                Contraseña
              </label>
              <div className="login-input-wrap">
                <input
                  id="login-password"
                  type={showPwd ? "text" : "password"}
                  className={`login-input${errors.password ? " input-error" : ""}`}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password)
                      setErrors((p) => ({ ...p, password: "" }));
                  }}
                  autoComplete="current-password"
                />
                <span className="login-input-icon">
                  <IconLock />
                </span>
                <button
                  type="button"
                  className="login-pwd-toggle"
                  onClick={() => setShowPwd((p) => !p)}
                  aria-label={
                    showPwd ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                >
                  {showPwd ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
              {errors.password && (
                <p className="login-field-error">
                  <IconAlert /> {errors.password}
                </p>
              )}
            </div>

            {/* Recordarme + olvidé */}
            <div className="login-row-extras">
              <label className="login-check-label">
                <input
                  type="checkbox"
                  checked={recordarme}
                  onChange={(e) => setRecordarme(e.target.checked)}
                />
                Recordarme
              </label>
              <a href="recuperar-password.html" className="login-forgot-link">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {/* CAPTCHA */}
            <div
              className={`login-captcha-box${errors.captcha ? " captcha-error" : ""}`}
            >
              <input
                type="checkbox"
                id="login-captcha"
                checked={captchaOk}
                onChange={(e) => {
                  setCaptchaOk(e.target.checked);
                  if (errors.captcha) setErrors((p) => ({ ...p, captcha: "" }));
                }}
                aria-label="No soy un robot"
              />
              <label htmlFor="login-captcha" className="login-captcha-text">
                No soy un robot
              </label>
              <span className="login-captcha-logo">🤖</span>
            </div>
            {errors.captcha && (
              <p className="login-field-error">
                <IconAlert /> {errors.captcha}
              </p>
            )}

            {/* Botón */}
            <button
              type="submit"
              className="login-btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="login-spinner"></span>Verificando...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </button>
          </form>

          <div className="login-separator">
            <div className="login-separator-line"></div>
            <span className="login-separator-text">o</span>
            <div className="login-separator-line"></div>
          </div>

          <p className="login-register-row">
            ¿No tienes cuenta? <a href="registro.html">Regístrate aquí</a>
          </p>

          <div className="login-security-badge">
            <IconShield />
            <span>Conexión segura HTTPS · Sesión cifrada</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const loginRoot = ReactDOM.createRoot(document.getElementById("root-login"));
loginRoot.render(<LoginPage />);
