<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/response.php';

setCorsHeaders();
soloMetodo('POST');

session_start();

// ── 1. Existe sesión PHP activa? 
if (empty($_SESSION['usuario_id'])) {
    responder(401, ['ok' => false, 'razon' => 'sin_sesion']);
}

// ── 2. FINGERPRINT: Verificar que es el mismo navegador ─────
//   Se compara el hash SHA-256 del User-Agent guardado al
//   hacer login con el del request actual.
//   Detecta cuando alguien copia la cookie a otro navegador.
$uaActual = hash('sha256', $_SERVER['HTTP_USER_AGENT'] ?? '');

if (!isset($_SESSION['ua_hash']) || $uaActual !== $_SESSION['ua_hash']) {
    // Fingerprint no coincide — destruir sesión inmediatamente
    session_destroy();
    responder(401, ['ok' => false, 'razon' => 'fingerprint_invalido']);
}

// ── 3. Verificar que la sesión no expiró en el servidor
$maxInactividad = 30 * 60; // 30 minutos (más amplio que el del cliente)
$ultimaActividad = $_SESSION['ultima_actividad'] ?? 0;

if ((time() - $ultimaActividad) > $maxInactividad) {
    session_destroy();
    responder(401, ['ok' => false, 'razon' => 'sesion_expirada']);
}

// Actualizar timestamp de actividad
$_SESSION['ultima_actividad'] = time();

// ── 4. Obtener datos frescos del usuario desde la BD 
//   Verificamos que el usuario siga activo en la BD.
//   Esto detecta si un admin desactivó la cuenta mientras
//   el usuario tenía la sesión abierta.
$pdo = getPDO();

$stmt = $pdo->prepare(
    'SELECT id, nombre, correo, rol, estado
     FROM usuarios
     WHERE id = :id AND estado = "activo"
     LIMIT 1'
);
$stmt->execute([':id' => (int) $_SESSION['usuario_id']]);
$usuario = $stmt->fetch();

if (!$usuario) {
    // Usuario fue desactivado o eliminado
    session_destroy();
    responder(401, ['ok' => false, 'razon' => 'usuario_inactivo']);
}

// ── 5. Todo válido — devolver datos del usuario 
responder(200, [
    'ok'      => true,
    'usuario' => [
        'id'     => (int) $usuario['id'],
        'nombre' => $usuario['nombre'],
        'correo' => $usuario['correo'],
        'rol'    => $usuario['rol'],
    ]
]);