const { useState } = React;

// ── Íconos SVG ─────────────────────────────────────────────────
const IconUser = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
    </svg>
);

const IconPhone = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.61 19 19.45 19.45 0 0 1 5 12.39 19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91A16 16 0 0 0 14.09 15.91l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
);

const IconEmail = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2"/>
        <path d="M2 7l10 7 10-7"/>
    </svg>
);

const IconTag = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
        <line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
);

const IconMessage = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
);

// ── Componente principal ───────────────────────────────────────
function ModuloContacto() {

    const [datos, setDatos] = useState({
        nombre:   '',
        correo:   '',
        telefono: '',
        asunto:   'Información General',
        mensaje:  ''
    });

    const [enviando,      setEnviando]      = useState(false);
    const [mensajeEnviado, setMensajeEnviado] = useState(false);

    // ── Envío del formulario ───────────────────────────────────
    async function procesarEnvio(e) {
        e.preventDefault();
        setEnviando(true);

        // Sonido de éxito (opcional)
        try {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
            audio.play().catch(() => {});
        } catch (err) {}

        // Simulación de envío (reemplazar con fetch real a la API)
        await new Promise(r => setTimeout(r, 1200));

        setEnviando(false);
        setMensajeEnviado(true);

        // Limpiar y cerrar modal después de 4 segundos
        setTimeout(() => {
            setMensajeEnviado(false);
            setDatos({ nombre: '', correo: '', telefono: '', asunto: 'Información General', mensaje: '' });
        }, 4000);
    }

    // ── Render ──────────────────────────────────────────────────
    return (
        <div className="contacto-page">

            {/* Encabezado — tarjeta flotante */}
            <div className="contacto-hero">
                <div className="contacto-hero-card">
                    <h1>Ponte en Contacto</h1>
                    <p>
                        Estamos listos para hacer de tu visita a Michoacán algo
                        inolvidable. Escríbenos y te responderemos a la brevedad.
                    </p>
                    <div className="contacto-hero-line"></div>
                </div>
            </div>

            {/* Tarjeta dividida */}
            <div className="contacto-card">

                {/* ── Panel izquierdo: info + mapa ── */}
                <div className="contacto-panel-info">

                    {/* Ornamentos */}
                    <div className="cinfo-ornament"></div>
                    <div className="cinfo-ornament-b"></div>

                    <h2 className="cinfo-title">Datos de Contacto</h2>
                    <p className="cinfo-subtitle">
                        Llena el formulario y nuestro equipo<br />
                        se pondrá en contacto contigo a la brevedad.
                    </p>

                    <div className="cinfo-divider"></div>

                    {/* Ítems de contacto */}
                    <div className="cinfo-items">
                        <div className="cinfo-item">
                            <div className="cinfo-item-icon">📞</div>
                            <div>
                                <p className="cinfo-item-label">Llámanos</p>
                                <p className="cinfo-item-value">+52 (443) 377 0214</p>
                            </div>
                        </div>
                        <div className="cinfo-item">
                            <div className="cinfo-item-icon">✉️</div>
                            <div>
                                <p className="cinfo-item-label">Escríbenos</p>
                                <p className="cinfo-item-value">info@quintadalam.com</p>
                            </div>
                        </div>
                        <div className="cinfo-item">
                            <div className="cinfo-item-icon">📍</div>
                            <div>
                                <p className="cinfo-item-label">Visítanos</p>
                                <p className="cinfo-item-value">
                                    Centro Histórico<br />Michoacán, México
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Redes sociales */}
                    <p className="cinfo-redes-label">Síguenos en redes</p>
                    <div className="cinfo-redes">
                        <a href="https://www.facebook.com/profile.php?id=61584681841684"
                           target="_blank" rel="noopener noreferrer"
                           className="cinfo-red-btn" title="Facebook">
                            <img src="./img/iconos/icon-facebook.png" alt="Facebook" />
                        </a>
                        <a href="https://www.instagram.com/quintadalam"
                           target="_blank" rel="noopener noreferrer"
                           className="cinfo-red-btn" title="Instagram">
                            <img src="./img/iconos/icon-instagram.png" alt="Instagram" />
                        </a>
                        <a href="https://www.tiktok.com/@quintadalam"
                           target="_blank" rel="noopener noreferrer"
                           className="cinfo-red-btn" title="TikTok">
                            <img src="./img/iconos/icon-tiktok.png" alt="TikTok" />
                        </a>
                    </div>

                    {/* Mapa */}
                    <div className="cinfo-mapa">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15024.96020524584!2d-101.19694465!3d19.70271175!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x842d0e40be8f5d05%3A0x80352ef2dc740df!2sCentro%20hist%C3%B3rico%20de%20Morelia%2C%20Morelia%2C%20Mich.!5e0!3m2!1ses-419!2smx!4v1700000000000!5m2!1ses-419!2smx"
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Mapa Hotel Quinta Dalam">
                        </iframe>
                    </div>
                </div>

                {/* ── Panel derecho: formulario ── */}
                <div className="contacto-panel-form">

                    <h2 className="cform-title">Envíanos un Mensaje</h2>
                    <p className="cform-subtitle">Todos los campos marcados con * son obligatorios</p>

                    <form onSubmit={procesarEnvio} noValidate>

                        {/* Nombre + Teléfono */}
                        <div className="cform-row-2">
                            <div className="cform-group">
                                <label className="cform-label">Nombre Completo *</label>
                                <div className="cform-input-wrap">
                                    <input
                                        type="text"
                                        className="cform-input"
                                        required
                                        pattern="[A-Za-záéíóúÁÉÍÓÚñÑ\s]+"
                                        title="Solo letras"
                                        placeholder="Ej. Juan Pérez"
                                        value={datos.nombre}
                                        onChange={e => setDatos({...datos, nombre: e.target.value})}
                                    />
                                    <span className="cform-input-icon"><IconUser /></span>
                                </div>
                            </div>

                            <div className="cform-group">
                                <label className="cform-label">Teléfono *</label>
                                <div className="cform-input-wrap">
                                    <input
                                        type="tel"
                                        className="cform-input"
                                        required
                                        pattern="[0-9]{10}"
                                        title="10 dígitos numéricos"
                                        maxLength="10"
                                        placeholder="10 dígitos"
                                        value={datos.telefono}
                                        onChange={e => setDatos({...datos, telefono: e.target.value})}
                                    />
                                    <span className="cform-input-icon"><IconPhone /></span>
                                </div>
                            </div>
                        </div>

                        {/* Correo */}
                        <div className="cform-group">
                            <label className="cform-label">Correo Electrónico *</label>
                            <div className="cform-input-wrap">
                                <input
                                    type="email"
                                    className="cform-input"
                                    required
                                    pattern="[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$"
                                    title="Correo válido"
                                    placeholder="ejemplo@correo.com"
                                    value={datos.correo}
                                    onChange={e => setDatos({...datos, correo: e.target.value})}
                                />
                                <span className="cform-input-icon"><IconEmail /></span>
                            </div>
                        </div>

                        {/* Asunto */}
                        <div className="cform-group">
                            <label className="cform-label">Asunto *</label>
                            <div className="cform-input-wrap">
                                <select
                                    className="cform-select"
                                    value={datos.asunto}
                                    onChange={e => setDatos({...datos, asunto: e.target.value})}
                                >
                                    <option value="Información General">Información General</option>
                                    <option value="Dudas sobre Habitaciones">Dudas sobre Habitaciones</option>
                                    <option value="Eventos Especiales">Eventos Especiales (Bodas, Convenciones)</option>
                                    <option value="Soporte Técnico">Problemas con la página</option>
                                </select>
                                <span className="cform-input-icon"><IconTag /></span>
                                <span className="cform-select-arrow">▾</span>
                            </div>
                        </div>

                        {/* Mensaje */}
                        <div className="cform-group">
                            <label className="cform-label">Mensaje *</label>
                            <div className="cform-input-wrap">
                                <textarea
                                    className="cform-textarea"
                                    required
                                    minLength="15"
                                    title="Mínimo 15 caracteres"
                                    placeholder="Escribe aquí tu mensaje detallado..."
                                    value={datos.mensaje}
                                    onChange={e => setDatos({...datos, mensaje: e.target.value})}
                                />
                                <span className="cform-input-icon top"><IconMessage /></span>
                            </div>
                        </div>

                        {/* Botón enviar */}
                        <button type="submit" className="cform-btn" disabled={enviando}>
                            {enviando
                                ? <><span className="cform-spinner"></span>Enviando...</>
                                : '✉️ Enviar Mensaje'
                            }
                        </button>

                    </form>
                </div>
            </div>

            {/* ── Modal de éxito ── */}
            {mensajeEnviado && (
                <div className="cform-modal-overlay">
                    <div className="cform-modal">
                        <span className="cform-modal-icon">✅</span>
                        <h2>¡Mensaje Enviado!</h2>
                        <p>
                            Gracias por escribirnos, <strong>{datos.nombre}</strong>.
                        </p>
                        <p>
                            Hemos recibido tu mensaje sobre{' '}
                            <strong>"{datos.asunto}"</strong>.<br />
                            Te responderemos muy pronto.
                        </p>
                    </div>
                </div>
            )}

        </div>
    );
}

// ── Montar en el DOM ────────────────────────────────────────────
const contactoRoot = ReactDOM.createRoot(document.getElementById('root-contacto'));
contactoRoot.render(<ModuloContacto />);