<?php
// ============================================================
//  database.php — Hotel Quinta Dalam
//  Conexión PDO con detección automática de entorno:
//  - PRODUCCIÓN: Azure inyecta DB_HOST como variable de sistema
//  - LOCAL:      Lee credenciales desde archivo .env via env.php
// ============================================================

function getPDO(): PDO {
    static $pdo = null;
    if ($pdo !== null) return $pdo;

    // ── Detección de entorno ─────────────────────────────────
    // getenv('DB_HOST') devuelve el valor si Azure lo inyectó,
    // o false si no existe (estamos en local con XAMPP).
    if (getenv('DB_HOST')) {
        // PRODUCCIÓN — variables inyectadas por Azure App Service
        $host   = getenv('DB_HOST');
        $dbname = getenv('DB_NAME');
        $user   = getenv('DB_USER');
        $pass   = getenv('DB_PASS');
        $port   = getenv('DB_PORT') ?: '3306';
    } else {
        // LOCAL — cargar .env solo cuando estamos en XAMPP
        // env.php NO existe en Azure, por eso solo se carga aquí
        require_once __DIR__ . '/env.php';
        $host   = env('DB_HOST', 'localhost');
        $dbname = env('DB_NAME', 'hotel_quinta_dalam');
        $user   = env('DB_USER', 'root');
        $pass   = env('DB_PASS', '');
        $port   = env('DB_PORT', '3306');
    }

    $charset = 'utf8mb4';
    $dsn = "mysql:host={$host};port={$port};dbname={$dbname};charset={$charset}";

    try {
        $pdo = new PDO($dsn, $user, $pass, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
           PDO::ATTR_PERSISTENT => true, // Reutiliza conexiones - limite 5 conexiones Clever Cloud DEV // Reutiliza conexiones — vital para límite de 5 en Clever Cloud DEV
        ]);
    } catch (PDOException $e) {
        http_response_code(500);

        // En producción no exponemos detalles del error
        $mensaje = getenv('DB_HOST')
            ? 'Error interno del servidor.'
            : 'Error de conexión: ' . $e->getMessage();

        echo json_encode(['ok' => false, 'mensaje' => $mensaje]);
        exit;
    }

    return $pdo;
}