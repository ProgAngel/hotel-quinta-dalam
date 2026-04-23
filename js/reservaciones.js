const { useState, useEffect } = React;

const habitacionesCatalogo = [
    { id: 1,  nombre: 'Tzintzuntzan',  precio: 800,  maxPersonas: 4, imagen: './img/habitaciones/habitacion101.jpg' },
    { id: 2,  nombre: 'Pátzcuaro',     precio: 1200, maxPersonas: 5, imagen: './img/habitaciones/habitacion104.jpg' },
    { id: 3,  nombre: 'Coeneo',        precio: 1000, maxPersonas: 3, imagen: './img/habitaciones/habitacion105.jpg' },
    { id: 4,  nombre: 'Tacámbaro',     precio: 1500, maxPersonas: 6, imagen: './img/habitaciones/habitacion203.jpg' },
    { id: 5,  nombre: 'Uruapan',       precio: 1500, maxPersonas: 6, imagen: './img/habitaciones/habitacion204.jpg' },
    { id: 6,  nombre: 'Tlalpujahua',   precio: 1200, maxPersonas: 4, imagen: './img/habitaciones/habitacionn205.jpg' },
    { id: 7,  nombre: 'Paracho',       precio: 800,  maxPersonas: 4, imagen: './img/habitaciones/habitacion102.jpg' },
    { id: 8,  nombre: 'Yunuen',        precio: 1200, maxPersonas: 5, imagen: './img/habitaciones/habitacion103.jpg' },
    { id: 9,  nombre: 'Cuitzeo',       precio: 1000, maxPersonas: 3, imagen: './img/habitaciones/habitacion206.jpg' },
    { id: 10, nombre: 'Janitzio',      precio: 1000, maxPersonas: 3, imagen: './img/habitaciones/habitacion106.jpg' },
    { id: 11, nombre: 'Suite Quinceo', precio: 2200, maxPersonas: 2, imagen: './img/habitaciones/habitacion201.jpg' },
    { id: 12, nombre: 'Morelia',       precio: 1200, maxPersonas: 5, imagen: './img/habitaciones/habitacion202.jpg' },
    { id: 13, nombre: 'Cuanajo',       precio: 1180, maxPersonas: 6, imagen: './img/habitaciones/habitacion207.jpg' }
];

