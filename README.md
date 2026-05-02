# 🏨 Hotel Quinta Dalam — Proyecto Web

Aplicación web fullstack desarrollada para la asignatura de **Programación Web** (6° Semestre, Ingeniería en Sistemas — TecNM). Representa un hotel boutique temático inspirado en la riqueza cultural de los **Pueblos Mágicos de Michoacán**, con flujo completo de reservaciones en línea e integración de pagos reales.

---

## 🚀 Características Principales

- **13 Habitaciones Temáticas** — Cada habitación está dedicada a un municipio michoacano (Pátzcuaro, Tzintzuntzan, Paracho, Cuanajo, etc.)
- **Sistema de Reservaciones** — Flujo de 3 pasos con validación de disponibilidad en tiempo real y prevención de condiciones de carrera (doble SELECT + transacciones PDO)
- **Pagos con Mercado Pago** — Integración oficial con Checkout Pro (SDK PHP v3.9), sandbox funcional y webhook con verificación de firma `x-signature`
- **Autenticación Segura** — Sesiones PHP con fingerprint SHA-256 del User-Agent, heartbeat de validación y sincronización entre pestañas
- **RBAC Completo** — 3 roles: `admin`, `recepcionista`, `cliente`. El rol se asigna exclusivamente desde el backend, nunca desde el formulario público
- **Dashboard Administrativo** — Panel React con CRUD de habitaciones, gestión de reservaciones, usuarios y monitor de pagos pendientes
- **Reservaciones Manuales** — El recepcionista puede crear reservaciones directas (bypass Mercado Pago) para huéspedes presenciales
- **Recolector de Basura** — Limpieza pasiva automática: cancela reservaciones pendientes >15 min y libera habitaciones en cada consulta al catálogo
- **Diseño Responsivo** — CSS Grid + Flexbox, Mobile-first, fuentes Playfair Display + Lato

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | HTML5, CSS3 Modular, React 18 (Babel CDN), Vanilla JS |
| Backend | PHP 8+ con PDO |
| Base de Datos | MySQL 8 / XAMPP |
| Pagos | Mercado Pago SDK PHP v3.9 (`mercadopago/dx-php`) via Composer |
| Control de Versiones | Git + GitHub |

---

## 📂 Estructura del Proyecto

```text
Hotel-quinta-dalam/
│
├── api/                          # Backend PHP — APIs REST
│   ├── config/
│   │   ├── database.php          # Conexión PDO + carga de .env
│   │   ├── env.php               # Lector de variables de entorno
│   │   └── response.php          # Helpers: setCorsHeaders, responder, leerBody
│   │
│   ├── auth/
│   │   ├── login.php             # Autenticación + fingerprint + sesión PHP
│   │   ├── logout.php            # Cierre de sesión
│   │   ├── registro.php          # Registro público (rol siempre = 'cliente')
│   │   ├── validate.php          # Heartbeat — valida sesión activa
│   │   └── check-email.php       # Verificación de correo en tiempo real
│   │
│   ├── habitaciones/
│   │   ├── listar.php            # GET: catálogo con filtros, paginación + recolector de basura
│   │   └── actualizar.php        # POST crear / PUT editar (solo admin)
│   │
│   ├── reservaciones/
│   │   ├── crear.php             # POST: reservación online con transacción PDO
│   │   ├── listar.php            # GET: LEFT JOIN usuarios + COALESCE huesped_nombre
│   │   ├── crear-manual.php      # POST: reservación desde recepción (bypass MP)
│   │   ├── cancelar.php          # POST: cancela reserva + libera habitación (RBAC)
│   │   └── confirmar.php         # POST: confirma pago en efectivo (RBAC)
│   │
│   ├── usuarios/
│   │   ├── listar.php            # GET: lista usuarios (solo admin)
│   │   ├── crear.php             # POST: crea usuario desde dashboard (solo admin)
│   │   └── perfil.php            # GET/PUT: perfil del usuario autenticado
│   │
│   └── pagos/
│       ├── crear-preferencia.php # POST: crea preferencia Mercado Pago (Checkout Pro)
│       └── webhook.php           # POST: recibe notificaciones MP con verificación x-signature
│
├── css/                          # Hojas de estilo modulares
│   ├── styles.css                # Estilos globales, nav, footer, componentes comunes
│   ├── auth.css                  # Login y Registro
│   ├── catalogo.css              # Catálogo de habitaciones
│   ├── contacto.css              # Página de contacto
│   ├── dashboard.css             # Panel de administración
│   ├── inicio.css                # Página principal
│   ├── intro.css                 # Sección de introducción
│   ├── nav-fixes.css             # Fixes de nav: sombra, hamburguesa, btn volver
│   ├── nosotros.css              # Página Nosotros
│   ├── perfil.css                # Perfil del usuario
│   └── reservaciones.css         # Flujo de reservaciones
│
├── js/                           # Scripts del frontend
│   ├── session.js                # QDSession v2: heartbeat, fingerprint, RBAC, QDToast
│   ├── nav-auth.js               # Avatar de sesión en el nav
│   ├── mobile-nav.js             # Menú hamburguesa responsivo
│   ├── intro.js                  # Animación de introducción
│   ├── inicio.js                 # React — habitaciones destacadas (index.html)
│   ├── catalogo.js               # React — catálogo completo con filtros y paginación
│   ├── reservaciones.js          # React — flujo 3 pasos + scroll automático entre pasos
│   ├── contacto.js               # React — formulario de contacto con validaciones
│   ├── login.js                  # React — formulario de inicio de sesión
│   ├── registro.js               # React — formulario de registro (rol hardcodeado a cliente)
│   ├── perfil.js                 # React — perfil y reservaciones del usuario
│   ├── nosotros.js               # Animaciones de la página Nosotros
│   └── dashboard.js              # React — panel admin con CRUD y modales premium
│
├── img/
│   ├── logo/
│   │   ├── logo-quinta-dalam-dark.svg   # Logo DL (fondo oscuro)
│   │   └── logo-quinta-dalam-light.svg  # Logo DL (fondo claro)
│   └── habitaciones/             # Fotografías de las 13 habitaciones temáticas
│
├── database/
│   └── schema.sql                # Estructura completa de la BD (4 tablas)
│
├── vendor/                       # Dependencias Composer (ignorado por Git)
├── .env                          # Variables de entorno reales (ignorado por Git)
├── .env.example                  # Plantilla de variables de entorno
├── .gitignore
├── composer.json
├── composer.lock
│
├── index.html                    # Inicio — habitaciones destacadas
├── catalogo.html                 # Catálogo de habitaciones
├── nosotros.html                 # Historia y valores del hotel
├── contacto.html                 # Formulario de contacto
├── reservaciones.html            # Flujo de reservación online
├── login.html                    # Inicio de sesión
├── registro.html                 # Registro de cuenta (solo clientes)
├── perfil.html                   # Perfil y reservaciones del usuario
├── dashboard.html                # Panel de administración (RBAC: admin/recepcionista)
├── exito.html                    # Página post-pago exitoso
├── error-pago.html               # Página post-pago fallido
└── pendiente.html                # Página de pago pendiente
```

