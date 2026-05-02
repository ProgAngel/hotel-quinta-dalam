<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/response.php';

setCorsHeaders();
soloMetodo('POST');

session_start();
if (($_SESSION['rol'] ?? '') !== 'admin') {
    responder(403, ['ok' => false, 'mensaje' => 'Solo el administrador puede crear usuarios.']);
}

$body = leerBody();

$nombre     = limpiar($body['nombre']     ?? '');
$correo     = limpiar($body['correo']     ?? '');
$contrasena = $body['contrasena']          ?? '';
$telefono   = limpiar($body['telefono']  ?? '');
$rol        = limpiar($body['rol']        ?? 'cliente');

// ── Validaciones 
$errores = [];
if (!$nombre || strlen($nombre) < 3)
    $errores['nombre'] = 'El nombre debe tener al menos 3 caracteres.';
if (!filter_var($correo, FILTER_VALIDATE_EMAIL))
    $errores['correo'] = 'Correo inválido.';
if (!$contrasena || strlen($contrasena) < 8)
    $errores['contrasena'] = 'La contraseña debe tener al menos 8 caracteres.';
if (!in_array($rol, ['admin', 'cliente', 'recepcionista'], true))
    $errores['rol'] = 'Rol inválido.';

if (!empty($errores)) {
    responder(400, ['ok' => false, 'mensaje' => 'Datos inválidos.', 'errores' => $errores]);
}

$pdo = getPDO();

// Verificar correo único
$stmtCheck = $pdo->prepare('SELECT id FROM usuarios WHERE correo = :correo LIMIT 1');
$stmtCheck->execute([':correo' => $correo]);
if ($stmtCheck->fetch()) {
    responder(409, ['ok' => false, 'mensaje' => 'Este correo ya está registrado.']);
}

$hash = password_hash($contrasena, PASSWORD_BCRYPT);

$stmt = $pdo->prepare(
    'INSERT INTO usuarios (nombre, correo, contrasena, telefono, rol, estado)
     VALUES (:nombre, :correo, :contrasena, :telefono, :rol, "activo")'
);
$stmt->execute([
    ':nombre'     => $nombre,
    ':correo'     => $correo,
    ':contrasena' => $hash,
    ':telefono'   => $telefono ?: null,
    ':rol'        => $rol,
]);

responder(201, [
    'ok'      => true,
    'mensaje' => "Usuario $nombre creado exitosamente.",
    'id'      => (int) $pdo->lastInsertId(),
]);