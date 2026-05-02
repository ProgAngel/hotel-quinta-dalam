const { useState, useEffect } = React;

const API_HABITACIONES = "/Hotel-quinta-dalam/api/habitaciones/listar.php";

// ── Datos de presentación estáticos por número de habitación ─
const ENRIQUECIMIENTO = {
  101: {
    desc: "Vista panorámica al lago • 35 m²",
    camas: "2 Matrimoniales",
    amenidades: ["📶 Wi-Fi", "❄️ A/C", "📺 Smart TV", "☕ Cafetera"],
    resena: {
      estrellas: 5,
      comentario:
        "Una experiencia mágica. La decoración artesanal es preciosa.",
      autor: "María G.",
    },
  },
  102: {
    desc: "Insonorizada • 35 m²",
    camas: "2 Matrimoniales",
    amenidades: ["📶 Wi-Fi", "❄️ A/C", "🎵 Altavoz Bluetooth"],
    resena: {
      estrellas: 4,
      comentario:
        "Un silencio total, descansamos como hace tiempo no lo hacíamos.",
      autor: "Karen y José",
    },
  },
  103: {
    desc: "Cerca del área común • 40 m²",
    camas: "2 Matrimoniales, 1 Individual",
    amenidades: ["📶 Wi-Fi", "❄️ A/C", "📺 TV Cable"],
    resena: {
      estrellas: 5,
      comentario: "Perfecta para viaje con amigos. El internet es muy rápido.",
      autor: "Diana C.",
    },
  },
  104: {
    desc: "Vista al patio central • 40 m²",
    camas: "2 Matrimoniales, 1 Individual",
    amenidades: ["📶 Wi-Fi", "❄️ A/C", "📺 TV Cable"],
    resena: {
      estrellas: 5,
      comentario: "Camas muy cómodas y ambiente súper tranquilo. 10/10.",
      autor: "Carlos R.",
    },
  },
  105: {
    desc: "Balcón privado • 30 m²",
    camas: "1 King Size, 1 Sofá Cama",
    amenidades: ["📶 Wi-Fi", "❄️ A/C", "🥂 Frigobar", "🛁 Jacuzzi"],
    resena: {
      estrellas: 5,
      comentario: "Ideal para relajarse. El jacuzzi es un plus increíble.",
      autor: "Ana P.",
    },
  },
  106: {
    desc: "Jardín privado trasero • 35 m²",
    camas: "1 King Size, 1 Individual",
    amenidades: ["📶 Wi-Fi", "🔥 Chimenea", "📺 Smart TV"],
    resena: {
      estrellas: 5,
      comentario: "El jardín es hermoso, pasamos una tarde muy agradable.",
      autor: "Jorge L.",
    },
  },
  201: {
    desc: "Lujo y exclusividad máxima • 60 m²",
    camas: "1 King Size Extra",
    amenidades: [
      "📶 Wi-Fi Premium",
      "❄️ A/C",
      "🛁 Jacuzzi Privado",
      "🍾 Champán",
    ],
    resena: {
      estrellas: 5,
      comentario:
        "Increíble para nuestra luna de miel. Servicio de primera clase.",
      autor: "Roberto V.",
    },
  },
  202: {
    desc: "Centro de negocios integrado • 45 m²",
    camas: "2 Queen Size, 1 Individual",
    amenidades: ["📶 Wi-Fi", "❄️ A/C", "💻 Escritorio", "☕ Cafetera"],
    resena: {
      estrellas: 5,
      comentario: "Muy espaciosa y cómoda para viajes de negocios grupales.",
      autor: "Paty H.",
    },
  },
  203: {
    desc: "Rodeada de naturaleza • 55 m²",
    camas: "3 Matrimoniales",
    amenidades: ["📶 Wi-Fi", "🔥 Chimenea", "🍳 Cocineta"],
    resena: {
      estrellas: 4,
      comentario: "Muy acogedora. Perfecta para toda la familia.",
      autor: "Luis F.",
    },
  },
  204: {
    desc: "Vista a la alberca • 55 m²",
    camas: "3 Matrimoniales",
    amenidades: ["📶 Wi-Fi", "❄️ A/C", "📺 Smart TV", "☕ Cafetera"],
    resena: {
      estrellas: 5,
      comentario:
        "Excelente atención y la habitación impecable. Muy recomendado.",
      autor: "Elena M.",
    },
  },
  205: {
    desc: "Terraza privada panorámica • 45 m²",
    camas: "2 Matrimoniales",
    amenidades: ["📶 Wi-Fi", "❄️ A/C", "🍽️ Comedor", "🍷 Frigobar"],
    resena: {
      estrellas: 5,
      comentario: "Espacio hermoso con detalles increíbles.",
      autor: "Familia Ruiz",
    },
  },
  206: {
    desc: "Vista al amanecer • 35 m²",
    camas: "1 King Size, 1 Individual",
    amenidades: ["📶 Wi-Fi", "❄️ A/C", "🛁 Tina", "🥂 Frigobar"],
    resena: {
      estrellas: 5,
      comentario:
        "El desayuno en la terraza viendo el amanecer no tiene precio.",
      autor: "Sofía T.",
    },
  },
  207: {
    desc: "Muebles artesanales tallados • 50 m²",
    camas: "3 Matrimoniales",
    amenidades: ["📶 Wi-Fi", "❄️ A/C", "📺 Smart TV", "🥐 Desayuno"],
    resena: {
      estrellas: 5,
      comentario: "Los muebles son una obra de arte. Muy espaciosa.",
      autor: "Armando B.",
    },
  },
};

