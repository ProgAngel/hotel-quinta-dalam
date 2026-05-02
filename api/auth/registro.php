<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/response.php';

setCorsHeaders();
soloMetodo('POST');

$body = leerBody();

// Extraer y sanear campos
$nombre    = limpiar($body['nombre']    ?? '');
$correo    = limpiar($body['correo']    ?? '');
$telefono  = limpiar($body['telefono'] ?? '');
$contrasena = trim($body['contrasena'] ?? '');
// El rol SIEMPRE es cliente desde el registro público.
// Los admins y recepcionistas se crean desde el dashboard.
$rol = 'cliente';

// Validaciones
$errores = [];

if (empty($nombre) || mb_strlen($nombre) < 3) {
    $errores['nombre'] = 'El nombre debe tener al menos 3 caracteres.';
} elseif (!preg_match('/^[A-Za-záéíóúÁÉÍÓÚñÑ\s]+$/u', $nombre)) {
    $errores['nombre'] = 'El nombre solo puede contener letras.';
}

if (empty($correo) || !filter_var($correo, FILTER_VALIDATE_EMAIL)) {
    $errores['correo'] = 'El correo electrónico no es válido.';
}

if (!empty($telefono) && !preg_match('/^[0-9]{10}$/', $telefono)) {
    $errores['telefono'] = 'El teléfono debe tener exactamente 10 dígitos.';
}

if (empty($contrasena) || mb_strlen($contrasena) < 8) {
    $errores['contrasena'] = 'La contraseña debe tener al menos 8 caracteres.';
} elseif (!preg_match('/[A-Z]/', $contrasena)) {
    $errores['contrasena'] = 'La contraseña debe contener al menos una mayúscula.';
} elseif (!preg_match('/[0-9]/', $contrasena)) {
    $errores['contrasena'] = 'La contraseña debe contener al menos un número.';
}

// Si hay errores de validacion, devolverlos todos juntos
if (!empty($errores)) {
    responder(400, ['ok' => false, 'mensaje' => 'Datos inválidos.', 'errores' => $errores]);
}

// ── 3. Verificar que el correo no este registrado 
$pdo  = getPDO();

$stmt = $pdo->prepare('SELECT id FROM usuarios WHERE correo = :correo LIMIT 1');
$stmt->execute([':correo' => $correo]);

if ($stmt->fetch()) {
    responder(409, ['ok' => false, 'mensaje' => 'Este correo ya está registrado.']);
}

// ── 4. Hashear contraseña y guardar 
$hash = password_hash($contrasena, PASSWORD_BCRYPT, ['cost' => 12]);

$insert = $pdo->prepare(
    'INSERT INTO usuarios (nombre, correo, telefono, contrasena, rol, estado)
     VALUES (:nombre, :correo, :telefono, :contrasena, :rol, "activo")'
);

$insert->execute([
    ':nombre'     => $nombre,
    ':correo'     => $correo,
    ':telefono'   => $telefono ?: null,
    ':contrasena' => $hash,
    ':rol'        => $rol,
]);

$nuevoId = (int) $pdo->lastInsertId();

// ── 5. Respuesta exitosa (sin devolver la contraseña) 
responder(201, [
    'ok'      => true,
    'mensaje' => 'Cuenta creada exitosamente.',
    'usuario' => [
        'id'     => $nuevoId,
        'nombre' => $nombre,
        'correo' => $correo,
        'rol'    => $rol,
    ]
]);