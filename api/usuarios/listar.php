<?php
// ============================================================
//  api/usuarios/listar.php — Hotel Quinta Dalam
//  Lista todos los usuarios (solo accesible para admins).
//  En esta versión valida el rol desde la sesión PHP.
//
//  Método: GET
//  Params: ?rol=cliente|admin  (opcional)
//          ?estado=activo|inactivo|pendiente (opcional)
//          ?buscar=texto (opcional, busca en nombre y correo)
// ============================================================

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/response.php';

setCorsHeaders();
soloMetodo('GET');

// ── Verificar que es admin vía sesión PHP ────────────────────
session_start();
if (empty($_SESSION['usuario_id']) || ($_SESSION['rol'] ?? '') !== 'admin') {
    responder(403, ['ok' => false, 'mensaje' => 'Acceso restringido a administradores.']);
}

$pdo = getPDO();

// ── Filtros opcionales ───────────────────────────────────────
$where  = [];
$params = [];

if (!empty($_GET['rol'])) {
    $rol = limpiar($_GET['rol']);
    if (in_array($rol, ['cliente', 'admin'], true)) {
        $where[]        = 'rol = :rol';
        $params[':rol'] = $rol;
    }
}

if (!empty($_GET['estado'])) {
    $estado = limpiar($_GET['estado']);
    if (in_array($estado, ['activo', 'inactivo', 'pendiente'], true)) {
        $where[]           = 'estado = :estado';
        $params[':estado'] = $estado;
    }
}

if (!empty($_GET['buscar'])) {
    $buscar              = '%' . limpiar($_GET['buscar']) . '%';
    $where[]             = '(nombre LIKE :buscar OR correo LIKE :buscar)';
    $params[':buscar']   = $buscar;
}

// ── Paginación ───────────────────────────────────────────────
$limit  = isset($_GET['limit'])  && is_numeric($_GET['limit'])  ? min((int) $_GET['limit'],  200) : 50;
$pagina = isset($_GET['pagina']) && is_numeric($_GET['pagina']) ? max((int) $_GET['pagina'],  1)  : 1;
$offset = ($pagina - 1) * $limit;

// ── Construir y ejecutar consulta ────────────────────────────
$sql = 'SELECT id, nombre, correo, telefono, rol, estado, created_at
        FROM usuarios';

if (!empty($where)) $sql .= ' WHERE ' . implode(' AND ', $where);
$sql .= ' ORDER BY created_at DESC LIMIT :limit OFFSET :offset';

$stmt = $pdo->prepare($sql);
foreach ($params as $key => $val) { $stmt->bindValue($key, $val); }
$stmt->bindValue(':limit',  $limit,  PDO::PARAM_INT);
$stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
$stmt->execute();
$usuarios = $stmt->fetchAll();

foreach ($usuarios as &$u) { $u['id'] = (int) $u['id']; }
unset($u);

responder(200, [
    'ok'       => true,
    'total'    => count($usuarios),
    'pagina'   => $pagina,
    'limit'    => $limit,
    'usuarios' => $usuarios,
]);