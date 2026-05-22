
-- ============================================================
--  TABLA: usuarios
-- ============================================================
CREATE TABLE usuarios (
    id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    nombre      VARCHAR(120)    NOT NULL,
    correo      VARCHAR(180)    NOT NULL,
    telefono    VARCHAR(15)         NULL,
    contrasena  VARCHAR(255)    NOT NULL,          -- bcrypt hash
    rol         ENUM('cliente','recepcionista','admin') NOT NULL DEFAULT 'cliente',
    estado      ENUM('activo','inactivo','pendiente') NOT NULL DEFAULT 'activo',
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
                                ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_correo (correo)
);

-- ============================================================
--  TABLA: habitaciones
-- ============================================================
CREATE TABLE habitaciones (
    id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    numero      VARCHAR(10)     NOT NULL,           -- '101', '201', etc.
    nombre      VARCHAR(80)     NOT NULL,           -- 'Tzintzuntzan', 'Morelia'...
    tipo        ENUM(
                    'Estándar',
                    'Familiar',
                    'Suite',
                    'Suite Deluxe',
                    'Suite Presidencial',
                    'Ejecutiva',
                    'Master Familiar'
                ) NOT NULL,
    precio_noche DECIMAL(8,2)   NOT NULL,
    capacidad   TINYINT UNSIGNED NOT NULL,
    descripcion TEXT                NULL,
    estado      ENUM('disponible','ocupada','mantenimiento') NOT NULL DEFAULT 'disponible',
    imagen_url  VARCHAR(255)        NULL,
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
                                ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_numero (numero)
);

-- ============================================================
--  TABLA: reservaciones
-- ============================================================
CREATE TABLE reservaciones (
    id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    codigo          VARCHAR(20)     NOT NULL,        -- 'R-001', 'R-002'...
    usuario_id      INT UNSIGNED    NOT NULL,
    habitacion_id   INT UNSIGNED    NOT NULL,
    fecha_entrada   DATE            NOT NULL,
    fecha_salida    DATE            NOT NULL,
    num_huespedes   TINYINT UNSIGNED NOT NULL DEFAULT 1,
    precio_noche    DECIMAL(8,2)    NOT NULL,        -- precio al momento de reservar
    total           DECIMAL(10,2)   NOT NULL,
    estado          ENUM('pendiente','confirmada','activa','completada','cancelada')
                    NOT NULL DEFAULT 'pendiente',
    notas           TEXT                NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
                                    ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_codigo (codigo),
    CONSTRAINT fk_reserv_usuario
        FOREIGN KEY (usuario_id)   REFERENCES usuarios    (id) ON DELETE RESTRICT,
    CONSTRAINT fk_reserv_habitacion
        FOREIGN KEY (habitacion_id) REFERENCES habitaciones (id) ON DELETE RESTRICT,

    -- Una habitación no puede tener 2 reservas activas en fechas solapadas
    INDEX idx_habitacion_fechas (habitacion_id, fecha_entrada, fecha_salida),
    INDEX idx_usuario (usuario_id),
    INDEX idx_estado  (estado)
);

-- ============================================================
--  TABLA: pagos
-- ============================================================
CREATE TABLE pagos (
    id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    reservacion_id  INT UNSIGNED    NOT NULL,
    metodo          ENUM('tarjeta','paypal','spei','recepcion') NOT NULL,
    monto           DECIMAL(10,2)   NOT NULL,
    estado          ENUM('pendiente','completado','fallido','reembolsado')
                    NOT NULL DEFAULT 'pendiente',
    referencia      VARCHAR(100)        NULL,        -- ID de transacción externa
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    CONSTRAINT fk_pago_reservacion
        FOREIGN KEY (reservacion_id) REFERENCES reservaciones (id) ON DELETE RESTRICT,
    INDEX idx_reservacion (reservacion_id)
);

-- ============================================================
--  DATOS INICIALES — 13 habitaciones reales
-- ============================================================
INSERT INTO habitaciones (numero, nombre, tipo, precio_noche, capacidad, estado) VALUES
('101', 'Tzintzuntzan',  'Estándar',           800.00,  4, 'disponible'),
('102', 'Paracho',       'Estándar',           800.00,  4, 'disponible'),
('103', 'Yunuen',        'Familiar',          1200.00,  5, 'disponible'),
('104', 'Pátzcuaro',     'Familiar',          1200.00,  5, 'disponible'),
('105', 'Coeneo',        'Suite',             1000.00,  3, 'disponible'),
('106', 'Janitzio',      'Suite',             1000.00,  3, 'disponible'),
('201', 'Suite Quinceo', 'Suite Presidencial',2200.00,  2, 'disponible'),
('202', 'Morelia',       'Ejecutiva',         1200.00,  5, 'disponible'),
('203', 'Tacámbaro',     'Master Familiar',   1500.00,  6, 'disponible'),
('204', 'Uruapan',       'Master Familiar',   1500.00,  6, 'disponible'),
('205', 'Tlalpujahua',   'Suite Deluxe',      1200.00,  4, 'disponible'),
('206', 'Cuitzeo',       'Suite',             1000.00,  3, 'disponible'),
('207', 'Cuanajo',       'Master Familiar',   1180.00,  6, 'disponible');

-- ============================================================
--  USUARIO ADMIN INICIAL
--  Contraseña: Admin2026! (hash bcrypt generado con PHP)
-- ============================================================
INSERT INTO usuarios (nombre, correo, contrasena, rol) VALUES
('Angel Romero', 'admin@quintadalam.com',
 '$2y$12$LSopSYyQpGf/wsSEEilzW.DYNznQ/UyXm6ZgfpueIv/V5lSyZPuyq', 'admin');