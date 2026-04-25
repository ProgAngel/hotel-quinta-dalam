// ============================================================
//  dashboard.js — Hotel Quinta Dalam
//  Panel de Control — todas las tablas con datos reales
// ============================================================

const { useState, useEffect, useCallback } = React;

const API_USUARIOS      = './api/usuarios/listar.php';
const API_RESERVACIONES = './api/reservaciones/listar.php';
const API_HABITACIONES  = './api/habitaciones/listar.php';

// ── Helpers ─────────────────────────────────────────────────
const isMobile = () => window.innerWidth <= 768;

const colorEstado = e => ({
    activa:'green', confirmada:'blue', pendiente:'yellow', cancelada:'red', completada:'blue',
    disponible:'green', ocupada:'red', mantenimiento:'yellow',
    activo:'green', inactivo:'red', pendiente:'yellow'
}[e] || 'brown');

const iniciales = n => n ? n.split(' ').map(x => x[0]).join('').toUpperCase().slice(0, 2) : '??';

const fmt = n => '$' + Number(n).toLocaleString('es-MX', { minimumFractionDigits: 2 });

// ── Spinner de carga ─────────────────────────────────────────
function Spinner() {
    return (
        <div style={{ textAlign:'center', padding:'40px 20px' }}>
            <div style={{ width:'36px', height:'36px', border:'3px solid rgba(140,90,53,0.2)',
                borderTopColor:'#8c5a35', borderRadius:'50%',
                animation:'dashSpin 0.8s linear infinite', margin:'0 auto 12px' }}></div>
            <style>{'@keyframes dashSpin{to{transform:rotate(360deg)}}'}</style>
            <p style={{ fontFamily:"'Lato',sans-serif", fontSize:'0.85rem', color:'#aaa' }}>
                Cargando datos...
            </p>
        </div>
    );
}

