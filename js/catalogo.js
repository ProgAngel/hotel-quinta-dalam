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

const habitacionesData = [
    { id: 1,  nombre: 'Tzintzuntzan',  precio: 800,  maxPersonas: 4, imagen: './img/habitaciones/habitacion101.jpg', tipo: 'Estándar',          disponibilidad: 'Última disponible', desc: 'Vista panorámica al lago • 35 m²',       camas: '2 Matrimoniales',              amenidades: ['📶 Wi-Fi', '❄️ A/C', '📺 Smart TV', '☕ Cafetera'],              resena: { estrellas: 5, comentario: 'Una experiencia mágica. La decoración artesanal es preciosa.',         autor: 'María G.'      }, galeria: generarGaleriaPlaceholder('Tzintzuntzan')  },
    { id: 2,  nombre: 'Pátzcuaro',     precio: 1200, maxPersonas: 5, imagen: './img/habitaciones/habitacion104.jpg', tipo: 'Familiar',          disponibilidad: 'Disponible',        desc: 'Vista al patio central • 40 m²',         camas: '2 Matrimoniales, 1 Individual', amenidades: ['📶 Wi-Fi', '❄️ A/C', '📺 TV Cable'],                             resena: { estrellas: 5, comentario: 'Camas muy cómodas y ambiente súper tranquilo. 10/10.',                  autor: 'Carlos R.'     }, galeria: generarGaleriaPlaceholder('Pátzcuaro')     },
    { id: 3,  nombre: 'Coeneo',        precio: 1000, maxPersonas: 3, imagen: './img/habitaciones/habitacion105.jpg', tipo: 'Suite',             disponibilidad: 'Disponible',        desc: 'Balcón privado • 30 m²',                 camas: '1 King Size, 1 Sofá Cama',     amenidades: ['📶 Wi-Fi', '❄️ A/C', '🥂 Frigobar', '🛁 Jacuzzi'],              resena: { estrellas: 5, comentario: 'Ideal para relajarse. El jacuzzi es un plus increíble.',                autor: 'Ana P.'        }, galeria: generarGaleriaPlaceholder('Coeneo')        },
    { id: 4,  nombre: 'Tacámbaro',     precio: 1500, maxPersonas: 6, imagen: './img/habitaciones/habitacion203.jpg', tipo: 'Master Familiar',  disponibilidad: 'Últimas 2',         desc: 'Rodeada de naturaleza • 55 m²',          camas: '3 Matrimoniales',              amenidades: ['📶 Wi-Fi', '🔥 Chimenea', '🍳 Cocineta'],                        resena: { estrellas: 4, comentario: 'Muy acogedora. Perfecta para toda la familia.',                         autor: 'Luis F.'       }, galeria: generarGaleriaPlaceholder('Tacámbaro')     },
    { id: 5,  nombre: 'Uruapan',       precio: 1500, maxPersonas: 6, imagen: './img/habitaciones/habitacion204.jpg', tipo: 'Master Familiar',  disponibilidad: 'Disponible',        desc: 'Vista a la alberca • 55 m²',             camas: '3 Matrimoniales',              amenidades: ['📶 Wi-Fi', '❄️ A/C', '📺 Smart TV', '☕ Cafetera'],              resena: { estrellas: 5, comentario: 'Excelente atención y la habitación impecable. Muy recomendado.',         autor: 'Elena M.'      }, galeria: generarGaleriaPlaceholder('Uruapan')       },
    { id: 6,  nombre: 'Tlalpujahua',   precio: 1200, maxPersonas: 4, imagen: './img/habitaciones/habitacion205.jpg', tipo: 'Suite Deluxe',     disponibilidad: 'Solo 1',            desc: 'Terraza privada panorámica • 45 m²',     camas: '2 Matrimoniales',              amenidades: ['📶 Wi-Fi', '❄️ A/C', '🍽️ Comedor', '🍷 Frigobar'],             resena: { estrellas: 5, comentario: 'Espacio hermoso con detalles increíbles.',                               autor: 'Familia Ruiz'  }, galeria: generarGaleriaPlaceholder('Tlalpujahua')   },
    { id: 7,  nombre: 'Paracho',       precio: 800,  maxPersonas: 4, imagen: './img/habitaciones/habitacion102.jpg', tipo: 'Estándar',          disponibilidad: 'Disponible',        desc: 'Insonorizada • 35 m²',                   camas: '2 Matrimoniales',              amenidades: ['📶 Wi-Fi', '❄️ A/C', '🎵 Altavoz Bluetooth'],                    resena: { estrellas: 4, comentario: 'Un silencio total, descansamos como hace tiempo no lo hacíamos.',        autor: 'Karen y José'  }, galeria: generarGaleriaPlaceholder('Paracho')       },
    { id: 8,  nombre: 'Yunuen',        precio: 1200, maxPersonas: 5, imagen: './img/habitaciones/habitacion103.jpg', tipo: 'Familiar',          disponibilidad: 'Disponible',        desc: 'Cerca del área común • 40 m²',           camas: '2 Matrimoniales, 1 Individual', amenidades: ['📶 Wi-Fi', '❄️ A/C', '📺 TV Cable'],                             resena: { estrellas: 5, comentario: 'Perfecta para viaje con amigos. El internet es muy rápido.',             autor: 'Diana C.'      }, galeria: generarGaleriaPlaceholder('Yunuen')        },
    { id: 9,  nombre: 'Cuitzeo',       precio: 1000, maxPersonas: 3, imagen: './img/habitaciones/habitacion206.jpg', tipo: 'Suite',             disponibilidad: 'Última disponible', desc: 'Vista al amanecer • 35 m²',              camas: '1 King Size, 1 Individual',    amenidades: ['📶 Wi-Fi', '❄️ A/C', '🛁 Tina', '🥂 Frigobar'],                 resena: { estrellas: 5, comentario: 'El desayuno en la terraza viendo el amanecer no tiene precio.',          autor: 'Sofía T.'      }, galeria: generarGaleriaPlaceholder('Cuitzeo')       },
    { id: 10, nombre: 'Janitzio',      precio: 1000, maxPersonas: 3, imagen: './img/habitaciones/habitacion106.jpg', tipo: 'Suite',             disponibilidad: 'Disponible',        desc: 'Jardín privado trasero • 35 m²',         camas: '1 King Size, 1 Individual',    amenidades: ['📶 Wi-Fi', '🔥 Chimenea', '📺 Smart TV'],                        resena: { estrellas: 5, comentario: 'El jardín es hermoso, pasamos una tarde muy agradable.',                 autor: 'Jorge L.'      }, galeria: generarGaleriaPlaceholder('Janitzio')      },
    { id: 11, nombre: 'Suite Quinceo', precio: 2200, maxPersonas: 2, imagen: './img/habitaciones/habitacion201.jpg', tipo: 'Suite Presidencial',disponibilidad: 'Solo 1',            desc: 'Lujo y exclusividad máxima • 60 m²',     camas: '1 King Size Extra',            amenidades: ['📶 Wi-Fi Premium', '❄️ A/C', '🛁 Jacuzzi Privado', '🍾 Champán'], resena: { estrellas: 5, comentario: 'Increíble para nuestra luna de miel. Servicio de primera clase.',       autor: 'Roberto V.'    }, galeria: generarGaleriaPlaceholder('Suite Quinceo') },
    { id: 12, nombre: 'Morelia',       precio: 1200, maxPersonas: 5, imagen: './img/habitaciones/habitacion202.jpg', tipo: 'Ejecutiva',         disponibilidad: 'Últimas 2',         desc: 'Centro de negocios integrado • 45 m²',   camas: '2 Queen Size, 1 Individual',   amenidades: ['📶 Wi-Fi', '❄️ A/C', '💻 Escritorio', '☕ Cafetera'],            resena: { estrellas: 5, comentario: 'Muy espaciosa y cómoda para viajes de negocios grupales.',               autor: 'Paty H.'       }, galeria: generarGaleriaPlaceholder('Morelia')       },
    { id: 13, nombre: 'Cuanajo',       precio: 1180, maxPersonas: 6, imagen: './img/habitaciones/habitacion207.jpg', tipo: 'Master Familiar',  disponibilidad: 'Disponible',        desc: 'Muebles artesanales tallados • 50 m²',   camas: '3 Matrimoniales',              amenidades: ['📶 Wi-Fi', '❄️ A/C', '📺 Smart TV', '🥐 Desayuno'],              resena: { estrellas: 5, comentario: 'Los muebles son una obra de arte. Muy espaciosa.',                       autor: 'Armando B.'    }, galeria: generarGaleriaPlaceholder('Cuanajo')       }
];

