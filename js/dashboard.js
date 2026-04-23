const { useState, useEffect, useCallback } = React;

// ── Datos de USUARIOS mock ─────────────────────────────────────
const USUARIOS_MOCK = [
    { id: 1, nombre: 'Emiliano Beltrán',  correo: 'emiliano@correo.com', rol: 'cliente', estado: 'activo',    fecha: '2026-03-10' },
    { id: 2, nombre: 'Luis Pérez',        correo: 'luis@correo.com',     rol: 'cliente', estado: 'activo',    fecha: '2026-03-14' },
    { id: 3, nombre: 'Sofía Rodríguez',   correo: 'sofia@correo.com',    rol: 'cliente', estado: 'inactivo',  fecha: '2026-02-28' },
    { id: 4, nombre: 'Miguel Torres',     correo: 'miguel@correo.com',   rol: 'cliente', estado: 'activo',    fecha: '2026-04-01' },
    { id: 5, nombre: 'Angel Romero',      correo: 'angel@hotel.com',     rol: 'admin',   estado: 'activo',    fecha: '2026-01-15' },
    { id: 6, nombre: 'Carlos Méndez',     correo: 'carlos@correo.com',   rol: 'cliente', estado: 'pendiente', fecha: '2026-04-12' },
];

// ── Reservaciones — habitaciones del catálogo ─────────────
const RESERVACIONES_MOCK = [
    { id: 'R-001', huesped: 'Emiliano Beltrán', habitacion: '101 — Tzintzuntzan',   tipo: 'Estándar',          entrada: '2026-04-20', salida: '2026-04-22', estado: 'activa',     total: '$1,600'  },
    { id: 'R-002', huesped: 'Luis Pérez',        habitacion: '106 — Janitzio',       tipo: 'Suite',             entrada: '2026-04-21', salida: '2026-04-23', estado: 'activa',     total: '$2,000'  },
    { id: 'R-003', huesped: 'Miguel Torres',     habitacion: '201 — Suite Quinceo',  tipo: 'Suite Presidencial',entrada: '2026-04-22', salida: '2026-04-25', estado: 'confirmada', total: '$6,600'  },
    { id: 'R-004', huesped: 'Sofía Rodríguez',   habitacion: '104 — Pátzcuaro',      tipo: 'Familiar',          entrada: '2026-04-25', salida: '2026-04-28', estado: 'pendiente',  total: '$3,600'  },
    { id: 'R-005', huesped: 'Carlos Méndez',     habitacion: '205 — Tlalpujahua',    tipo: 'Suite Deluxe',      entrada: '2026-05-01', salida: '2026-05-03', estado: 'confirmada', total: '$2,400'  },
];

// ── Habitaciones — catálogo del hotel ─────────────────────
const HABITACIONES_MOCK = [
    { id: '101', nombre: 'Tzintzuntzan',  tipo: 'Estándar',           precio: '$800/noche',   estado: 'ocupada',       capacidad: 4 },
    { id: '102', nombre: 'Paracho',       tipo: 'Estándar',           precio: '$800/noche',   estado: 'disponible',    capacidad: 4 },
    { id: '103', nombre: 'Yunuen',        tipo: 'Familiar',           precio: '$1,200/noche', estado: 'disponible',    capacidad: 5 },
    { id: '104', nombre: 'Pátzcuaro',     tipo: 'Familiar',           precio: '$1,200/noche', estado: 'disponible',    capacidad: 5 },
    { id: '105', nombre: 'Coeneo',        tipo: 'Suite',              precio: '$1,000/noche', estado: 'mantenimiento', capacidad: 3 },
    { id: '106', nombre: 'Janitzio',      tipo: 'Suite',              precio: '$1,000/noche', estado: 'ocupada',       capacidad: 3 },
    { id: '201', nombre: 'Suite Quinceo', tipo: 'Suite Presidencial', precio: '$2,200/noche', estado: 'disponible',    capacidad: 2 },
    { id: '202', nombre: 'Morelia',       tipo: 'Ejecutiva',          precio: '$1,200/noche', estado: 'disponible',    capacidad: 5 },
    { id: '203', nombre: 'Tacámbaro',     tipo: 'Master Familiar',    precio: '$1,500/noche', estado: 'disponible',    capacidad: 6 },
    { id: '204', nombre: 'Uruapan',       tipo: 'Master Familiar',    precio: '$1,500/noche', estado: 'disponible',    capacidad: 6 },
    { id: '205', nombre: 'Tlalpujahua',   tipo: 'Suite Deluxe',       precio: '$1,200/noche', estado: 'disponible',    capacidad: 4 },
    { id: '206', nombre: 'Cuitzeo',       tipo: 'Suite',              precio: '$1,000/noche', estado: 'disponible',    capacidad: 3 },
    { id: '207', nombre: 'Cuanajo',       tipo: 'Master Familiar',    precio: '$1,180/noche', estado: 'disponible',    capacidad: 6 },
];

