const { useState, useEffect, useRef } = React;

/* ── Contador animado*/
function ContadorAnimado({
  objetivo,
  sufijo = "",
  decimales = 0,
  duracion = 2000,
}) {
  const [valor, setValor] = useState(0);
  const iniciado = useRef(false);

  useEffect(() => {
    if (iniciado.current) return;
    iniciado.current = true;
    const pasos = 60;
    const intervalo = duracion / pasos;
    const incremento = objetivo / pasos;
    let actual = 0;
    const timer = setInterval(() => {
      actual += incremento;
      if (actual >= objetivo) {
        setValor(objetivo);
        clearInterval(timer);
      } else {
        setValor(parseFloat(actual.toFixed(decimales)));
      }
    }, intervalo);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {decimales > 0 ? valor.toFixed(decimales) : valor}
      {sufijo}
    </>
  );
}

/* ── Datos del equipo ── */
const equipo = [
  {
    iniciales: "RM",
    color: "#8c5a35",
    nombre: "Roberto Mendoza",
    cargo: "Director General",
    bio: "Apasionado por la hospitalidad michoacana con más de 10 años liderando proyectos hoteleros de identidad cultural en la región.",
  },
  {
    iniciales: "AG",
    color: "#3e4e42",
    nombre: "Ana Gutiérrez",
    cargo: "Directora de Experiencias",
    bio: "Diseña cada detalle de la estadía para que los huéspedes se lleven un pedacito de Michoacán en el corazón.",
  },
  {
    iniciales: "CH",
    color: "#8c5a35",
    nombre: "Carlos Herrera",
    cargo: "Chef Ejecutivo",
    bio: "Sus recetas fusionan la cocina tradicional purépecha con técnicas contemporáneas, orgullo culinario del hotel.",
  },
];

/* ── Componente principal ── */
function PaginaNosotros() {
  return (
    <div>
      {/* Head */}
      <section className="page-header bg-nosotros">
        <h1>Nuestra Historia</h1>
        <p>Tradición que se vive en cada rincón del Hotel Quinta Dalam</p>
      </section>

      {/* Historia */}
      <section className="ns-historia">
        <div className="ns-historia__inner">
          <div className="ns-historia__texto">
            <span className="ns-historia__etiqueta">
              Desde 2019 · Morelia, Michoacán
            </span>
            <h2 className="ns-historia__titulo">
              Un refugio en el corazón de Michoacán
            </h2>
            <p className="ns-historia__parrafo">
              Hotel Quinta Dalam no es solo un lugar de descanso, es un homenaje
              a la riqueza cultural de nuestro estado. Cada habitación lleva el
              nombre de un municipio michoacano y está decorada con artesanías
              locales, tejidos purépechas y maderas talladas.
            </p>
            <p className="ns-historia__parrafo">
              Inspirados en los pueblos mágicos de Michoacán, creamos un espacio
              donde la arquitectura tradicional se funde con el confort moderno,
              para que cada estancia sea una experiencia auténtica e
              irrepetible.
            </p>
            <div className="ns-historia__tags">
              <span className="ns-tag">🏺 Arte purépecha</span>
              <span className="ns-tag">🌿 Entorno natural</span>
              <span className="ns-tag">🍽️ Cocina tradicional</span>
            </div>
          </div>
          <div className="ns-historia__img-wrap">
            <img
              src="./img/habitaciones/fachada-quinta-dalam.jpg"
              alt="Fachada Hotel Quinta Dalam"
              onError={(e) => {
                e.target.src =
                  "https://via.placeholder.com/600x450/e0d5c1/8c5a35?text=Hotel+Quinta+Dalam";
              }}
            />
            <div className="ns-historia__img-badge">🏨 Hotel Boutique</div>
          </div>
        </div>
      </section>

      {/* Estadisticas */}
      <section className="ns-stats">
        <div className="ns-stats__inner">
          <div className="ns-stat">
            <span className="ns-stat__icono">🏨</span>
            <span className="ns-stat__numero">
              <ContadorAnimado objetivo={5} sufijo="+" />
            </span>
            <span className="ns-stat__label">Años de Trayectoria</span>
          </div>
          <div className="ns-stat__divisor"></div>
          <div className="ns-stat">
            <span className="ns-stat__icono">🛏️</span>
            <span className="ns-stat__numero">
              <ContadorAnimado objetivo={13} />
            </span>
            <span className="ns-stat__label">Habitaciones Únicas</span>
          </div>
          <div className="ns-stat__divisor"></div>
          <div className="ns-stat">
            <span className="ns-stat__icono">😊</span>
            <span className="ns-stat__numero">
              <ContadorAnimado objetivo={500} sufijo="+" />
            </span>
            <span className="ns-stat__label">Huéspedes Satisfechos</span>
          </div>
          <div className="ns-stat__divisor"></div>
          <div className="ns-stat">
            <span className="ns-stat__icono">⭐</span>
            <span className="ns-stat__numero">
              <ContadorAnimado objetivo={4.9} sufijo="/5" decimales={1} />
            </span>
            <span className="ns-stat__label">Calificación Promedio</span>
          </div>
        </div>
      </section>

      {/* Mision y Vision */}
      <section className="ns-mision">
        <div className="ns-mision__header">
          <h2 className="ns-mision__titulo">Lo que nos guía</h2>
          <p className="ns-mision__subtitulo">
            Los principios que dan vida a cada habitación, servicio y sonrisa en
            Quinta Dalam.
          </p>
        </div>
        <div className="ns-mision__grid">
          <div className="ns-mv-card">
            <span className="ns-mv-card__icono">🎯</span>
            <h3 className="ns-mv-card__titulo">Nuestra Misión</h3>
            <p className="ns-mv-card__texto">
              Brindar una experiencia de hospitalidad auténtica que celebre la
              riqueza cultural de Michoacán, ofreciendo espacios temáticos que
              cuentan la historia de nuestros pueblos y hacen sentir a cada
              huésped en casa.
            </p>
          </div>
          <div className="ns-mv-card">
            <span className="ns-mv-card__icono">👁️</span>
            <h3 className="ns-mv-card__titulo">Nuestra Visión</h3>
            <p className="ns-mv-card__texto">
              Ser reconocidos como el hotel boutique referente de la región por
              nuestra excelencia en servicio y el rescate de la identidad
              purépecha, consolidándonos como destino cultural de talla nacional
              para el 2030.
            </p>
          </div>
        </div>
      </section>

      {/* Valores con sus pilares */}
      <div className="ns-valores">
        <div className="ns-valores__inner">
          <h2 className="ns-valores__titulo">Nuestros Pilares</h2>
          <p className="ns-valores__subtitulo">
            Los valores que definen cada decisión y cada interacción en nuestro
            hotel.
          </p>
          <div className="ns-valores__grid">
            {[
              {
                icono: "🤝",
                titulo: "Calidez",
                texto:
                  "Nuestra atención personalizada refleja el alma michoacana. Cada huésped es familia.",
              },
              {
                icono: "🎨",
                titulo: "Cultura",
                texto:
                  "Cada habitación cuenta la historia de un pueblo. El arte local vive en cada detalle.",
              },
              {
                icono: "⭐",
                titulo: "Calidad",
                texto:
                  "Excelencia en servicio avalada por los más altos estándares y la opinión de nuestros huéspedes.",
              },
              {
                icono: "🌿",
                titulo: "Sustentabilidad",
                texto:
                  "Comprometidos con el medio ambiente y las prácticas responsables de nuestra comunidad.",
              },
              {
                icono: "🔒",
                titulo: "Confianza",
                texto:
                  "Tu seguridad y privacidad son nuestra prioridad en cada momento de tu estadía.",
              },
            ].map((v, i) => (
              <div key={i} className="ns-valor">
                <span className="ns-valor__icono">{v.icono}</span>
                <h4 className="ns-valor__titulo">{v.titulo}</h4>
                <p className="ns-valor__texto">{v.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Nuestro equipo */}
      <section className="ns-equipo">
        <div className="ns-equipo__header">
          <h2 className="ns-equipo__titulo">El Equipo detrás de la Magia</h2>
          <p className="ns-equipo__subtitulo">
            Personas apasionadas por Michoacán y por hacer tu estadía
            inolvidable.
          </p>
        </div>
        <div className="ns-equipo__grid">
          {equipo.map((m, i) => (
            <div key={i} className="ns-miembro">
              <div className="ns-miembro__avatar-wrap">
                <div
                  className="ns-miembro__avatar"
                  style={{ backgroundColor: m.color }}
                >
                  {m.iniciales}
                </div>
              </div>
              <div className="ns-miembro__info">
                <h3 className="ns-miembro__nombre">{m.nombre}</h3>
                <p className="ns-miembro__cargo">{m.cargo}</p>
                <p className="ns-miembro__bio">{m.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/*CTA FINAL*/}
      <div className="cta-final-wrap">
        <div className="cta-final-box">
          <h2 className="cta-final-box__titulo">
            ¿Listo para vivir la experiencia?
          </h2>
          <p className="cta-final-box__desc">
            Ahora que nos conoces mejor, te invitamos a ser parte de nuestra
            historia. Reserva tu habitación y descubre Michoacán como nunca
            antes.
          </p>
          <a href="reservaciones.html" className="btn-cta-final">
            Reservar mi Estancia
          </a>
        </div>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root-nosotros"));
root.render(<PaginaNosotros />);
