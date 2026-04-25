<?php
// ============================================================
//  api/auth/check-email.php — Hotel Quinta Dalam
//  Verifica si un correo está disponible para registrarse
//
//  Método:  GET
//  Params:  ?correo=ejemplo@correo.com
//  Éxito:   { "disponible": true/false }
// ============================================================

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/response.php';

setCorsHeaders();
soloMetodo('GET');

$correo = limpiar($_GET['correo'] ?? '');

if (empty($correo) || !filter_var($correo, FILTER_VALIDATE_EMAIL)) {
    responder(400, ['ok' => false, 'mensaje' => 'Correo inválido.']);
}

$pdo  = getPDO();
$stmt = $pdo->prepare('SELECT id FROM usuarios WHERE correo = :correo LIMIT 1');
$stmt->execute([':correo' => $correo]);

responder(200, [
    'disponible' => $stmt->fetch() === false
]);