function Catalogo() {
    const [lightbox, setLightbox] = useState({ abierto: false, habitacionActual: null, indiceFoto: 0 });

    const formatoMoneda = (n) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const renderEstrellas = (n) => Array(n).fill('⭐').join('');
    const esUrgente = (disp) => disp.includes('Última') || disp.includes('Solo 1');

    const abrirGaleria = (hab) => { setLightbox({ abierto: true, habitacionActual: hab, indiceFoto: 0 }); document.body.style.overflow = 'hidden'; };
    const cerrarGaleria = () => { setLightbox({ abierto: false, habitacionActual: null, indiceFoto: 0 }); document.body.style.overflow = 'auto'; };
    const fotoSiguiente = (e) => { e.stopPropagation(); setLightbox(prev => ({ ...prev, indiceFoto: (prev.indiceFoto + 1) % prev.habitacionActual.galeria.length })); };
    const fotoAnterior  = (e) => { e.stopPropagation(); setLightbox(prev => ({ ...prev, indiceFoto: (prev.indiceFoto - 1 + prev.habitacionActual.galeria.length) % prev.habitacionActual.galeria.length })); };
    const irAFoto = (e, i) => { e.stopPropagation(); setLightbox(prev => ({ ...prev, indiceFoto: i })); };

    return (
        <div>
            <div className="catalogo-grid">
                {habitacionesData.map((hab) => (
                    <div key={hab.id} className="hab-card">

                        <div className="hab-card__img-wrap" onClick={() => abrirGaleria(hab)}>
                            <img src={hab.imagen} alt={hab.nombre} loading="lazy" onError={(e) => { e.target.src = 'https://via.placeholder.com/400x250?text=Sin+Foto'; }} />
                            <span className="hab-badge hab-badge--tipo">{hab.tipo}</span>
                            <span className={`hab-badge hab-badge--estado ${esUrgente(hab.disponibilidad) ? 'hab-badge--urgente' : 'hab-badge--disponible'}`}>{hab.disponibilidad}</span>
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

                            <div className="hab-card__resena">
                                <div className="hab-resena__stars">{renderEstrellas(hab.resena.estrellas)}</div>
                                <p className="hab-resena__texto">"{hab.resena.comentario}"</p>
                                <p className="hab-resena__autor">— {hab.resena.autor}</p>
                            </div>

                            <a href="reservaciones.html" className="btn-reservar-card">Seleccionar Fechas</a>
                        </div>
                    </div>
                ))}
            </div>

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

const root = ReactDOM.createRoot(document.getElementById('root-catalogo'));
root.render(<Catalogo />);