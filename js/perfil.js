const { useState, useEffect } = React;

// ── Íconos SVG ─────────────────────────────────────────────────
const IconEdit = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
);

const IconSave = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
    </svg>
);

const IconCheck = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
    </svg>
);

const IconAlert = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
);

const IconEye = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
    </svg>
);

const IconEyeOff = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
);

// ── Reservaciones mock — habitaciones del catálogo real ────────
const RESERVACIONES_MOCK = [
    {
        id: 'R-001',
        habitacion: 'Suite Quinceo',
        tipo: 'Suite Presidencial',
        noches: 2,
        entrada: '2026-04-20',
        salida:  '2026-04-22',
        estado:  'activa',
        total:   '$4,400 MXN'   // 2 noches × $2,200
    },
    {
        id: 'R-002',
        habitacion: 'Pátzcuaro',
        tipo: 'Familiar',
        noches: 3,
        entrada: '2026-02-14',
        salida:  '2026-02-17',
        estado:  'completada',
        total:   '$3,600 MXN'   // 3 noches × $1,200
    },
    {
        id: 'R-003',
        habitacion: 'Janitzio',
        tipo: 'Suite',
        noches: 2,
        entrada: '2025-12-23',
        salida:  '2025-12-25',
        estado:  'completada',
        total:   '$2,000 MXN'   // 2 noches × $1,000
    },
];

// ── Fuerza de contraseña ───────────────────────────────────────
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

// ── Tarjeta de reservación ─────────────────────────────────────
function TarjetaReservacion({ reserv }) {
    const col = e => ({
        activa:     'green',
        completada: 'blue',
        cancelada:  'red',
        pendiente:  'yellow'
    }[e] || 'blue');

    return (
        <div className="perfil-reserv-item">
            <div className="perfil-reserv-top">
                <div>
                    <p className="perfil-reserv-id">{reserv.id}</p>
                    <p className="perfil-reserv-hab">{reserv.habitacion}</p>
                    <p style={{
                        fontFamily: "'Lato', sans-serif",
                        fontSize: '0.78rem',
                        color: '#aaa',
                        marginTop: '2px'
                    }}>
                        {reserv.tipo}
                    </p>
                </div>
                <span className={`perfil-badge ${col(reserv.estado)}`}>
                    {reserv.estado}
                </span>
            </div>
            <div className="perfil-reserv-dates">
                <span>📅 Entrada: <strong>{reserv.entrada}</strong></span>
                <span>📅 Salida: <strong>{reserv.salida}</strong></span>
                <span>🌙 {reserv.noches} {reserv.noches === 1 ? 'noche' : 'noches'}</span>
            </div>
            <div className="perfil-reserv-footer">
                <div className="perfil-reserv-precio">
                    {reserv.total} <span>total</span>
                </div>
                <a href="reservaciones.html" className="perfil-btn-link">
                    👁️ Ver detalle
                </a>
            </div>
        </div>
    );
}

