const { useState, useEffect, useCallback, useRef } = React;

const API_BASE = "/Hotel-quinta-dalam/api";
const API_USUARIOS = API_BASE + "/usuarios/listar.php";
const API_USUARIOS_NEW = API_BASE + "/usuarios/crear.php";
const API_RESERVAS = API_BASE + "/reservaciones/listar.php";
const API_HABITACIONES = API_BASE + "/habitaciones/listar.php";
const API_HAB_UPDATE = API_BASE + "/habitaciones/actualizar.php";
const API_CANCELAR = API_BASE + "/reservaciones/cancelar.php";
const API_CONFIRMAR = API_BASE + "/reservaciones/confirmar.php";
const API_CREAR_MANUAL = API_BASE + "/reservaciones/crear-manual.php";

const isMobile = () => window.innerWidth <= 768;
const iniciales = (n) =>
  n
    ? n
        .split(" ")
        .map((x) => x[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";
const fmt = (n) =>
  "$" + Number(n).toLocaleString("es-MX", { minimumFractionDigits: 2 });
const fmtFecha = (f) => (f ? f.split("-").reverse().join("/") : "—");
const toast = {
  ok: (m) => window.QDToast?.exito(m),
  err: (m) => window.QDToast?.error(m),
  info: (m) => window.QDToast?.info(m),
  av: (m) => window.QDToast?.aviso(m),
};

const colorEstado = (e) =>
  ({
    activa: "green",
    confirmada: "blue",
    pendiente: "yellow",
    cancelada: "red",
    completada: "blue",
    expirada: "red",
    disponible: "green",
    ocupada: "red",
    mantenimiento: "yellow",
    inactiva: "red",
    activo: "green",
    inactivo: "red",
  })[e] || "brown";

//  ESTILOS BASE COMPARTIDOS
const S = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,8,2,0.72)",
    zIndex: 9000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    paddingLeft: "calc(var(--sw) + 20px)", // ← fix sidebar
    overflowY: "auto",
    backdropFilter: "blur(3px)",
  },
  card: {
    background: "#fff",
    borderRadius: "20px",
    padding: "36px",
    maxWidth: "560px",
    width: "100%",
    boxShadow: "0 28px 70px rgba(0,0,0,0.22)",
    maxHeight: "90vh",
    overflowY: "auto",
    animation: "fadeInUp 0.3s ease",
  },
  inp: {
    fontFamily: "'Lato',sans-serif",
    fontSize: "0.9rem",
    padding: "11px 14px",
    borderRadius: "9px",
    border: "1.5px solid #e0d8cf",
    width: "100%",
    outline: "none",
    boxSizing: "border-box",
    background: "#fdfaf7",
    transition: "border-color 0.2s,box-shadow 0.2s",
  },
  lbl: {
    fontFamily: "'Lato',sans-serif",
    fontSize: "0.72rem",
    fontWeight: 700,
    color: "#5a4a3a",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    display: "block",
    marginBottom: "5px",
  },
  err: {
    fontFamily: "'Lato',sans-serif",
    fontSize: "0.75rem",
    color: "#e74c3c",
    marginTop: "4px",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
    marginBottom: "16px",
  },
  mb: { marginBottom: "16px" },
  btnPrimary: {
    padding: "12px 24px",
    borderRadius: "9px",
    border: "none",
    cursor: "pointer",
    fontFamily: "'Lato',sans-serif",
    fontWeight: 700,
    fontSize: "0.9rem",
    color: "#fff",
    background: "linear-gradient(135deg,#8c5a35,#6b3a1f)",
    transition: "all 0.2s ease",
    boxShadow: "0 4px 14px rgba(140,90,53,0.3)",
  },
  btnSecondary: {
    padding: "12px 24px",
    borderRadius: "9px",
    border: "1.5px solid #d4c5b5",
    background: "none",
    cursor: "pointer",
    fontFamily: "'Lato',sans-serif",
    fontWeight: 700,
    fontSize: "0.9rem",
    color: "#7a5c3e",
    transition: "all 0.2s ease",
  },
  btnDanger: {
    padding: "12px 24px",
    borderRadius: "9px",
    border: "none",
    cursor: "pointer",
    fontFamily: "'Lato',sans-serif",
    fontWeight: 700,
    fontSize: "0.9rem",
    color: "#fff",
    background: "linear-gradient(135deg,#c0392b,#e74c3c)",
    transition: "all 0.2s ease",
  },
};

//SPPINER
function Spinner() {
  return (
    <div style={{ textAlign: "center", padding: "40px 20px" }}>
      <div
        style={{
          width: "36px",
          height: "36px",
          border: "3px solid rgba(140,90,53,0.15)",
          borderTopColor: "#8c5a35",
          borderRadius: "50%",
          animation: "dashSpin 0.8s linear infinite",
          margin: "0 auto 12px",
        }}
      ></div>
      <style>
        {
          "@keyframes dashSpin{to{transform:rotate(360deg)}} @keyframes fadeInUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}"
        }
      </style>
      <p
        style={{
          fontFamily: "'Lato',sans-serif",
          fontSize: "0.85rem",
          color: "#aaa",
        }}
      >
        Cargando datos...
      </p>
    </div>
  );
}

//  MODAL CONFIRMACIÓN GENÉRICO
function ModalConfirmar({
  titulo,
  mensaje,
  onConfirmar,
  onCancelar,
  confirmLabel = "Confirmar",
  peligro = false,
}) {
  return (
    <div style={S.overlay}>
      <div style={{ ...S.card, maxWidth: "420px" }}>
        <h3
          style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: "1.3rem",
            color: "#1a0d06",
            marginBottom: "12px",
          }}
        >
          {titulo}
        </h3>
        <p
          style={{
            fontFamily: "'Lato',sans-serif",
            fontSize: "0.9rem",
            color: "#666",
            lineHeight: 1.6,
            marginBottom: "28px",
          }}
        >
          {mensaje}
        </p>
        <div
          style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}
        >
          <button
            onClick={onCancelar}
            style={S.btnSecondary}
            onMouseEnter={(e) =>
              (e.target.style.background = "rgba(140,90,53,0.06)")
            }
            onMouseLeave={(e) => (e.target.style.background = "none")}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            style={peligro ? S.btnDanger : S.btnPrimary}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 6px 18px rgba(0,0,0,0.25)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "";
              e.target.style.boxShadow = "";
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

