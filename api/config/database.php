<?php
require_once __DIR__ . '/env.php';  // carga el .env

function getPDO(): PDO {
    static $pdo = null;
    if ($pdo !== null) return $pdo;

    $host    = env('DB_HOST', 'localhost');
    $dbname  = env('DB_NAME', 'hotel_quinta_dalam');
    $user    = env('DB_USER', 'root');
    $pass    = env('DB_PASS', '');
    $charset = 'utf8mb4';

    $dsn = "mysql:host={$host};dbname={$dbname};charset={$charset}";

    try {
        $pdo = new PDO($dsn, $user, $pass, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['ok' => false, 'mensaje' => 'Error de conexión a la base de datos.']);
        exit;
    }

    return $pdo;
}