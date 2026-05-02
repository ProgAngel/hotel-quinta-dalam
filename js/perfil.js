// ============================================================
//  perfil.js — Hotel Quinta Dalam
//  Conectado a api/usuarios/perfil.php y api/reservaciones/listar.php
// ============================================================

const { useState, useEffect } = React;

const API_PERFIL        = '/Hotel-quinta-dalam/api/usuarios/perfil.php';
const API_RESERVACIONES = '/Hotel-quinta-dalam/api/reservaciones/listar.php';

// ── Íconos SVG ─────────────────────────────────────────────
const IconEdit = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
);
const IconSave = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
    </svg>
);
const IconCheck = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
    </svg>
);
const IconAlert = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
);
const IconEye = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
    </svg>
);
const IconEyeOff = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
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

// ── Helpers de formato ────────────────────────────────────────
const formatFecha = f => f ? f.split('-').reverse().join('/') : '—';
const totalFmt    = t => '$' + Number(t).toLocaleString('es-MX', {minimumFractionDigits: 2}) + ' MXN';
const fmtSimple   = t => '$' + Number(t).toLocaleString('es-MX', {minimumFractionDigits: 2});
const colBadge    = e => ({ activa:'green', completada:'blue', cancelada:'red', pendiente:'yellow', confirmada:'blue' }[e] || 'blue');