// ── Helpers
function generarGaleria(nombre) {
  const n = nombre.replace(/\s/g, "+");
  return [
    {
      url: `https://via.placeholder.com/1200x800/e0d5c1/8c5a35?text=${n}+-+Recámara`,
      etiqueta: "Recámara Principal",
    },
    {
      url: `https://via.placeholder.com/1200x800/fdf8f5/333333?text=${n}+-+Baño`,
      etiqueta: "Baño Completo",
    },
    {
      url: `https://via.placeholder.com/1200x800/e0d5c1/8c5a35?text=${n}+-+Vista`,
      etiqueta: "Vista al Exterior",
    },
    {
      url: `https://via.placeholder.com/1200x800/fdf8f5/333333?text=${n}+-+Detalles`,
      etiqueta: "Detalles y Amenidades",
    },
  ];
}

function estadoADisponibilidad(estado) {
  return (
    {
      disponible: "Disponible",
      ocupada: "Ocupada",
      mantenimiento: "En Mantenimiento",
    }[estado] || "Disponible"
  );
}

function enriquecerHabitacion(hab) {
  const extra = ENRIQUECIMIENTO[hab.numero] || {};
  return {
    id: hab.id,
    numero: hab.numero,
    nombre: hab.nombre,
    tipo: hab.tipo,
    precio: hab.precio_noche,
    maxPersonas: hab.capacidad,
    imagen: hab.imagen_url || `./img/habitaciones/habitacion${hab.numero}.jpg`,
    disponibilidad: estadoADisponibilidad(hab.estado),
    estado: hab.estado,
    desc:
      hab.descripcion || extra.desc || `Habitación ${hab.nombre} • ${hab.tipo}`,
    camas: extra.camas || "—",
    amenidades: extra.amenidades || ["📶 Wi-Fi", "❄️ A/C"],
    resena: extra.resena || {
      estrellas: 5,
      comentario: "Excelente estadía.",
      autor: "Huésped",
    },
    galeria: generarGaleria(hab.nombre),
  };
}

