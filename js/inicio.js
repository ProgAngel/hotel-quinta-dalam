// ============================================================
//  inicio.js — Hotel Quinta Dalam
//  Habitaciones destacadas conectadas a api/habitaciones/listar.php
// ============================================================

const { useState, useEffect } = React;

const API_HABITACIONES = './api/habitaciones/listar.php';

// ── Enriquecimiento estático (mismo que catalogo.js) ─────────
const ENRIQUECIMIENTO = {
    '101': { resena:{ estrellas:5, comentario:'Una experiencia mágica. La decoración artesanal es preciosa.',    autor:'María G.'    } },
    '201': { resena:{ estrellas:5, comentario:'Increíble para nuestra luna de miel. Servicio de primera clase.', autor:'Roberto V.'  } },
    '203': { resena:{ estrellas:4, comentario:'Muy acogedora. Perfecta para toda la familia.',                    autor:'Luis F.'     } },
    '204': { resena:{ estrellas:5, comentario:'Excelente atención y la habitación impecable. Muy recomendado.',   autor:'Elena M.'    } },
    '205': { resena:{ estrellas:5, comentario:'Espacio hermoso con detalles increíbles.',                         autor:'Familia Ruiz'} },
};

function generarGaleria(nombre) {
    const n = nombre.replace(/\s/g, '+');
    return [
        { url:`https://via.placeholder.com/1200x800/e0d5c1/8c5a35?text=${n}+-+Recámara`, etiqueta:'Recámara Principal' },
        { url:`https://via.placeholder.com/1200x800/fdf8f5/333333?text=${n}+-+Baño`,      etiqueta:'Baño Completo'      },
        { url:`https://via.placeholder.com/1200x800/e0d5c1/8c5a35?text=${n}+-+Vista`,     etiqueta:'Vista al Exterior'  },
        { url:`https://via.placeholder.com/1200x800/fdf8f5/333333?text=${n}+-+Detalles`,  etiqueta:'Detalles y Amenidades' }
    ];
}

function enriquecerHabitacion(hab) {
    const extra = ENRIQUECIMIENTO[hab.numero] || {};
    return {
        id:          hab.id,
        numero:      hab.numero,
        nombre:      hab.nombre,
        tipo:        hab.tipo,
        precio:      hab.precio_noche,
        maxPersonas: hab.capacidad,
        imagen:      hab.imagen_url || `./img/habitaciones/habitacion${hab.numero}.jpg`,
        estado:      hab.estado,
        descripcion: hab.descripcion || `${hab.nombre} — ${hab.tipo}`,
        resena:      extra.resena || { estrellas:5, comentario:'Excelente estadía.', autor:'Huésped' },
        galeria:     generarGaleria(hab.nombre),
    };
}

