<?php
header('Content-Type: application/json');
require_once __DIR__ . '/config/database.php';
try {
    $pdo   = getPDO();
    $count = $pdo->query('SELECT COUNT(*) FROM habitaciones')->fetchColumn();
    echo json_encode(['ok' => true, 'habitaciones' => (int)$count]);
} catch (Exception $e) {
    echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
}