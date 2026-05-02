<?php
// ============================================================
//  api/reservaciones/cancelar.php — Hotel Quinta Dalam
//  Cancela una reservación y libera la habitación.
//  Solo accesible para admin y recepcionista.
//
//  Método: POST
//  Body:   { "reservacion_id": 1, "motivo": "..." }
// ============================================================

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/response.php';

setCorsHeaders();
soloMetodo('POST');

session_start();

// ── RBAC: solo admin o recepcionista ─────────────────────────
$rol = $_SESSION['rol'] ?? '';
if (!in_array($rol, ['admin', 'recepcionista'], true)) {
    responder(403, ['ok' => false, 'mensaje' => 'Acceso restringido.']);
}

$body          = leerBody();
$reservacionId = (int) ($body['reservacion_id'] ?? 0);
$motivo        = limpiar($body['motivo'] ?? 'Cancelada desde el panel de administración');

if ($reservacionId <= 0) {
    responder(400, ['ok' => false, 'mensaje' => 'ID de reservación inválido.']);
}

$pdo = getPDO();

// Verificar que la reservación existe y no está ya cancelada
$stmt = $pdo->prepare(
    'SELECT id, estado, habitacion_id FROM reservaciones WHERE id = :id LIMIT 1'
);
$stmt->execute([':id' => $reservacionId]);
$reservacion = $stmt->fetch();

if (!$reservacion) {
    responder(404, ['ok' => false, 'mensaje' => 'Reservación no encontrada.']);
}

if (in_array($reservacion['estado'], ['cancelada', 'completada'], true)) {
    responder(409, ['ok' => false, 'mensaje' => 'Esta reservación ya está ' . $reservacion['estado'] . '.']);
}

// ── Transacción: cancelar reserva + liberar habitación ───────
try {
    $pdo->beginTransaction();

    // 1. Cancelar la reservación
    $pdo->prepare(
        'UPDATE reservaciones SET estado = "cancelada" WHERE id = :id'
    )->execute([':id' => $reservacionId]);

    // 2. Verificar si la habitación tiene otras reservas activas
    $stmtOtras = $pdo->prepare(
        'SELECT COUNT(*) FROM reservaciones
         WHERE habitacion_id = :hab_id
           AND id != :res_id
           AND estado IN ("pendiente", "confirmada", "activa")'
    );
    $stmtOtras->execute([
        ':hab_id' => $reservacion['habitacion_id'],
        ':res_id' => $reservacionId
    ]);
    $otrasActivas = (int) $stmtOtras->fetchColumn();

    // 3. Solo liberar la habitación si no hay otras reservas activas
    if ($otrasActivas === 0) {
        $pdo->prepare(
            'UPDATE habitaciones SET estado = "disponible" WHERE id = :id'
        )->execute([':id' => $reservacion['habitacion_id']]);
    }

    // 4. Registrar el motivo en el log (si existe columna notas)
    $pdo->prepare(
        'UPDATE reservaciones SET notas = CONCAT(IFNULL(notas,""), " | Cancelación: ", :motivo)
         WHERE id = :id'
    )->execute([':motivo' => $motivo, ':id' => $reservacionId]);

    $pdo->commit();

    responder(200, [
        'ok'      => true,
        'mensaje' => 'Reservación cancelada y habitación liberada correctamente.',
    ]);

} catch (Exception $e) {
    $pdo->rollBack();
    error_log('Cancelar reservación error: ' . $e->getMessage());
    responder(500, ['ok' => false, 'mensaje' => 'Error al cancelar la reservación.']);
}