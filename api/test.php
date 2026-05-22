<?php
header('Content-Type: application/json');

$host = getenv('DB_HOST');
$name = getenv('DB_NAME');
$user = getenv('DB_USER');
$pass = getenv('DB_PASS');
$port = getenv('DB_PORT') ?: '3306';

try {
    $pdo = new PDO(
        "mysql:host=$host;port=$port;dbname=$name;charset=utf8mb4",
        $user, $pass,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    $count = $pdo->query('SELECT COUNT(*) FROM habitaciones')->fetchColumn();
    echo json_encode([
        'ok'           => true,
        'conexion'     => 'exitosa',
        'habitaciones' => $count
    ]);
} catch (PDOException $e) {
    echo json_encode([
        'ok'    => false,
        'error' => $e->getMessage()
    ]);
}