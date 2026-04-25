<?php
function getPDO(): PDO {
    static $pdo = null;         // singleton — solo crea la conexión una vez

    if ($pdo !== null) return $pdo;

    $host    = 'localhost';
    $dbname  = 'hotel_quinta_dalam';
    $user    = 'root';
    $pass    = '';              // XAMPP local: sin contraseña
    $charset = 'utf8mb4';

    $dsn = "mysql:host={$host};dbname={$dbname};charset={$charset}";

    try {
        $pdo = new PDO($dsn, $user, $pass, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,  // prepared statements reales
        ]);
    } catch (PDOException $e) {
        // No exponer detalles del error al cliente
        http_response_code(500);
        echo json_encode([
            'ok'      => false,
            'mensaje' => 'Error de conexión a la base de datos.'
        ]);
        exit;
    }

    return $pdo;
}