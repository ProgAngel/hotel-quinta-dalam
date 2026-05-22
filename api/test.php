<?php
header('Content-Type: application/json');
echo json_encode([
    'php'     => PHP_VERSION,
    'db_host' => getenv('DB_HOST') ?: 'NO ENCONTRADO',
    'db_name' => getenv('DB_NAME') ?: 'NO ENCONTRADO',
    'db_user' => getenv('DB_USER') ?: 'NO ENCONTRADO',
]);