function PaginaInicio() {
    const fechaHoy  = new Date().toISOString().split('T')[0];
    const [busqueda, setBusqueda] = useState({ checkIn: '', checkOut: '', huespedes: 2 });

    // ── Habitaciones destacadas desde API ─────────────────────
    const [destacadas,      setDestacadas]      = useState([]);
    const [cargandoDestac,  setCargandoDestac]  = useState(true);

    const [lightbox, setLightbox] = useState({ abierto: false, hab: null, idx: 0 });

    useEffect(() => {
        // ?estado=disponible&limit=3 → la BD filtra, no el navegador
        fetch(API_HABITACIONES + '?estado=disponible&limit=3')
            .then(r => r.json())
            .then(data => {
                if (data.ok && data.habitaciones.length > 0) {
                    setDestacadas(data.habitaciones.map(enriquecerHabitacion));
                }
            })
            .catch(() => {
                window.QDToast && window.QDToast.aviso('No se pudieron cargar las habitaciones destacadas.');
            })
            .finally(() => setCargandoDestac(false));
    }, []);

    const fmt      = n => n.toLocaleString('es-MX', { minimumFractionDigits: 2 });
    const estrell  = n => Array(n).fill('⭐').join('');

    const manejarBusqueda = e => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (busqueda.checkIn)  params.set('checkIn',   busqueda.checkIn);
        if (busqueda.checkOut) params.set('checkOut',  busqueda.checkOut);
        if (busqueda.huespedes) params.set('huespedes', busqueda.huespedes);
        window.location.href = 'reservaciones.html?' + params.toString();
    };

    const abrirLb   = h  => { setLightbox({ abierto: true, hab: h, idx: 0 }); document.body.style.overflow = 'hidden'; };
    const cerrarLb  = () => { setLightbox({ abierto: false, hab: null, idx: 0 }); document.body.style.overflow = 'auto'; };
    const siguiente = e  => { e.stopPropagation(); setLightbox(p => ({ ...p, idx: (p.idx + 1) % p.hab.galeria.length })); };
    const anterior  = e  => { e.stopPropagation(); setLightbox(p => ({ ...p, idx: (p.idx - 1 + p.hab.galeria.length) % p.hab.galeria.length })); };
    const irA       = (e, i) => { e.stopPropagation(); setLightbox(p => ({ ...p, idx: i })); };

    return (
        <div>

            {/* ── HERO ── */}
            <div className="hero-react">
                <h1 className="hero-react__titulo">Descubre la Magia de Michoacán</h1>
                <p className="hero-react__desc">
                    Tu refugio perfecto te espera en Hotel Quinta Dalam. Tradición, confort, y un servicio
                    excepcional diseñado para crear recuerdos inolvidables.
                </p>
                <div className="hero-react__botones">
                    <a href="reservaciones.html#paso-1" className="btn-hero-primario">Reservar Ahora</a>
                    <a href="catalogo.html"      className="btn-hero-secundario">Ver Habitaciones</a>
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
                            onChange={e => setBusqueda({...busqueda, checkIn: e.target.value})} />
                    </div>
                    <div className="buscador-campo">
                        <label>Salida</label>
                        <input type="date" required min={busqueda.checkIn || fechaHoy}
                            value={busqueda.checkOut}
                            onChange={e => setBusqueda({...busqueda, checkOut: e.target.value})} />
                    </div>
                    <div className="buscador-campo">
                        <label>Huéspedes</label>
                        <select value={busqueda.huespedes}
                            onChange={e => setBusqueda({...busqueda, huespedes: e.target.value})}>
                            {[1,2,3,4,5].map(n => (
                                <option key={n} value={n}>{n} {n === 1 ? 'Persona' : 'Personas'}</option>
                            ))}
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

                {cargandoDestac ? (
                    <div style={{ textAlign:'center', padding:'60px 20px' }}>
                        <div style={{ width:'40px', height:'40px', border:'3px solid #f0ece1',
                            borderTopColor:'#8c5a35', borderRadius:'50%',
                            animation:'spin 0.8s linear infinite', margin:'0 auto 16px' }}></div>
                        <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
                        <p style={{ fontFamily:"'Lato',sans-serif", color:'#aaa', fontSize:'0.9rem' }}>
                            Cargando habitaciones...
                        </p>
                    </div>
                ) : (
                    <div className="destacadas-grid">
                        {destacadas.map(hab => (
                            <div key={hab.id} className="hab-card">

                                <div className="hab-card__img-wrap" onClick={() => abrirLb(hab)}>
                                    <img src={hab.imagen} alt={hab.nombre} loading="lazy"
                                        onError={e => { e.target.src = 'https://via.placeholder.com/400x250/e0d5c1/8c5a35?text=Habitación'; }} />
                                    <span className="hab-badge hab-badge--tipo">{hab.tipo}</span>
                                    <span className="hab-badge hab-badge--estado hab-badge--disponible">✨ Destacada</span>
                                    <div className="hab-foto-hint">📷 Ver fotos</div>
                                </div>

                                <div className="hab-card__body">
                                    <div className="hab-card__header">
                                        <h2 className="hab-card__nombre">{hab.nombre}</h2>
                                        <div className="hab-card__precio-wrap">
                                            <h3 className="hab-card__precio">${fmt(hab.precio)}</h3>
                                            <span className="hab-card__precio-nota">/ noche</span>
                                        </div>
                                    </div>

                                    <p className="hab-card__desc">{hab.descripcion}</p>

                                    <div className="hab-card__meta">
                                        <span>👥 Máx: {hab.maxPersonas} pers.</span>
                                        <span>🏡 Hab. {hab.numero}</span>
                                    </div>

                                    <div className="hab-card__spacer"></div>

                                    <div className="hab-card__resena">
                                        <div className="hab-resena__stars">{estrell(hab.resena.estrellas)}</div>
                                        <p className="hab-resena__texto">"{hab.resena.comentario}"</p>
                                        <p className="hab-resena__autor">— {hab.resena.autor}</p>
                                    </div>

                                    <a href={`reservaciones.html?hab=${hab.id}`} className="btn-reservar-card">
                                        Seleccionar Fechas
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div style={{ textAlign:'center', marginTop:'32px' }}>
                    <a href="catalogo.html" style={{
                        display:'inline-block',
                        background:'linear-gradient(135deg,#8c5a35,#6b3a1f)',
                        color:'#fff', textDecoration:'none',
                        padding:'14px 36px', borderRadius:'10px',
                        fontFamily:"'Lato',sans-serif", fontWeight:700,
                        letterSpacing:'1px', textTransform:'uppercase',
                        fontSize:'0.88rem', boxShadow:'0 4px 16px rgba(140,90,53,0.3)',
                        transition:'all 0.3s ease'
                    }}>
                        Ver todas las habitaciones →
                    </a>
                </div>
            </div>

            {/* Lightbox */}
            {lightbox.abierto && (
                <div className="lb-bg" onClick={cerrarLb}>
                    <button className="lb-close" onClick={cerrarLb}>✕</button>
                    <div className="lb-viewer" onClick={e => e.stopPropagation()}>
                        <button className="lb-nav lb-nav--prev" onClick={anterior}>‹</button>
                        <img className="lb-img" src={lightbox.hab.galeria[lightbox.idx].url} alt="" />
                        <button className="lb-nav lb-nav--next" onClick={siguiente}>›</button>
                        <div className="lb-info">
                            <h4 className="lb-label">{lightbox.hab.galeria[lightbox.idx].etiqueta}</h4>
                            <span className="lb-counter">{lightbox.idx + 1} / {lightbox.hab.galeria.length}</span>
                        </div>
                    </div>
                    <div className="lb-thumbs thumbnails-container" onClick={e => e.stopPropagation()}>
                        {lightbox.hab.galeria.map((img, i) => (
                            <img key={i} src={img.url}
                                className={`lb-thumb ${lightbox.idx === i ? 'lb-thumb--activa' : ''}`}
                                onClick={e => irA(e, i)} alt="" />
                        ))}
                    </div>
                </div>
            )}

            {/* ── SERVICIOS ── */}
            <div className="servicios-seccion">
                <div className="servicios-seccion__inner">
                    <h2 className="servicios-seccion__titulo">¿Por qué elegirnos?</h2>
                    <div className="servicios-grid">
                        {[
                            { icono:'🏺', titulo:'Arte Purépecha',    desc:'Cada habitación está decorada con artesanías y textiles auténticos de Michoacán.' },
                            { icono:'🍽️', titulo:'Cocina Tradicional', desc:'Sabores únicos de la gastronomía michoacana preparados con ingredientes locales.' },
                            { icono:'🌿', titulo:'Entorno Natural',    desc:'Rodeados de naturaleza, en un ambiente tranquilo ideal para el descanso.' },
                            { icono:'⭐', titulo:'Servicio Premium',   desc:'Atención personalizada para que tu estancia sea verdaderamente memorable.' },
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
                        { texto:'Una experiencia mágica. La decoración artesanal es preciosa y el servicio excepcional.', autor:'María G.', tipo:'Habitación Tzintzuntzan', iniciales:'MG' },
                        { texto:'Increíble para nuestra luna de miel. El jacuzzi privado y el servicio de primera clase nos encantaron.', autor:'Roberto V.', tipo:'Suite Quinceo', iniciales:'RV' },
                        { texto:'Perfecta para toda la familia. Muy acogedora y el personal siempre atento a todo.', autor:'Luis F.', tipo:'Habitación Tacámbaro', iniciales:'LF' },
                    ].map((r, i) => (
                        <div key={i} className="resena-card">
                            <div className="resena-card__comilla">"</div>
                            <div className="resena-card__estrellas">⭐⭐⭐⭐⭐</div>
                            <p className="resena-card__texto">{r.texto}</p>
                            <div className="resena-card__autor">
                                <div className="resena-card__avatar">{r.iniciales}</div>
                                <div>
                                    <p className="resena-card__nombre">{r.autor}</p>
                                    <p className="resena-card__tipo">{r.tipo}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── UBICACIÓN ── */}
            <div className="ubicacion-seccion">
                <div className="ubicacion-seccion__inner">
                    <div className="ubicacion-seccion__texto">
                        <h2 className="ubicacion-seccion__titulo">¿Cómo llegar?</h2>
                        <p className="ubicacion-seccion__desc">
                            Ubicados en el corazón de Michoacán, a pocos minutos de los principales
                            Pueblos Mágicos y atractivos turísticos de la región.
                        </p>
                        <ul className="ubicacion-seccion__lista">
                            <li>📍 Michoacán, México</li>
                            <li>✈️ 45 min del Aeropuerto de Morelia</li>
                            <li>🚗 Acceso por carretera federal</li>
                            <li>📞 +52 (443) 000-0000</li>
                        </ul>
                        <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer"
                           className="btn-google-maps">
                            🗺️ Ver en Google Maps
                        </a>
                    </div>
                    <div className="ubicacion-mapa">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d240281.95989108458!2d-101.3305!3d19.7060!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x842d0e5571f5c429%3A0x2f97b14ef52eff0!2sMorelia%2C%20Michoacán!5e0!3m2!1ses!2smx!4v1620000000000"
                            allowFullScreen="" loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Ubicación Hotel Quinta Dalam">
                        </iframe>
                    </div>
                </div>
            </div>

            {/* ── CTA FINAL ── */}
            <div className="cta-final-wrap">
                <div className="cta-final-box">
                    <h2 className="cta-final-box__titulo">¿Listo para vivir la experiencia?</h2>
                    <p className="cta-final-box__desc">
                        Reserva ahora y disfruta de una estancia única en el corazón de Michoacán.
                        Habitaciones disponibles para tus próximas fechas.
                    </p>
                    <a href="reservaciones.html" className="btn-cta-final">Reservar mi Estancia</a>
                </div>
            </div>

        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root-inicio'));
root.render(<PaginaInicio />);