//  MODAL VER RESERVACIÓN
function ModalVerReservacion({ reservacion, onCerrar }) {
  const r = reservacion;
  return (
    <div style={S.overlay} onClick={onCerrar}>
      <div
        style={{ ...S.card, maxWidth: "480px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "20px",
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: "1.4rem",
                color: "#1a0d06",
                marginBottom: "4px",
              }}
            >
              📋 Detalle de Reservación
            </h2>
            <p
              style={{
                fontFamily: "'Lato',sans-serif",
                fontSize: "0.8rem",
                color: "#aaa",
              }}
            >
              {r.codigo}
            </p>
          </div>
          <span
            className={`dash-badge ${colorEstado(r.estado)}`}
            style={{ fontSize: "0.8rem" }}
          >
            {r.estado}
          </span>
        </div>

        <div
          style={{
            background: "linear-gradient(135deg,#2a1206,#6b3a1f)",
            borderRadius: "12px",
            padding: "16px 20px",
            marginBottom: "20px",
            color: "#fff",
            fontFamily: "'Lato',sans-serif",
            fontSize: "0.88rem",
            lineHeight: 1.8,
          }}
        >
          <p
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: "1rem",
              color: "#e8c98a",
              fontWeight: 700,
              marginBottom: "6px",
            }}
          >
            🛏️ {r.habitacion_numero} — {r.habitacion_nombre}
          </p>
          <p>
            📅 {fmtFecha(r.fecha_entrada)} → {fmtFecha(r.fecha_salida)} (
            {r.noches} noche{r.noches !== 1 ? "s" : ""})
          </p>
          <p>
            👥 {r.num_huespedes} huésped{r.num_huespedes !== 1 ? "es" : ""}
          </p>
          <p style={{ fontSize: "1.1rem", fontWeight: 700, marginTop: "8px" }}>
            {fmt(r.total)} MXN
          </p>
        </div>

        <div
          style={{
            fontFamily: "'Lato',sans-serif",
            fontSize: "0.88rem",
            color: "#555",
            lineHeight: 2,
          }}
        >
          <p>
            <strong>Huésped:</strong> {r.huesped_nombre || "—"}
          </p>
          <p>
            <strong>Correo:</strong> {r.huesped_correo || "—"}
          </p>
          <p>
            <strong>Tipo habitación:</strong> {r.habitacion_tipo}
          </p>
          <p>
            <strong>Precio por noche:</strong> {fmt(r.precio_noche)}
          </p>
          {r.notas && (
            <p>
              <strong>Notas:</strong> {r.notas}
            </p>
          )}
          <p>
            <strong>Creada:</strong>{" "}
            {r.created_at ? r.created_at.split(" ")[0] : "—"}
          </p>
        </div>

        <div
          style={{
            marginTop: "24px",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={onCerrar}
            style={S.btnPrimary}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "";
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
//  MODAL NUEVA HABITACIÓN / EDITAR HABITACIÓN
function ModalHabitacion({ habitacion, onGuardar, onCerrar }) {
  const esEditar = !!habitacion;
  const [form, setForm] = useState({
    numero: habitacion?.numero || "",
    nombre: habitacion?.nombre || "",
    tipo: habitacion?.tipo || "Estándar",
    precio_noche: habitacion?.precio_noche || "",
    capacidad: habitacion?.capacidad || 2,
    descripcion: habitacion?.descripcion || "",
    estado: habitacion?.estado || "disponible",
  });
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [focusedField, setFocused] = useState(null);

  const tipos = [
    "Estándar",
    "Familiar",
    "Suite",
    "Suite Deluxe",
    "Suite Presidencial",
    "Ejecutiva",
    "Master Familiar",
  ];
  const estados = ["disponible", "ocupada", "mantenimiento", "inactiva"];

  function validar() {
    const e = {};
    if (!esEditar && !form.numero.trim()) e.numero = "Obligatorio.";
    if (!form.nombre.trim()) e.nombre = "Obligatorio.";
    if (!form.precio_noche || parseFloat(form.precio_noche) <= 0)
      e.precio_noche = "Debe ser mayor a 0.";
    if (!form.capacidad || parseInt(form.capacidad) < 1)
      e.capacidad = "Mínimo 1.";
    return e;
  }

  async function handleGuardar() {
    const e = validar();
    if (Object.keys(e).length > 0) {
      setErrores(e);
      return;
    }
    setGuardando(true);
    try {
      const metodo = esEditar ? "PUT" : "POST";
      const payload = esEditar
        ? {
            id: habitacion.id,
            ...form,
            precio_noche: parseFloat(form.precio_noche),
            capacidad: parseInt(form.capacidad),
          }
        : {
            ...form,
            precio_noche: parseFloat(form.precio_noche),
            capacidad: parseInt(form.capacidad),
          };

      const res = await fetch(API_HAB_UPDATE, {
        method: metodo,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.ok) {
        toast.err(data.mensaje || "Error.");
        return;
      }
      toast.ok(
        esEditar
          ? "✅ Habitación actualizada."
          : `✅ Habitación ${form.nombre} creada.`,
      );
      onGuardar();
    } catch {
      toast.err("Error de conexión.");
    } finally {
      setGuardando(false);
    }
  }

  const inpStyle = (campo) => ({
    ...S.inp,
    borderColor: errores[campo]
      ? "#e74c3c"
      : focusedField === campo
        ? "#8c5a35"
        : "#e0d8cf",
    boxShadow:
      focusedField === campo ? "0 0 0 3px rgba(140,90,53,0.12)" : "none",
  });

  return (
    <div style={S.overlay} onClick={onCerrar}>
      <div style={S.card} onClick={(e) => e.stopPropagation()}>
        <h2
          style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: "1.5rem",
            color: "#1a0d06",
            marginBottom: "6px",
          }}
        >
          {esEditar ? "✏️ Editar Habitación" : "🛏️ Nueva Habitación"}
        </h2>
        <p
          style={{
            fontFamily: "'Lato',sans-serif",
            fontSize: "0.85rem",
            color: "#aaa",
            marginBottom: "24px",
          }}
        >
          {esEditar
            ? `Editando: ${habitacion.nombre} (Hab. ${habitacion.numero})`
            : "Completa los datos de la nueva habitación"}
        </p>

        <div style={S.row}>
          {!esEditar && (
            <div>
              <label style={S.lbl}>Número *</label>
              <input
                style={inpStyle("numero")}
                value={form.numero}
                placeholder="ej. 301"
                onFocus={() => setFocused("numero")}
                onBlur={() => setFocused(null)}
                onChange={(e) => {
                  setForm({ ...form, numero: e.target.value });
                  setErrores({ ...errores, numero: null });
                }}
              />
              {errores.numero && <p style={S.err}>⚠ {errores.numero}</p>}
            </div>
          )}
          <div style={esEditar ? { gridColumn: "1/-1" } : {}}>
            <label style={S.lbl}>Nombre / Temática *</label>
            <input
              style={inpStyle("nombre")}
              value={form.nombre}
              placeholder="ej. Tzintzuntzan"
              onFocus={() => setFocused("nombre")}
              onBlur={() => setFocused(null)}
              onChange={(e) => {
                setForm({ ...form, nombre: e.target.value });
                setErrores({ ...errores, nombre: null });
              }}
            />
            {errores.nombre && <p style={S.err}>⚠ {errores.nombre}</p>}
          </div>
        </div>

        <div style={S.row}>
          <div>
            <label style={S.lbl}>Tipo *</label>
            <select
              style={{
                ...S.inp,
                borderColor: focusedField === "tipo" ? "#8c5a35" : "#e0d8cf",
              }}
              value={form.tipo}
              onFocus={() => setFocused("tipo")}
              onBlur={() => setFocused(null)}
              onChange={(e) => setForm({ ...form, tipo: e.target.value })}
            >
              {tipos.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={S.lbl}>Estado</label>
            <select
              style={{
                ...S.inp,
                borderColor: focusedField === "estado" ? "#8c5a35" : "#e0d8cf",
              }}
              value={form.estado}
              onFocus={() => setFocused("estado")}
              onBlur={() => setFocused(null)}
              onChange={(e) => setForm({ ...form, estado: e.target.value })}
            >
              {estados.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={S.row}>
          <div>
            <label style={S.lbl}>Precio por Noche (MXN) *</label>
            <input
              type="number"
              style={inpStyle("precio_noche")}
              value={form.precio_noche}
              placeholder="ej. 1200"
              min="1"
              onFocus={() => setFocused("precio_noche")}
              onBlur={() => setFocused(null)}
              onChange={(e) => {
                setForm({ ...form, precio_noche: e.target.value });
                setErrores({ ...errores, precio_noche: null });
              }}
            />
            {errores.precio_noche && (
              <p style={S.err}>⚠ {errores.precio_noche}</p>
            )}
          </div>
          <div>
            <label style={S.lbl}>Capacidad (personas) *</label>
            <input
              type="number"
              style={inpStyle("capacidad")}
              value={form.capacidad}
              min="1"
              max="12"
              onFocus={() => setFocused("capacidad")}
              onBlur={() => setFocused(null)}
              onChange={(e) => {
                setForm({ ...form, capacidad: e.target.value });
                setErrores({ ...errores, capacidad: null });
              }}
            />
            {errores.capacidad && <p style={S.err}>⚠ {errores.capacidad}</p>}
          </div>
        </div>

        <div style={S.mb}>
          <label style={S.lbl}>Descripción (opcional)</label>
          <textarea
            style={{
              ...S.inp,
              minHeight: "70px",
              resize: "vertical",
              borderColor:
                focusedField === "descripcion" ? "#8c5a35" : "#e0d8cf",
              boxShadow:
                focusedField === "descripcion"
                  ? "0 0 0 3px rgba(140,90,53,0.12)"
                  : "none",
            }}
            value={form.descripcion}
            placeholder="Vista al lago, balcón privado, 45m²..."
            onFocus={() => setFocused("descripcion")}
            onBlur={() => setFocused(null)}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
          />
        </div>

        {esEditar && form.estado === "inactiva" && (
          <div
            style={{
              background: "#fff3cd",
              border: "1px solid #ffc107",
              borderRadius: "8px",
              padding: "10px 14px",
              marginBottom: "16px",
              fontFamily: "'Lato',sans-serif",
              fontSize: "0.82rem",
              color: "#856404",
            }}
          >
            ⚠️ Al marcar como "inactiva", la habitación desaparecerá del
            catálogo en línea pero su historial de reservaciones se conservará.
          </div>
        )}

        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "flex-end",
            marginTop: "8px",
          }}
        >
          <button
            onClick={onCerrar}
            style={S.btnSecondary}
            disabled={guardando}
            onMouseEnter={(e) =>
              (e.target.style.background = "rgba(140,90,53,0.06)")
            }
            onMouseLeave={(e) => (e.target.style.background = "none")}
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={guardando}
            style={{ ...S.btnPrimary, opacity: guardando ? 0.7 : 1 }}
            onMouseEnter={(e) => {
              if (!guardando) {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 18px rgba(140,90,53,0.4)";
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "";
              e.target.style.boxShadow = "0 4px 14px rgba(140,90,53,0.3)";
            }}
          >
            {guardando
              ? "⏳ Guardando..."
              : esEditar
                ? "💾 Guardar Cambios"
                : "✅ Crear Habitación"}
          </button>
        </div>
      </div>
    </div>
  );
}

//  MODAL NUEVO USUARIO

function ModalNuevoUsuario({ onGuardar, onCerrar }) {
  const [form, setForm] = useState({
    nombre: "",
    correo: "",
    contrasena: "",
    telefono: "",
    rol: "cliente",
  });
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [focusedField, setFocused] = useState(null);

  function validar() {
    const e = {};
    if (!form.nombre.trim() || form.nombre.trim().length < 3)
      e.nombre = "Mínimo 3 caracteres.";
    if (!form.correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo))
      e.correo = "Correo inválido.";
    if (!form.contrasena || form.contrasena.length < 8)
      e.contrasena = "Mínimo 8 caracteres.";
    return e;
  }

  async function handleGuardar() {
    const e = validar();
    if (Object.keys(e).length > 0) {
      setErrores(e);
      return;
    }
    setGuardando(true);
    try {
      const res = await fetch(API_USUARIOS_NEW, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.ok) {
        if (data.errores) setErrores(data.errores);
        else toast.err(data.mensaje || "Error al crear.");
        return;
      }
      toast.ok(`✅ Usuario ${form.nombre} creado correctamente.`);
      onGuardar();
    } catch {
      toast.err("Error de conexión.");
    } finally {
      setGuardando(false);
    }
  }

  const inpStyle = (campo) => ({
    ...S.inp,
    borderColor: errores[campo]
      ? "#e74c3c"
      : focusedField === campo
        ? "#8c5a35"
        : "#e0d8cf",
    boxShadow:
      focusedField === campo ? "0 0 0 3px rgba(140,90,53,0.12)" : "none",
  });

  return (
    <div style={S.overlay} onClick={onCerrar}>
      <div
        style={{ ...S.card, maxWidth: "480px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: "1.5rem",
            color: "#1a0d06",
            marginBottom: "6px",
          }}
        >
          👤 Nuevo Usuario
        </h2>
        <p
          style={{
            fontFamily: "'Lato',sans-serif",
            fontSize: "0.85rem",
            color: "#aaa",
            marginBottom: "24px",
          }}
        >
          Crea una cuenta para un huésped o miembro del equipo
        </p>

        <div style={S.row}>
          <div>
            <label style={S.lbl}>Nombre Completo *</label>
            <input
              style={inpStyle("nombre")}
              value={form.nombre}
              placeholder="Juan Pérez"
              onFocus={() => setFocused("nombre")}
              onBlur={() => setFocused(null)}
              onChange={(e) => {
                setForm({ ...form, nombre: e.target.value });
                setErrores({ ...errores, nombre: null });
              }}
            />
            {errores.nombre && <p style={S.err}>⚠ {errores.nombre}</p>}
          </div>
          <div>
            <label style={S.lbl}>Teléfono</label>
            <input
              style={inpStyle("telefono")}
              value={form.telefono}
              placeholder="10 dígitos"
              maxLength="10"
              onFocus={() => setFocused("telefono")}
              onBlur={() => setFocused(null)}
              onChange={(e) =>
                setForm({
                  ...form,
                  telefono: e.target.value.replace(/\D/g, ""),
                })
              }
            />
          </div>
        </div>

        <div style={S.mb}>
          <label style={S.lbl}>Correo Electrónico *</label>
          <input
            type="email"
            style={inpStyle("correo")}
            value={form.correo}
            placeholder="ejemplo@correo.com"
            onFocus={() => setFocused("correo")}
            onBlur={() => setFocused(null)}
            onChange={(e) => {
              setForm({ ...form, correo: e.target.value });
              setErrores({ ...errores, correo: null });
            }}
          />
          {errores.correo && <p style={S.err}>⚠ {errores.correo}</p>}
        </div>

        <div style={S.row}>
          <div>
            <label style={S.lbl}>Contraseña *</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPwd ? "text" : "password"}
                style={{ ...inpStyle("contrasena"), paddingRight: "40px" }}
                value={form.contrasena}
                placeholder="Mínimo 8 caracteres"
                onFocus={() => setFocused("contrasena")}
                onBlur={() => setFocused(null)}
                onChange={(e) => {
                  setForm({ ...form, contrasena: e.target.value });
                  setErrores({ ...errores, contrasena: null });
                }}
              />
              <button
                type="button"
                onClick={() => setShowPwd((p) => !p)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1rem",
                  color: "#888",
                }}
              >
                {showPwd ? "🙈" : "👁️"}
              </button>
            </div>
            {errores.contrasena && <p style={S.err}>⚠ {errores.contrasena}</p>}
          </div>
          <div>
            <label style={S.lbl}>Rol</label>
            <select
              style={{
                ...S.inp,
                borderColor: focusedField === "rol" ? "#8c5a35" : "#e0d8cf",
              }}
              value={form.rol}
              onFocus={() => setFocused("rol")}
              onBlur={() => setFocused(null)}
              onChange={(e) => setForm({ ...form, rol: e.target.value })}
            >
              <option value="cliente">🧳 Cliente / Huésped</option>
              <option value="recepcionista">🔑 Recepcionista</option>
              <option value="admin">🛡️ Administrador</option>
            </select>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "flex-end",
            marginTop: "8px",
          }}
        >
          <button
            onClick={onCerrar}
            style={S.btnSecondary}
            onMouseEnter={(e) =>
              (e.target.style.background = "rgba(140,90,53,0.06)")
            }
            onMouseLeave={(e) => (e.target.style.background = "none")}
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={guardando}
            style={{ ...S.btnPrimary, opacity: guardando ? 0.7 : 1 }}
            onMouseEnter={(e) => {
              if (!guardando) {
                e.target.style.transform = "translateY(-2px)";
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "";
            }}
          >
            {guardando ? "⏳ Creando..." : "✅ Crear Usuario"}
          </button>
        </div>
      </div>
    </div>
  );
}
//  MODAL RESERVACIÓN MANUAL
function ModalReservacionManual({ habitaciones, onGuardar, onCerrar }) {
  const [form, setForm] = useState({
    habitacion_id: "",
    fecha_entrada: "",
    fecha_salida: "",
    nombre_huesped: "",
    correo_huesped: "",
    num_huespedes: 1,
    metodo_pago: "efectivo",
    notas: "",
  });
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [focusedField, setFocused] = useState(null);
  const hoy = new Date().toISOString().split("T")[0];
  const habsDisp = habitaciones.filter((h) => h.estado === "disponible");
  const habSel = habitaciones.find(
    (h) => h.id === parseInt(form.habitacion_id),
  );
  const noches =
    form.fecha_entrada && form.fecha_salida
      ? Math.max(
          0,
          Math.ceil(
            (new Date(form.fecha_salida) - new Date(form.fecha_entrada)) /
              86400000,
          ),
        )
      : 0;
  const total = habSel ? habSel.precio_noche * noches : 0;

  function validar() {
    const e = {};
    if (!form.habitacion_id) e.habitacion_id = "Selecciona una habitación.";
    if (!form.fecha_entrada) e.fecha_entrada = "Obligatoria.";
    if (!form.fecha_salida) e.fecha_salida = "Obligatoria.";
    else if (noches <= 0) e.fecha_salida = "Debe ser posterior a la entrada.";
    if (!form.nombre_huesped.trim()) e.nombre_huesped = "Obligatorio.";
    return e;
  }

  async function handleGuardar() {
    const e = validar();
    if (Object.keys(e).length > 0) {
      setErrores(e);
      return;
    }
    setGuardando(true);
    try {
      const res = await fetch(API_CREAR_MANUAL, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          habitacion_id: parseInt(form.habitacion_id),
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        toast.err(data.mensaje || "Error.");
        return;
      }
      toast.ok(
        `✅ Reservación ${data.reservacion.codigo} creada. Total: ${fmt(data.reservacion.total)}`,
      );
      onGuardar();
    } catch {
      toast.err("Error de conexión.");
    } finally {
      setGuardando(false);
    }
  }

  const inpStyle = (campo) => ({
    ...S.inp,
    borderColor: errores[campo]
      ? "#e74c3c"
      : focusedField === campo
        ? "#8c5a35"
        : "#e0d8cf",
    boxShadow:
      focusedField === campo ? "0 0 0 3px rgba(140,90,53,0.12)" : "none",
  });

  return (
    <div style={S.overlay} onClick={onCerrar}>
      <div style={S.card} onClick={(e) => e.stopPropagation()}>
        <h2
          style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: "1.5rem",
            color: "#1a0d06",
            marginBottom: "6px",
          }}
        >
          🛎️ Nueva Reservación Manual
        </h2>
        <p
          style={{
            fontFamily: "'Lato',sans-serif",
            fontSize: "0.85rem",
            color: "#aaa",
            marginBottom: "24px",
          }}
        >
          Huésped en recepción — pago directo, sin Mercado Pago
        </p>

        <div style={S.mb}>
          <label style={S.lbl}>Habitación *</label>
          <select
            style={{
              ...S.inp,
              borderColor: errores.habitacion_id
                ? "#e74c3c"
                : focusedField === "hab"
                  ? "#8c5a35"
                  : "#e0d8cf",
              boxShadow:
                focusedField === "hab"
                  ? "0 0 0 3px rgba(140,90,53,0.12)"
                  : "none",
            }}
            value={form.habitacion_id}
            onFocus={() => setFocused("hab")}
            onBlur={() => setFocused(null)}
            onChange={(e) => {
              setForm({ ...form, habitacion_id: e.target.value });
              setErrores({ ...errores, habitacion_id: null });
            }}
          >
            <option value="">— Seleccionar —</option>
            {habsDisp.map((h) => (
              <option key={h.id} value={h.id}>
                {h.nombre} ({h.tipo}) — {fmt(h.precio_noche)}/noche
              </option>
            ))}
          </select>
          {errores.habitacion_id && (
            <p style={S.err}>⚠ {errores.habitacion_id}</p>
          )}
        </div>

        <div style={S.row}>
          <div>
            <label style={S.lbl}>Llegada *</label>
            <input
              type="date"
              style={inpStyle("fecha_entrada")}
              min={hoy}
              value={form.fecha_entrada}
              onFocus={() => setFocused("fecha_entrada")}
              onBlur={() => setFocused(null)}
              onChange={(e) => {
                setForm({ ...form, fecha_entrada: e.target.value });
                setErrores({ ...errores, fecha_entrada: null });
              }}
            />
            {errores.fecha_entrada && (
              <p style={S.err}>⚠ {errores.fecha_entrada}</p>
            )}
          </div>
          <div>
            <label style={S.lbl}>Salida *</label>
            <input
              type="date"
              style={inpStyle("fecha_salida")}
              min={form.fecha_entrada || hoy}
              value={form.fecha_salida}
              onFocus={() => setFocused("fecha_salida")}
              onBlur={() => setFocused(null)}
              onChange={(e) => {
                setForm({ ...form, fecha_salida: e.target.value });
                setErrores({ ...errores, fecha_salida: null });
              }}
            />
            {errores.fecha_salida && (
              <p style={S.err}>⚠ {errores.fecha_salida}</p>
            )}
          </div>
        </div>

        {habSel && noches > 0 && (
          <div
            style={{
              background: "linear-gradient(135deg,#2a1206,#6b3a1f)",
              borderRadius: "10px",
              padding: "12px 18px",
              marginBottom: "16px",
              color: "#fff",
              fontFamily: "'Lato',sans-serif",
              fontSize: "0.88rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>
              🌙 {noches} noche{noches !== 1 ? "s" : ""} ×{" "}
              {fmt(habSel.precio_noche)}
            </span>
            <strong style={{ fontSize: "1.1rem", color: "#e8c98a" }}>
              {fmt(total)}
            </strong>
          </div>
        )}

        <div style={S.row}>
          <div>
            <label style={S.lbl}>Nombre del Huésped *</label>
            <input
              style={inpStyle("nombre_huesped")}
              value={form.nombre_huesped}
              placeholder="Nombre completo"
              onFocus={() => setFocused("nombre_huesped")}
              onBlur={() => setFocused(null)}
              onChange={(e) => {
                setForm({ ...form, nombre_huesped: e.target.value });
                setErrores({ ...errores, nombre_huesped: null });
              }}
            />
            {errores.nombre_huesped && (
              <p style={S.err}>⚠ {errores.nombre_huesped}</p>
            )}
          </div>
          <div>
            <label style={S.lbl}>Correo (opcional)</label>
            <input
              type="email"
              style={inpStyle("correo_huesped")}
              value={form.correo_huesped}
              placeholder="correo@ejemplo.com"
              onFocus={() => setFocused("correo_huesped")}
              onBlur={() => setFocused(null)}
              onChange={(e) =>
                setForm({ ...form, correo_huesped: e.target.value })
              }
            />
          </div>
        </div>

        <div style={S.row}>
          <div>
            <label style={S.lbl}>N° Huéspedes</label>
            <input
              type="number"
              style={inpStyle("num_huespedes")}
              min="1"
              max="10"
              value={form.num_huespedes}
              onFocus={() => setFocused("num_huespedes")}
              onBlur={() => setFocused(null)}
              onChange={(e) =>
                setForm({
                  ...form,
                  num_huespedes: parseInt(e.target.value) || 1,
                })
              }
            />
          </div>
          <div>
            <label style={S.lbl}>Método de Pago</label>
            <select
              style={{
                ...S.inp,
                borderColor: focusedField === "metodo" ? "#8c5a35" : "#e0d8cf",
              }}
              value={form.metodo_pago}
              onFocus={() => setFocused("metodo")}
              onBlur={() => setFocused(null)}
              onChange={(e) =>
                setForm({ ...form, metodo_pago: e.target.value })
              }
            >
              <option value="efectivo">💵 Efectivo</option>
              <option value="transferencia">🏦 Transferencia SPEI</option>
              <option value="tarjeta">💳 Tarjeta en Terminal</option>
              <option value="otro">📋 Otro</option>
            </select>
          </div>
        </div>

        <div style={S.mb}>
          <label style={S.lbl}>Notas especiales (opcional)</label>
          <textarea
            style={{
              ...S.inp,
              minHeight: "60px",
              resize: "vertical",
              borderColor: focusedField === "notas" ? "#8c5a35" : "#e0d8cf",
              boxShadow:
                focusedField === "notas"
                  ? "0 0 0 3px rgba(140,90,53,0.12)"
                  : "none",
            }}
            placeholder="Ej: aniversario, llegada tardía, cama extra..."
            value={form.notas}
            onFocus={() => setFocused("notas")}
            onBlur={() => setFocused(null)}
            onChange={(e) => setForm({ ...form, notas: e.target.value })}
          />
        </div>

        <div
          style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}
        >
          <button
            onClick={() => {
              toast.info("Reservación cancelada. Los datos fueron limpiados.");
              onCerrar();
            }}
            style={S.btnSecondary}
            onMouseEnter={(e) =>
              (e.target.style.background = "rgba(140,90,53,0.06)")
            }
            onMouseLeave={(e) => (e.target.style.background = "none")}
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={guardando}
            style={{ ...S.btnPrimary, opacity: guardando ? 0.7 : 1 }}
            onMouseEnter={(e) => {
              if (!guardando) {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 18px rgba(140,90,53,0.4)";
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "";
              e.target.style.boxShadow = "0 4px 14px rgba(140,90,53,0.3)";
            }}
          >
            {guardando ? "⏳ Creando..." : "✅ Crear Reservación"}
          </button>
        </div>
      </div>
    </div>
  );
}
//  BOTONES DE ACCIÓN ANIMADOS
function BtnAccion({ icono, label, color, onClick, disabled }) {
  const [hover, setHover] = useState(false);
  const colores = {
    ver: {
      bg: "rgba(37,99,235,0.08)",
      border: "rgba(37,99,235,0.25)",
      hbg: "rgba(37,99,235,0.16)",
    },
    editar: {
      bg: "rgba(217,119,6,0.08)",
      border: "rgba(217,119,6,0.25)",
      hbg: "rgba(217,119,6,0.16)",
    },
    cancelar: {
      bg: "rgba(239,68,68,0.08)",
      border: "rgba(239,68,68,0.25)",
      hbg: "rgba(239,68,68,0.16)",
    },
    pagar: {
      bg: "rgba(39,174,96,0.08)",
      border: "rgba(39,174,96,0.25)",
      hbg: "rgba(39,174,96,0.16)",
    },
  };
  const c = colores[color] || colores.ver;
  return (
    <button
      title={label}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: "32px",
        height: "32px",
        borderRadius: "8px",
        border: `1.5px solid ${hover ? c.border : "transparent"}`,
        background: hover ? c.hbg : c.bg,
        cursor: disabled ? "not-allowed" : "pointer",
        fontSize: "1rem",
        transition: "all 0.18s ease",
        transform: hover ? "scale(1.12)" : "scale(1)",
        opacity: disabled ? 0.4 : 1,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {icono}
    </button>
  );
}
//  TABLA RESERVACIONES
function TablaReservaciones({
  limite,
  datos,
  cargando,
  onRecargar,
  irSeccion,
}) {
  const [confirmando, setConfirmando] = useState(null);
  const [viendoRes, setViendoRes] = useState(null);
  const [filtro, setFiltro] = useState("activas");

  // 'activas' = pendiente/confirmada/activa
  // 'todas'   = muestra todo
  const datosFiltrados =
    filtro === "activas"
      ? datos.filter((r) => !["cancelada", "completada"].includes(r.estado))
      : datos;
  const filas = limite ? datosFiltrados.slice(0, limite) : datosFiltrados;

  async function handleCancelar(r) {
    try {
      const res = await fetch(API_CANCELAR, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reservacion_id: r.id }),
      });
      const data = await res.json();
      if (!data.ok) {
        toast.err(data.mensaje);
        return;
      }
      toast.ok("Reservación cancelada y habitación liberada.");
      onRecargar();
    } catch {
      toast.err("Error de conexión.");
    }
    setConfirmando(null);
  }

  async function handleConfirmarPago(r) {
    try {
      const res = await fetch(API_CONFIRMAR, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reservacion_id: r.id, metodo: "efectivo" }),
      });
      const data = await res.json();
      if (!data.ok) {
        toast.err(data.mensaje);
        return;
      }
      toast.ok("✅ Pago en efectivo confirmado.");
      onRecargar();
    } catch {
      toast.err("Error de conexión.");
    }
    setConfirmando(null);
  }

  return (
    <>
      {viendoRes && (
        <ModalVerReservacion
          reservacion={viendoRes}
          onCerrar={() => setViendoRes(null)}
        />
      )}
      {confirmando?.tipo === "cancelar" && (
        <ModalConfirmar
          titulo="¿Cancelar reservación?"
          mensaje={`Se cancelará ${confirmando.r.codigo} y la habitación quedará disponible.`}
          confirmLabel="Sí, cancelar"
          peligro={true}
          onConfirmar={() => handleCancelar(confirmando.r)}
          onCancelar={() => setConfirmando(null)}
        />
      )}
      {confirmando?.tipo === "confirmar" && (
        <ModalConfirmar
          titulo="¿Confirmar pago en efectivo?"
          mensaje={`Se registrará el pago de ${fmt(confirmando.r.total)} para ${confirmando.r.codigo}.`}
          confirmLabel="Confirmar pago"
          onConfirmar={() => handleConfirmarPago(confirmando.r)}
          onCancelar={() => setConfirmando(null)}
        />
      )}

      <div className="dash-table-card">
        <div className="dash-table-header">
          <div>
            <h2>📋 Reservaciones {limite ? "Recientes" : ""}</h2>
            <p>
              {cargando
                ? "Cargando..."
                : `${datosFiltrados.length} reservación${datosFiltrados.length !== 1 ? "es" : ""} mostrando`}
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {limite && (
              <button
                className="dash-btn-small outline"
                onClick={() => irSeccion("reservaciones")}
              >
                Ver todas
              </button>
            )}
            <button
              className="dash-btn-small outline"
              onClick={() =>
                setFiltro((p) => (p === "activas" ? "todas" : "activas"))
              }
            >
              {filtro === "activas"
                ? `+ Ver canceladas (${datos.filter((r) => r.estado === "cancelada").length})`
                : "✕ Ocultar canceladas"}
            </button>
          </div>
        </div>

        {!cargando &&
          datosFiltrados.filter((r) => r.estado === "pendiente").length > 0 && (
            <div
              style={{
                margin: "0 0 12px",
                padding: "10px 16px",
                background: "#fff3cd",
                borderRadius: "8px",
                border: "1px solid #ffc107",
                fontFamily: "'Lato',sans-serif",
                fontSize: "0.85rem",
                color: "#856404",
              }}
            >
              ⏳ {datosFiltrados.filter((r) => r.estado === "pendiente").length}{" "}
              reservación(es) pendiente(s). Se liberan en 15 min o confírmalas
              con 💵.
            </div>
          )}

        {cargando ? (
          <Spinner />
        ) : (
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Huésped</th>
                  <th>Habitación</th>
                  <th>Entrada</th>
                  <th>Salida</th>
                  <th>Estado</th>
                  <th>Total</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filas.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      style={{
                        textAlign: "center",
                        color: "#aaa",
                        padding: "30px",
                        fontFamily: "'Lato',sans-serif",
                      }}
                    >
                      No hay reservaciones para mostrar
                    </td>
                  </tr>
                ) : (
                  filas.map((r) => (
                    <tr
                      key={r.id}
                      style={
                        r.estado === "pendiente"
                          ? { background: "#fffbeb" }
                          : {}
                      }
                    >
                      <td>
                        <strong>{r.codigo}</strong>
                      </td>
                      <td>{r.huesped_nombre || "—"}</td>
                      <td>
                        {r.habitacion_numero} — {r.habitacion_nombre}
                      </td>
                      <td>{fmtFecha(r.fecha_entrada)}</td>
                      <td>{fmtFecha(r.fecha_salida)}</td>
                      <td>
                        <span className={`dash-badge ${colorEstado(r.estado)}`}>
                          {r.estado}
                        </span>
                      </td>
                      <td>
                        <strong>{fmt(r.total)}</strong>
                      </td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            gap: "6px",
                            alignItems: "center",
                          }}
                        >
                          <BtnAccion
                            icono="👁️"
                            label="Ver detalle"
                            color="ver"
                            onClick={() => setViendoRes(r)}
                          />
                          {r.estado === "pendiente" && (
                            <BtnAccion
                              icono="💵"
                              label="Confirmar pago efectivo"
                              color="pagar"
                              onClick={() =>
                                setConfirmando({ tipo: "confirmar", r })
                              }
                            />
                          )}
                          {!["cancelada", "completada"].includes(r.estado) && (
                            <BtnAccion
                              icono="🚫"
                              label="Cancelar"
                              color="cancelar"
                              onClick={() =>
                                setConfirmando({ tipo: "cancelar", r })
                              }
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
// TABBLA USUARIOS
function TablaUsuarios({ limite, datos, cargando, onNuevoUsuario, irSeccion }) {
  const filas = limite ? datos.slice(0, limite) : datos;
  return (
    <div className="dash-table-card">
      <div className="dash-table-header">
        <div>
          <h2>👥 Usuarios {limite ? "Recientes" : ""}</h2>
          <p>
            {cargando
              ? "Cargando..."
              : `${datos.length} usuario${datos.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {limite && (
            <button
              className="dash-btn-small outline"
              onClick={() => irSeccion("usuarios")}
            >
              Ver todos
            </button>
          )}
          <button className="dash-btn-small filled" onClick={onNuevoUsuario}>
            + Añadir
          </button>
        </div>
      </div>
      {cargando ? (
        <Spinner />
      ) : (
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filas.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    style={{
                      textAlign: "center",
                      color: "#aaa",
                      padding: "30px",
                      fontFamily: "'Lato',sans-serif",
                    }}
                  >
                    Sin usuarios
                  </td>
                </tr>
              ) : (
                filas.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="dash-user-cell">
                        <div className="dash-user-mini-avatar">
                          {iniciales(u.nombre)}
                        </div>
                        <div>
                          <div className="dash-user-cell-name">{u.nombre}</div>
                          <div className="dash-user-cell-email">{u.correo}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`dash-badge ${u.rol === "admin" ? "brown" : u.rol === "recepcionista" ? "yellow" : "blue"}`}
                      >
                        {u.rol === "admin"
                          ? "🛡️ Admin"
                          : u.rol === "recepcionista"
                            ? "🔑 Recep."
                            : "🧳 Cliente"}
                      </span>
                    </td>
                    <td>
                      <span className={`dash-badge ${colorEstado(u.estado)}`}>
                        {u.estado}
                      </span>
                    </td>
                    <td>{u.created_at ? u.created_at.split(" ")[0] : "—"}</td>
                    <td>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <BtnAccion
                          icono="👁️"
                          label="Ver usuario"
                          color="ver"
                          onClick={() =>
                            toast.info(`${u.nombre} — ${u.correo} — ${u.rol}`)
                          }
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
//  SECCIÓN HABITACIONES CON CRUD COMPLETO (solo admin)
function SeccionHabitaciones({ datos, cargando, onRecargar, onNuevaHab, rol }) {
  const [confirmando, setConfirmando] = useState(null);
  const [editandoHab, setEditandoHab] = useState(null);

  async function handleDesactivar(h) {
    try {
      const res = await fetch(API_HAB_UPDATE, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: h.id, estado: "inactiva" }),
      });
      const data = await res.json();
      if (!data.ok) {
        toast.err(data.mensaje);
        return;
      }
      toast.ok(`Habitación ${h.nombre} desactivada del catálogo.`);
      onRecargar();
    } catch {
      toast.err("Error de conexión.");
    }
    setConfirmando(null);
  }

  return (
    <div className="dash-section-full">
      {editandoHab !== undefined &&
        editandoHab !== "nueva" &&
        editandoHab !== null && (
          <ModalHabitacion
            habitacion={editandoHab}
            onGuardar={() => {
              setEditandoHab(null);
              onRecargar();
            }}
            onCerrar={() => setEditandoHab(null)}
          />
        )}
      {editandoHab === "nueva" && (
        <ModalHabitacion
          habitacion={null}
          onGuardar={() => {
            setEditandoHab(null);
            onRecargar();
          }}
          onCerrar={() => setEditandoHab(null)}
        />
      )}
      {confirmando?.tipo === "desactivar" && (
        <ModalConfirmar
          titulo={`¿Desactivar habitación ${confirmando.h.nombre}?`}
          mensaje="La habitación desaparecerá del catálogo en línea pero su historial de reservaciones se conservará intacto."
          confirmLabel="Sí, desactivar"
          peligro={true}
          onConfirmar={() => handleDesactivar(confirmando.h)}
          onCancelar={() => setConfirmando(null)}
        />
      )}
      <div className="dash-table-card">
        <div className="dash-table-header">
          <div>
            <h2>🛏️ Habitaciones</h2>
            <p>
              {cargando
                ? "Cargando..."
                : `${datos.length} habitaciones — Pueblos Mágicos de Michoacán`}
            </p>
          </div>
          {rol === "admin" && (
            <button
              className="dash-btn-small filled"
              onClick={() => setEditandoHab("nueva")}
            >
              + Nueva Habitación
            </button>
          )}
        </div>
        {cargando ? (
          <Spinner />
        ) : (
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>Capacidad</th>
                  <th>Precio/Noche</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {datos.map((h) => (
                  <tr key={h.id}>
                    <td>
                      <strong>{h.numero}</strong>
                    </td>
                    <td>
                      <strong>{h.nombre}</strong>
                    </td>
                    <td
                      style={{
                        fontSize: "0.8rem",
                        color: "#888",
                        fontFamily: "'Lato',sans-serif",
                      }}
                    >
                      {h.tipo}
                    </td>
                    <td>{h.capacidad} personas</td>
                    <td>
                      <strong>{fmt(h.precio_noche)}/noche</strong>
                    </td>
                    <td>
                      <span className={`dash-badge ${colorEstado(h.estado)}`}>
                        {h.estado}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <BtnAccion
                          icono="👁️"
                          label="Ver detalles"
                          color="ver"
                          onClick={() =>
                            toast.info(
                              `${h.nombre} — ${h.tipo} — Cap: ${h.capacidad} — ${fmt(h.precio_noche)}/noche`,
                            )
                          }
                        />
                        {rol === "admin" && (
                          <>
                            <BtnAccion
                              icono="✏️"
                              label="Editar habitación"
                              color="editar"
                              onClick={() => setEditandoHab(h)}
                            />
                            <BtnAccion
                              icono="🔒"
                              label="Desactivar"
                              color="cancelar"
                              disabled={h.estado === "inactiva"}
                              onClick={() =>
                                setConfirmando({ tipo: "desactivar", h })
                              }
                            />
                          </>
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
    </div>
  );
}
//  SECCIÓN DASHBOARD PRINCIPAL
function SeccionDashboard({
  usuarios,
  reservaciones,
  habitaciones,
  cargando,
  onNuevaReserva,
  onNuevaHab,
  onNuevoUsuario,
  onRecargar,
  irSeccion,
  rol,
}) {
  const pendientes = reservaciones.filter(
    (r) => r.estado === "pendiente",
  ).length;
  const confirmadas = reservaciones.filter((r) =>
    ["confirmada", "activa"].includes(r.estado),
  ).length;
  const ocupadas = habitaciones.filter((h) => h.estado === "ocupada").length;
  const ingresos = reservaciones
    .filter((r) => ["confirmada", "activa"].includes(r.estado))
    .reduce((s, r) => s + Number(r.total), 0);

  const stats = [
    {
      label: "Huéspedes Registrados",
      value: cargando
        ? "..."
        : usuarios.filter((u) => u.rol === "cliente").length,
      icon: "👥",
      color: "brown",
    },
    {
      label: "Reservaciones Activas",
      value: cargando ? "..." : confirmadas,
      icon: "📋",
      color: "green",
    },
    {
      label: "Habitaciones Ocupadas",
      value: cargando ? "..." : ocupadas,
      icon: "🛏️",
      color: "blue",
    },
    {
      label: "Ingresos Confirmados",
      value: cargando ? "..." : fmt(ingresos),
      icon: "💰",
      color: "yellow",
    },
  ];

  const acciones = [
    {
      label: "Nueva Habitación",
      icon: "🛏️",
      onClick: onNuevaHab,
      visible: rol === "admin",
    },
    {
      label: "Nueva Reserva",
      icon: "📅",
      onClick: onNuevaReserva,
      visible: true,
    },
    {
      label: "Nuevo Usuario",
      icon: "👤",
      onClick: onNuevoUsuario,
      visible: rol === "admin",
    },
    {
      label: "Ver Reportes",
      icon: "📊",
      onClick: () => toast.info("Reportes — próximamente"),
      visible: true,
    },
  ].filter((a) => a.visible);

  return (
    <>
      {!cargando && pendientes > 0 && (
        <div
          style={{
            background: "#fff3cd",
            border: "1px solid #ffc107",
            borderRadius: "10px",
            padding: "12px 20px",
            marginBottom: "20px",
            fontFamily: "'Lato',sans-serif",
            fontSize: "0.88rem",
            color: "#856404",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span style={{ fontSize: "1.2rem" }}>⏳</span>
          <span>
            <strong>{pendientes}</strong> reservación(es) pendiente(s) de pago.
            Se liberan automáticamente en 15 min.
          </span>
        </div>
      )}

      <div className="dash-stats-grid">
        {stats.map((s, i) => (
          <div key={i} className="dash-stat-card">
            <div className="dash-stat-header">
              <div className={`dash-stat-icon ${s.color}`}>{s.icon}</div>
            </div>
            <div className="dash-stat-value">
              {cargando ? (
                <span style={{ fontSize: "1rem", color: "#aaa" }}>
                  Cargando...
                </span>
              ) : (
                s.value
              )}
            </div>
            <div className="dash-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="dash-quick-actions">
        {acciones.map((a, i) => (
          <button key={i} className="dash-quick-btn" onClick={a.onClick}>
            <span className="dash-quick-btn-icon">{a.icon}</span>
            {a.label}
          </button>
        ))}
      </div>

      <div className="dash-section-grid">
        <TablaReservaciones
          limite={4}
          datos={reservaciones}
          cargando={cargando}
          onRecargar={onRecargar}
          irSeccion={irSeccion}
        />
        <TablaUsuarios
          limite={4}
          datos={usuarios}
          cargando={cargando}
          onNuevoUsuario={onNuevoUsuario}
          irSeccion={irSeccion}
        />
      </div>
    </>
  );
}
//  APP PRINCIPAL
function DashboardApp() {
  const [seccion, setSeccion] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobile, setMobile] = useState(isMobile());
  const [modalManual, setModalManual] = useState(false);
  const [modalHab, setModalHab] = useState(false);
  const [modalUsuario, setModalUsuario] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [reservaciones, setReservaciones] = useState([]);
  const [habitaciones, setHabitaciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  const sesion =
    window.QDSession?.obtener() ||
    (() => {
      try {
        return JSON.parse(sessionStorage.getItem("qdSession") || "{}");
      } catch {
        return {};
      }
    })();
  const rol = sesion.rol || "cliente";
  const adminNombre = sesion.nombre || "Administrador";

  const cargarTodo = useCallback(async () => {
    setCargando(true);
    try {
      const [resU, resR, resH] = await Promise.all([
        fetch(API_USUARIOS, { credentials: "include" }),
        fetch(API_RESERVAS, { credentials: "include" }),
        fetch(API_HABITACIONES, { credentials: "include" }),
      ]);
      const [dU, dR, dH] = await Promise.all([
        resU.json(),
        resR.json(),
        resH.json(),
      ]);
      if (dU.ok) setUsuarios(dU.usuarios);
      else toast.av("No se cargaron usuarios.");
      if (dR.ok) setReservaciones(dR.reservaciones);
      else toast.av("No se cargaron reservaciones.");
      if (dH.ok) setHabitaciones(dH.habitaciones);
      else toast.av("No se cargaron habitaciones.");
    } catch {
      toast.err("Error al conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarTodo();
  }, []);
  useEffect(() => {
    const onResize = () => {
      setMobile(isMobile());
      if (!isMobile()) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  function cerrarSesion() {
    window.QDSession
      ? window.QDSession.cerrar(false)
      : (sessionStorage.removeItem("qdSession"),
        (window.location.href = "login.html"));
  }

  const irSeccion = (id) => {
    setSeccion(id);
    if (isMobile()) setMobileOpen(false);
  };

  const titulos = {
    dashboard: {
      h: "Panel de Control",
      p: "Resumen general — Hotel Quinta Dalam",
    },
    reservaciones: {
      h: "Reservaciones",
      p: "Gestión de reservas activas y pasadas",
    },
    usuarios: { h: "Usuarios", p: "Administración de cuentas" },
    habitaciones: {
      h: "Habitaciones",
      p: "13 habitaciones temáticas de Michoacán",
    },
  };
  const titulo = titulos[seccion] || titulos.dashboard;
  const pendientesBadge = reservaciones.filter(
    (r) => r.estado === "pendiente",
  ).length;

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "🏠" },
    {
      id: "reservaciones",
      label: "Reservaciones",
      icon: "📋",
      badge: pendientesBadge || null,
    },
    { id: "usuarios", label: "Usuarios", icon: "👥" },
    { id: "habitaciones", label: "Habitaciones", icon: "🛏️" },
  ];

  const sidebarCls = [
    "dash-sidebar",
    !mobile && collapsed ? "collapsed" : "",
    mobile && mobileOpen ? "mobile-open" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const mainCls = ["dash-main", !mobile && collapsed ? "sidebar-collapsed" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="dash-layout">
      {mobile && mobileOpen && (
        <div className="dash-overlay" onClick={() => setMobileOpen(false)} />
      )}

      {modalManual && (
        <ModalReservacionManual
          habitaciones={habitaciones}
          onGuardar={() => {
            setModalManual(false);
            cargarTodo();
          }}
          onCerrar={() => setModalManual(false)}
        />
      )}
      {modalHab && (
        <ModalHabitacion
          habitacion={null}
          onGuardar={() => {
            setModalHab(false);
            cargarTodo();
          }}
          onCerrar={() => setModalHab(false)}
        />
      )}
      {modalUsuario && (
        <ModalNuevoUsuario
          onGuardar={() => {
            setModalUsuario(false);
            cargarTodo();
          }}
          onCerrar={() => setModalUsuario(false)}
        />
      )}

      <aside className={sidebarCls}>
        <div className="dash-sidebar-brand">
          <div className="dash-sidebar-logo">
            <img
              src="./img/logo/logo-quinta-dalam-dark.svg"
              alt="Hotel Quinta Dalam"
            />
          </div>
          <div className="dash-brand-text">
            <strong>Hotel Quinta Dalam</strong>
            <span>Panel Admin</span>
          </div>
          <button
            className="dash-toggle-btn"
            onClick={() =>
              mobile ? setMobileOpen((p) => !p) : setCollapsed((p) => !p)
            }
            aria-label="Colapsar menú"
          >
            <span className="dash-toggle-line"></span>
            <span className="dash-toggle-line"></span>
            <span className="dash-toggle-line"></span>
          </button>
        </div>
        <div className="dash-sidebar-profile">
          <div className="dash-profile-avatar">{iniciales(adminNombre)}</div>
          <div className="dash-profile-text">
            <p className="dash-profile-name">{adminNombre}</p>
            <span className="dash-profile-badge">
              {rol === "admin" ? "🛡️ Administrador" : "🔑 Recepcionista"}
            </span>
            <div className="dash-profile-divider"></div>
          </div>
        </div>
        <nav className="dash-sidebar-nav">
          <p className="dash-nav-section-title">Menú Principal</p>
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`dash-nav-item${seccion === item.id ? " active" : ""}`}
              onClick={() => irSeccion(item.id)}
              title={item.label}
            >
              <span className="dash-nav-icon">{item.icon}</span>
              <span className="dash-nav-label">{item.label}</span>
              {item.badge ? (
                <span className="dash-nav-badge">{item.badge}</span>
              ) : null}
            </button>
          ))}
          <p className="dash-nav-section-title">Acceso Rápido</p>
          <a
            href="index.html"
            target="_blank"
            rel="noopener noreferrer"
            className="dash-nav-item"
          >
            <span className="dash-nav-icon">🌐</span>
            <span className="dash-nav-label">Ver Sitio Web</span>
          </a>
        </nav>
        <div className="dash-sidebar-footer">
          <button className="dash-logout-btn" onClick={cerrarSesion}>
            <span className="dash-logout-icon">🚪</span>
            <span className="dash-logout-label">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      <div className={mainCls}>
        <div className="dash-topbar">
          <div className="dash-topbar-left">
            <button
              className="dash-topbar-menu-btn"
              onClick={() =>
                mobile ? setMobileOpen((p) => !p) : setCollapsed((p) => !p)
              }
            >
              ☰ Menú
            </button>
            <div className="dash-topbar-title">
              <h1>{titulo.h}</h1>
              <p>{titulo.p}</p>
            </div>
          </div>
          <div className="dash-topbar-actions">
            <button className="dash-topbar-btn" onClick={cargarTodo}>
              🔄 Actualizar
            </button>
            <button
              className="dash-topbar-btn primary"
              onClick={() => setModalManual(true)}
            >
              + Nueva Reserva
            </button>
          </div>
        </div>

        <div className="dash-content">
          {seccion === "dashboard" && (
            <SeccionDashboard
              usuarios={usuarios}
              reservaciones={reservaciones}
              habitaciones={habitaciones}
              cargando={cargando}
              onNuevaReserva={() => setModalManual(true)}
              onNuevaHab={() => setModalHab(true)}
              onNuevoUsuario={() => setModalUsuario(true)}
              onRecargar={cargarTodo}
              irSeccion={irSeccion}
              rol={rol}
            />
          )}
          {seccion === "reservaciones" && (
            <div className="dash-section-full">
              <TablaReservaciones
                datos={reservaciones}
                cargando={cargando}
                onRecargar={cargarTodo}
                irSeccion={irSeccion}
              />
            </div>
          )}
          {seccion === "usuarios" && (
            <div className="dash-section-full">
              <TablaUsuarios
                datos={usuarios}
                cargando={cargando}
                onNuevoUsuario={() => setModalUsuario(true)}
                irSeccion={irSeccion}
              />
            </div>
          )}
          {seccion === "habitaciones" && (
            <SeccionHabitaciones
              datos={habitaciones}
              cargando={cargando}
              onRecargar={cargarTodo}
              onNuevaHab={() => setModalHab(true)}
              rol={rol}
            />
          )}
        </div>
      </div>
    </div>
  );
}

const dashRoot = ReactDOM.createRoot(document.getElementById("root-dashboard"));
dashRoot.render(<DashboardApp />);