// ── Componente principal
function Catalogo() {
  const [habitaciones, setHabitaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [lightbox, setLightbox] = useState({
    abierto: false,
    hab: null,
    idx: 0,
  });

  // ── Cargar habitaciones desde la API
  useEffect(() => {
    fetch(API_HABITACIONES)
      .then((r) => {
        if (!r.ok) throw new Error("Error del servidor");
        return r.json();
      })
      .then((data) => {
        if (!data.ok) throw new Error(data.mensaje || "Error al cargar");
        setHabitaciones(data.habitaciones.map(enriquecerHabitacion));
      })
      .catch((err) => {
        setError(err.message);
        window.QDToast &&
          window.QDToast.error(
            "No se pudieron cargar las habitaciones. Intenta de nuevo.",
          );
      })
      .finally(() => setCargando(false));
  }, []);

  const fmt = (n) => n.toLocaleString("es-MX", { minimumFractionDigits: 2 });
  const estrellas = (n) => Array(n).fill("⭐").join("");
  const esUrgente = (d) => d === "Ocupada" || d === "En Mantenimiento";

  const abrirLb = (h) => {
    setLightbox({ abierto: true, hab: h, idx: 0 });
    document.body.style.overflow = "hidden";
  };
  const cerrarLb = () => {
    setLightbox({ abierto: false, hab: null, idx: 0 });
    document.body.style.overflow = "auto";
  };
  const siguiente = (e) => {
    e.stopPropagation();
    setLightbox((p) => ({ ...p, idx: (p.idx + 1) % p.hab.galeria.length }));
  };
  const anterior = (e) => {
    e.stopPropagation();
    setLightbox((p) => ({
      ...p,
      idx: (p.idx - 1 + p.hab.galeria.length) % p.hab.galeria.length,
    }));
  };
  const irA = (e, i) => {
    e.stopPropagation();
    setLightbox((p) => ({ ...p, idx: i }));
  };

  // ── Estados de carga y error
  if (cargando)
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <div
          style={{
            width: "48px",
            height: "48px",
            border: "3px solid #f0ece1",
            borderTopColor: "#8c5a35",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 20px",
          }}
        ></div>
        <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
        <p style={{ fontFamily: "'Lato',sans-serif", color: "#888" }}>
          Cargando habitaciones...
        </p>
      </div>
    );

  if (error)
    return (
      <div
        style={{
          textAlign: "center",
          padding: "80px 20px",
          fontFamily: "'Lato',sans-serif",
        }}
      >
        <p style={{ fontSize: "2rem", marginBottom: "16px" }}>😕</p>
        <p style={{ color: "#8c5a35", fontWeight: 700, marginBottom: "8px" }}>
          No se pudieron cargar las habitaciones
        </p>
        <p style={{ color: "#aaa", fontSize: "0.9rem", marginBottom: "24px" }}>
          {error}
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            background: "linear-gradient(135deg,#8c5a35,#6b3a1f)",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            padding: "12px 28px",
            fontFamily: "'Lato',sans-serif",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          🔄 Reintentar
        </button>
      </div>
    );

  return (
    <div>
      <div className="catalogo-grid">
        {habitaciones.map((hab) => (
          <div key={hab.id} className="hab-card">
            <div className="hab-card__img-wrap" onClick={() => abrirLb(hab)}>
              <img
                src={hab.imagen}
                alt={hab.nombre}
                loading="lazy"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/400x250/e0d5c1/8c5a35?text=Sin+Foto";
                }}
              />
              <span className="hab-badge hab-badge--tipo">{hab.tipo}</span>
              <span
                className={`hab-badge hab-badge--estado ${esUrgente(hab.disponibilidad) ? "hab-badge--urgente" : "hab-badge--disponible"}`}
              >
                {hab.disponibilidad}
              </span>
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

              <p className="hab-card__desc">{hab.desc}</p>

              <div className="hab-card__meta">
                <span>👥 Máx: {hab.maxPersonas} pers.</span>
                <span>🛏️ {hab.camas}</span>
              </div>

              <div className="hab-card__amenidades">
                {hab.amenidades.map((a, i) => (
                  <span key={i} className="hab-amenidad-tag">
                    {a}
                  </span>
                ))}
              </div>

              <div className="hab-card__spacer"></div>

              <div className="hab-card__resena">
                <div className="hab-resena__stars">
                  {estrellas(hab.resena.estrellas)}
                </div>
                <p className="hab-resena__texto">"{hab.resena.comentario}"</p>
                <p className="hab-resena__autor">— {hab.resena.autor}</p>
              </div>

              {hab.estado === "disponible" ? (
                <a
                  href={`reservaciones.html?hab=${hab.id}`}
                  className="btn-reservar-card"
                >
                  Seleccionar Fechas
                </a>
              ) : (
                <button
                  className="btn-reservar-card"
                  disabled
                  style={{ opacity: 0.5, cursor: "not-allowed" }}
                >
                  {hab.estado === "ocupada" ? "Ocupada" : "No disponible"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Lightbox ── */}
      {lightbox.abierto && (
        <div className="lb-bg" onClick={cerrarLb}>
          <button className="lb-close" onClick={cerrarLb}>
            ✕
          </button>
          <div className="lb-viewer" onClick={(e) => e.stopPropagation()}>
            <button className="lb-nav lb-nav--prev" onClick={anterior}>
              ‹
            </button>
            <img
              className="lb-img"
              src={lightbox.hab.galeria[lightbox.idx].url}
              alt=""
            />
            <button className="lb-nav lb-nav--next" onClick={siguiente}>
              ›
            </button>
            <div className="lb-info">
              <h4 className="lb-label">
                {lightbox.hab.galeria[lightbox.idx].etiqueta}
              </h4>
              <span className="lb-counter">
                {lightbox.idx + 1} / {lightbox.hab.galeria.length}
              </span>
            </div>
          </div>
          <div
            className="lb-thumbs thumbnails-container"
            onClick={(e) => e.stopPropagation()}
          >
            {lightbox.hab.galeria.map((img, i) => (
              <img
                key={i}
                src={img.url}
                className={`lb-thumb ${lightbox.idx === i ? "lb-thumb--activa" : ""}`}
                onClick={(e) => irA(e, i)}
                alt=""
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root-catalogo"));
root.render(<Catalogo />);
