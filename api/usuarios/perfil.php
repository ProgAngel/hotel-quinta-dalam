<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/response.php';

setCorsHeaders();

$metodo = $_SERVER['REQUEST_METHOD'];

// ── GET: obtener perfil 
if ($metodo === 'GET') {

    if (empty($_GET['id']) || !is_numeric($_GET['id'])) {
        responder(400, ['ok' => false, 'mensaje' => 'ID de usuario requerido.']);
    }

    $id  = (int) $_GET['id'];
    $pdo = getPDO();

    $stmt = $pdo->prepare(
        'SELECT id, nombre, correo, telefono, rol, estado, created_at
         FROM usuarios
         WHERE id = :id AND estado != "inactivo"
         LIMIT 1'
    );
    $stmt->execute([':id' => $id]);
    $usuario = $stmt->fetch();

    if (!$usuario) {
        responder(404, ['ok' => false, 'mensaje' => 'Usuario no encontrado.']);
    }

    // Contar reservaciones del usuario
    $stmtR = $pdo->prepare(
        'SELECT COUNT(*) AS total,
                SUM(CASE WHEN estado IN ("activa","confirmada") THEN 1 ELSE 0 END) AS activas
         FROM reservaciones WHERE usuario_id = :id'
    );
    $stmtR->execute([':id' => $id]);
    $stats = $stmtR->fetch();

    $usuario['id']  = (int) $usuario['id'];
    $usuario['stats'] = [
        'total_reservaciones'  => (int) $stats['total'],
        'reservaciones_activas' => (int) $stats['activas'],
    ];

    responder(200, ['ok' => true, 'usuario' => $usuario]);
}

// ── PUT: actualizar perfil
if ($metodo === 'PUT') {

    $body = leerBody();

    $id = isset($body['id']) ? (int) $body['id'] : 0;
    if ($id <= 0) {
        responder(400, ['ok' => false, 'mensaje' => 'ID de usuario requerido.']);
    }

    $pdo = getPDO();

    // Obtener usuario actual
    $stmt = $pdo->prepare(
        'SELECT id, nombre, telefono, contrasena FROM usuarios WHERE id = :id LIMIT 1'
    );
    $stmt->execute([':id' => $id]);
    $usuario = $stmt->fetch();

    if (!$usuario) {
        responder(404, ['ok' => false, 'mensaje' => 'Usuario no encontrado.']);
    }

    $campos = [];
    $params = [':id' => $id];
    $errores = [];

    // ── Actualizar nombre 
    if (isset($body['nombre'])) {
        $nombre = limpiar($body['nombre']);
        if (mb_strlen($nombre) < 3) {
            $errores['nombre'] = 'El nombre debe tener al menos 3 caracteres.';
        } elseif (!preg_match('/^[A-Za-záéíóúÁÉÍÓÚñÑ\s]+$/u', $nombre)) {
            $errores['nombre'] = 'El nombre solo puede contener letras.';
        } else {
            $campos[]          = 'nombre = :nombre';
            $params[':nombre'] = $nombre;
        }
    }

    // ── Actualizar teléfono 
    if (isset($body['telefono'])) {
        $telefono = limpiar($body['telefono']);
        if (!empty($telefono) && !preg_match('/^[0-9]{10}$/', $telefono)) {
            $errores['telefono'] = 'El teléfono debe tener exactamente 10 dígitos.';
        } else {
            $campos[]            = 'telefono = :telefono';
            $params[':telefono'] = $telefono ?: null;
        }
    }

    // ── Cambiar contraseña 
    if (isset($body['contrasena_nueva'])) {
        $actual = trim($body['contrasena_actual'] ?? '');
        $nueva  = trim($body['contrasena_nueva']);

        if (empty($actual)) {
            $errores['contrasena_actual'] = 'Debes ingresar tu contraseña actual.';
        } elseif (!password_verify($actual, $usuario['contrasena'])) {
            $errores['contrasena_actual'] = 'La contraseña actual es incorrecta.';
        } elseif (mb_strlen($nueva) < 8) {
            $errores['contrasena_nueva'] = 'La nueva contraseña debe tener al menos 8 caracteres.';
        } elseif (!preg_match('/[A-Z]/', $nueva)) {
            $errores['contrasena_nueva'] = 'Debe contener al menos una mayúscula.';
        } elseif (!preg_match('/[0-9]/', $nueva)) {
            $errores['contrasena_nueva'] = 'Debe contener al menos un número.';
        } elseif ($nueva === $actual) {
            $errores['contrasena_nueva'] = 'La nueva contraseña no puede ser igual a la actual.';
        } else {
            $campos[]              = 'contrasena = :contrasena';
            $params[':contrasena'] = password_hash($nueva, PASSWORD_BCRYPT, ['cost' => 12]);
        }
    }

    if (!empty($errores)) {
        responder(400, ['ok' => false, 'mensaje' => 'Datos inválidos.', 'errores' => $errores]);
    }

    if (empty($campos)) {
        responder(400, ['ok' => false, 'mensaje' => 'No hay campos para actualizar.']);
    }

    // ── Ejecutar UPDATE 
    $sql = 'UPDATE usuarios SET ' . implode(', ', $campos) . ' WHERE id = :id';
    $pdo->prepare($sql)->execute($params);

    responder(200, [
        'ok'      => true,
        'mensaje' => 'Perfil actualizado correctamente.',
    ]);
}

// Cualquier otro método no está permitido
responder(405, ['ok' => false, 'mensaje' => 'Método no permitido.']);