// ── Modal Ver Detalle de Reservación ─────────────────────────
function ModalDetalleReservacion({ reserv: r, onCerrar }) {
    // Bloquear scroll del body mientras el modal está abierto
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    return (
        <div
            onClick={onCerrar}
            style={{
                position:'fixed', inset:0,
                background:'rgba(15,8,2,0.70)',
                zIndex:9000, display:'flex',
                alignItems:'center', justifyContent:'center',
                padding:'20px', backdropFilter:'blur(3px)',
                animation:'perfilFadeIn 0.25s ease',
            }}>
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    background:'#fff', borderRadius:'20px',
                    padding:'36px', maxWidth:'480px', width:'100%',
                    boxShadow:'0 28px 70px rgba(0,0,0,0.25)',
                    maxHeight:'90vh', overflowY:'auto',
                    animation:'perfilFadeIn 0.3s ease',
                }}>

                {/* Cabecera */}
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'20px'}}>
                    <div>
                        <h2 style={{fontFamily:"'Playfair Display',serif", fontSize:'1.4rem', color:'#1a0d06', marginBottom:'4px'}}>
                            📋 Detalle de Reservación
                        </h2>
                        <p style={{fontFamily:"'Lato',sans-serif", fontSize:'0.78rem', color:'#aaa', letterSpacing:'0.5px'}}>
                            {r.codigo}
                        </p>
                    </div>
                    <span className={`perfil-badge ${colBadge(r.estado)}`} style={{fontSize:'0.78rem'}}>
                        {r.estado}
                    </span>
                </div>

                {/* Tarjeta oscura con info principal */}
                <div style={{
                    background:'linear-gradient(135deg,#2a1206,#6b3a1f)',
                    borderRadius:'12px', padding:'16px 20px',
                    marginBottom:'20px', color:'#fff',
                    fontFamily:"'Lato',sans-serif", fontSize:'0.88rem', lineHeight:1.8
                }}>
                    <p style={{fontFamily:"'Playfair Display',serif", fontSize:'1rem', color:'#e8c98a', fontWeight:700, marginBottom:'6px'}}>
                        🛏️ {r.habitacion_numero} — {r.habitacion_nombre}
                    </p>
                    <p>📅 {formatFecha(r.fecha_entrada)} → {formatFecha(r.fecha_salida)}</p>
                    <p>🌙 {r.noches} noche{r.noches !== 1 ? 's' : ''}</p>
                    <p>👥 {r.num_huespedes} huésped{r.num_huespedes !== 1 ? 'es' : ''}</p>
                    <p style={{fontSize:'1.1rem', fontWeight:700, marginTop:'8px', color:'#e8c98a'}}>
                        {fmtSimple(r.total)} MXN
                    </p>
                </div>

                {/* Datos adicionales */}
                <div style={{fontFamily:"'Lato',sans-serif", fontSize:'0.88rem', color:'#555', lineHeight:2.2}}>
                    <p><strong style={{color:'#2d1a0e'}}>Tipo de habitación:</strong> {r.habitacion_tipo}</p>
                    <p><strong style={{color:'#2d1a0e'}}>Precio por noche:</strong> {fmtSimple(r.precio_noche)}</p>
                    {r.notas && <p><strong style={{color:'#2d1a0e'}}>Notas:</strong> {r.notas}</p>}
                    <p><strong style={{color:'#2d1a0e'}}>Reservación creada:</strong> {r.created_at ? r.created_at.split(' ')[0] : '—'}</p>
                </div>

                {/* Acción según estado */}
                {r.estado === 'pendiente' && (
                    <div style={{
                        background:'#fff3cd', border:'1px solid #ffc107',
                        borderRadius:'8px', padding:'10px 14px', marginTop:'16px',
                        fontFamily:"'Lato',sans-serif", fontSize:'0.82rem', color:'#856404'
                    }}>
                        ⏳ Pago pendiente. Tienes 15 minutos para completar el pago antes de que se libere la habitación.
                    </div>
                )}

                {/* Botones */}
                <div style={{display:'flex', gap:'10px', justifyContent:'flex-end', marginTop:'24px'}}>
                    {r.estado === 'pendiente' && (
                        <a href="reservaciones.html#paso-1"
                            style={{
                                padding:'10px 18px', borderRadius:'8px', border:'none',
                                background:'linear-gradient(135deg,#8c5a35,#6b3a1f)',
                                color:'#fff', fontFamily:"'Lato',sans-serif",
                                fontWeight:700, fontSize:'0.85rem', cursor:'pointer',
                                textDecoration:'none', display:'inline-flex', alignItems:'center'
                            }}>
                            💳 Ir a pagar
                        </a>
                    )}
                    <button onClick={onCerrar}
                        style={{
                            padding:'10px 22px', borderRadius:'8px',
                            border:'1.5px solid #d4c5b5', background:'none',
                            cursor:'pointer', fontFamily:"'Lato',sans-serif",
                            fontWeight:700, fontSize:'0.85rem', color:'#7a5c3e',
                            transition:'all 0.2s ease'
                        }}
                        onMouseEnter={e => e.target.style.background='rgba(140,90,53,0.06)'}
                        onMouseLeave={e => e.target.style.background='none'}>
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Tarjeta de reservación ────────────────────────────────────
function TarjetaReservacion({ reserv, onVerDetalle }) {
    return (
        <div className="perfil-reserv-item">
            <div className="perfil-reserv-top">
                <div>
                    <p className="perfil-reserv-id">{reserv.codigo}</p>
                    <p className="perfil-reserv-hab">
                        {reserv.habitacion_numero} — {reserv.habitacion_nombre}
                    </p>
                    <p style={{fontFamily:"'Lato',sans-serif", fontSize:'0.78rem', color:'#aaa', marginTop:'2px'}}>
                        {reserv.habitacion_tipo}
                    </p>
                </div>
                <span className={`perfil-badge ${colBadge(reserv.estado)}`}>
                    {reserv.estado}
                </span>
            </div>
            <div className="perfil-reserv-dates">
                <span>📅 Entrada: <strong>{formatFecha(reserv.fecha_entrada)}</strong></span>
                <span>📅 Salida: <strong>{formatFecha(reserv.fecha_salida)}</strong></span>
                <span>🌙 {reserv.noches} {reserv.noches === 1 ? 'noche' : 'noches'}</span>
            </div>
            <div className="perfil-reserv-footer">
                <div className="perfil-reserv-precio">
                    {totalFmt(reserv.total)} <span>total</span>
                </div>
                {/* FIX: botón que abre el modal en lugar de link roto */}
                <button className="perfil-btn-link" onClick={() => onVerDetalle(reserv)}>
                    👁️ Ver detalle
                </button>
            </div>
        </div>
    );
}

