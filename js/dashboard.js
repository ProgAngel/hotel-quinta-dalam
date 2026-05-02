// ============================================================
//  dashboard.js — Hotel Quinta Dalam
//  Panel de Control con RBAC completo
// ============================================================

const { useState, useEffect, useCallback } = React;

const API_BASE          = '/Hotel-quinta-dalam/api';
const API_USUARIOS      = API_BASE + '/usuarios/listar.php';
const API_RESERVACIONES = API_BASE + '/reservaciones/listar.php';
const API_HABITACIONES  = API_BASE + '/habitaciones/listar.php';
const API_CANCELAR      = API_BASE + '/reservaciones/cancelar.php';
const API_CONFIRMAR     = API_BASE + '/reservaciones/confirmar.php';
const API_CREAR_MANUAL  = API_BASE + '/reservaciones/crear-manual.php';

const isMobile    = () => window.innerWidth <= 768;
const iniciales   = n  => n ? n.split(' ').map(x=>x[0]).join('').toUpperCase().slice(0,2) : '??';
const fmt         = n  => '$' + Number(n).toLocaleString('es-MX', {minimumFractionDigits:2});
const fmtFecha    = f  => f ? f.split('-').reverse().join('/') : '—';
const toast       = { ok:m=>window.QDToast?.exito(m), err:m=>window.QDToast?.error(m), info:m=>window.QDToast?.info(m), av:m=>window.QDToast?.aviso(m) };

const colorEstado = e => ({
    activa:'green', confirmada:'blue', pendiente:'yellow', cancelada:'red', completada:'blue',
    disponible:'green', ocupada:'red', mantenimiento:'yellow', activo:'green', inactivo:'red'
}[e] || 'brown');

function Spinner() {
    return (
        <div style={{textAlign:'center',padding:'40px 20px'}}>
            <div style={{width:'36px',height:'36px',border:'3px solid rgba(140,90,53,0.2)',borderTopColor:'#8c5a35',borderRadius:'50%',animation:'dashSpin 0.8s linear infinite',margin:'0 auto 12px'}}></div>
            <style>{'@keyframes dashSpin{to{transform:rotate(360deg)}}'}</style>
            <p style={{fontFamily:"'Lato',sans-serif",fontSize:'0.85rem',color:'#aaa'}}>Cargando datos...</p>
        </div>
    );
}

function ModalConfirmar({ titulo, mensaje, onConfirmar, onCancelar, confirmLabel='Confirmar', peligro=false }) {
    return (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.55)',zIndex:9000,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
            <div style={{background:'#fff',borderRadius:'16px',padding:'32px',maxWidth:'440px',width:'100%',boxShadow:'0 20px 60px rgba(0,0,0,0.2)'}}>
                <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.3rem',color:'#1a0d06',marginBottom:'12px'}}>{titulo}</h3>
                <p style={{fontFamily:"'Lato',sans-serif",fontSize:'0.9rem',color:'#555',lineHeight:1.6,marginBottom:'24px'}}>{mensaje}</p>
                <div style={{display:'flex',gap:'12px',justifyContent:'flex-end'}}>
                    <button onClick={onCancelar} style={{padding:'10px 20px',borderRadius:'8px',border:'1.5px solid #ddd',background:'none',cursor:'pointer',fontFamily:"'Lato',sans-serif",fontWeight:700,color:'#666'}}>Cancelar</button>
                    <button onClick={onConfirmar} style={{padding:'10px 20px',borderRadius:'8px',border:'none',cursor:'pointer',fontFamily:"'Lato',sans-serif",fontWeight:700,color:'#fff',background:peligro?'linear-gradient(135deg,#c0392b,#e74c3c)':'linear-gradient(135deg,#8c5a35,#6b3a1f)'}}>{confirmLabel}</button>
                </div>
            </div>
        </div>
    );
}

