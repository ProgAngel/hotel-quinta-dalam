const { useState } = React;

const generarGaleriaPlaceholder = (nombreHabitacion) => {
    const nombreM = nombreHabitacion.replace(' ', '+');
    return [
        { url: `https://via.placeholder.com/1200x800/e0d5c1/8c5a35?text=${nombreM}+-+Recámara`, etiqueta: 'Recámara Principal' },
        { url: `https://via.placeholder.com/1200x800/fdf8f5/333333?text=${nombreM}+-+Baño`, etiqueta: 'Baño Completo' },
        { url: `https://via.placeholder.com/1200x800/e0d5c1/8c5a35?text=${nombreM}+-+Vista`, etiqueta: 'Vista al exterior' },
        { url: `https://via.placeholder.com/1200x800/fdf8f5/333333?text=${nombreM}+-+Detalles`, etiqueta: 'Detalles y Amenidades' }
    ];
};

const habitacionesDestacadas = [
    { id: 1,  nombre: 'Tzintzuntzan', precio: 800,  maxPersonas: 4, imagen: './img/habitaciones/habitacion101.jpg', tipo: 'Estándar',          disponibilidad: 'Última disponible', desc: 'Vista panorámica al lago • 35 m²',   camas: '2 Matrimoniales',   amenidades: ['📶 Wi-Fi', '❄️ A/C', '📺 Smart TV', '☕ Cafetera'], resena: { estrellas: 5, comentario: 'Una experiencia mágica. La decoración artesanal es preciosa.',         autor: 'María G.'   }, galeria: generarGaleriaPlaceholder('Tzintzuntzan')  },
    { id: 11, nombre: 'Suite Quinceo', precio: 2200, maxPersonas: 2, imagen: './img/habitaciones/habitacion201.jpg', tipo: 'Suite Presidencial', disponibilidad: 'Solo 1',            desc: 'Lujo y exclusividad máxima • 60 m²', camas: '1 King Size Extra', amenidades: ['📶 Wi-Fi Premium', '❄️ A/C', '🛁 Jacuzzi', '🍾 Champán'], resena: { estrellas: 5, comentario: 'Increíble para nuestra luna de miel. Servicio de primera clase.',       autor: 'Roberto V.' }, galeria: generarGaleriaPlaceholder('Suite Quinceo') },
    { id: 4,  nombre: 'Tacámbaro',    precio: 1500, maxPersonas: 6, imagen: './img/habitaciones/habitacion203.jpg', tipo: 'Master Familiar',   disponibilidad: 'Últimas 2',         desc: 'Rodeada de naturaleza • 55 m²',      camas: '3 Matrimoniales',  amenidades: ['📶 Wi-Fi', '🔥 Chimenea', '🍳 Cocineta'],            resena: { estrellas: 4, comentario: 'Muy acogedora. Perfecta para toda la familia.',                         autor: 'Luis F.'    }, galeria: generarGaleriaPlaceholder('Tacámbaro')     }
];