// ── Componente Principal ──────────────────────────────────────
function PerfilPage() {

    const sesion = (window.QDSession && window.QDSession.obtener()) || (() => {
        try { return JSON.parse(sessionStorage.getItem('qdSession') || '{}'); }
        catch { return {}; }
    })();

    const [perfilData,    setPerfilData]    = useState(null);
    const [loadingPerfil, setLoadingPerfil] = useState(true);
    const [reservaciones, setReservaciones] = useState([]);
    const [loadingReserv, setLoadingReserv] = useState(true);

    // Modal de detalle
    const [reservDetalle, setReservDetalle] = useState(null);

    const [editando,  setEditando]  = useState(false);
    const [nombre,    setNombre]    = useState('');
    const [telefono,  setTelefono]  = useState('');
    const [loadEdit,  setLoadEdit]  = useState(false);
    const [alertEdit, setAlertEdit] = useState(null);
    const [errEdit,   setErrEdit]   = useState({});

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

    useEffect(() => {
        if (!sesion.id) return;

        fetch(`${API_PERFIL}?id=${sesion.id}`)
            .then(r => r.json())
            .then(data => {
                if (data.ok) {
                    setPerfilData(data.usuario);
                    setNombre(data.usuario.nombre   || '');
                    setTelefono(data.usuario.telefono || '');
                }
            })
            .catch(() => {})
            .finally(() => setLoadingPerfil(false));

        fetch(`${API_RESERVACIONES}?usuario_id=${sesion.id}`)
            .then(r => r.json())
            .then(data => {
                if (data.ok) setReservaciones(data.reservaciones);
            })
            .catch(() => {})
            .finally(() => setLoadingReserv(false));
    }, [sesion.id]);

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

    useEffect(() => {
        if (window.location.hash === '#mis-reservaciones') {
            setTimeout(() => {
                const el = document.getElementById('mis-reservaciones');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 600);
        }
    }, []);

    async function handleGuardarPerfil(e) {
        e.preventDefault();
        const errs = {};
        if (!nombre.trim()) errs.nombre = 'El nombre es obligatorio.';
        if (telefono && !/^[0-9]{10}$/.test(telefono.replace(/\s/g,'')))
            errs.telefono = 'El teléfono debe tener 10 dígitos.';
        setErrEdit(errs);
        if (Object.keys(errs).length > 0) return;

        setLoadEdit(true);
        try {
            const res = await fetch(API_PERFIL, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: sesion.id, nombre: nombre.trim(), telefono: telefono.trim() })
            });
            const data = await res.json();
            if (!data.ok) { setAlertEdit({ tipo:'error', msg: data.mensaje || 'No se pudo actualizar.' }); return; }

            if (window.QDSession) {
                window.QDSession.guardar({ ...window.QDSession.obtener(), nombre: nombre.trim() });
            } else {
                const raw = JSON.parse(sessionStorage.getItem('qdSession') || '{}');
                sessionStorage.setItem('qdSession', JSON.stringify({ ...raw, nombre: nombre.trim() }));
            }

            setPerfilData(p => ({ ...p, nombre: nombre.trim(), telefono: telefono.trim() }));
            setAlertEdit({ tipo:'success', msg: 'Perfil actualizado correctamente.' });
            setEditando(false);
        } catch {
            setAlertEdit({ tipo:'error', msg: 'No se pudo conectar con el servidor.' });
        } finally {
            setLoadEdit(false);
        }
    }

    async function handleCambiarPwd(e) {
        e.preventDefault();
        const errs = {};
        if (!pwdActual)                  errs.actual    = 'Ingresa tu contraseña actual.';
        if (!pwdNueva)                   errs.nueva     = 'Ingresa la nueva contraseña.';
        else if (pwdNueva.length < 8)    errs.nueva     = 'Mínimo 8 caracteres.';
        else if (fuerza.nivel < 3)       errs.nueva     = 'La contraseña es muy débil.';
        if (!pwdConfirm)                 errs.confirmar = 'Confirma la nueva contraseña.';
        else if (pwdNueva !== pwdConfirm) errs.confirmar = 'Las contraseñas no coinciden.';
        setErrPwd(errs);
        if (Object.keys(errs).length > 0) return;

        setLoadPwd(true);
        try {
            const res = await fetch(API_PERFIL, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: sesion.id, contrasena_actual: pwdActual, contrasena_nueva: pwdNueva })
            });
            const data = await res.json();
            if (!data.ok) {
                if (data.errores?.contrasena_actual) setErrPwd(p => ({ ...p, actual: data.errores.contrasena_actual }));
                else setAlertPwd({ tipo:'error', msg: data.mensaje || 'No se pudo cambiar la contraseña.' });
                return;
            }
            setAlertPwd({ tipo:'success', msg: '✅ Contraseña actualizada correctamente.' });
            setPwdActual(''); setPwdNueva(''); setPwdConfirm('');
            setErrPwd({});
        } catch {
            setAlertPwd({ tipo:'error', msg: 'No se pudo conectar con el servidor.' });
        } finally {
            setLoadPwd(false);
        }
    }

    const displayNombre   = perfilData?.nombre   || sesion.nombre   || 'Mi Perfil';
    const displayCorreo   = perfilData?.correo   || sesion.correo   || '—';
    const displayTelefono = perfilData?.telefono || '—';
    const displayRol      = perfilData?.rol      || sesion.rol      || 'cliente';
    const stats           = perfilData?.stats    || { total_reservaciones: 0, reservaciones_activas: 0 };
    const completadas     = reservaciones.filter(r => r.estado === 'completada').length;
    const iniciales       = displayNombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    return (
        <div className="perfil-page">

            {/* Modal de detalle */}
            {reservDetalle && (
                <ModalDetalleReservacion
                    reserv={reservDetalle}
                    onCerrar={() => setReservDetalle(null)}
                />
            )}

            {/* ── Hero ── */}
            <div className="perfil-hero">
                <div className="perfil-avatar">
                    {loadingPerfil ? '...' : iniciales}
                </div>
                <div className="perfil-hero-info">
                    <h1>{displayNombre}</h1>
                    <p>{displayCorreo}</p>
                    <span className="perfil-rol-badge">
                        {displayRol === 'admin' ? '🛡️ Administrador' : '🧳 Huésped'}
                    </span>
                </div>
                <div className="perfil-hero-stats">
                    <div className="perfil-hero-stat">
                        <strong>{stats.total_reservaciones}</strong>
                        <span>Reservaciones</span>
                    </div>
                    <div className="perfil-hero-stat">
                        <strong>{stats.reservaciones_activas}</strong>
                        <span>Activas</span>
                    </div>
                    <div className="perfil-hero-stat">
                        <strong>{completadas}</strong>
                        <span>Completadas</span>
                    </div>
                </div>
            </div>

            {/* ── Grid ── */}
            <div className="perfil-grid">

                {/* ── Columna izquierda ── */}
                <div>
                    {/* Info personal */}
                    <div className="perfil-card" style={{marginBottom:'22px'}}>
                        <div className="perfil-card-header">
                            <h2>👤 Información Personal</h2>
                            {!editando ? (
                                <button className="perfil-btn-edit" onClick={() => setEditando(true)}>
                                    <IconEdit /> Editar
                                </button>
                            ) : (
                                <button className="perfil-btn-edit" onClick={() => { setEditando(false); setErrEdit({}); }}>
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
                            {loadingPerfil ? (
                                <p style={{textAlign:'center',color:'#aaa',padding:'20px',fontFamily:"'Lato',sans-serif"}}>
                                    Cargando datos...
                                </p>
                            ) : !editando ? (
                                <>
                                    <div className="perfil-info-row">
                                        <span className="perfil-info-icon">👤</span>
                                        <div><p className="perfil-info-label">Nombre completo</p><p className="perfil-info-value">{displayNombre}</p></div>
                                    </div>
                                    <div className="perfil-info-row">
                                        <span className="perfil-info-icon">✉️</span>
                                        <div><p className="perfil-info-label">Correo electrónico</p><p className="perfil-info-value">{displayCorreo}</p></div>
                                    </div>
                                    <div className="perfil-info-row">
                                        <span className="perfil-info-icon">📞</span>
                                        <div><p className="perfil-info-label">Teléfono</p><p className="perfil-info-value">{displayTelefono}</p></div>
                                    </div>
                                    <div className="perfil-info-row">
                                        <span className="perfil-info-icon">🛡️</span>
                                        <div><p className="perfil-info-label">Tipo de cuenta</p><p className="perfil-info-value">{displayRol === 'admin' ? 'Administrador' : 'Huésped / Cliente'}</p></div>
                                    </div>
                                    <div className="perfil-info-row">
                                        <span className="perfil-info-icon">📅</span>
                                        <div>
                                            <p className="perfil-info-label">Miembro desde</p>
                                            <p className="perfil-info-value">
                                                {perfilData?.created_at
                                                    ? new Date(perfilData.created_at).toLocaleDateString('es-MX', {year:'numeric',month:'long',day:'numeric'})
                                                    : '—'}
                                            </p>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <form onSubmit={handleGuardarPerfil} noValidate>
                                    <div className="perfil-field-group">
                                        <label className="perfil-label">Nombre completo</label>
                                        <div className="perfil-input-wrap">
                                            <input type="text" className={`perfil-input${errEdit.nombre?' input-error':''}`}
                                                value={nombre} placeholder="Tu nombre completo"
                                                onChange={e => { setNombre(e.target.value); setErrEdit(p=>({...p,nombre:''})); }} />
                                            <span className="perfil-input-icon">👤</span>
                                        </div>
                                        {errEdit.nombre && <p className="perfil-field-error"><IconAlert /> {errEdit.nombre}</p>}
                                    </div>
                                    <div className="perfil-field-group">
                                        <label className="perfil-label">Correo (no editable)</label>
                                        <div className="perfil-input-wrap">
                                            <input type="email" className="perfil-input" value={displayCorreo} disabled />
                                            <span className="perfil-input-icon">✉️</span>
                                        </div>
                                    </div>
                                    <div className="perfil-field-group">
                                        <label className="perfil-label">Teléfono</label>
                                        <div className="perfil-input-wrap">
                                            <input type="tel" className="perfil-input" value={telefono} maxLength="10"
                                                placeholder="10 dígitos"
                                                onChange={e => { const v=e.target.value.replace(/\D/g,''); setTelefono(v); setErrEdit(p=>({...p,telefono:''})); }} />
                                            <span className="perfil-input-icon">📞</span>
                                        </div>
                                        {errEdit.telefono && <p className="perfil-field-error"><IconAlert /> {errEdit.telefono}</p>}
                                    </div>
                                    <button type="submit" className="perfil-btn-primary" disabled={loadEdit}>
                                        {loadEdit ? <><span className="perfil-spinner"></span>Guardando...</> : <><IconSave /> Guardar Cambios</>}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* Cambiar contraseña */}
                    <div className="perfil-card">
                        <div className="perfil-card-header"><h2>🔒 Cambiar Contraseña</h2></div>
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
                                        <input type={showPwdA?'text':'password'} className={`perfil-input${errPwd.actual?' input-error':''}`}
                                            value={pwdActual} placeholder="••••••••" autoComplete="current-password"
                                            onChange={e => { setPwdActual(e.target.value); setErrPwd(p=>({...p,actual:''})); }} />
                                        <span className="perfil-input-icon">🔒</span>
                                        <button type="button" className="login-pwd-toggle" onClick={() => setShowPwdA(p=>!p)}>
                                            {showPwdA ? <IconEyeOff /> : <IconEye />}
                                        </button>
                                    </div>
                                    {errPwd.actual && <p className="perfil-field-error"><IconAlert /> {errPwd.actual}</p>}
                                </div>
                                <div className="perfil-field-group">
                                    <label className="perfil-label">Nueva Contraseña</label>
                                    <div className="perfil-input-wrap">
                                        <input type={showPwdN?'text':'password'} className={`perfil-input${errPwd.nueva?' input-error':''}`}
                                            value={pwdNueva} placeholder="Mínimo 8 caracteres" autoComplete="new-password"
                                            onChange={e => { setPwdNueva(e.target.value); setErrPwd(p=>({...p,nueva:''})); }} />
                                        <span className="perfil-input-icon">🔑</span>
                                        <button type="button" className="login-pwd-toggle" onClick={() => setShowPwdN(p=>!p)}>
                                            {showPwdN ? <IconEyeOff /> : <IconEye />}
                                        </button>
                                    </div>
                                    {pwdNueva && (
                                        <>
                                            <div className="perfil-strength-bar-wrap">
                                                {[1,2,3,4,5].map(n => <div key={n} className={`perfil-strength-segment${n<=fuerza.nivel?' '+fuerza.clase:''}`} />)}
                                            </div>
                                            <p className="perfil-strength-label">{fuerza.texto}</p>
                                        </>
                                    )}
                                    {errPwd.nueva && <p className="perfil-field-error"><IconAlert /> {errPwd.nueva}</p>}
                                </div>
                                <div className="perfil-field-group">
                                    <label className="perfil-label">Confirmar Nueva Contraseña</label>
                                    <div className="perfil-input-wrap">
                                        <input type={showPwdC?'text':'password'}
                                            className={`perfil-input${errPwd.confirmar?' input-error':pwdConfirm&&pwdConfirm===pwdNueva?' input-success':''}`}
                                            value={pwdConfirm} placeholder="Repite la nueva contraseña" autoComplete="new-password"
                                            onChange={e => { setPwdConfirm(e.target.value); setErrPwd(p=>({...p,confirmar:''})); }} />
                                        <span className="perfil-input-icon">🔑</span>
                                        <button type="button" className="login-pwd-toggle" onClick={() => setShowPwdC(p=>!p)}>
                                            {showPwdC ? <IconEyeOff /> : <IconEye />}
                                        </button>
                                    </div>
                                    {errPwd.confirmar && <p className="perfil-field-error"><IconAlert /> {errPwd.confirmar}</p>}
                                    {!errPwd.confirmar && pwdConfirm && pwdConfirm===pwdNueva && (
                                        <p className="perfil-field-error" style={{color:'#27ae60'}}><IconCheck /> Las contraseñas coinciden</p>
                                    )}
                                </div>
                                <button type="submit" className="perfil-btn-primary" disabled={loadPwd}>
                                    {loadPwd ? <><span className="perfil-spinner"></span>Actualizando...</> : '🔒 Actualizar Contraseña'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* ── Columna derecha: Reservaciones ── */}
                <div className="perfil-card" id="mis-reservaciones">
                    <div className="perfil-card-header">
                        <h2>📋 Mis Reservaciones</h2>
                        {/* FIX: URL corregida reservaciones.html#paso-1 */}
                        <a href="reservaciones.html#paso-1" className="perfil-btn-link">
                            + Nueva reserva
                        </a>
                    </div>
                    <div className="perfil-card-body">
                        {loadingReserv ? (
                            <p style={{textAlign:'center',color:'#aaa',padding:'30px',fontFamily:"'Lato',sans-serif"}}>
                                Cargando reservaciones...
                            </p>
                        ) : reservaciones.length === 0 ? (
                            <div className="perfil-reserv-empty">
                                <span>🏨</span>
                                <p>Aún no tienes reservaciones.</p>
                                <a href="reservaciones.html">Reserva tu primera estancia →</a>
                            </div>
                        ) : (
                            <>
                                {reservaciones.map(r => (
                                    <TarjetaReservacion
                                        key={r.id}
                                        reserv={r}
                                        onVerDetalle={setReservDetalle}
                                    />
                                ))}
                                <p className="perfil-reserv-pager">
                                    Mostrando {reservaciones.length} reservación{reservaciones.length !== 1 ? 'es' : ''}
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