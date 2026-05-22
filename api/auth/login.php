<?php
// ── Headers 
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Responde a preflight de CORS sin hacer nada más
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Solo acepta POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'mensaje' => 'Método no permitido.']);
    exit;
}

// ── Conexión a la BD (detecta entorno automáticamente)
// database.php usa getenv() en Azure y .env en local
require_once __DIR__ . '/../config/database.php';
$pdo = getPDO();

// ── Leer y validar el body JSON 
$body = json_decode(file_get_contents('php://input'), true);

if (!$body) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'mensaje' => 'Cuerpo de la petición inválido.']);
    exit;
}

$correo     = trim($body['correo']     ?? '');
$contrasena = trim($body['contrasena'] ?? '');

// Validación básica de campos vacíos
if (empty($correo) || empty($contrasena)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'mensaje' => 'Correo y contraseña son obligatorios.']);
    exit;
}

// Validación de formato de correo
if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'mensaje' => 'Formato de correo inválido.']);
    exit;
}

// ── Buscar usuario por correo
// NUNCA buscar por correo Y contraseña directamente —
// primero traemos el hash y luego lo verificamos con PHP
try {
    $stmt = $pdo->prepare(
        'SELECT id, nombre, correo, contrasena, rol, estado
         FROM usuarios
         WHERE correo = :correo
         LIMIT 1'
    );
    $stmt->execute([':correo' => $correo]);
    $usuario = $stmt->fetch();
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'mensaje' => 'Error al consultar la base de datos.']);
    exit;
}

// ── Verificar si existe y está activo 
if (!$usuario) {
    http_response_code(401);
    // Mensaje genérico — no revelar si el correo existe o no
    echo json_encode(['ok' => false, 'mensaje' => 'Correo o contraseña incorrectos.']);
    exit;
}

if ($usuario['estado'] !== 'activo') {
    http_response_code(403);
    echo json_encode(['ok' => false, 'mensaje' => 'Tu cuenta está inactiva. Contacta al administrador.']);
    exit;
}

// ── Verificar contraseña con bcrypt 
// password_verify() compara el texto plano contra el hash
// de forma segura — nunca almacena ni expone la contraseña
if (!password_verify($contrasena, $usuario['contrasena'])) {
    http_response_code(401);
    echo json_encode(['ok' => false, 'mensaje' => 'Correo o contraseña incorrectos.']);
    exit;
}

// ── Login exitoso 
// Iniciar sesión PHP — aquí guardamos el fingerprint
// del navegador para el sistema de seguridad (validate.php)
session_start();
session_regenerate_id(true); // previene session fixation

$_SESSION['usuario_id']       = (int) $usuario['id'];
$_SESSION['rol']              = $usuario['rol'];
$_SESSION['ua_hash']          = hash('sha256', $_SERVER['HTTP_USER_AGENT'] ?? '');
$_SESSION['ultima_actividad'] = time();
$_SESSION['created_at']       = time();

// Nunca devolver la contraseña (ni el hash) al frontend
http_response_code(200);
echo json_encode([
    'ok'      => true,
    'usuario' => [
        'id'     => (int) $usuario['id'],
        'nombre' => $usuario['nombre'],
        'correo' => $usuario['correo'],
        'rol'    => $usuario['rol'],
    ]
]);