function ModalReservacionManual({ habitaciones, onGuardar, onCerrar }) {
    const [form, setForm] = useState({ habitacion_id:'', fecha_entrada:'', fecha_salida:'', nombre_huesped:'', correo_huesped:'', num_huespedes:1, metodo_pago:'efectivo', notas:'' });
    const [errores, setErrores] = useState({});
    const [guardando, setGuardando] = useState(false);
    const hoy = new Date().toISOString().split('T')[0];
    const habsDisp = habitaciones.filter(h => h.estado === 'disponible');
    const habSel = habitaciones.find(h => h.id === parseInt(form.habitacion_id));
    const noches = form.fecha_entrada && form.fecha_salida ? Math.max(0, Math.ceil((new Date(form.fecha_salida) - new Date(form.fecha_entrada)) / 86400000)) : 0;
    const total = habSel ? habSel.precio_noche * noches : 0;

    function validar() {
        const e = {};
        if (!form.habitacion_id) e.habitacion_id = 'Selecciona una habitación.';
        if (!form.fecha_entrada) e.fecha_entrada = 'Obligatoria.';
        if (!form.fecha_salida) e.fecha_salida = 'Obligatoria.';
        else if (noches <= 0) e.fecha_salida = 'Debe ser posterior a la entrada.';
        if (!form.nombre_huesped.trim()) e.nombre_huesped = 'Obligatorio.';
        return e;
    }

    async function handleGuardar() {
        const e = validar();
        if (Object.keys(e).length > 0) { setErrores(e); return; }
        setGuardando(true);
        try {
            const res = await fetch(API_CREAR_MANUAL, { method:'POST', credentials:'include', headers:{'Content-Type':'application/json'}, body: JSON.stringify({...form, habitacion_id: parseInt(form.habitacion_id)}) });
            const data = await res.json();
            if (!data.ok) { toast.err(data.mensaje || 'Error al crear.'); return; }
            toast.ok('✅ Reservación ' + data.reservacion.codigo + ' creada. Total: ' + fmt(data.reservacion.total));
            onGuardar();
        } catch { toast.err('Error de conexión.'); }
        finally { setGuardando(false); }
    }

    const inp = { fontFamily:"'Lato',sans-serif", fontSize:'0.88rem', padding:'9px 12px', borderRadius:'8px', border:'1.5px solid #e0d8cf', width:'100%', outline:'none', boxSizing:'border-box', background:'#fdfaf7' };
    const lbl = { fontFamily:"'Lato',sans-serif", fontSize:'0.75rem', fontWeight:700, color:'#4a4a4a', textTransform:'uppercase', letterSpacing:'0.7px', display:'block', marginBottom:'5px' };
    const err = { fontFamily:"'Lato',sans-serif", fontSize:'0.75rem', color:'#e74c3c', marginTop:'3px' };

    return (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',zIndex:9000,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px',overflowY:'auto'}}>
            <div style={{background:'#fff',borderRadius:'20px',padding:'32px',maxWidth:'560px',width:'100%',boxShadow:'0 24px 60px rgba(0,0,0,0.25)',maxHeight:'90vh',overflowY:'auto'}}>
                <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.5rem',color:'#1a0d06',marginBottom:'6px'}}>🛎️ Nueva Reservación Manual</h2>
                <p style={{fontFamily:"'Lato',sans-serif",fontSize:'0.85rem',color:'#888',marginBottom:'24px'}}>Huésped en recepción — pago directo, sin Mercado Pago</p>

                <div style={{marginBottom:'16px'}}>
                    <label style={lbl}>Habitación *</label>
                    <select style={inp} value={form.habitacion_id} onChange={e => { setForm({...form, habitacion_id: e.target.value}); setErrores({...errores, habitacion_id: null}); }}>
                        <option value="">— Seleccionar —</option>
                        {habsDisp.map(h => <option key={h.id} value={h.id}>{h.nombre} ({h.tipo}) — {fmt(h.precio_noche)}/noche</option>)}
                    </select>
                    {errores.habitacion_id && <p style={err}>⚠ {errores.habitacion_id}</p>}
                </div>

                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'16px'}}>
                    <div>
                        <label style={lbl}>Llegada *</label>
                        <input type="date" style={inp} min={hoy} value={form.fecha_entrada} onChange={e => { setForm({...form, fecha_entrada: e.target.value}); setErrores({...errores, fecha_entrada:null}); }} />
                        {errores.fecha_entrada && <p style={err}>⚠ {errores.fecha_entrada}</p>}
                    </div>
                    <div>
                        <label style={lbl}>Salida *</label>
                        <input type="date" style={inp} min={form.fecha_entrada||hoy} value={form.fecha_salida} onChange={e => { setForm({...form, fecha_salida: e.target.value}); setErrores({...errores, fecha_salida:null}); }} />
                        {errores.fecha_salida && <p style={err}>⚠ {errores.fecha_salida}</p>}
                    </div>
                </div>

                {habSel && noches > 0 && (
                    <div style={{background:'linear-gradient(135deg,#2a1206,#6b3a1f)',borderRadius:'10px',padding:'12px 16px',marginBottom:'16px',color:'#fff',fontFamily:"'Lato',sans-serif",fontSize:'0.85rem'}}>
                        🌙 {noches} noche{noches!==1?'s':''} × {fmt(habSel.precio_noche)} = <strong style={{fontSize:'1rem',marginLeft:'6px'}}>{fmt(total)}</strong>
                    </div>
                )}

                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'16px'}}>
                    <div>
                        <label style={lbl}>Nombre del Huésped *</label>
                        <input type="text" style={inp} placeholder="Nombre completo" value={form.nombre_huesped} onChange={e => { setForm({...form, nombre_huesped: e.target.value}); setErrores({...errores, nombre_huesped:null}); }} />
                        {errores.nombre_huesped && <p style={err}>⚠ {errores.nombre_huesped}</p>}
                    </div>
                    <div>
                        <label style={lbl}>Correo (opcional)</label>
                        <input type="email" style={inp} placeholder="correo@ejemplo.com" value={form.correo_huesped} onChange={e => setForm({...form, correo_huesped: e.target.value})} />
                    </div>
                </div>

                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'16px'}}>
                    <div>
                        <label style={lbl}>N° Huéspedes</label>
                        <input type="number" style={inp} min="1" max="10" value={form.num_huespedes} onChange={e => setForm({...form, num_huespedes: parseInt(e.target.value)||1})} />
                    </div>
                    <div>
                        <label style={lbl}>Método de Pago</label>
                        <select style={inp} value={form.metodo_pago} onChange={e => setForm({...form, metodo_pago: e.target.value})}>
                            <option value="efectivo">💵 Efectivo</option>
                            <option value="transferencia">🏦 Transferencia (SPEI)</option>
                            <option value="tarjeta">💳 Tarjeta en Terminal</option>
                            <option value="otro">📋 Otro</option>
                        </select>
                    </div>
                </div>

                <div style={{marginBottom:'24px'}}>
                    <label style={lbl}>Notas (opcional)</label>
                    <textarea style={{...inp, minHeight:'60px', resize:'vertical'}} placeholder="Ej: aniversario, llegada tardía..." value={form.notas} onChange={e => setForm({...form, notas: e.target.value})} />
                </div>

                <div style={{display:'flex',gap:'12px',justifyContent:'flex-end'}}>
                    <button onClick={onCerrar} style={{padding:'11px 22px',borderRadius:'8px',border:'1.5px solid #ddd',background:'none',cursor:'pointer',fontFamily:"'Lato',sans-serif",fontWeight:700,color:'#666'}}>Cancelar</button>
                    <button onClick={handleGuardar} disabled={guardando} style={{padding:'11px 22px',borderRadius:'8px',border:'none',cursor:'pointer',fontFamily:"'Lato',sans-serif",fontWeight:700,color:'#fff',background:'linear-gradient(135deg,#8c5a35,#6b3a1f)',opacity:guardando?0.7:1}}>
                        {guardando ? '⏳ Creando...' : '✅ Crear Reservación'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function TablaReservaciones({ limite, datos, cargando, onRecargar, rol }) {
    const filas = limite ? datos.slice(0, limite) : datos;
    const [confirmando, setConfirmando] = useState(null);

    async function handleCancelar(reservacion) {
        try {
            const res = await fetch(API_CANCELAR, { method:'POST', credentials:'include', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ reservacion_id: reservacion.id }) });
            const data = await res.json();
            if (!data.ok) { toast.err(data.mensaje); return; }
            toast.ok('Reservación cancelada y habitación liberada.');
            onRecargar();
        } catch { toast.err('Error de conexión.'); }
        setConfirmando(null);
    }

    async function handleConfirmarPago(reservacion) {
        try {
            const res = await fetch(API_CONFIRMAR, { method:'POST', credentials:'include', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ reservacion_id: reservacion.id, metodo: 'efectivo' }) });
            const data = await res.json();
            if (!data.ok) { toast.err(data.mensaje); return; }
            toast.ok('✅ Pago confirmado correctamente.');
            onRecargar();
        } catch { toast.err('Error de conexión.'); }
        setConfirmando(null);
    }

    return (
        <div className="dash-table-card">
            {confirmando?.tipo === 'cancelar' && <ModalConfirmar titulo="¿Cancelar reservación?" mensaje={`Se cancelará ${confirmando.reservacion.codigo} y la habitación quedará disponible.`} confirmLabel="Sí, cancelar" peligro={true} onConfirmar={() => handleCancelar(confirmando.reservacion)} onCancelar={() => setConfirmando(null)} />}
            {confirmando?.tipo === 'confirmar' && <ModalConfirmar titulo="¿Confirmar pago en efectivo?" mensaje={`Se registrará el pago de ${fmt(confirmando.reservacion.total)} para ${confirmando.reservacion.codigo}.`} confirmLabel="Confirmar pago" onConfirmar={() => handleConfirmarPago(confirmando.reservacion)} onCancelar={() => setConfirmando(null)} />}

            <div className="dash-table-header">
                <div>
                    <h2>📋 Reservaciones {limite ? 'Recientes' : ''}</h2>
                    <p>{cargando ? 'Cargando...' : `${datos.length} reservación${datos.length!==1?'es':''}`}</p>
                </div>
            </div>

            {!cargando && datos.filter(r=>r.estado==='pendiente').length > 0 && (
                <div style={{margin:'0 0 12px',padding:'10px 16px',background:'#fff3cd',borderRadius:'8px',border:'1px solid #ffc107',fontFamily:"'Lato',sans-serif",fontSize:'0.85rem',color:'#856404'}}>
                    ⏳ {datos.filter(r=>r.estado==='pendiente').length} reservación(es) pendiente(s) de pago. Se liberan automáticamente en 15 min.
                </div>
            )}

            {cargando ? <Spinner /> : (
                <div className="dash-table-wrap">
                    <table className="dash-table">
                        <thead>
                            <tr><th>Código</th><th>Huésped</th><th>Habitación</th><th>Entrada</th><th>Salida</th><th>Estado</th><th>Total</th><th>Acciones</th></tr>
                        </thead>
                        <tbody>
                            {filas.length === 0 ? (
                                <tr><td colSpan="8" style={{textAlign:'center',color:'#aaa',padding:'30px',fontFamily:"'Lato',sans-serif"}}>Sin reservaciones</td></tr>
                            ) : filas.map(r => (
                                <tr key={r.id} style={r.estado==='pendiente'?{background:'#fffbeb'}:{}}>
                                    <td><strong>{r.codigo}</strong></td>
                                    <td>{r.huesped_nombre || '—'}</td>
                                    <td>{r.habitacion_numero} — {r.habitacion_nombre}</td>
                                    <td>{fmtFecha(r.fecha_entrada)}</td>
                                    <td>{fmtFecha(r.fecha_salida)}</td>
                                    <td><span className={`dash-badge ${colorEstado(r.estado)}`}>{r.estado}</span></td>
                                    <td><strong>{fmt(r.total)}</strong></td>
                                    <td>
                                        <div className="dash-action-btns">
                                            {r.estado === 'pendiente' && (
                                                <button className="dash-action-btn view" title="Confirmar pago efectivo" onClick={() => setConfirmando({tipo:'confirmar', reservacion:r})}>💵</button>
                                            )}
                                            {!['cancelada','completada'].includes(r.estado) && (
                                                <button className="dash-action-btn delete" title="Cancelar reservación" onClick={() => setConfirmando({tipo:'cancelar', reservacion:r})}>🚫</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

function TablaUsuarios({ limite, datos, cargando }) {
    const filas = limite ? datos.slice(0, limite) : datos;
    return (
        <div className="dash-table-card">
            <div className="dash-table-header">
                <div><h2>👥 Usuarios {limite ? 'Recientes' : ''}</h2><p>{cargando ? 'Cargando...' : `${datos.length} usuario${datos.length!==1?'s':''}`}</p></div>
            </div>
            {cargando ? <Spinner /> : (
                <div className="dash-table-wrap">
                    <table className="dash-table">
                        <thead><tr><th>Usuario</th><th>Rol</th><th>Estado</th><th>Registro</th></tr></thead>
                        <tbody>
                            {filas.length === 0 ? <tr><td colSpan="4" style={{textAlign:'center',color:'#aaa',padding:'30px',fontFamily:"'Lato',sans-serif"}}>Sin usuarios</td></tr>
                            : filas.map(u => (
                                <tr key={u.id}>
                                    <td>
                                        <div className="dash-user-cell">
                                            <div className="dash-user-mini-avatar">{iniciales(u.nombre)}</div>
                                            <div><div className="dash-user-cell-name">{u.nombre}</div><div className="dash-user-cell-email">{u.correo}</div></div>
                                        </div>
                                    </td>
                                    <td><span className={`dash-badge ${u.rol==='admin'?'brown':'blue'}`}>{u.rol==='admin'?'🛡️ Admin':'🧳 Cliente'}</span></td>
                                    <td><span className={`dash-badge ${colorEstado(u.estado)}`}>{u.estado}</span></td>
                                    <td>{u.created_at ? u.created_at.split(' ')[0] : '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

function SeccionHabitaciones({ datos, cargando }) {
    return (
        <div className="dash-section-full">
            <div className="dash-table-card">
                <div className="dash-table-header">
                    <div><h2>🛏️ Habitaciones</h2><p>{cargando ? 'Cargando...' : `${datos.length} habitaciones`}</p></div>
                </div>
                {cargando ? <Spinner /> : (
                    <div className="dash-table-wrap">
                        <table className="dash-table">
                            <thead><tr><th>No.</th><th>Nombre</th><th>Tipo</th><th>Capacidad</th><th>Precio/Noche</th><th>Estado</th></tr></thead>
                            <tbody>
                                {datos.map(h => (
                                    <tr key={h.id}>
                                        <td><strong>{h.numero}</strong></td>
                                        <td><strong>{h.nombre}</strong></td>
                                        <td style={{fontSize:'0.8rem',color:'#888'}}>{h.tipo}</td>
                                        <td>{h.capacidad} personas</td>
                                        <td><strong>{fmt(h.precio_noche)}/noche</strong></td>
                                        <td><span className={`dash-badge ${colorEstado(h.estado)}`}>{h.estado}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

function SeccionDashboard({ usuarios, reservaciones, habitaciones, cargando, onNuevaReserva, onRecargar, rol }) {
    const pendientes  = reservaciones.filter(r=>r.estado==='pendiente').length;
    const confirmadas = reservaciones.filter(r=>['confirmada','activa'].includes(r.estado)).length;
    const ocupadas    = habitaciones.filter(h=>h.estado==='ocupada').length;
    const ingresos    = reservaciones.filter(r=>['confirmada','activa'].includes(r.estado)).reduce((s,r)=>s+Number(r.total),0);

    const stats = [
        { label:'Huéspedes Registrados', value: cargando?'...':usuarios.filter(u=>u.rol==='cliente').length, icon:'👥', color:'brown' },
        { label:'Reservaciones Activas',  value: cargando?'...':confirmadas,   icon:'📋', color:'green'  },
        { label:'Habitaciones Ocupadas',  value: cargando?'...':ocupadas,      icon:'🛏️', color:'blue'   },
        { label:'Ingresos Confirmados',   value: cargando?'...':fmt(ingresos), icon:'💰', color:'yellow' },
    ];

    return (
        <>
            {!cargando && pendientes > 0 && (
                <div style={{background:'#fff3cd',border:'1px solid #ffc107',borderRadius:'10px',padding:'12px 20px',marginBottom:'20px',fontFamily:"'Lato',sans-serif",fontSize:'0.88rem',color:'#856404',display:'flex',alignItems:'center',gap:'10px'}}>
                    <span style={{fontSize:'1.2rem'}}>⏳</span>
                    <span><strong>{pendientes}</strong> reservación(es) pendiente(s) de pago en línea. Se liberan en 15 min o confírmalas manualmente en Reservaciones.</span>
                </div>
            )}
            <div className="dash-stats-grid">
                {stats.map((s,i) => (
                    <div key={i} className="dash-stat-card">
                        <div className="dash-stat-header"><div className={`dash-stat-icon ${s.color}`}>{s.icon}</div></div>
                        <div className="dash-stat-value">{cargando ? <span style={{fontSize:'1rem',color:'#aaa'}}>Cargando...</span> : s.value}</div>
                        <div className="dash-stat-label">{s.label}</div>
                    </div>
                ))}
            </div>
            <div className="dash-quick-actions">
                <button className="dash-quick-btn" onClick={onNuevaReserva}><span className="dash-quick-btn-icon">🛎️</span>Nueva Reserva Manual</button>
                <button className="dash-quick-btn" onClick={onRecargar}><span className="dash-quick-btn-icon">🔄</span>Actualizar Datos</button>
                <a href="catalogo.html" target="_blank" rel="noopener noreferrer" style={{textDecoration:'none'}}><button className="dash-quick-btn"><span className="dash-quick-btn-icon">🛏️</span>Ver Catálogo</button></a>
                <button className="dash-quick-btn" onClick={()=>toast.info('Reportes — próximamente')}><span className="dash-quick-btn-icon">📊</span>Ver Reportes</button>
            </div>
            <div className="dash-section-grid">
                <TablaReservaciones limite={5} datos={reservaciones} cargando={cargando} onRecargar={onRecargar} rol={rol} />
                <TablaUsuarios limite={5} datos={usuarios} cargando={cargando} />
            </div>
        </>
    );
}

function DashboardApp() {
    const [seccion,     setSeccion]    = useState('dashboard');
    const [collapsed,   setCollapsed]  = useState(false);
    const [mobileOpen,  setMobileOpen] = useState(false);
    const [mobile,      setMobile]     = useState(isMobile());
    const [modalManual, setModalManual] = useState(false);
    const [usuarios,      setUsuarios]      = useState([]);
    const [reservaciones, setReservaciones] = useState([]);
    const [habitaciones,  setHabitaciones]  = useState([]);
    const [cargando,      setCargando]      = useState(true);

    const sesion      = (window.QDSession?.obtener()) || (() => { try { return JSON.parse(sessionStorage.getItem('qdSession')||'{}'); } catch { return {}; } })();
    const rol         = sesion.rol || 'cliente';
    const adminNombre = sesion.nombre || 'Administrador';

    const cargarTodo = useCallback(async () => {
        setCargando(true);
        try {
            const [resU, resR, resH] = await Promise.all([
                fetch(API_USUARIOS,      { credentials:'include' }),
                fetch(API_RESERVACIONES, { credentials:'include' }),
                fetch(API_HABITACIONES,  { credentials:'include' }),
            ]);
            const [dU, dR, dH] = await Promise.all([resU.json(), resR.json(), resH.json()]);
            if (dU.ok) setUsuarios(dU.usuarios);           else toast.av('No se cargaron usuarios.');
            if (dR.ok) setReservaciones(dR.reservaciones); else toast.av('No se cargaron reservaciones.');
            if (dH.ok) setHabitaciones(dH.habitaciones);   else toast.av('No se cargaron habitaciones.');
        } catch { toast.err('Error al conectar con el servidor.'); }
        finally { setCargando(false); }
    }, []);

    useEffect(() => { cargarTodo(); }, []);
    useEffect(() => {
        const onResize = () => { setMobile(isMobile()); if (!isMobile()) setMobileOpen(false); };
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    function cerrarSesion() {
        window.QDSession ? window.QDSession.cerrar(false) : (sessionStorage.removeItem('qdSession'), window.location.href = 'login.html');
    }

    const titulos = {
        dashboard:    { h:'Panel de Control',  p:'Resumen general — Hotel Quinta Dalam'  },
        reservaciones:{ h:'Reservaciones',      p:'Gestión de reservas activas y pasadas' },
        usuarios:     { h:'Usuarios',           p:'Administración de cuentas'             },
        habitaciones: { h:'Habitaciones',       p:'13 habitaciones — Michoacán'           },
    };
    const titulo = titulos[seccion] || titulos.dashboard;
    const pendientesBadge = reservaciones.filter(r=>r.estado==='pendiente').length;

    const navItems = [
        { id:'dashboard',     label:'Dashboard',     icon:'🏠' },
        { id:'reservaciones', label:'Reservaciones', icon:'📋', badge: pendientesBadge||null },
        { id:'usuarios',      label:'Usuarios',      icon:'👥' },
        { id:'habitaciones',  label:'Habitaciones',  icon:'🛏️' },
    ];

    const sidebarCls = ['dash-sidebar', !mobile&&collapsed?'collapsed':'', mobile&&mobileOpen?'mobile-open':''].filter(Boolean).join(' ');
    const mainCls    = ['dash-main', !mobile&&collapsed?'sidebar-collapsed':''].filter(Boolean).join(' ');

    return (
        <div className="dash-layout">
            {mobile && mobileOpen && <div className="dash-overlay" onClick={() => setMobileOpen(false)} />}

            {modalManual && (
                <ModalReservacionManual
                    habitaciones={habitaciones}
                    onGuardar={() => { setModalManual(false); cargarTodo(); }}
                    onCerrar={() => setModalManual(false)}
                />
            )}

            <aside className={sidebarCls}>
                <div className="dash-sidebar-brand">
                    <div className="dash-sidebar-logo"><img src="./img/logo/logo-quinta-dalam-dark.svg" alt="Hotel Quinta Dalam" /></div>
                    <div className="dash-brand-text"><strong>Hotel Quinta Dalam</strong><span>Panel Admin</span></div>
                    <button className="dash-toggle-btn" onClick={() => mobile ? setMobileOpen(p=>!p) : setCollapsed(p=>!p)} aria-label="Colapsar menú">
                        <span className="dash-toggle-line"></span><span className="dash-toggle-line"></span><span className="dash-toggle-line"></span>
                    </button>
                </div>
                <div className="dash-sidebar-profile">
                    <div className="dash-profile-avatar">{iniciales(adminNombre)}</div>
                    <div className="dash-profile-text">
                        <p className="dash-profile-name">{adminNombre}</p>
                        <span className="dash-profile-badge">{rol==='admin'?'🛡️ Administrador':'🔑 Recepcionista'}</span>
                        <div className="dash-profile-divider"></div>
                    </div>
                </div>
                <nav className="dash-sidebar-nav">
                    <p className="dash-nav-section-title">Menú Principal</p>
                    {navItems.map(item => (
                        <button key={item.id} className={`dash-nav-item${seccion===item.id?' active':''}`} onClick={() => { setSeccion(item.id); if(isMobile()) setMobileOpen(false); }} title={item.label}>
                            <span className="dash-nav-icon">{item.icon}</span>
                            <span className="dash-nav-label">{item.label}</span>
                            {item.badge ? <span className="dash-nav-badge">{item.badge}</span> : null}
                        </button>
                    ))}
                    <p className="dash-nav-section-title">Acceso Rápido</p>
                    <a href="index.html" target="_blank" rel="noopener noreferrer" className="dash-nav-item">
                        <span className="dash-nav-icon">🌐</span><span className="dash-nav-label">Ver Sitio Web</span>
                    </a>
                </nav>
                <div className="dash-sidebar-footer">
                    <button className="dash-logout-btn" onClick={cerrarSesion}>
                        <span className="dash-logout-icon">🚪</span><span className="dash-logout-label">Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            <div className={mainCls}>
                <div className="dash-topbar">
                    <div className="dash-topbar-left">
                        <button className="dash-topbar-menu-btn" onClick={() => mobile ? setMobileOpen(p=>!p) : setCollapsed(p=>!p)}>☰ Menú</button>
                        <div className="dash-topbar-title"><h1>{titulo.h}</h1><p>{titulo.p}</p></div>
                    </div>
                    <div className="dash-topbar-actions">
                        <button className="dash-topbar-btn" onClick={cargarTodo}>🔄 Actualizar</button>
                        <button className="dash-topbar-btn primary" onClick={() => setModalManual(true)}>+ Nueva Reserva</button>
                    </div>
                </div>
                <div className="dash-content">
                    {seccion === 'dashboard'     && <SeccionDashboard usuarios={usuarios} reservaciones={reservaciones} habitaciones={habitaciones} cargando={cargando} onNuevaReserva={() => setModalManual(true)} onRecargar={cargarTodo} rol={rol} />}
                    {seccion === 'reservaciones' && <div className="dash-section-full"><TablaReservaciones datos={reservaciones} cargando={cargando} onRecargar={cargarTodo} rol={rol} /></div>}
                    {seccion === 'usuarios'      && <div className="dash-section-full"><TablaUsuarios datos={usuarios} cargando={cargando} /></div>}
                    {seccion === 'habitaciones'  && <SeccionHabitaciones datos={habitaciones} cargando={cargando} />}
                </div>
            </div>
        </div>
    );
}

const dashRoot = ReactDOM.createRoot(document.getElementById('root-dashboard'));
dashRoot.render(<DashboardApp />);