// ── Helpers ────────────────────────────────────────────────────
const isMobile = () => window.innerWidth <= 768;

const colorEstado = (e) => ({
    activa: 'green', confirmada: 'blue', pendiente: 'yellow', cancelada: 'red',
    disponible: 'green', ocupada: 'red', mantenimiento: 'yellow',
    activo: 'green', inactivo: 'red'
}[e] || 'brown');

const iniciales = (n) => n.split(' ').map(x => x[0]).join('').toUpperCase().slice(0, 2);

// ── Tabla Reservaciones ────────────────────────────────────────
function TablaReservaciones({ limite }) {
    const datos = limite ? RESERVACIONES_MOCK.slice(0, limite) : RESERVACIONES_MOCK;
    return (
        <div className="dash-table-card">
            <div className="dash-table-header">
                <div>
                    <h2>📋 Reservaciones {limite ? 'Recientes' : ''}</h2>
                    <p>{datos.length} reservaciones</p>
                </div>
                <button className="dash-btn-small outline">Ver todas</button>
            </div>
            <div className="dash-table-wrap">
                <table className="dash-table">
                    <thead>
                        <tr>
                            <th>ID</th><th>Huésped</th><th>Habitación</th><th>Tipo</th>
                            <th>Entrada</th><th>Salida</th><th>Estado</th><th>Total</th><th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {datos.map(r => (
                            <tr key={r.id}>
                                <td><strong>{r.id}</strong></td>
                                <td>{r.huesped}</td>
                                <td>{r.habitacion}</td>
                                <td><span style={{ fontSize: '0.78rem', color: '#888' }}>{r.tipo}</span></td>
                                <td>{r.entrada}</td>
                                <td>{r.salida}</td>
                                <td><span className={`dash-badge ${colorEstado(r.estado)}`}>{r.estado}</span></td>
                                <td><strong>{r.total}</strong></td>
                                <td>
                                    <div className="dash-action-btns">
                                        <button className="dash-action-btn view"  title="Ver">👁️</button>
                                        <button className="dash-action-btn edit"  title="Editar">✏️</button>
                                        <button className="dash-action-btn delete" title="Cancelar">🚫</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ── Tabla Usuarios ─────────────────────────────────────────────
function TablaUsuarios({ limite }) {
    const datos = limite ? USUARIOS_MOCK.slice(0, limite) : USUARIOS_MOCK;
    return (
        <div className="dash-table-card">
            <div className="dash-table-header">
                <div>
                    <h2>👥 Usuarios {limite ? 'Recientes' : ''}</h2>
                    <p>{datos.length} usuarios</p>
                </div>
                <button className="dash-btn-small filled">+ Añadir</button>
            </div>
            <div className="dash-table-wrap">
                <table className="dash-table">
                    <thead>
                        <tr><th>Usuario</th><th>Rol</th><th>Estado</th><th>Registro</th><th>Acciones</th></tr>
                    </thead>
                    <tbody>
                        {datos.map(u => (
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
                                <td>{u.fecha}</td>
                                <td>
                                    <div className="dash-action-btns">
                                        <button className="dash-action-btn view"  title="Ver">👁️</button>
                                        <button className="dash-action-btn edit"  title="Editar">✏️</button>
                                        <button className="dash-action-btn delete" title="Eliminar">🗑️</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ── Sección Habitaciones — todas las 13 reales ─────────────────
function SeccionHabitaciones() {
    return (
        <div className="dash-section-full">
            <div className="dash-table-card">
                <div className="dash-table-header">
                    <div>
                        <h2>🛏️ Gestión de Habitaciones</h2>
                        <p>{HABITACIONES_MOCK.length} habitaciones — Pueblos Mágicos de Michoacán</p>
                    </div>
                    <button className="dash-btn-small filled">+ Nueva Habitación</button>
                </div>
                <div className="dash-table-wrap">
                    <table className="dash-table">
                        <thead>
                            <tr>
                                <th>No.</th><th>Nombre / Temática</th><th>Tipo</th>
                                <th>Capacidad</th><th>Precio por Noche</th><th>Estado</th><th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {HABITACIONES_MOCK.map(h => (
                                <tr key={h.id}>
                                    <td><strong>{h.id}</strong></td>
                                    <td><strong>{h.nombre}</strong></td>
                                    <td><span style={{ fontSize: '0.8rem', color: '#888' }}>{h.tipo}</span></td>
                                    <td>{h.capacidad} personas</td>
                                    <td><strong>{h.precio}</strong></td>
                                    <td><span className={`dash-badge ${colorEstado(h.estado)}`}>{h.estado}</span></td>
                                    <td>
                                        <div className="dash-action-btns">
                                            <button className="dash-action-btn view"  title="Ver">👁️</button>
                                            <button className="dash-action-btn edit"  title="Editar precio">✏️</button>
                                            <button className="dash-action-btn delete" title="Eliminar">🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// ── Dashboard principal ────────────────────────────────────────
function SeccionDashboard({ onAccion }) {
    const stats = [
        { label: 'Huéspedes Registrados', value: USUARIOS_MOCK.filter(u => u.rol === 'cliente').length, icon: '👥', color: 'brown',  trend: '+3',  up: true },
        { label: 'Reservaciones Activas', value: RESERVACIONES_MOCK.filter(r => r.estado === 'activa').length,    icon: '📋', color: 'green',  trend: '+2',  up: true },
        { label: 'Habitaciones Ocupadas', value: HABITACIONES_MOCK.filter(h => h.estado === 'ocupada').length,     icon: '🛏️', color: 'blue',   trend: '0',   up: true },
        { label: 'Ingresos del Mes',      value: '$18,200',                                                        icon: '💰', color: 'yellow', trend: '+8%', up: true },
    ];

    const acciones = [
        { label: 'Nueva Habitación', icon: '🛏️', accion: 'nueva-habitacion' },
        { label: 'Nueva Reserva',    icon: '📅', accion: 'nueva-reserva'    },
        { label: 'Nuevo Usuario',    icon: '👤', accion: 'nuevo-usuario'    },
        { label: 'Ver Reportes',     icon: '📊', accion: 'reportes'         },
    ];

    return (
        <>
            <div className="dash-stats-grid">
                {stats.map((s, i) => (
                    <div key={i} className="dash-stat-card">
                        <div className="dash-stat-header">
                            <div className={`dash-stat-icon ${s.color}`}>{s.icon}</div>
                            <span className={`dash-stat-trend ${s.up ? 'up' : 'down'}`}>
                                {s.up ? '▲' : '▼'} {s.trend}
                            </span>
                        </div>
                        <div className="dash-stat-value">{s.value}</div>
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
                <TablaReservaciones limite={4} />
                <TablaUsuarios limite={4} />
            </div>
        </>
    );
}

// ── App Principal ──────────────────────────────────────────────
function DashboardApp() {

    const [seccion,    setSeccion]    = useState('dashboard');
    const [collapsed,  setCollapsed]  = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [toast,      setToast]      = useState(null);
    const [mobile,     setMobile]     = useState(isMobile());

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

    function mostrarToast(msg, tipo = 'success') {
        setToast({ msg, tipo });
        setTimeout(() => setToast(null), 3000);
    }

    function cerrarSesion() {
        sessionStorage.removeItem('qdSession');
        window.location.href = 'login.html';
    }

    function handleAccion(accion) {
        const msgs = {
            'nueva-habitacion': '🛏️ Nueva habitación — próximamente',
            'nueva-reserva':    '📅 Nueva reserva — próximamente',
            'nuevo-usuario':    '👤 Nuevo usuario — próximamente',
            'reportes':         '📊 Reportes — próximamente',
        };
        mostrarToast(msgs[accion] || 'Acción registrada');
    }

    function toggleSidebar() {
        if (mobile) {
            setMobileOpen(p => !p);
        } else {
            setCollapsed(p => !p);
        }
    }

    const titulos = {
        dashboard:    { h: 'Panel de Control',   p: 'Resumen general — Hotel Quinta Dalam' },
        reservaciones:{ h: 'Reservaciones',       p: 'Gestión de reservas activas y pasadas' },
        usuarios:     { h: 'Usuarios',            p: 'Administración de cuentas de huéspedes' },
        habitaciones: { h: 'Habitaciones',        p: '13 habitaciones temáticas de Michoacán' },
        configuracion:{ h: 'Configuración',       p: 'Ajustes generales del sistema' },
    };

    const titulo = titulos[seccion] || titulos.dashboard;

    const navItems = [
        { id: 'dashboard',     label: 'Dashboard',     icon: '🏠', tooltip: 'Dashboard' },
        { id: 'reservaciones', label: 'Reservaciones', icon: '📋', tooltip: 'Reservaciones',
          badge: RESERVACIONES_MOCK.filter(r => r.estado === 'pendiente').length || null },
        { id: 'usuarios',      label: 'Usuarios',      icon: '👥', tooltip: 'Usuarios'      },
        { id: 'habitaciones',  label: 'Habitaciones',  icon: '🛏️', tooltip: 'Habitaciones'  },
        { id: 'configuracion', label: 'Configuración', icon: '⚙️', tooltip: 'Configuración' },
    ];

    const sidebarCls = [
        'dash-sidebar',
        !mobile && collapsed  ? 'collapsed'    : '',
        mobile  && mobileOpen ? 'mobile-open'  : '',
    ].filter(Boolean).join(' ');

    const mainCls = [
        'dash-main',
        !mobile && collapsed ? 'sidebar-collapsed' : '',
    ].filter(Boolean).join(' ');

    return (
        <div className="dash-layout">

            {mobile && mobileOpen && (
                <div className="dash-overlay" onClick={() => setMobileOpen(false)} />
            )}

            {/* ── SIDEBAR ── */}
            <aside className={sidebarCls}>

                <div className="dash-sidebar-brand">
                    <div className="dash-sidebar-logo">
                        <img src="./img/logo/logo-quinta-dalam-dark.svg" alt="Hotel Quinta Dalam" style={{width: '42px', height: '42px'}}
                            onError={e => { e.target.style.display = 'none'; }} />
                    </div>
                    <div className="dash-brand-text">
                        <strong>Hotel Quinta Dalam</strong>
                        <span>Panel Admin</span>
                    </div>
                    <button className="dash-toggle-btn"
                            onClick={toggleSidebar}
                            aria-label="Colapsar menú">
                        <span className="dash-toggle-line"></span>
                        <span className="dash-toggle-line"></span>
                        <span className="dash-toggle-line"></span>
                    </button>
                </div>

                <div className="dash-sidebar-profile">
                    <div className="dash-profile-avatar">AR</div>
                    <div className="dash-profile-text">
                        <p className="dash-profile-name">Angel Romero</p>
                        <span className="dash-profile-badge">🛡️ Administrador</span>
                        <div className="dash-profile-divider"></div>
                    </div>
                </div>

                <nav className="dash-sidebar-nav">
                    <p className="dash-nav-section-title">Menú Principal</p>
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            className={`dash-nav-item${seccion === item.id ? ' active' : ''}`}
                            onClick={() => irSeccion(item.id)}
                            data-tooltip={item.tooltip}
                            title={item.tooltip}
                        >
                            <span className="dash-nav-icon">{item.icon}</span>
                            <span className="dash-nav-label">{item.label}</span>
                            {item.badge
                                ? <span className="dash-nav-badge">{item.badge}</span>
                                : null
                            }
                        </button>
                    ))}
                    <p className="dash-nav-section-title">Acceso Rápido</p>
                    <a href="index.html" className="dash-nav-item"
                       data-tooltip="Ver sitio web"
                       target="_blank" rel="noopener noreferrer">
                        <span className="dash-nav-icon">🌐</span>
                        <span className="dash-nav-label">Ver Sitio Web</span>
                    </a>
                </nav>

                <div className="dash-sidebar-footer">
                    <button className="dash-logout-btn"
                            onClick={cerrarSesion}
                            title="Cerrar sesión">
                        <span className="dash-logout-icon">🚪</span>
                        <span className="dash-logout-label">Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* ── ÁREA PRINCIPAL ── */}
            <div className={mainCls}>
                <div className="dash-topbar">
                    <div className="dash-topbar-left">
                        <button className="dash-topbar-menu-btn"
                                onClick={toggleSidebar}
                                aria-label="Abrir menú">
                            ☰ Menú
                        </button>
                        <div className="dash-topbar-title">
                            <h1>{titulo.h}</h1>
                            <p>{titulo.p}</p>
                        </div>
                    </div>
                    <div className="dash-topbar-actions">
                        <button className="dash-topbar-btn"
                                onClick={() => window.location.reload()}>
                            🔄 Actualizar
                        </button>
                        <button className="dash-topbar-btn primary"
                                onClick={() => handleAccion('nueva-reserva')}>
                            + Nueva Reserva
                        </button>
                    </div>
                </div>

                <div className="dash-content">
                    {seccion === 'dashboard'     && <SeccionDashboard onAccion={handleAccion} />}
                    {seccion === 'reservaciones' && <div className="dash-section-full"><TablaReservaciones /></div>}
                    {seccion === 'usuarios'      && <div className="dash-section-full"><TablaUsuarios /></div>}
                    {seccion === 'habitaciones'  && <SeccionHabitaciones />}
                    {seccion === 'configuracion' && (
                        <div className="dash-table-card">
                            <div className="dash-table-header">
                                <div>
                                    <h2>⚙️ Configuración</h2>
                                    <p>Ajustes generales del sistema</p>
                                </div>
                            </div>
                            <div style={{ padding: '50px', textAlign: 'center',
                                          color: '#bbb', fontFamily: "'Lato', sans-serif" }}>
                                ⚙️ Sección en desarrollo...
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {toast && (
                <div className={`dash-toast ${toast.tipo}`}>
                    {toast.tipo === 'success' ? '✅' : '❌'} {toast.msg}
                </div>
            )}
        </div>
    );
}

const dashRoot = ReactDOM.createRoot(document.getElementById('root-dashboard'));
dashRoot.render(<DashboardApp />);