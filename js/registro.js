// ============================================================
//  registro.js — Hotel Quinta Dalam
//  SEGURIDAD: rol siempre 'cliente' — hardcodeado en PHP.
//  Admins y recepcionistas se crean SOLO desde el dashboard.
// ============================================================

const { useState, useEffect, useRef, useCallback } = React;

const API_REGISTRO    = '/Hotel-quinta-dalam/api/auth/registro.php';
const API_CHECK_EMAIL = '/Hotel-quinta-dalam/api/auth/check-email.php';

const IconUser = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
);
const IconEmail = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/>
    </svg>
);
const IconPhone = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.61 19 19.45 19.45 0 0 1 5 12.39 19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91A16 16 0 0 0 14.09 15.91l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
);
const IconLock = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
);
const IconShield = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
);
const IconEye = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
);
const IconEyeOff = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
);
const IconCheck = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
    </svg>
);
const IconAlert = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
);

function evaluarFuerza(pwd) {
    if (!pwd) return { nivel: 0, texto: '', clase: '' };
    let score = 0;
    if (pwd.length >= 8)          score++;
    if (pwd.length >= 12)         score++;
    if (/[A-Z]/.test(pwd))        score++;
    if (/[0-9]/.test(pwd))        score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 1) return { nivel: 1, texto: 'Muy débil',  clase: 'active-weak'   };
    if (score === 2) return { nivel: 2, texto: 'Débil',      clase: 'active-weak'   };
    if (score === 3) return { nivel: 3, texto: 'Regular',    clase: 'active-fair'   };
    if (score === 4) return { nivel: 4, texto: 'Buena',      clase: 'active-good'   };
    return                { nivel: 5, texto: 'Excelente',   clase: 'active-strong' };
}

function ModalResultado({ tipo, nombre, mensaje, onCerrar }) {
    const esExito = tipo === 'exito';
    useEffect(() => {
        if (esExito) {
            const t = setTimeout(() => { window.location.href = 'login.html'; }, 3000);
            return () => clearTimeout(t);
        }
    }, [esExito]);
    return (
        <div className="reg-modal-overlay">
            <div className="reg-modal-box">
                <div className={`reg-modal-icono-wrap ${esExito ? 'reg-modal--exito' : 'reg-modal--error'}`}>
                    <span className="reg-modal-emoji">{esExito ? '🎉' : '⚠️'}</span>
                </div>
                <h2 className="reg-modal-titulo">{esExito ? '¡Cuenta creada!' : 'Algo salió mal'}</h2>
                {esExito ? (
                    <>
                        <p className="reg-modal-texto">¡Bienvenido, <strong>{nombre}</strong>!</p>
                        <p className="reg-modal-subtexto">Tu cuenta fue creada exitosamente.<br />Serás redirigido al inicio de sesión en unos segundos.</p>
                        <div className="reg-modal-progress-track"><div className="reg-modal-progress-bar"></div></div>
                        <p className="reg-modal-redir">Redirigiendo a inicio de sesión...</p>
                    </>
                ) : (
                    <>
                        <p className="reg-modal-texto">{mensaje}</p>
                        <button className="reg-modal-btn-cerrar" onClick={onCerrar}>Intentar de nuevo</button>
                    </>
                )}
            </div>
        </div>
    );
}