---

## 🗄️ Base de Datos

4 tablas con relaciones y restricciones de integridad:

```sql
usuarios       — id, nombre, correo, telefono, contrasena, rol (ENUM), estado, created_at
habitaciones   — id, numero, nombre, tipo, precio_noche, capacidad, descripcion, estado, imagen_url
reservaciones  — id, codigo, usuario_id (NULL para huéspedes anónimos), huesped_nombre,
                 habitacion_id, fecha_entrada, fecha_salida, num_huespedes,
                 precio_noche, total, estado, notas, created_at
pagos          — id, reservacion_id (UNIQUE KEY), metodo, monto, estado, referencia, created_at
```

**Estados de reservación:** `pendiente` → `confirmada` → `completada` / `cancelada`

---

## 🔐 Seguridad Implementada

- **RBAC backend-first** — El rol nunca viene del frontend; PHP lo asigna o verifica en cada endpoint
- **Mass Assignment bloqueado** — `registro.php` ignora cualquier campo `rol` recibido y hardcodea `cliente`
- **Fingerprint de sesión** — SHA-256 del User-Agent detecta robo de sesión
- **Transacciones PDO** — Atomicidad en reservaciones y pagos (BEGIN / COMMIT / ROLLBACK)
- **Anti race condition** — Doble SELECT antes del INSERT para prevenir reservas duplicadas de la misma habitación
- **Webhook verificado** — Firma `x-signature` de Mercado Pago validada antes de procesar pagos
- **Variables de entorno** — Credenciales en `.env` (excluido del repositorio vía `.gitignore`)

---

## 💳 Integración Mercado Pago

- SDK oficial `mercadopago/dx-php` v3.9.0 vía Composer
- Checkout Pro con `sandbox_init_point` en desarrollo y `init_point` en producción
- Detección de entorno por `APP_ENV` en `.env`
- `notification_url` y `auto_return` nulos en desarrollo local (MP no puede alcanzar `localhost`)
- Idempotencia en el webhook con verificación de pagos ya procesados

**Tarjeta de prueba sandbox:**
```
Número: 4505 0663 5683 8002 | Nombre: APRO | Vencimiento: 11/25 | CVV: 123
```

---

## ⚙️ Instalación Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/ProgAngel/hotel-quinta-dalam.git
cd hotel-quinta-dalam

# 2. Instalar dependencias PHP
composer install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de BD y Mercado Pago

# 4. Importar la base de datos
# Abrir phpMyAdmin → crear BD 'hotel_quinta_dalam' → importar database/schema.sql

# 5. Iniciar XAMPP (Apache + MySQL) y abrir:
# http://localhost/Hotel-quinta-dalam/
```

---

## 👥 Roles del Sistema

| Rol | Acceso |
|---|---|
| `cliente` | Reservaciones online, perfil, historial personal |
| `recepcionista` | Todo lo anterior + ver todas las reservaciones, crear reservas manuales, confirmar pagos en efectivo |
| `admin` | Todo lo anterior + CRUD de habitaciones, gestión de usuarios, cambio de precios y estados |

> Los roles `admin` y `recepcionista` **solo se crean desde el dashboard**. El formulario público de registro siempre crea cuentas de tipo `cliente`.

---

## 🎓 Información Académica

- **Materia:** Programación Web
- **Semestre:** 6° Semestre
- **Institución:** TecNM — Michoacán
- **Alumno:** Luis Angel Montanez Romero
- **GitHub:** [@ProgAngel](https://github.com/ProgAngel)
- **Rama activa:** `frontend-final`
- **Cliente real:** Hotel Quinta Dalam, Michoacán, México