function PaginaInicio() {
    const fechaHoy = new Date().toISOString().split('T')[0];
    const [busqueda, setBusqueda] = useState({ checkIn: '', checkOut: '', huespedes: 2 });
    const [lightbox, setLightbox] = useState({ abierto: false, habitacionActual: null, indiceFoto: 0 });

    const formatoMoneda = (n) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const renderEstrellas = (n) => Array(n).fill('⭐').join('');

    const manejarBusqueda = (e) => { e.preventDefault(); window.location.href = 'reservaciones.html'; };

    const abrirGaleria  = (hab) => { setLightbox({ abierto: true, habitacionActual: hab, indiceFoto: 0 }); document.body.style.overflow = 'hidden'; };
    const cerrarGaleria = ()    => { setLightbox({ abierto: false, habitacionActual: null, indiceFoto: 0 }); document.body.style.overflow = 'auto'; };
    const fotoSiguiente = (e)   => { e.stopPropagation(); setLightbox(prev => ({ ...prev, indiceFoto: (prev.indiceFoto + 1) % prev.habitacionActual.galeria.length })); };
    const fotoAnterior  = (e)   => { e.stopPropagation(); setLightbox(prev => ({ ...prev, indiceFoto: (prev.indiceFoto - 1 + prev.habitacionActual.galeria.length) % prev.habitacionActual.galeria.length })); };
    const irAFoto = (e, i)      => { e.stopPropagation(); setLightbox(prev => ({ ...prev, indiceFoto: i })); };

    return (
        <div>

            {/* ── HERO ── */}
            <div className="hero-react">
                <h1 className="hero-react__titulo">Descubre la Magia de Michoacán</h1>
                <p className="hero-react__desc">
                    Tu refugio perfecto te espera en Hotel Quinta Dalam. Tradición, confort, y un servicio excepcional diseñado para crear recuerdos inolvidables.
                </p>
                <div className="hero-react__botones">
                    <a href="reservaciones.html" className="btn-hero-primario">Reservar Ahora</a>
                    <a href="catalogo.html" className="btn-hero-secundario">Ver Habitaciones</a>
                </div>
                <div className="hero-scroll-arrow">↓</div>
            </div>

            {/* ── BUSCADOR ── */}
            <div className="buscador-wrap">
                <form className="buscador-form" onSubmit={manejarBusqueda}>
                    <div className="buscador-campo">
                        <label>Llegada</label>
                        <input type="date" required min={fechaHoy}
                            value={busqueda.checkIn}
                            onChange={(e) => setBusqueda({...busqueda, checkIn: e.target.value})} />
                    </div>
                    <div className="buscador-campo">
                        <label>Salida</label>
                        <input type="date" required min={busqueda.checkIn || fechaHoy}
                            value={busqueda.checkOut}
                            onChange={(e) => setBusqueda({...busqueda, checkOut: e.target.value})} />
                    </div>
                    <div className="buscador-campo">
                        <label>Huéspedes</label>
                        <select value={busqueda.huespedes} onChange={(e) => setBusqueda({...busqueda, huespedes: e.target.value})}>
                            <option value="1">1 Persona</option>
                            <option value="2">2 Personas</option>
                            <option value="3">3 Personas</option>
                            <option value="4">4 Personas</option>
                            <option value="5">5+ Personas</option>
                        </select>
                    </div>
                    <button type="submit" className="btn-buscar">Buscar</button>
                </form>
            </div>

            {/* ── HABITACIONES DESTACADAS ── */}
            <div className="destacadas-seccion">
                <div className="destacadas-seccion__header">
                    <h2 className="destacadas-seccion__titulo">Habitaciones Destacadas</h2>
                    <p className="destacadas-seccion__desc">Nuestras opciones más populares elegidas por los huéspedes.</p>
                </div>

                <div className="destacadas-grid">
                    {habitacionesDestacadas.map((hab) => (
                        <div key={hab.id} className="hab-card">

                            <div className="hab-card__img-wrap" onClick={() => abrirGaleria(hab)}>
                                <img src={hab.imagen} alt={hab.nombre} loading="lazy"
                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/400x250?text=Habitación'; }} />
                                <span className="hab-badge hab-badge--tipo">{hab.tipo}</span>
                                <span className="hab-badge hab-badge--estado hab-badge--disponible">Destacada</span>
                                <div className="hab-foto-hint">📷 Ver fotos</div>
                            </div>

                            <div className="hab-card__body">
                                <div className="hab-card__header">
                                    <h2 className="hab-card__nombre">{hab.nombre}</h2>
                                    <div className="hab-card__precio-wrap">
                                        <h3 className="hab-card__precio">${formatoMoneda(hab.precio)}</h3>
                                        <span className="hab-card__precio-nota">/ noche</span>
                                    </div>
                                </div>
                                <p className="hab-card__desc">{hab.desc}</p>
                                <div className="hab-card__meta">
                                    <span>👥 Máx: {hab.maxPersonas} pers.</span>
                                    <span>🛏️ {hab.camas}</span>
                                </div>
                                <div className="hab-card__amenidades">
                                    {hab.amenidades.map((a, i) => <span key={i} className="hab-amenidad-tag">{a}</span>)}
                                </div>
                                <div className="hab-card__spacer"></div>
                                <a href="reservaciones.html" className="btn-reservar-card">Reservar ahora</a>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="destacadas-cta">
                    <a href="catalogo.html" className="btn-ver-catalogo">Ver el catálogo completo</a>
                </div>
            </div>

            {/* ── SERVICIOS ── */}
            <div className="servicios-seccion">
                <div className="servicios-seccion__inner">
                    <h2 className="servicios-seccion__titulo">Servicios de Primera Clase</h2>
                    <div className="servicios-grid">
                        {[
                            { icono: '🍳', titulo: 'Restaurante Gourmet',        desc: 'Sabores michoacanos auténticos con ingredientes locales de temporada.' },
                            { icono: '📶', titulo: 'Wi-Fi de Alta Velocidad',    desc: 'Conexión estable y gratuita en todas las habitaciones y áreas.' },
                            { icono: '🅿️', titulo: 'Estacionamiento',            desc: 'Aparcamiento seguro y gratuito exclusivo para nuestros huéspedes.' },
                            { icono: '🏊', titulo: 'Alberca Climatizada',         desc: 'Relájate en nuestra zona de piscina con temperatura perfecta todo el año.' },
                            { icono: '🥐', titulo: 'Desayuno Incluido',           desc: 'Empieza tu día con nuestro buffet de platillos tradicionales y frescos.' }
                        ].map((s, i) => (
                            <div key={i} className="servicio-card">
                                <div className="servicio-card__icono">{s.icono}</div>
                                <h3 className="servicio-card__titulo">{s.titulo}</h3>
                                <p className="servicio-card__desc">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── RESEÑAS ── */}
            <div className="resenas-seccion">
                <h2 className="resenas-seccion__titulo">Lo que dicen nuestros huéspedes</h2>
                <div className="resenas-grid">
                    {[
                        { iniciales: 'AG', nombre: 'Alejandro Gómez', tipo: 'Viajero frecuente', texto: 'La atención al detalle es impresionante. Desde que entras se siente una paz increíble, y la habitación estaba impecable. Sin duda el mejor lugar para hospedarse en la zona.' },
                        { iniciales: 'SF', nombre: 'Sara & Fernando',  tipo: 'Pareja',           texto: 'Celebramos nuestro aniversario aquí y fue la mejor decisión. El servicio del personal, el desayuno y la comodidad de la cama superaron todas nuestras expectativas.' }
                    ].map((r, i) => (
                        <div key={i} className="resena-card">
                            <div className="resena-card__comilla">"</div>
                            <div className="resena-card__estrellas">{renderEstrellas(5)}</div>
                            <p className="resena-card__texto">"{r.texto}"</p>
                            <div className="resena-card__autor">
                                <div className="resena-card__avatar">{r.iniciales}</div>
                                <div>
                                    <h4 className="resena-card__nombre">{r.nombre}</h4>
                                    <span className="resena-card__tipo">{r.tipo}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── UBICACION ── */}
            <div className="ubicacion-seccion">
                <div className="ubicacion-seccion__inner">
                    <div className="ubicacion-seccion__texto">
                        <h2 className="ubicacion-seccion__titulo">Encuéntranos Fácilmente</h2>
                        <p className="ubicacion-seccion__desc">
                            Estamos ubicados en el corazón histórico, a solo unos pasos de los principales atractivos culturales, restaurantes y centros artesanales.
                        </p>
                        <ul className="ubicacion-seccion__lista">
                            <li>📍 Centro Histórico, Michoacán, México</li>
                            <li>🚗 A 15 min de la terminal de autobuses</li>
                            <li>✈️ A 40 min del Aeropuerto Internacional</li>
                        </ul>
                        <a href="https://maps.google.com" target="_blank" className="btn-google-maps">
                            <span>🗺️</span> Abrir en Google Maps
                        </a>
                    </div>
                    <div className="ubicacion-mapa">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15024.96020524584!2d-101.19694465!3d19.70271175!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x842d0e40be8f5d05%3A0x80352ef2dc740df!2sCentro%20hist%C3%B3rico%20de%20Morelia%2C%20Morelia%2C%20Mich.!5e0!3m2!1ses-419!2smx!4v1700000000000!5m2!1ses-419!2smx"
                            allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Mapa del Hotel"
                        ></iframe>
                    </div>
                </div>
            </div>

            {/* ── CTA FINAL ── */}
            <div className="cta-final-wrap">
                <div className="cta-final-box">
                    <h2 className="cta-final-box__titulo">¿Listo para tu próxima escapada?</h2>
                    <p className="cta-final-box__desc">
                        No esperes más. Las fechas más solicitadas se llenan rápido. Asegura tu descanso ideal hoy mismo.
                    </p>
                    <a href="reservaciones.html" className="btn-cta-final">Ver Disponibilidad y Reservar</a>
                </div>
            </div>

            {/* ── LIGHTBOX ── */}
            {lightbox.abierto && (
                <div className="lb-bg" onClick={cerrarGaleria}>
                    <button className="lb-close" onClick={cerrarGaleria}>✕</button>

                    <div className="lb-viewer" onClick={(e) => e.stopPropagation()}>
                        <button className="lb-nav lb-nav--prev" onClick={fotoAnterior}>‹</button>
                        <img className="lb-img" src={lightbox.habitacionActual.galeria[lightbox.indiceFoto].url} alt="" />
                        <button className="lb-nav lb-nav--next" onClick={fotoSiguiente}>›</button>
                        <div className="lb-info">
                            <h4 className="lb-label">{lightbox.habitacionActual.galeria[lightbox.indiceFoto].etiqueta}</h4>
                            <span className="lb-counter">{lightbox.indiceFoto + 1} / {lightbox.habitacionActual.galeria.length}</span>
                        </div>
                    </div>

                    <div className="lb-thumbs thumbnails-container" onClick={(e) => e.stopPropagation()}>
                        {lightbox.habitacionActual.galeria.map((img, i) => (
                            <img key={i} src={img.url} onClick={(e) => irAFoto(e, i)}
                                className={`lb-thumb ${lightbox.indiceFoto === i ? 'lb-thumb--activa' : ''}`} alt="" />
                        ))}
                    </div>
                </div>
            )}

        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root-index'));
root.render(<PaginaInicio />);