function ModuloReservaciones() {
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [adultos, setAdultos] = useState(1);
    const [ninos, setNinos] = useState(0);
    const [habitacionSeleccionada, setHabitacionSeleccionada] = useState(null);
    const [errorFechas, setErrorFechas] = useState('');
    const [noches, setNoches] = useState(0);

    const [mostrarModal, setMostrarModal] = useState(false);
    const [reservaExitosa, setReservaExitosa] = useState(false);
    const [mostrarConfirmacionCancelar, setMostrarConfirmacionCancelar] = useState(false);
    const [cancelacionExitosa, setCancelacionExitosa] = useState(false);

    const [datosCliente, setDatosCliente] = useState({
        nombre: '', apellido: '', correo: '', codigoPais: '+52', telefono: '',
        metodoPago: 'tarjeta', numeroTarjeta: '', fechaExpiracion: '', cvv: ''
    });

    const fechaHoy = new Date().toISOString().split('T')[0];

    useEffect(() => {
        if (checkIn && checkOut) {
            const diff = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
            if (diff <= 0) {
                setErrorFechas('La fecha de salida debe ser posterior a la de llegada.');
                setNoches(0);
                setHabitacionSeleccionada(null);
            } else {
                setErrorFechas('');
                setNoches(diff);
            }
        } else {
            setErrorFechas('');
            setNoches(0);
            setHabitacionSeleccionada(null);
        }
    }, [checkIn, checkOut]);

    const sumarAdulto = () => setAdultos(p => p < 4 ? p + 1 : p);
    const restarAdulto = () => setAdultos(p => p > 1 ? p - 1 : p);
    const sumarNino   = () => setNinos(p => p < 3 ? p + 1 : p);
    const restarNino  = () => setNinos(p => p > 0 ? p - 1 : p);

    const limpiarDatos = () => {
        setCheckIn(''); setCheckOut(''); setAdultos(1); setNinos(0);
        setHabitacionSeleccionada(null); setErrorFechas(''); setNoches(0);
        setDatosCliente({ nombre: '', apellido: '', correo: '', codigoPais: '+52', telefono: '', metodoPago: 'tarjeta', numeroTarjeta: '', fechaExpiracion: '', cvv: '' });
    };

    const formatoMoneda = (n) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const procesarReserva = (e) => {
        e.preventDefault();
        new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3').play().catch(() => {});
        setMostrarModal(false);
        setReservaExitosa(true);
        setTimeout(() => { setReservaExitosa(false); limpiarDatos(); }, 4000);
    };

    const intentarCancelar    = () => setMostrarConfirmacionCancelar(true);
    const abortarCancelacion  = () => setMostrarConfirmacionCancelar(false);
    const confirmarCancelacion = () => {
        new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3').play().catch(() => {});
        setMostrarConfirmacionCancelar(false);
        setMostrarModal(false);
        setCancelacionExitosa(true);
        setTimeout(() => { setCancelacionExitosa(false); limpiarDatos(); }, 3000);
    };

    const huespedesTotales   = adultos + ninos;
    const habitacionesDisponibles = habitacionesCatalogo.filter(h => h.maxPersonas >= huespedesTotales);
    const subtotal = habitacionSeleccionada ? habitacionSeleccionada.precio * noches : 0;
    const ish = subtotal * 0.03;
    const iva = subtotal * 0.16;
    const total = subtotal + ish + iva;

    const estadoValidacion = (!checkIn || !checkOut) ? 'inicial' : (noches > 0 && !errorFechas ? 'valido' : 'error');

    return (
        <div className="reserva-layout">

            {/* PASO 1 */}
            <div className="reserva-col">
                <h3 className="reserva-col__titulo">PASO 1: Fechas y Huéspedes</h3>
                <div className="reserva-campo-grupo">
                    <label className="reserva-label">Llegada (Check-in)</label>
                    <input type="date" className="reserva-date-input" value={checkIn} min={fechaHoy} onChange={(e) => setCheckIn(e.target.value)} />

                    <label className="reserva-label">Salida (Check-out)</label>
                    <input type="date" className="reserva-date-input" value={checkOut} min={checkIn || fechaHoy} onChange={(e) => setCheckOut(e.target.value)} />
                </div>

                <div className="reserva-huespedes-fila">
                    <div className="reserva-huesped-grupo">
                        <label>Adultos</label>
                        <div className="reserva-contador">
                            <button className="reserva-contador__btn" onClick={restarAdulto}>-</button>
                            <span>{adultos}</span>
                            <button className="reserva-contador__btn" onClick={sumarAdulto}>+</button>
                        </div>
                    </div>
                    <div className="reserva-huesped-grupo">
                        <label>Niños</label>
                        <div className="reserva-contador">
                            <button className="reserva-contador__btn" onClick={restarNino}>-</button>
                            <span>{ninos}</span>
                            <button className="reserva-contador__btn" onClick={sumarNino}>+</button>
                        </div>
                    </div>
                </div>

                <div className={`reserva-estado-box reserva-estado-box--${estadoValidacion}`}>
                    <p className="reserva-estado-msg">
                        {estadoValidacion === 'inicial' && '📅 Seleccione fechas de llegada y salida'}
                        {estadoValidacion === 'valido'  && '✅ Fechas válidas'}
                        {estadoValidacion === 'error'   && `❌ ${errorFechas}`}
                    </p>
                    <p>✅ Huéspedes: {huespedesTotales}</p>
                    {noches > 0 && <p className="reserva-noches">Total de noches: {noches}</p>}
                </div>
            </div>

            {/* PASO 2 */}
            <div className={`reserva-col ${noches === 0 ? 'reserva-col--disabled' : ''}`}>
                <h3 className="reserva-col__titulo">PASO 2: Elija su Habitación</h3>
                {noches === 0 ? (
                    <p>Complete el Paso 1 para ver las habitaciones disponibles.</p>
                ) : (
                    <div className="hab-mini-grid">
                        {habitacionesDisponibles.map(hab => (
                            <div key={hab.id} onClick={() => setHabitacionSeleccionada(hab)}
                                className={`hab-mini-card ${habitacionSeleccionada?.id === hab.id ? 'hab-mini-card--seleccionada' : ''}`}>
                                <img src={hab.imagen} alt={hab.nombre} onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Sin+Imagen'; }} />
                                <h4>{hab.nombre}</h4>
                                <p className="hab-mini-precio">${formatoMoneda(hab.precio)}</p>
                                <p className="hab-mini-max">Máx: {hab.maxPersonas} pers.</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* PASO 3 */}
            <div className={`reserva-col ${!habitacionSeleccionada ? 'reserva-col--disabled' : ''}`}>
                <h3 className="reserva-col__titulo">PASO 3: Resumen y confirmación</h3>
                {habitacionSeleccionada && noches > 0 ? (
                    <div className="resumen-cuerpo">
                        <div>
                            <h4 className="resumen-nombre">Habitación {habitacionSeleccionada.nombre}</h4>
                            <p className="resumen-detalle"><strong>Llegada:</strong> {checkIn}</p>
                            <p className="resumen-detalle"><strong>Salida:</strong> {checkOut}</p>
                            <p className="resumen-detalle"><strong>Estancia:</strong> {noches} noche(s)</p>
                            <p className="resumen-detalle"><strong>Huéspedes:</strong> {adultos} Adulto(s), {ninos} Niño(s)</p>
                            <hr className="resumen-hr-dashed" />
                            <div className="resumen-linea"><span>Subtotal ({noches} noches):</span><span>${formatoMoneda(subtotal)}</span></div>
                            <div className="resumen-linea"><span>ISH (3%):</span><span>${formatoMoneda(ish)}</span></div>
                            <div className="resumen-linea"><span>IVA (16%):</span><span>${formatoMoneda(iva)}</span></div>
                            <hr className="resumen-hr-solid" />
                            <div className="resumen-total-fila"><span>TOTAL:</span><span>${formatoMoneda(total)} MXN</span></div>
                        </div>
                        <div className="reserva-acciones">
                            <button className="btn-confirmar-reserva" onClick={() => setMostrarModal(true)}>Confirmar Reserva</button>
                            <button className="btn-limpiar-reserva" onClick={limpiarDatos}>Limpiar Datos</button>
                        </div>
                    </div>
                ) : (
                    <p>Seleccione fechas y una habitación para ver el desglose completo.</p>
                )}
            </div>

            {/* Modal de formulario */}
            {mostrarModal && (
                <div className="modal-reserva-overlay">
                    <div className="modal-reserva-box">
                        <h2 className="modal-reserva-titulo">Finalizar Reserva</h2>
                        <form onSubmit={procesarReserva}>
                            <div className="modal-form-fila">
                                <div className="modal-form-campo">
                                    <label className="modal-campo-label">Nombre(s)</label>
                                    <input type="text" required pattern="[A-Za-záéíóúÁÉÍÓÚñÑ\s]+" title="Solo letras"
                                        className="modal-campo-input" placeholder="Ej. Juan"
                                        value={datosCliente.nombre} onChange={(e) => setDatosCliente({...datosCliente, nombre: e.target.value})} />
                                </div>
                                <div className="modal-form-campo">
                                    <label className="modal-campo-label">Apellido(s)</label>
                                    <input type="text" required pattern="[A-Za-záéíóúÁÉÍÓÚñÑ\s]+" title="Solo letras"
                                        className="modal-campo-input" placeholder="Ej. Pérez"
                                        value={datosCliente.apellido} onChange={(e) => setDatosCliente({...datosCliente, apellido: e.target.value})} />
                                </div>
                            </div>

                            <label className="modal-campo-label">Correo Electrónico</label>
                            <input type="email" required pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                                title="Por favor ingresa un correo válido"
                                className="modal-campo-input" placeholder="ejemplo@correo.com"
                                value={datosCliente.correo} onChange={(e) => setDatosCliente({...datosCliente, correo: e.target.value})} />

                            <label className="modal-campo-label">Teléfono Móvil</label>
                            <div className="modal-tel-fila">
                                <select className="modal-tel-pais" value={datosCliente.codigoPais} onChange={(e) => setDatosCliente({...datosCliente, codigoPais: e.target.value})}>
                                    <option value="+52">🇲🇽 MX (+52)</option>
                                    <option value="+1">🇺🇸 US (+1)</option>
                                    <option value="+1">🇨🇦 CA (+1)</option>
                                    <option value="+34">🇪🇸 ES (+34)</option>
                                    <option value="+54">🇦🇷 AR (+54)</option>
                                    <option value="+51">🇵🇪 PE (+51)</option>
                                    <option value="+57">🇨🇴 CO (+57)</option>
                                </select>
                                <input type="tel" required pattern="[0-9]{10}" title="Exactamente 10 dígitos"
                                    className="modal-tel-numero" placeholder="10 dígitos" maxLength="10"
                                    value={datosCliente.telefono} onChange={(e) => setDatosCliente({...datosCliente, telefono: e.target.value})} />
                            </div>

                            <label className="modal-campo-label">Forma de Pago</label>
                            <select className="modal-select" value={datosCliente.metodoPago} onChange={(e) => setDatosCliente({...datosCliente, metodoPago: e.target.value})}>
                                <option value="tarjeta">💳 Tarjeta de Crédito / Débito</option>
                                <option value="paypal">🅿️ PayPal</option>
                                <option value="transferencia">🏦 Transferencia Bancaria (SPEI)</option>
                                <option value="recepcion">🏨 Pagar en Recepción (Efectivo)</option>
                            </select>

                            {datosCliente.metodoPago === 'tarjeta' && (
                                <div className="pago-panel pago-panel--tarjeta">
                                    <label className="pago-campo-label">Número de Tarjeta</label>
                                    <input type="text" required pattern="[0-9]{16}" title="16 dígitos"
                                        className="pago-tarjeta-num" placeholder="0000 0000 0000 0000" maxLength="16"
                                        value={datosCliente.numeroTarjeta} onChange={(e) => setDatosCliente({...datosCliente, numeroTarjeta: e.target.value})} />
                                    <div className="pago-tarjeta-fila">
                                        <div className="pago-tarjeta-campo">
                                            <label className="pago-campo-label">Expiración (MM/AA)</label>
                                            <input type="text" required pattern="(0[1-9]|1[0-2])\/[0-9]{2}" title="Formato MM/AA"
                                                className="pago-campo-input" placeholder="MM/AA" maxLength="5"
                                                value={datosCliente.fechaExpiracion} onChange={(e) => setDatosCliente({...datosCliente, fechaExpiracion: e.target.value})} />
                                        </div>
                                        <div className="pago-tarjeta-campo">
                                            <label className="pago-campo-label">CVV</label>
                                            <input type="text" required pattern="[0-9]{3,4}" title="3 o 4 dígitos"
                                                className="pago-campo-input" placeholder="123" maxLength="4"
                                                value={datosCliente.cvv} onChange={(e) => setDatosCliente({...datosCliente, cvv: e.target.value})} />
                                        </div>
                                    </div>
                                </div>
                            )}
                            {datosCliente.metodoPago === 'paypal' && (
                                <div className="pago-panel pago-panel--paypal"><p><strong>Se te redirigirá a PayPal.</strong></p></div>
                            )}
                            {datosCliente.metodoPago === 'transferencia' && (
                                <div className="pago-panel pago-panel--spei"><p><strong>Banco: BBVA<br/>CLABE: 012345678901234567</strong></p></div>
                            )}
                            {datosCliente.metodoPago === 'recepcion' && (
                                <div className="pago-panel pago-panel--recepcion"><p><strong>Pago en Recepción.</strong></p></div>
                            )}

                            <div className="modal-total-box">
                                <span className="modal-total-label">Total a pagar:</span>
                                <h3 className="modal-total-monto">${formatoMoneda(total)} MXN</h3>
                            </div>

                            <div className="modal-acciones">
                                <button type="button" className="btn-modal-cancelar" onClick={intentarCancelar}>Cancelar</button>
                                <button type="submit" className="btn-modal-confirmar">Confirmar Pago</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de cancelacion */}
            {mostrarConfirmacionCancelar && (
                <div className="modal-cancelar-overlay">
                    <div className="modal-cancelar-box">
                        <div className="modal-cancelar-icono">⚠️</div>
                        <h3 className="modal-cancelar-titulo">¿Cancelar reservación?</h3>
                        <p className="modal-cancelar-texto">Se perderán los datos ingresados y la habitación seleccionada.</p>
                        <div className="modal-cancelar-acciones">
                            <button className="btn-volver" onClick={abortarCancelacion}>No, volver</button>
                            <button className="btn-cancelar-confirm" onClick={confirmarCancelacion}>Sí, cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal exito */}
            {reservaExitosa && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <div className="modal-box__icono modal-box__icono--exito">✅</div>
                        <h2 className="modal-box__titulo--exito">¡Reservación Exitosa!</h2>
                        <p className="modal-box__texto">Gracias, <strong>{datosCliente.nombre}</strong>.</p>
                        <p className="modal-box__subtexto">Hemos enviado los detalles a:<br/><strong>{datosCliente.correo}</strong></p>
                    </div>
                </div>
            )}

            {/* Modal de cancelacion */}
            {cancelacionExitosa && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <div className="modal-box__icono modal-box__icono--error">❌</div>
                        <h2 className="modal-box__titulo--error">Reservación Cancelada</h2>
                        <p className="modal-box__texto">El proceso se detuvo de forma segura.</p>
                    </div>
                </div>
            )}
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root-reservaciones'));
root.render(<ModuloReservaciones />);