function RegistroPage() {
    const [nombre,      setNombre]      = useState('');
    const [apellido,    setApellido]    = useState('');
    const [correo,      setCorreo]      = useState('');
    const [telefono,    setTelefono]    = useState('');
    const [password,    setPassword]    = useState('');
    const [confirmar,   setConfirmar]   = useState('');
    const [captchaOk,   setCaptchaOk]   = useState(false);
    const [terminos,    setTerminos]    = useState(false);
    const [showPwd,     setShowPwd]     = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading,     setLoading]     = useState(false);
    const [errors,      setErrors]      = useState({});
    const [modal,       setModal]       = useState(null);
    const [correoStatus, setCorreoStatus] = useState(null);
    const correoTimer = useRef(null);
    const fuerza = evaluarFuerza(password);

    const verificarCorreo = useCallback((valor) => {
        clearTimeout(correoTimer.current);
        if (!valor || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) { setCorreoStatus(null); return; }
        setCorreoStatus('checking');
        correoTimer.current = setTimeout(async () => {
            try {
                const res  = await fetch(API_CHECK_EMAIL + '?correo=' + encodeURIComponent(valor));
                const data = await res.json();
                setCorreoStatus(data.disponible ? 'available' : 'taken');
            } catch { setCorreoStatus(null); }
        }, 600);
    }, []);

    function validar() {
        const errs = {};
        if (!nombre.trim())   errs.nombre   = 'El nombre es obligatorio.';
        if (!apellido.trim()) errs.apellido = 'El apellido es obligatorio.';
        if (!correo.trim())        errs.correo = 'El correo es obligatorio.';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) errs.correo = 'Correo no válido.';
        else if (correoStatus === 'taken') errs.correo = 'Este correo ya está registrado.';
        if (telefono && !/^[0-9]{10}$/.test(telefono.replace(/\s/g, ''))) errs.telefono = 'El teléfono debe tener 10 dígitos.';
        if (!password)               errs.password  = 'La contraseña es obligatoria.';
        else if (password.length < 8)  errs.password  = 'Mínimo 8 caracteres.';
        else if (fuerza.nivel < 3)     errs.password  = 'La contraseña es muy débil.';
        if (!confirmar)                  errs.confirmar = 'Confirma tu contraseña.';
        else if (confirmar !== password) errs.confirmar = 'Las contraseñas no coinciden.';
        if (!captchaOk) errs.captcha  = 'Confirma que no eres un robot.';
        if (!terminos)  errs.terminos = 'Debes aceptar los términos y condiciones.';
        return errs;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const errs = validar();
        setErrors(errs);
        if (Object.keys(errs).length > 0) return;
        setLoading(true);
        try {
            const res = await fetch(API_REGISTRO, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre:     `${nombre.trim()} ${apellido.trim()}`,
                    correo:     correo.trim().toLowerCase(),
                    telefono:   telefono.trim(),
                    contrasena: password,
                    // rol NO se envía — el backend lo fuerza a 'cliente'
                })
            });
            const data = await res.json();
            if (res.status === 409) { setErrors(p => ({...p, correo: 'Este correo ya está registrado.'})); setCorreoStatus('taken'); setLoading(false); return; }
            if (!data.ok) { setModal({ tipo: 'error', mensaje: data.mensaje || 'Error al crear la cuenta.' }); setLoading(false); return; }
            setModal({ tipo: 'exito', nombre: data.usuario?.nombre || `${nombre} ${apellido}` });
        } catch { setModal({ tipo: 'error', mensaje: 'No se pudo conectar con el servidor.' }); setLoading(false); }
    }

    const correoStatusIcon = () => ({ checking:'⏳', available:'✅', taken:'❌' }[correoStatus] || null);
    const correoMsgClase   = () => ({ available:'success', taken:'error', checking:'info' }[correoStatus] || 'info');
    const correoMsgTexto   = () => ({ checking:'Verificando disponibilidad...', available:'Correo disponible ✓', taken:'Este correo ya está registrado.' }[correoStatus] || null);

    return (
        <div className="reg-page-wrapper">
            {modal && <ModalResultado tipo={modal.tipo} nombre={modal.nombre} mensaje={modal.mensaje} onCerrar={() => { setModal(null); setLoading(false); }} />}

            <div className="reg-card">
                {/* Panel Izquierdo */}
                <div className="reg-panel-brand">
                    <div className="reg-ornament-top"></div>
                    <div className="reg-ornament-bottom"></div>
                    <span className="reg-float-icon">🏨</span>
                    <span className="reg-float-icon">🌿</span>
                    <span className="reg-float-icon">🔑</span>
                    <div className="reg-logo-circle">
                        <img src="./img/logo/logo-quinta-dalam-dark.svg" alt="Logo Hotel Quinta Dalam" />
                    </div>
                    <h2 className="reg-brand-name">Hotel Quinta Dalam</h2>
                    <p className="reg-brand-tagline">Michoacán · México</p>
                    <div className="reg-brand-divider"></div>
                    <p className="reg-brand-message">"Únete a nuestra comunidad de huéspedes"</p>
                    <p className="reg-brand-sub">Crea tu cuenta y disfruta de<br />reservaciones rápidas y exclusivas.</p>
                    <ul className="reg-benefits">
                        <li><span className="reg-benefit-icon">✨</span> Reservaciones prioritarias</li>
                        <li><span className="reg-benefit-icon">🏷️</span> Tarifas especiales para miembros</li>
                        <li><span className="reg-benefit-icon">📋</span> Historial de estancias</li>
                        <li><span className="reg-benefit-icon">🔔</span> Notificaciones y ofertas</li>
                    </ul>
                </div>

                {/* Panel Derecho */}
                <div className="reg-panel-form">
                    <h1 className="reg-form-title">Crear Cuenta</h1>
                    <p className="reg-form-subtitle">Completa los datos para registrarte</p>

                    <form onSubmit={handleSubmit} noValidate>

                        {/* Nombre + Apellido */}
                        <div className="reg-row-2col">
                            <div className="reg-field-group">
                                <label className="reg-label" htmlFor="reg-nombre">Nombre</label>
                                <div className="reg-input-wrap">
                                    <input id="reg-nombre" type="text" className={`reg-input${errors.nombre?' input-error':''}`}
                                        placeholder="Ej: Carlos" value={nombre} autoComplete="given-name"
                                        onChange={e => { setNombre(e.target.value); if(errors.nombre) setErrors(p=>({...p,nombre:''})); }} />
                                    <span className="reg-input-icon"><IconUser /></span>
                                </div>
                                {errors.nombre && <p className="reg-field-msg error"><IconAlert /> {errors.nombre}</p>}
                            </div>
                            <div className="reg-field-group">
                                <label className="reg-label" htmlFor="reg-apellido">Apellido</label>
                                <div className="reg-input-wrap">
                                    <input id="reg-apellido" type="text" className={`reg-input${errors.apellido?' input-error':''}`}
                                        placeholder="Ej: García" value={apellido} autoComplete="family-name"
                                        onChange={e => { setApellido(e.target.value); if(errors.apellido) setErrors(p=>({...p,apellido:''})); }} />
                                    <span className="reg-input-icon"><IconUser /></span>
                                </div>
                                {errors.apellido && <p className="reg-field-msg error"><IconAlert /> {errors.apellido}</p>}
                            </div>
                        </div>

                        {/* Correo */}
                        <div className="reg-field-group">
                            <label className="reg-label" htmlFor="reg-correo">Correo Electrónico</label>
                            <div className="reg-input-wrap">
                                <input id="reg-correo" type="email"
                                    className={`reg-input${errors.correo||correoStatus==='taken'?' input-error':correoStatus==='available'?' input-success':''}`}
                                    placeholder="ejemplo@correo.com" value={correo} autoComplete="email"
                                    onChange={e => { const v=e.target.value; setCorreo(v); if(errors.correo) setErrors(p=>({...p,correo:''})); verificarCorreo(v); }} />
                                <span className="reg-input-icon"><IconEmail /></span>
                                {correoStatus && <span className="reg-input-status">{correoStatusIcon()}</span>}
                            </div>
                            {(errors.correo || correoMsgTexto()) && (
                                <p className={`reg-field-msg ${errors.correo ? 'error' : correoMsgClase()}`}>
                                    {errors.correo ? <><IconAlert /> {errors.correo}</> : correoMsgTexto()}
                                </p>
                            )}
                        </div>

                        {/* Teléfono — ancho completo (ya no comparte fila con rol) */}
                        <div className="reg-field-group">
                            <label className="reg-label" htmlFor="reg-telefono">
                                Teléfono <span style={{fontWeight:400,fontSize:'0.7rem',color:'#aaa',textTransform:'none'}}>(opcional)</span>
                            </label>
                            <div className="reg-input-wrap">
                                <input id="reg-telefono" type="tel" className={`reg-input${errors.telefono?' input-error':''}`}
                                    placeholder="10 dígitos" maxLength="10" value={telefono} autoComplete="tel"
                                    onChange={e => { const v=e.target.value.replace(/\D/g,''); setTelefono(v); if(errors.telefono) setErrors(p=>({...p,telefono:''})); }} />
                                <span className="reg-input-icon"><IconPhone /></span>
                            </div>
                            {errors.telefono && <p className="reg-field-msg error"><IconAlert /> {errors.telefono}</p>}
                        </div>

                        {/* Contraseña */}
                        <div className="reg-field-group">
                            <label className="reg-label" htmlFor="reg-password">Contraseña</label>
                            <div className="reg-input-wrap">
                                <input id="reg-password" type={showPwd?'text':'password'} className={`reg-input${errors.password?' input-error':''}`}
                                    placeholder="Mínimo 8 caracteres" value={password} autoComplete="new-password"
                                    onChange={e => { setPassword(e.target.value); if(errors.password) setErrors(p=>({...p,password:''})); }} />
                                <span className="reg-input-icon"><IconLock /></span>
                                <button type="button" className="login-pwd-toggle" onClick={() => setShowPwd(p=>!p)} aria-label={showPwd?'Ocultar':'Mostrar'}>
                                    {showPwd ? <IconEyeOff /> : <IconEye />}
                                </button>
                            </div>
                            {password && (
                                <>
                                    <div className="reg-strength-bar-wrap">
                                        {[1,2,3,4,5].map(n => <div key={n} className={`reg-strength-segment${n<=fuerza.nivel?' '+fuerza.clase:''}`} />)}
                                    </div>
                                    <p className="reg-strength-label">{fuerza.texto}</p>
                                </>
                            )}
                            {errors.password && <p className="reg-field-msg error"><IconAlert /> {errors.password}</p>}
                        </div>

                        {/* Confirmar contraseña */}
                        <div className="reg-field-group">
                            <label className="reg-label" htmlFor="reg-confirmar">Confirmar Contraseña</label>
                            <div className="reg-input-wrap">
                                <input id="reg-confirmar" type={showConfirm?'text':'password'}
                                    className={`reg-input${errors.confirmar?' input-error':confirmar&&confirmar===password?' input-success':''}`}
                                    placeholder="Repite tu contraseña" value={confirmar} autoComplete="new-password"
                                    onChange={e => { setConfirmar(e.target.value); if(errors.confirmar) setErrors(p=>({...p,confirmar:''})); }} />
                                <span className="reg-input-icon"><IconLock /></span>
                                <button type="button" className="login-pwd-toggle" onClick={() => setShowConfirm(p=>!p)} aria-label={showConfirm?'Ocultar':'Mostrar'}>
                                    {showConfirm ? <IconEyeOff /> : <IconEye />}
                                </button>
                            </div>
                            {errors.confirmar && <p className="reg-field-msg error"><IconAlert /> {errors.confirmar}</p>}
                            {!errors.confirmar && confirmar && confirmar===password && <p className="reg-field-msg success"><IconCheck /> Las contraseñas coinciden</p>}
                        </div>

                        {/* Captcha */}
                        <div className={`reg-captcha-box${errors.captcha?' captcha-error':''}`}
                            onClick={() => { setCaptchaOk(p=>!p); if(errors.captcha) setErrors(p=>({...p,captcha:''})); }}>
                            <input type="checkbox" id="reg-captcha" checked={captchaOk} onChange={() => {}} aria-label="No soy un robot" />
                            <label htmlFor="reg-captcha" className="reg-captcha-text">No soy un robot</label>
                            <span className="reg-captcha-logo">🤖</span>
                        </div>
                        {errors.captcha && <p className="reg-field-msg error"><IconAlert /> {errors.captcha}</p>}

                        {/* Términos */}
                        <label className="reg-terms-label">
                            <input type="checkbox" checked={terminos} onChange={e => { setTerminos(e.target.checked); if(errors.terminos) setErrors(p=>({...p,terminos:''})); }} />
                            Acepto los{' '}<a href="terminos.html" target="_blank" rel="noopener noreferrer">Términos y Condiciones</a>{' '}y la{' '}<a href="privacidad.html" target="_blank" rel="noopener noreferrer">Política de Privacidad</a>
                        </label>
                        {errors.terminos && <p className="reg-field-msg error"><IconAlert /> {errors.terminos}</p>}

                        <button type="submit" className="reg-btn-primary" disabled={loading}>
                            {loading ? <><span className="reg-spinner"></span>Creando cuenta...</> : 'Crear Cuenta'}
                        </button>

                    </form>

                    <div className="reg-separator">
                        <div className="reg-separator-line"></div>
                        <span className="reg-separator-text">o</span>
                        <div className="reg-separator-line"></div>
                    </div>

                    <p className="reg-login-row">¿Ya tienes cuenta?{' '}<a href="login.html">Inicia sesión aquí</a></p>

                    <div className="reg-security-badge">
                        <IconShield />
                        <span>Conexión segura HTTPS · Datos cifrados</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

const registroRoot = ReactDOM.createRoot(document.getElementById('root-registro'));
registroRoot.render(<RegistroPage />);