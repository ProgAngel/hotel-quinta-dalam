<?php
// ============================================================
//  api/habitaciones/listar.php — Hotel Quinta Dalam
//  Devuelve el listado de habitaciones con filtros y paginación
//
//  Método:  GET
//  Params:  ?estado=disponible    (opcional)
//           ?tipo=Suite           (opcional)
//           ?capacidad=3          (opcional, mínimo de personas)
//           ?limit=3              (opcional, máximo de resultados)
//           ?pagina=1             (opcional, para paginación)
//  Éxito:   200 { "ok": true, "total": N, "habitaciones": [...] }
// ============================================================

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/response.php';

setCorsHeaders();
soloMetodo('GET');

$pdo = getPDO();

// ── RECOLECTOR DE BASURA — Limpieza pasiva ───────────────────
// Cada vez que alguien consulta el catálogo, liberamos las
// habitaciones cuyas reservaciones pendientes llevan más de
// 15 minutos sin confirmarse (usuario abandonó el pago).
try {
    $pdo->beginTransaction();

    // Paso 1: Cancelar reservaciones pendientes > 15 minutos
    $pdo->prepare(
        'UPDATE reservaciones
         SET estado = "cancelada"
         WHERE estado = "pendiente"
           AND created_at < NOW() - INTERVAL 15 MINUTE'
    )->execute();

    // Paso 2: Liberar habitaciones sin reserva activa
    $pdo->prepare(
        'UPDATE habitaciones h
         SET h.estado = "disponible"
         WHERE h.estado = "ocupada"
           AND NOT EXISTS (
               SELECT 1 FROM reservaciones r
               WHERE r.habitacion_id = h.id
                 AND r.estado IN ("pendiente", "confirmada", "activa")
           )'
    )->execute();

    $pdo->commit();
} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    error_log('Limpieza pasiva error: ' . $e->getMessage());
}
// ── Fin recolector

$where  = [];
$params = [];

$estadoValidos = ['disponible', 'ocupada', 'mantenimiento'];
$tiposValidos  = [
    'Estándar', 'Familiar', 'Suite', 'Suite Deluxe',
    'Suite Presidencial', 'Ejecutiva', 'Master Familiar'
];

if (!empty($_GET['estado'])) {
    $estado = limpiar($_GET['estado']);
    if (in_array($estado, $estadoValidos, true)) {
        $where[]           = 'estado = :estado';
        $params[':estado'] = $estado;
    }
}

if (!empty($_GET['tipo'])) {
    $tipo = limpiar($_GET['tipo']);
    if (in_array($tipo, $tiposValidos, true)) {
        $where[]         = 'tipo = :tipo';
        $params[':tipo'] = $tipo;
    }
}

if (!empty($_GET['capacidad']) && is_numeric($_GET['capacidad'])) {
    $capacidad               = (int) $_GET['capacidad'];
    $where[]                 = 'capacidad >= :capacidad';
    $params[':capacidad']    = $capacidad;
}

// ── Paginación ───────────────────────────────────────────────
$limit  = isset($_GET['limit'])  && is_numeric($_GET['limit'])  ? min((int) $_GET['limit'],  100) : 50;
$pagina = isset($_GET['pagina']) && is_numeric($_GET['pagina']) ? max((int) $_GET['pagina'],  1)  : 1;
$offset = ($pagina - 1) * $limit;

// ── Contar total con los mismos filtros ──────────────────────
$sqlCount = 'SELECT COUNT(*) FROM habitaciones';
if (!empty($where)) $sqlCount .= ' WHERE ' . implode(' AND ', $where);
$stmtCount = $pdo->prepare($sqlCount);
$stmtCount->execute($params);
$totalRegistros = (int) $stmtCount->fetchColumn();

// ── Consulta principal con LIMIT y OFFSET ───────────────────
$sql = 'SELECT id, numero, nombre, tipo, precio_noche,
               capacidad, descripcion, estado, imagen_url
        FROM habitaciones';

if (!empty($where)) $sql .= ' WHERE ' . implode(' AND ', $where);
$sql .= ' ORDER BY CAST(numero AS UNSIGNED) ASC';
$sql .= ' LIMIT :limit OFFSET :offset';

$stmt = $pdo->prepare($sql);
foreach ($params as $key => $val) { $stmt->bindValue($key, $val); }
$stmt->bindValue(':limit',  $limit,  PDO::PARAM_INT);
$stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
$stmt->execute();
$habitaciones = $stmt->fetchAll();

foreach ($habitaciones as &$hab) {
    $hab['precio_noche'] = (float) $hab['precio_noche'];
    $hab['capacidad']    = (int)   $hab['capacidad'];
    $hab['id']           = (int)   $hab['id'];
}
unset($hab);

responder(200, [
    'ok'            => true,
    'total'         => count($habitaciones),
    'total_global'  => (int) $totalRegistros,
    'pagina'        => $pagina,
    'limit'         => $limit,
    'habitaciones'  => $habitaciones,
]);