// ── Componente Principal ────────────────────────────────────────
function PerfilPage() {

    const [sesion] = useState(() => {
        try { return JSON.parse(sessionStorage.getItem('qdSession') || '{}'); }
        catch (e) { return {}; }
    });

    // Editar perfil
    const [editando,  setEditando]  = useState(false);
    const [nombre,    setNombre]    = useState(sesion.nombre   || '');
    const [apellido,  setApellido]  = useState(sesion.apellido || '');
    const [telefono,  setTelefono]  = useState(sesion.telefono || '');
    const [loadEdit,  setLoadEdit]  = useState(false);
    const [alertEdit, setAlertEdit] = useState(null);
    const [errEdit,   setErrEdit]   = useState({});

    // Cambiar contraseña
    const [pwdActual,  setPwdActual]  = useState('');
    const [pwdNueva,   setPwdNueva]   = useState('');
    const [pwdConfirm, setPwdConfirm] = useState('');
    const [showPwdA,   setShowPwdA]   = useState(false);
    const [showPwdN,   setShowPwdN]   = useState(false);
    const [showPwdC,   setShowPwdC]   = useState(false);
    const [loadPwd,    setLoadPwd]    = useState(false);
    const [alertPwd,   setAlertPwd]   = useState(null);
    const [errPwd,     setErrPwd]     = useState({});

    const fuerza = evaluarFuerza(pwdNueva);

    const iniciales = sesion.nombre
        ? sesion.nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'HU';

    // Auto-cerrar alertas
    useEffect(() => {
        if (!alertEdit) return;
        const t = setTimeout(() => setAlertEdit(null), 4000);
        return () => clearTimeout(t);
    }, [alertEdit]);

    useEffect(() => {
        if (!alertPwd) return;
        const t = setTimeout(() => setAlertPwd(null), 4000);
        return () => clearTimeout(t);
    }, [alertPwd]);

    // Scroll al anchor #mis-reservaciones
    useEffect(() => {
        if (window.location.hash === '#mis-reservaciones') {
            setTimeout(() => {
                const el = document.getElementById('mis-reservaciones');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 400);
        }
    }, []);

    // ── Guardar perfil ─────────────────────────────────────────
    async function handleGuardarPerfil(e) {
        e.preventDefault();
        const errs = {};
        if (!nombre.trim())   errs.nombre   = 'El nombre es obligatorio.';
        if (!apellido.trim()) errs.apellido = 'El apellido es obligatorio.';
        setErrEdit(errs);
        if (Object.keys(errs).length > 0) return;

        setLoadEdit(true);
        try {
            // TODO: fetch('/api/perfil/actualizar', { method: 'POST', ... })
            await new Promise(r => setTimeout(r, 1200));
            const nueva = { ...sesion, nombre: `${nombre} ${apellido}`.trim(), telefono };
            sessionStorage.setItem('qdSession', JSON.stringify(nueva));
            setAlertEdit({ tipo: 'success', msg: 'Perfil actualizado correctamente.' });
            setEditando(false);
        } catch {
            setAlertEdit({ tipo: 'error', msg: 'No se pudo actualizar el perfil.' });
        } finally {
            setLoadEdit(false);
        }
    }

    // ── Cambiar contraseña ─────────────────────────────────────
    async function handleCambiarPwd(e) {
        e.preventDefault();
        const errs = {};
        if (!pwdActual)               errs.actual    = 'Ingresa tu contraseña actual.';
        if (!pwdNueva)                errs.nueva     = 'Ingresa la nueva contraseña.';
        else if (pwdNueva.length < 8) errs.nueva     = 'Mínimo 8 caracteres.';
        else if (fuerza.nivel < 3)    errs.nueva     = 'La contraseña es muy débil.';
        if (!pwdConfirm)              errs.confirmar = 'Confirma la nueva contraseña.';
        else if (pwdNueva !== pwdConfirm) errs.confirmar = 'Las contraseñas no coinciden.';
        setErrPwd(errs);
        if (Object.keys(errs).length > 0) return;

        setLoadPwd(true);
        try {
            // TODO: fetch('/api/perfil/cambiar-password', { method: 'POST', ... })
            await new Promise(r => setTimeout(r, 1400));
            setAlertPwd({ tipo: 'success', msg: 'Contraseña actualizada correctamente.' });
            setPwdActual(''); setPwdNueva(''); setPwdConfirm('');
            setErrPwd({});
        } catch {
            setAlertPwd({ tipo: 'error', msg: 'No se pudo cambiar la contraseña.' });
        } finally {
            setLoadPwd(false);
        }
    }

    // ── Render ──────────────────────────────────────────────────
    return (
        <div className="perfil-page">

            {/* Hero */}
            <div className="perfil-hero">
                <div className="perfil-avatar">{iniciales}</div>
                <div className="perfil-hero-info">
                    <h1>{sesion.nombre || 'Mi Perfil'}</h1>
                    <p>{sesion.correo  || 'correo@ejemplo.com'}</p>
                    <span className="perfil-rol-badge">
                        {sesion.rol === 'admin' ? '🛡️ Administrador' : '🧳 Huésped'}
                    </span>
                </div>
                <div className="perfil-hero-stats">
                    <div className="perfil-hero-stat">
                        <strong>{RESERVACIONES_MOCK.length}</strong>
                        <span>Reservaciones</span>
                    </div>
                    <div className="perfil-hero-stat">
                        <strong>{RESERVACIONES_MOCK.filter(r => r.estado === 'activa').length}</strong>
                        <span>Activas</span>
                    </div>
                    <div className="perfil-hero-stat">
                        <strong>{RESERVACIONES_MOCK.filter(r => r.estado === 'completada').length}</strong>
                        <span>Completadas</span>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="perfil-grid">

                {/* ── Columna izquierda ── */}
                <div>

                    {/* Info personal */}
                    <div className="perfil-card" style={{ marginBottom: '22px' }}>
                        <div className="perfil-card-header">
                            <h2>👤 Información Personal</h2>
                            {!editando ? (
                                <button className="perfil-btn-edit"
                                        onClick={() => setEditando(true)}>
                                    <IconEdit /> Editar
                                </button>
                            ) : (
                                <button className="perfil-btn-edit"
                                        onClick={() => { setEditando(false); setErrEdit({}); }}>
                                    ✕ Cancelar
                                </button>
                            )}
                        </div>
                        <div className="perfil-card-body">
                            {alertEdit && (
                                <div className={`perfil-alert perfil-alert-${alertEdit.tipo}`}>
                                    {alertEdit.tipo === 'error' ? <IconAlert /> : <IconCheck />}
                                    {alertEdit.msg}
                                </div>
                            )}

                            {!editando ? (
                                <>
                                    <div className="perfil-info-row">
                                        <span className="perfil-info-icon">👤</span>
                                        <div>
                                            <p className="perfil-info-label">Nombre completo</p>
                                            <p className="perfil-info-value">{sesion.nombre || '—'}</p>
                                        </div>
                                    </div>
                                    <div className="perfil-info-row">
                                        <span className="perfil-info-icon">✉️</span>
                                        <div>
                                            <p className="perfil-info-label">Correo electrónico</p>
                                            <p className="perfil-info-value">{sesion.correo || '—'}</p>
                                        </div>
                                    </div>
                                    <div className="perfil-info-row">
                                        <span className="perfil-info-icon">📞</span>
                                        <div>
                                            <p className="perfil-info-label">Teléfono</p>
                                            <p className="perfil-info-value">{telefono || 'No registrado'}</p>
                                        </div>
                                    </div>
                                    <div className="perfil-info-row">
                                        <span className="perfil-info-icon">🛡️</span>
                                        <div>
                                            <p className="perfil-info-label">Tipo de cuenta</p>
                                            <p className="perfil-info-value">
                                                {sesion.rol === 'admin' ? 'Administrador' : 'Huésped / Cliente'}
                                            </p>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <form onSubmit={handleGuardarPerfil} noValidate>
                                    <div className="perfil-field-group">
                                        <label className="perfil-label">Nombre</label>
                                        <div className="perfil-input-wrap">
                                            <input type="text"
                                                className={`perfil-input${errEdit.nombre ? ' input-error' : ''}`}
                                                value={nombre}
                                                onChange={e => { setNombre(e.target.value); setErrEdit(p => ({...p, nombre: ''})); }}
                                                placeholder="Tu nombre" />
                                            <span className="perfil-input-icon">👤</span>
                                        </div>
                                        {errEdit.nombre && <p className="perfil-field-error"><IconAlert /> {errEdit.nombre}</p>}
                                    </div>
                                    <div className="perfil-field-group">
                                        <label className="perfil-label">Apellido</label>
                                        <div className="perfil-input-wrap">
                                            <input type="text"
                                                className={`perfil-input${errEdit.apellido ? ' input-error' : ''}`}
                                                value={apellido}
                                                onChange={e => { setApellido(e.target.value); setErrEdit(p => ({...p, apellido: ''})); }}
                                                placeholder="Tu apellido" />
                                            <span className="perfil-input-icon">👤</span>
                                        </div>
                                        {errEdit.apellido && <p className="perfil-field-error"><IconAlert /> {errEdit.apellido}</p>}
                                    </div>
                                    <div className="perfil-field-group">
                                        <label className="perfil-label">Correo (no editable)</label>
                                        <div className="perfil-input-wrap">
                                            <input type="email" className="perfil-input"
                                                   value={sesion.correo || ''} disabled />
                                            <span className="perfil-input-icon">✉️</span>
                                        </div>
                                    </div>
                                    <div className="perfil-field-group">
                                        <label className="perfil-label">Teléfono</label>
                                        <div className="perfil-input-wrap">
                                            <input type="tel" className="perfil-input"
                                                   value={telefono}
                                                   onChange={e => setTelefono(e.target.value)}
                                                   placeholder="+52 443 000 0000" />
                                            <span className="perfil-input-icon">📞</span>
                                        </div>
                                    </div>
                                    <button type="submit" className="perfil-btn-primary"
                                            disabled={loadEdit}>
                                        {loadEdit
                                            ? <><span className="perfil-spinner"></span>Guardando...</>
                                            : <><IconSave /> Guardar Cambios</>
                                        }
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* Cambiar contraseña */}
                    <div className="perfil-card">
                        <div className="perfil-card-header">
                            <h2>🔒 Cambiar Contraseña</h2>
                        </div>
                        <div className="perfil-card-body">
                            {alertPwd && (
                                <div className={`perfil-alert perfil-alert-${alertPwd.tipo}`}>
                                    {alertPwd.tipo === 'error' ? <IconAlert /> : <IconCheck />}
                                    {alertPwd.msg}
                                </div>
                            )}
                            <form onSubmit={handleCambiarPwd} noValidate>
                                <div className="perfil-field-group">
                                    <label className="perfil-label">Contraseña Actual</label>
                                    <div className="perfil-input-wrap">
                                        <input type={showPwdA ? 'text' : 'password'}
                                            className={`perfil-input${errPwd.actual ? ' input-error' : ''}`}
                                            value={pwdActual}
                                            onChange={e => { setPwdActual(e.target.value); setErrPwd(p => ({...p, actual: ''})); }}
                                            placeholder="••••••••" autoComplete="current-password" />
                                        <span className="perfil-input-icon">🔒</span>
                                        <button type="button" className="login-pwd-toggle"
                                                onClick={() => setShowPwdA(p => !p)}>
                                            {showPwdA ? <IconEyeOff /> : <IconEye />}
                                        </button>
                                    </div>
                                    {errPwd.actual && <p className="perfil-field-error"><IconAlert /> {errPwd.actual}</p>}
                                </div>

                                <div className="perfil-field-group">
                                    <label className="perfil-label">Nueva Contraseña</label>
                                    <div className="perfil-input-wrap">
                                        <input type={showPwdN ? 'text' : 'password'}
                                            className={`perfil-input${errPwd.nueva ? ' input-error' : ''}`}
                                            value={pwdNueva}
                                            onChange={e => { setPwdNueva(e.target.value); setErrPwd(p => ({...p, nueva: ''})); }}
                                            placeholder="Mínimo 8 caracteres" autoComplete="new-password" />
                                        <span className="perfil-input-icon">🔑</span>
                                        <button type="button" className="login-pwd-toggle"
                                                onClick={() => setShowPwdN(p => !p)}>
                                            {showPwdN ? <IconEyeOff /> : <IconEye />}
                                        </button>
                                    </div>
                                    {pwdNueva && (
                                        <>
                                            <div className="perfil-strength-bar-wrap">
                                                {[1,2,3,4,5].map(n => (
                                                    <div key={n}
                                                         className={`perfil-strength-segment${n <= fuerza.nivel ? ' ' + fuerza.clase : ''}`} />
                                                ))}
                                            </div>
                                            <p className="perfil-strength-label">{fuerza.texto}</p>
                                        </>
                                    )}
                                    {errPwd.nueva && <p className="perfil-field-error"><IconAlert /> {errPwd.nueva}</p>}
                                </div>

                                <div className="perfil-field-group">
                                    <label className="perfil-label">Confirmar Nueva Contraseña</label>
                                    <div className="perfil-input-wrap">
                                        <input type={showPwdC ? 'text' : 'password'}
                                            className={`perfil-input${
                                                errPwd.confirmar ? ' input-error'
                                                : pwdConfirm && pwdConfirm === pwdNueva ? ' input-success' : ''
                                            }`}
                                            value={pwdConfirm}
                                            onChange={e => { setPwdConfirm(e.target.value); setErrPwd(p => ({...p, confirmar: ''})); }}
                                            placeholder="Repite la nueva contraseña" autoComplete="new-password" />
                                        <span className="perfil-input-icon">🔑</span>
                                        <button type="button" className="login-pwd-toggle"
                                                onClick={() => setShowPwdC(p => !p)}>
                                            {showPwdC ? <IconEyeOff /> : <IconEye />}
                                        </button>
                                    </div>
                                    {errPwd.confirmar && (
                                        <p className="perfil-field-error"><IconAlert /> {errPwd.confirmar}</p>
                                    )}
                                    {!errPwd.confirmar && pwdConfirm && pwdConfirm === pwdNueva && (
                                        <p className="perfil-field-error" style={{ color: '#27ae60' }}>
                                            <IconCheck /> Las contraseñas coinciden
                                        </p>
                                    )}
                                </div>

                                <button type="submit" className="perfil-btn-primary"
                                        disabled={loadPwd}>
                                    {loadPwd
                                        ? <><span className="perfil-spinner"></span>Actualizando...</>
                                        : '🔒 Actualizar Contraseña'
                                    }
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* ── Columna derecha: Reservaciones ── */}
                <div className="perfil-card" id="mis-reservaciones">
                    <div className="perfil-card-header">
                        <h2>📋 Mis Reservaciones</h2>
                        <a href="reservaciones.html" className="perfil-btn-link">
                            + Nueva reserva
                        </a>
                    </div>
                    <div className="perfil-card-body">
                        {RESERVACIONES_MOCK.length === 0 ? (
                            <div className="perfil-reserv-empty">
                                <span>🏨</span>
                                <p>Aún no tienes reservaciones.</p>
                                <a href="reservaciones.html">Reserva tu primera estancia →</a>
                            </div>
                        ) : (
                            <>
                                {RESERVACIONES_MOCK.map(r => (
                                    <TarjetaReservacion key={r.id} reserv={r} />
                                ))}
                                <p className="perfil-reserv-pager">
                                    Mostrando {RESERVACIONES_MOCK.length} de {RESERVACIONES_MOCK.length} reservaciones
                                </p>
                            </>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

const perfilRoot = ReactDOM.createRoot(document.getElementById('root-perfil'));
perfilRoot.render(<PerfilPage />);