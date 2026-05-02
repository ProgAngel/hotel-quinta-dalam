<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/response.php';

setCorsHeaders();
soloMetodo('GET');

$pdo = getPDO();

$where  = [];
$params = [];

if (!empty($_GET['usuario_id']) && is_numeric($_GET['usuario_id'])) {
    $where[]               = 'r.usuario_id = :usuario_id';
    $params[':usuario_id'] = (int) $_GET['usuario_id'];
}

$estadosValidos = ['pendiente', 'confirmada', 'activa', 'completada', 'cancelada'];
if (!empty($_GET['estado'])) {
    $estado = limpiar($_GET['estado']);
    if (in_array($estado, $estadosValidos, true)) {
        $where[]           = 'r.estado = :estado';
        $params[':estado'] = $estado;
    }
}

$sql = 'SELECT
            r.id,
            r.codigo,
            r.fecha_entrada,
            r.fecha_salida,
            r.num_huespedes,
            r.precio_noche,
            r.total,
            r.estado,
            r.notas,
            r.created_at,
            COALESCE(u.nombre, r.huesped_nombre, "Huésped") AS huesped_nombre,
            u.correo                                         AS huesped_correo,
            h.numero                                         AS habitacion_numero,
            h.nombre                                         AS habitacion_nombre,
            h.tipo                                           AS habitacion_tipo
        FROM reservaciones r
        LEFT JOIN  usuarios     u ON u.id = r.usuario_id
        INNER JOIN habitaciones h ON h.id = r.habitacion_id';

if (!empty($where)) {
    $sql .= ' WHERE ' . implode(' AND ', $where);
}

$sql .= ' ORDER BY r.created_at DESC';

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$reservaciones = $stmt->fetchAll();

foreach ($reservaciones as &$r) {
    $r['id']            = (int)   $r['id'];
    $r['num_huespedes'] = (int)   $r['num_huespedes'];
    $r['precio_noche']  = (float) $r['precio_noche'];
    $r['total']         = (float) $r['total'];
    $entrada            = new DateTime($r['fecha_entrada']);
    $salida             = new DateTime($r['fecha_salida']);
    $r['noches']        = (int) $entrada->diff($salida)->days;
}
unset($r);

responder(200, [
    'ok'            => true,
    'total'         => count($reservaciones),
    'reservaciones' => $reservaciones,
]);