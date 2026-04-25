// ============================================================
//  reservaciones.js — Hotel Quinta Dalam
//  Conectado a api/habitaciones/listar.php y
//  api/reservaciones/crear.php
//
//  REQUIERE sesión activa — la página tiene QDSession.guardarPagina()
//  en el HTML. El usuario llega aquí ya autenticado.
// ============================================================

const { useState, useEffect, useRef } = React;

const API_HABITACIONES = './api/habitaciones/listar.php';
const API_RESERVAR     = './api/reservaciones/crear.php';

function ModuloReservaciones() {

    // ── Sesión ────────────────────────────────────────────────
    const sesion = (window.QDSession && window.QDSession.obtener()) || (() => {
        try { return JSON.parse(sessionStorage.getItem('qdSession') || '{}'); }
        catch { return {}; }
    })();

    // ── Habitaciones de la API ────────────────────────────────
    const [habitaciones,   setHabitaciones]   = useState([]);
    const [cargandoHabs,   setCargandoHabs]   = useState(true);

    // ── Paso 1: Fechas y huéspedes ────────────────────────────
    const [checkIn,   setCheckIn]   = useState('');
    const [checkOut,  setCheckOut]  = useState('');
    const [adultos,   setAdultos]   = useState(1);
    const [ninos,     setNinos]     = useState(0);
    const [noches,    setNoches]    = useState(0);
    const [errFechas, setErrFechas] = useState('');

    // ── Paso 2: Habitación seleccionada ───────────────────────
    const [habSeleccionada, setHabSeleccionada] = useState(null);

    // ── Paso 3: Notas adicionales ─────────────────────────────
    const [notas, setNotas] = useState('');

    // ── Modal y estados ───────────────────────────────────────
    const [mostrarModal,  setMostrarModal]  = useState(false);
    const [enviando,      setEnviando]      = useState(false);
    const [mostrarCancel, setMostrarCancel] = useState(false);

    const submittingRef = useRef(false);

    const fechaHoy = new Date().toISOString().split('T')[0];
    const fmt = n => Number(n).toLocaleString('es-MX', { minimumFractionDigits: 2 });

    // ── Cargar habitaciones disponibles desde la API ──────────
    useEffect(() => {
        fetch(API_HABITACIONES + '?estado=disponible')
            .then(r => r.json())
            .then(data => {
                if (data.ok) setHabitaciones(data.habitaciones);
                else window.QDToast && window.QDToast.error('Error al cargar habitaciones.');
            })
            .catch(() => {
                window.QDToast && window.QDToast.error('No se pudo conectar con el servidor.');
            })
            .finally(() => setCargandoHabs(false));
    }, []);

    // ── Leer params de URL (viene del catálogo o buscador) ────
    useEffect(() => {
        const p = new URLSearchParams(window.location.search);
        if (p.get('checkIn'))    setCheckIn(p.get('checkIn'));
        if (p.get('checkOut'))   setCheckOut(p.get('checkOut'));
        if (p.get('huespedes'))  setAdultos(parseInt(p.get('huespedes')) || 1);
        if (p.get('hab')) {
            // Pre-seleccionar habitación si viene del catálogo
            const habId = parseInt(p.get('hab'));
            if (habId) {
                fetch(API_HABITACIONES)
                    .then(r => r.json())
                    .then(data => {
                        if (data.ok) {
                            const h = data.habitaciones.find(h => h.id === habId);
                            if (h) setHabSeleccionada(h);
                        }
                    })
                    .catch(() => {});
            }
        }
    }, []);

    // ── Calcular noches ───────────────────────────────────────
    useEffect(() => {
        if (!checkIn || !checkOut) { setNoches(0); setErrFechas(''); return; }
        const diff = Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86400000);
        if (diff <= 0) {
            setErrFechas('La fecha de salida debe ser posterior a la de llegada.');
            setNoches(0);
            setHabSeleccionada(null);
        } else {
            setErrFechas('');
            setNoches(diff);
        }
    }, [checkIn, checkOut]);

    // ── Cálculos del resumen ──────────────────────────────────
    const huespedesTotales     = adultos + ninos;
    const habsParaHuespedes    = habitaciones.filter(h => h.capacidad >= huespedesTotales);
    const subtotal = habSeleccionada && noches > 0 ? habSeleccionada.precio_noche * noches : 0;
    const ish    = subtotal * 0.03;
    const iva    = subtotal * 0.16;
    const total  = subtotal + ish + iva;

    const estadoValidacion = (!checkIn || !checkOut) ? 'inicial'
        : (noches > 0 && !errFechas ? 'valido' : 'error');

    // ── Limpiar formulario ────────────────────────────────────
    function limpiar() {
        setCheckIn(''); setCheckOut(''); setAdultos(1); setNinos(0);
        setHabSeleccionada(null); setNotas('');
        setErrFechas(''); setNoches(0);
        setMostrarModal(false); setMostrarCancel(false);
    }

    // ── Confirmar reserva — API real ──────────────────────────
    async function procesarReserva(e) {
        e.preventDefault();
        if (submittingRef.current || !habSeleccionada || noches <= 0) return;

        // Verificar sesión activa antes de enviar
        if (!sesion.id) {
            window.QDToast && window.QDToast.aviso(
                'Tu sesión expiró. Por favor inicia sesión nuevamente.'
            );
            setTimeout(() => { window.location.href = 'login.html'; }, 2000);
            return;
        }

        submittingRef.current = true;
        setEnviando(true);

        try {
            const res = await fetch(API_RESERVAR, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    usuario_id:    sesion.id,
                    habitacion_id: habSeleccionada.id,
                    fecha_entrada: checkIn,
                    fecha_salida:  checkOut,
                    num_huespedes: huespedesTotales,
                    notas:         notas.trim() || null,
                })
            });

            const data = await res.json();

            if (!data.ok) {
                // La habitación ya no está disponible en esas fechas
                window.QDToast && window.QDToast.error(
                    data.mensaje || 'No se pudo procesar la reservación.'
                );
                return;
            }

            // ── Éxito ──────────────────────────────────────────
            const codigo = data.reservacion?.codigo || 'R-XXXX';
            setMostrarModal(false);
            window.QDToast && window.QDToast.exito(
                `✅ ¡Reservación creada! Código: ${codigo}`, 7000
            );

            // Actualizar lista (quitar la habitación recién reservada)
            setHabitaciones(prev => prev.filter(h => h.id !== habSeleccionada.id));
            limpiar();

        } catch {
            window.QDToast && window.QDToast.error(
                'Error de conexión. Verifica tu internet e intenta de nuevo.'
            );
        } finally {
            setEnviando(false);
            submittingRef.current = false;
        }
    }

    // ── Render ────────────────────────────────────────────────
    return (
        <div className="reserva-layout">

            {/* ════════════════════════════════════
                PASO 1: FECHAS Y HUÉSPEDES
            ════════════════════════════════════ */}
            <div className="reserva-col">
                <h3 className="reserva-col__titulo">PASO 1: Fechas y Huéspedes</h3>

                <div className="reserva-campo-grupo">
                    <label className="reserva-label">Llegada (Check-in)</label>
                    <input type="date" className="reserva-date-input"
                        value={checkIn} min={fechaHoy}
                        onChange={e => setCheckIn(e.target.value)} />

                    <label className="reserva-label">Salida (Check-out)</label>
                    <input type="date" className="reserva-date-input"
                        value={checkOut} min={checkIn || fechaHoy}
                        onChange={e => setCheckOut(e.target.value)} />
                </div>

                <div className="reserva-huespedes-fila">
                    <div className="reserva-huesped-grupo">
                        <label>Adultos</label>
                        <div className="reserva-contador">
                            <button className="reserva-contador__btn" onClick={() => setAdultos(p => Math.max(1, p - 1))}>-</button>
                            <span>{adultos}</span>
                            <button className="reserva-contador__btn" onClick={() => setAdultos(p => Math.min(8, p + 1))}>+</button>
                        </div>
                    </div>
                    <div className="reserva-huesped-grupo">
                        <label>Niños</label>
                        <div className="reserva-contador">
                            <button className="reserva-contador__btn" onClick={() => setNinos(p => Math.max(0, p - 1))}>-</button>
                            <span>{ninos}</span>
                            <button className="reserva-contador__btn" onClick={() => setNinos(p => Math.min(4, p + 1))}>+</button>
                        </div>
                    </div>
                </div>

                <div className={`reserva-estado-box reserva-estado-box--${estadoValidacion}`}>
                    <p className="reserva-estado-msg">
                        {estadoValidacion === 'inicial' && '📅 Selecciona las fechas de llegada y salida'}
                        {estadoValidacion === 'valido'  && '✅ Fechas válidas'}
                        {estadoValidacion === 'error'   && `❌ ${errFechas}`}
                    </p>
                    <p>👥 Huéspedes: {huespedesTotales}</p>
                    {noches > 0 && <p className="reserva-noches">🌙 Total de noches: {noches}</p>}
                </div>
            </div>

            {/* ════════════════════════════════════
                PASO 2: SELECCIONAR HABITACIÓN
            ════════════════════════════════════ */}
            <div className={`reserva-col ${noches === 0 ? 'reserva-col--disabled' : ''}`}>
                <h3 className="reserva-col__titulo">PASO 2: Elija su Habitación</h3>

                {noches === 0 ? (
                    <p style={{ fontFamily:"'Lato',sans-serif", color:'#aaa', fontSize:'0.9rem' }}>
                        Complete el Paso 1 para ver las habitaciones disponibles.
                    </p>
                ) : cargandoHabs ? (
                    <p style={{ fontFamily:"'Lato',sans-serif", color:'#aaa' }}>Cargando habitaciones...</p>
                ) : habsParaHuespedes.length === 0 ? (
                    <div style={{ textAlign:'center', padding:'30px 20px', fontFamily:"'Lato',sans-serif" }}>
                        <p style={{ fontSize:'1.5rem', marginBottom:'10px' }}>😕</p>
                        <p style={{ color:'#888' }}>No hay habitaciones disponibles para {huespedesTotales} huéspedes en estas fechas.</p>
                        <p style={{ color:'#aaa', fontSize:'0.85rem', marginTop:'8px' }}>
                            Intenta con menos huéspedes o cambia las fechas.
                        </p>
                    </div>
                ) : (
                    <div className="hab-mini-grid">
                        {habsParaHuespedes.map(hab => (
                            <div key={hab.id}
                                className={`hab-mini-card ${habSeleccionada?.id === hab.id ? 'hab-mini-card--seleccionada' : ''}`}
                                onClick={() => setHabSeleccionada(hab)}>
                                <img src={hab.imagen_url || `./img/habitaciones/habitacion${hab.numero}.jpg`}
                                    alt={hab.nombre} loading="lazy"
                                    onError={e => { e.target.src = 'https://via.placeholder.com/150/e0d5c1/8c5a35?text=Sin+Foto'; }} />
                                <h4>{hab.nombre}</h4>
                                <p style={{ fontFamily:"'Lato',sans-serif", fontSize:'0.72rem', color:'#aaa', margin:'2px 0' }}>
                                    {hab.tipo}
                                </p>
                                <p className="hab-mini-precio">${fmt(hab.precio_noche)}/noche</p>
                                <p className="hab-mini-max">👥 Máx: {hab.capacidad} pers.</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ════════════════════════════════════
                PASO 3: RESUMEN Y CONFIRMACIÓN
            ════════════════════════════════════ */}
            <div className={`reserva-col ${!habSeleccionada ? 'reserva-col--disabled' : ''}`}>
                <h3 className="reserva-col__titulo">PASO 3: Resumen y Confirmación</h3>

                {habSeleccionada && noches > 0 ? (
                    <div className="resumen-cuerpo">
                        {/* Resumen */}
                        <div>
                            <h4 className="resumen-nombre">Habitación {habSeleccionada.nombre}</h4>
                            <p style={{ fontFamily:"'Lato',sans-serif", fontSize:'0.78rem', color:'#aaa', marginBottom:'12px' }}>
                                {habSeleccionada.tipo}
                            </p>
                            <p className="resumen-detalle"><strong>Llegada:</strong>   {checkIn}</p>
                            <p className="resumen-detalle"><strong>Salida:</strong>    {checkOut}</p>
                            <p className="resumen-detalle"><strong>Estancia:</strong>  {noches} noche{noches !== 1 ? 's' : ''}</p>
                            <p className="resumen-detalle"><strong>Huéspedes:</strong> {adultos} Adulto{adultos !== 1 ? 's' : ''}, {ninos} Niño{ninos !== 1 ? 's' : ''}</p>
                            <p className="resumen-detalle">
                                <strong>Reservado por:</strong>{' '}
                                <span style={{ color:'#8c5a35', fontWeight:700 }}>{sesion.nombre || 'Tu cuenta'}</span>
                            </p>

                            <hr className="resumen-hr-dashed" />
                            <div className="resumen-linea"><span>Subtotal ({noches} noches):</span><span>${fmt(subtotal)}</span></div>
                            <div className="resumen-linea"><span>ISH (3%):</span><span>${fmt(ish)}</span></div>
                            <div className="resumen-linea"><span>IVA (16%):</span><span>${fmt(iva)}</span></div>
                            <hr className="resumen-hr-solid" />
                            <div className="resumen-total-fila">
                                <span>TOTAL:</span>
                                <span>${fmt(total)} MXN</span>
                            </div>
                        </div>

                        {/* Notas */}
                        <div style={{ marginTop:'16px' }}>
                            <label style={{ fontFamily:"'Lato',sans-serif", fontSize:'0.78rem', fontWeight:700, color:'#4a4a4a', textTransform:'uppercase', letterSpacing:'0.8px', display:'block', marginBottom:'6px' }}>
                                Notas especiales (opcional)
                            </label>
                            <textarea value={notas} onChange={e => setNotas(e.target.value)}
                                placeholder="Ej: celebración de aniversario, llegada tardía..."
                                maxLength={300}
                                style={{ width:'100%', padding:'10px 12px', borderRadius:'8px',
                                    border:'1.5px solid #e0d8cf', fontFamily:"'Lato',sans-serif",
                                    fontSize:'0.88rem', resize:'vertical', minHeight:'70px',
                                    outline:'none', background:'#fdfaf7', boxSizing:'border-box' }} />
                        </div>

                        <div className="reserva-acciones">
                            <button className="btn-confirmar-reserva" onClick={() => setMostrarModal(true)}>
                                Confirmar Reserva
                            </button>
                            <button className="btn-limpiar-reserva" onClick={limpiar}>
                                Limpiar Datos
                            </button>
                        </div>
                    </div>
                ) : (
                    <p style={{ fontFamily:"'Lato',sans-serif", color:'#aaa', fontSize:'0.9rem' }}>
                        Seleccione fechas y una habitación para ver el desglose completo.
                    </p>
                )}
            </div>

            {/* ════════════════════════════════════
                MODAL: CONFIRMAR RESERVA
            ════════════════════════════════════ */}
            {mostrarModal && habSeleccionada && (
                <div className="modal-reserva-overlay">
                    <div className="modal-reserva-box">
                        <h2 className="modal-reserva-titulo">Confirmar Reservación</h2>

                        {/* Resumen compacto */}
                        <div style={{
                            background:'linear-gradient(135deg,#2a1206,#6b3a1f)',
                            borderRadius:'12px', padding:'16px 20px', marginBottom:'20px',
                            color:'#fff', fontFamily:"'Lato',sans-serif", fontSize:'0.88rem'
                        }}>
                            <p style={{ fontFamily:"'Playfair Display',serif", fontSize:'1rem', fontWeight:700, marginBottom:'8px', color:'#e8c98a' }}>
                                🛏️ {habSeleccionada.nombre} — {habSeleccionada.tipo}
                            </p>
                            <p>📅 {checkIn} → {checkOut} ({noches} noche{noches !== 1 ? 's' : ''})</p>
                            <p>👥 {huespedesTotales} huéspedes</p>
                            <p style={{ marginTop:'10px', fontSize:'1.1rem', fontWeight:700 }}>
                                Total: ${fmt(total)} MXN
                            </p>
                        </div>

                        {/* Info del usuario (pre-llenada, readonly) */}
                        <div style={{ marginBottom:'16px', fontFamily:"'Lato',sans-serif", fontSize:'0.85rem', color:'#555' }}>
                            <p style={{ marginBottom:'4px' }}>
                                <strong>Reservado a nombre de:</strong> {sesion.nombre}
                            </p>
                            <p>
                                <strong>Correo:</strong> {sesion.correo}
                            </p>
                        </div>

                        {/* Método de pago */}
                        <label style={{ fontFamily:"'Lato',sans-serif", fontSize:'0.78rem', fontWeight:700, color:'#4a4a4a', textTransform:'uppercase', letterSpacing:'0.8px', display:'block', marginBottom:'6px' }}>
                            Forma de Pago
                        </label>
                        <select className="modal-select" defaultValue="recepcion">
                            <option value="recepcion">🏨 Pagar en Recepción (Efectivo)</option>
                            <option value="transferencia">🏦 Transferencia Bancaria (SPEI)</option>
                            <option value="tarjeta" disabled>💳 Tarjeta — (Próximamente vía Mercado Pago)</option>
                        </select>

                        {notas.trim() && (
                            <p style={{ marginTop:'12px', fontFamily:"'Lato',sans-serif", fontSize:'0.83rem', color:'#888' }}>
                                📝 <em>{notas}</em>
                            </p>
                        )}

                        <div className="modal-acciones">
                            <button type="button" className="btn-modal-cancelar"
                                onClick={() => { setMostrarCancel(true); }}>
                                Cancelar
                            </button>
                            <button type="button" className="btn-modal-confirmar"
                                disabled={enviando} onClick={procesarReserva}>
                                {enviando
                                    ? <><span style={{ display:'inline-block', width:'14px', height:'14px', border:'2px solid rgba(255,255,255,0.4)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.7s linear infinite', verticalAlign:'middle', marginRight:'6px' }}></span>Procesando...</>
                                    : '✅ Confirmar Reserva'
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════
                MODAL: CONFIRMAR CANCELACIÓN
            ════════════════════════════════════ */}
            {mostrarCancel && (
                <div className="modal-cancelar-overlay">
                    <div className="modal-cancelar-box">
                        <div className="modal-cancelar-icono">⚠️</div>
                        <h3 className="modal-cancelar-titulo">¿Cancelar proceso?</h3>
                        <p className="modal-cancelar-texto">
                            Se perderán los datos ingresados y la habitación seleccionada quedará disponible.
                        </p>
                        <div className="modal-cancelar-acciones">
                            <button className="btn-volver" onClick={() => setMostrarCancel(false)}>
                                No, volver
                            </button>
                            <button className="btn-cancelar-confirm" onClick={() => {
                                setMostrarCancel(false);
                                limpiar();
                                window.QDToast && window.QDToast.info('Reservación cancelada. Los datos fueron limpiados.');
                            }}>
                                Sí, cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root-reservaciones'));
root.render(<ModuloReservaciones />);