// ── Tabla Reservaciones ──────────────────────────────────────
function TablaReservaciones({ limite, datos, cargando }) {
    const filas = limite ? datos.slice(0, limite) : datos;

    return (
        <div className="dash-table-card">
            <div className="dash-table-header">
                <div>
                    <h2>📋 Reservaciones {limite ? 'Recientes' : ''}</h2>
                    <p>{cargando ? 'Cargando...' : `${datos.length} reservación${datos.length !== 1 ? 'es' : ''}`}</p>
                </div>
                <button className="dash-btn-small outline">Ver todas</button>
            </div>
            {cargando ? <Spinner /> : (
                <div className="dash-table-wrap">
                    <table className="dash-table">
                        <thead>
                            <tr>
                                <th>Código</th><th>Huésped</th><th>Habitación</th>
                                <th>Entrada</th><th>Salida</th><th>Estado</th>
                                <th>Total</th><th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filas.length === 0 ? (
                                <tr><td colSpan="8" style={{ textAlign:'center', color:'#aaa', padding:'30px', fontFamily:"'Lato',sans-serif" }}>Sin reservaciones</td></tr>
                            ) : filas.map(r => (
                                <tr key={r.id}>
                                    <td><strong>{r.codigo}</strong></td>
                                    <td>{r.huesped_nombre}</td>
                                    <td>{r.habitacion_numero} — {r.habitacion_nombre}</td>
                                    <td>{r.fecha_entrada}</td>
                                    <td>{r.fecha_salida}</td>
                                    <td><span className={`dash-badge ${colorEstado(r.estado)}`}>{r.estado}</span></td>
                                    <td><strong>{fmt(r.total)}</strong></td>
                                    <td>
                                        <div className="dash-action-btns">
                                            <button className="dash-action-btn view" title="Ver"
                                                onClick={() => window.QDToast && window.QDToast.info('Ver reservación — próximamente')}>👁️</button>
                                            <button className="dash-action-btn edit" title="Editar"
                                                onClick={() => window.QDToast && window.QDToast.info('Editar — próximamente')}>✏️</button>
                                            <button className="dash-action-btn delete" title="Cancelar"
                                                onClick={() => window.QDToast && window.QDToast.aviso('Cancelar reservación — próximamente')}>🚫</button>
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

// ── Tabla Usuarios ───────────────────────────────────────────
function TablaUsuarios({ limite, datos, cargando }) {
    const filas = limite ? datos.slice(0, limite) : datos;

    return (
        <div className="dash-table-card">
            <div className="dash-table-header">
                <div>
                    <h2>👥 Usuarios {limite ? 'Recientes' : ''}</h2>
                    <p>{cargando ? 'Cargando...' : `${datos.length} usuario${datos.length !== 1 ? 's' : ''}`}</p>
                </div>
                <button className="dash-btn-small filled"
                    onClick={() => window.QDToast && window.QDToast.info('Añadir usuario — próximamente')}>
                    + Añadir
                </button>
            </div>
            {cargando ? <Spinner /> : (
                <div className="dash-table-wrap">
                    <table className="dash-table">
                        <thead>
                            <tr><th>Usuario</th><th>Rol</th><th>Estado</th><th>Registro</th><th>Acciones</th></tr>
                        </thead>
                        <tbody>
                            {filas.length === 0 ? (
                                <tr><td colSpan="5" style={{ textAlign:'center', color:'#aaa', padding:'30px', fontFamily:"'Lato',sans-serif" }}>Sin usuarios</td></tr>
                            ) : filas.map(u => (
                                <tr key={u.id}>
                                    <td>
                                        <div className="dash-user-cell">
                                            <div className="dash-user-mini-avatar">{iniciales(u.nombre)}</div>
                                            <div>
                                                <div className="dash-user-cell-name">{u.nombre}</div>
                                                <div className="dash-user-cell-email">{u.correo}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`dash-badge ${u.rol === 'admin' ? 'brown' : 'blue'}`}>
                                            {u.rol === 'admin' ? '🛡️ Admin' : '🧳 Cliente'}
                                        </span>
                                    </td>
                                    <td><span className={`dash-badge ${colorEstado(u.estado)}`}>{u.estado}</span></td>
                                    <td>{u.created_at ? u.created_at.split(' ')[0] : '—'}</td>
                                    <td>
                                        <div className="dash-action-btns">
                                            <button className="dash-action-btn view" title="Ver"
                                                onClick={() => window.QDToast && window.QDToast.info('Ver usuario — próximamente')}>👁️</button>
                                            <button className="dash-action-btn edit" title="Editar"
                                                onClick={() => window.QDToast && window.QDToast.info('Editar — próximamente')}>✏️</button>
                                            <button className="dash-action-btn delete" title="Eliminar"
                                                onClick={() => window.QDToast && window.QDToast.aviso('Eliminar usuario — próximamente')}>🗑️</button>
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

// ── Tabla Habitaciones ───────────────────────────────────────
function SeccionHabitaciones({ datos, cargando }) {
    return (
        <div className="dash-section-full">
            <div className="dash-table-card">
                <div className="dash-table-header">
                    <div>
                        <h2>🛏️ Gestión de Habitaciones</h2>
                        <p>{cargando ? 'Cargando...' : `${datos.length} habitaciones — Pueblos Mágicos de Michoacán`}</p>
                    </div>
                    <button className="dash-btn-small filled"
                        onClick={() => window.QDToast && window.QDToast.info('Nueva habitación — próximamente')}>
                        + Nueva Habitación
                    </button>
                </div>
                {cargando ? <Spinner /> : (
                    <div className="dash-table-wrap">
                        <table className="dash-table">
                            <thead>
                                <tr>
                                    <th>No.</th><th>Nombre / Temática</th><th>Tipo</th>
                                    <th>Capacidad</th><th>Precio por Noche</th><th>Estado</th><th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {datos.length === 0 ? (
                                    <tr><td colSpan="7" style={{ textAlign:'center', color:'#aaa', padding:'30px', fontFamily:"'Lato',sans-serif" }}>Sin habitaciones</td></tr>
                                ) : datos.map(h => (
                                    <tr key={h.id}>
                                        <td><strong>{h.numero}</strong></td>
                                        <td><strong>{h.nombre}</strong></td>
                                        <td><span style={{ fontSize:'0.8rem', color:'#888', fontFamily:"'Lato',sans-serif" }}>{h.tipo}</span></td>
                                        <td>{h.capacidad} personas</td>
                                        <td><strong>{fmt(h.precio_noche)}/noche</strong></td>
                                        <td><span className={`dash-badge ${colorEstado(h.estado)}`}>{h.estado}</span></td>
                                        <td>
                                            <div className="dash-action-btns">
                                                <button className="dash-action-btn view" title="Ver"
                                                    onClick={() => window.QDToast && window.QDToast.info(`Habitación ${h.nombre} — ${h.tipo}`)}>👁️</button>
                                                <button className="dash-action-btn edit" title="Editar"
                                                    onClick={() => window.QDToast && window.QDToast.info('Editar habitación — próximamente')}>✏️</button>
                                                <button className="dash-action-btn delete" title="Eliminar"
                                                    onClick={() => window.QDToast && window.QDToast.aviso('Eliminar habitación — próximamente')}>🗑️</button>
                                            </div>
                                        </td>
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

// ── Sección Dashboard principal ──────────────────────────────
function SeccionDashboard({ usuarios, reservaciones, habitaciones, cargando, onAccion }) {

    const stats = [
        {
            label: 'Huéspedes Registrados',
            value: cargando ? '...' : usuarios.filter(u => u.rol === 'cliente').length,
            icon: '👥', color: 'brown', trend: null
        },
        {
            label: 'Reservaciones Activas',
            value: cargando ? '...' : reservaciones.filter(r => ['activa','confirmada','pendiente'].includes(r.estado)).length,
            icon: '📋', color: 'green', trend: null
        },
        {
            label: 'Habitaciones Ocupadas',
            value: cargando ? '...' : habitaciones.filter(h => h.estado === 'ocupada').length,
            icon: '🛏️', color: 'blue', trend: null
        },
        {
            label: 'Ingresos (reservas activas)',
            value: cargando ? '...' : '$' + reservaciones
                .filter(r => ['activa','confirmada'].includes(r.estado))
                .reduce((sum, r) => sum + Number(r.total), 0)
                .toLocaleString('es-MX', { minimumFractionDigits: 0 }),
            icon: '💰', color: 'yellow', trend: null
        },
    ];

    const acciones = [
        { label:'Nueva Habitación', icon:'🛏️', accion:'nueva-habitacion' },
        { label:'Nueva Reserva',    icon:'📅', accion:'nueva-reserva'    },
        { label:'Nuevo Usuario',    icon:'👤', accion:'nuevo-usuario'    },
        { label:'Ver Reportes',     icon:'📊', accion:'reportes'         },
    ];

    return (
        <>
            <div className="dash-stats-grid">
                {stats.map((s, i) => (
                    <div key={i} className="dash-stat-card">
                        <div className="dash-stat-header">
                            <div className={`dash-stat-icon ${s.color}`}>{s.icon}</div>
                        </div>
                        <div className="dash-stat-value">
                            {cargando
                                ? <span style={{ fontSize:'1rem', color:'#aaa' }}>Cargando...</span>
                                : s.value
                            }
                        </div>
                        <div className="dash-stat-label">{s.label}</div>
                    </div>
                ))}
            </div>

            <div className="dash-quick-actions">
                {acciones.map((a, i) => (
                    <button key={i} className="dash-quick-btn" onClick={() => onAccion(a.accion)}>
                        <span className="dash-quick-btn-icon">{a.icon}</span>
                        {a.label}
                    </button>
                ))}
            </div>

            <div className="dash-section-grid">
                <TablaReservaciones limite={4} datos={reservaciones} cargando={cargando} />
                <TablaUsuarios      limite={4} datos={usuarios}      cargando={cargando} />
            </div>
        </>
    );
}

// ── App Principal ────────────────────────────────────────────
function DashboardApp() {

    const [seccion,    setSeccion]    = useState('dashboard');
    const [collapsed,  setCollapsed]  = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [mobile,     setMobile]     = useState(isMobile());

    // ── Datos de la API ──────────────────────────────────────
    const [usuarios,      setUsuarios]      = useState([]);
    const [reservaciones, setReservaciones] = useState([]);
    const [habitaciones,  setHabitaciones]  = useState([]);
    const [cargando,      setCargando]      = useState(true);

    // ── Cargar todos los datos al montar ─────────────────────
    useEffect(() => {
        const cargarTodo = async () => {
            setCargando(true);
            try {
                const [resU, resR, resH] = await Promise.all([
                    fetch(API_USUARIOS,      { credentials: 'include' }),
                    fetch(API_RESERVACIONES, { credentials: 'include' }),
                    fetch(API_HABITACIONES,  { credentials: 'include' }),
                ]);

                const [dataU, dataR, dataH] = await Promise.all([
                    resU.json(), resR.json(), resH.json()
                ]);

                if (dataU.ok) setUsuarios(dataU.usuarios);
                else window.QDToast && window.QDToast.aviso('No se pudieron cargar los usuarios.');

                if (dataR.ok) setReservaciones(dataR.reservaciones);
                else window.QDToast && window.QDToast.aviso('No se pudieron cargar las reservaciones.');

                if (dataH.ok) setHabitaciones(dataH.habitaciones);
                else window.QDToast && window.QDToast.aviso('No se pudieron cargar las habitaciones.');

            } catch {
                window.QDToast && window.QDToast.error('Error al conectar con el servidor.');
            } finally {
                setCargando(false);
            }
        };

        cargarTodo();
    }, []);

    useEffect(() => {
        const onResize = () => {
            const m = isMobile();
            setMobile(m);
            if (!m) setMobileOpen(false);
        };
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const irSeccion = useCallback((id) => {
        setSeccion(id);
        if (isMobile()) setMobileOpen(false);
    }, []);

    function handleAccion(accion) {
        const msgs = {
            'nueva-habitacion': '🛏️ Nueva habitación — próximamente',
            'nueva-reserva':    '📅 Nueva reserva — próximamente',
            'nuevo-usuario':    '👤 Nuevo usuario — próximamente',
            'reportes':         '📊 Reportes — próximamente',
        };
        window.QDToast && window.QDToast.info(msgs[accion] || 'Función en desarrollo');
    }

    function recargar() {
        window.location.reload();
    }

    function cerrarSesion() {
        if (window.QDSession) {
            window.QDSession.cerrar(false);
        } else {
            sessionStorage.removeItem('qdSession');
            window.location.href = 'login.html';
        }
    }

    function toggleSidebar() {
        if (mobile) setMobileOpen(p => !p);
        else        setCollapsed(p => !p);
    }

    const titulos = {
        dashboard:    { h:'Panel de Control',   p:'Resumen general — Hotel Quinta Dalam'        },
        reservaciones:{ h:'Reservaciones',       p:'Gestión de reservas activas y pasadas'       },
        usuarios:     { h:'Usuarios',            p:'Administración de cuentas de huéspedes'      },
        habitaciones: { h:'Habitaciones',        p:'13 habitaciones temáticas de Michoacán'      },
        configuracion:{ h:'Configuración',       p:'Ajustes generales del sistema'               },
    };
    const titulo = titulos[seccion] || titulos.dashboard;

    const navItems = [
        { id:'dashboard',     label:'Dashboard',     icon:'🏠', tooltip:'Dashboard'     },
        { id:'reservaciones', label:'Reservaciones', icon:'📋', tooltip:'Reservaciones',
          badge: reservaciones.filter(r => r.estado === 'pendiente').length || null },
        { id:'usuarios',      label:'Usuarios',      icon:'👥', tooltip:'Usuarios'      },
        { id:'habitaciones',  label:'Habitaciones',  icon:'🛏️', tooltip:'Habitaciones'  },
        { id:'configuracion', label:'Configuración', icon:'⚙️', tooltip:'Configuración' },
    ];

    // Leer sesión para mostrar nombre del admin
    const sesion = (window.QDSession && window.QDSession.obtener()) || (() => {
        try { return JSON.parse(sessionStorage.getItem('qdSession') || '{}'); } catch { return {}; }
    })();

    const adminNombre   = sesion.nombre || 'Administrador';
    const adminIniciales = iniciales(adminNombre);

    const sidebarCls = [
        'dash-sidebar',
        !mobile && collapsed  ? 'collapsed'   : '',
        mobile  && mobileOpen ? 'mobile-open' : '',
    ].filter(Boolean).join(' ');

    const mainCls = ['dash-main', !mobile && collapsed ? 'sidebar-collapsed' : ''].filter(Boolean).join(' ');

    return (
        <div className="dash-layout">

            {mobile && mobileOpen && (
                <div className="dash-overlay" onClick={() => setMobileOpen(false)} />
            )}

            {/* ── SIDEBAR ── */}
            <aside className={sidebarCls}>

                <div className="dash-sidebar-brand">
                    <div className="dash-sidebar-logo">
                        <img src="./img/logo/logo-quinta-dalam-dark.svg" alt="Hotel Quinta Dalam" />
                    </div>
                    <div className="dash-brand-text">
                        <strong>Hotel Quinta Dalam</strong>
                        <span>Panel Admin</span>
                    </div>
                    <button className="dash-toggle-btn" onClick={toggleSidebar} aria-label="Colapsar menú">
                        <span className="dash-toggle-line"></span>
                        <span className="dash-toggle-line"></span>
                        <span className="dash-toggle-line"></span>
                    </button>
                </div>

                <div className="dash-sidebar-profile">
                    <div className="dash-profile-avatar">{adminIniciales}</div>
                    <div className="dash-profile-text">
                        <p className="dash-profile-name">{adminNombre}</p>
                        <span className="dash-profile-badge">🛡️ Administrador</span>
                        <div className="dash-profile-divider"></div>
                    </div>
                </div>

                <nav className="dash-sidebar-nav">
                    <p className="dash-nav-section-title">Menú Principal</p>
                    {navItems.map(item => (
                        <button key={item.id}
                            className={`dash-nav-item${seccion === item.id ? ' active' : ''}`}
                            onClick={() => irSeccion(item.id)}
                            data-tooltip={item.tooltip}
                            title={item.tooltip}>
                            <span className="dash-nav-icon">{item.icon}</span>
                            <span className="dash-nav-label">{item.label}</span>
                            {item.badge ? <span className="dash-nav-badge">{item.badge}</span> : null}
                        </button>
                    ))}
                    <p className="dash-nav-section-title">Acceso Rápido</p>
                    <a href="index.html" className="dash-nav-item"
                        data-tooltip="Ver sitio web" target="_blank" rel="noopener noreferrer">
                        <span className="dash-nav-icon">🌐</span>
                        <span className="dash-nav-label">Ver Sitio Web</span>
                    </a>
                </nav>

                <div className="dash-sidebar-footer">
                    <button className="dash-logout-btn" onClick={cerrarSesion} title="Cerrar sesión">
                        <span className="dash-logout-icon">🚪</span>
                        <span className="dash-logout-label">Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* ── ÁREA PRINCIPAL ── */}
            <div className={mainCls}>
                <div className="dash-topbar">
                    <div className="dash-topbar-left">
                        <button className="dash-topbar-menu-btn" onClick={toggleSidebar} aria-label="Abrir menú">
                            ☰ Menú
                        </button>
                        <div className="dash-topbar-title">
                            <h1>{titulo.h}</h1>
                            <p>{titulo.p}</p>
                        </div>
                    </div>
                    <div className="dash-topbar-actions">
                        <button className="dash-topbar-btn" onClick={recargar}>🔄 Actualizar</button>
                        <button className="dash-topbar-btn primary"
                            onClick={() => handleAccion('nueva-reserva')}>
                            + Nueva Reserva
                        </button>
                    </div>
                </div>

                <div className="dash-content">
                    {seccion === 'dashboard' && (
                        <SeccionDashboard
                            usuarios={usuarios}
                            reservaciones={reservaciones}
                            habitaciones={habitaciones}
                            cargando={cargando}
                            onAccion={handleAccion}
                        />
                    )}
                    {seccion === 'reservaciones' && (
                        <div className="dash-section-full">
                            <TablaReservaciones datos={reservaciones} cargando={cargando} />
                        </div>
                    )}
                    {seccion === 'usuarios' && (
                        <div className="dash-section-full">
                            <TablaUsuarios datos={usuarios} cargando={cargando} />
                        </div>
                    )}
                    {seccion === 'habitaciones' && (
                        <SeccionHabitaciones datos={habitaciones} cargando={cargando} />
                    )}
                    {seccion === 'configuracion' && (
                        <div className="dash-table-card">
                            <div className="dash-table-header">
                                <div>
                                    <h2>⚙️ Configuración</h2>
                                    <p>Ajustes generales del sistema</p>
                                </div>
                            </div>
                            <div style={{ padding:'50px', textAlign:'center', color:'#bbb',
                                fontFamily:"'Lato',sans-serif" }}>
                                ⚙️ Sección en desarrollo...
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const dashRoot = ReactDOM.createRoot(document.getElementById('root-dashboard'));
dashRoot.render(<DashboardApp />);