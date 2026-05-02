<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/response.php';

setCorsHeaders();
soloMetodo('POST');

session_start();

// ── RBAC 
$rol = $_SESSION['rol'] ?? '';
if (!in_array($rol, ['admin', 'recepcionista'], true)) {
    responder(403, ['ok' => false, 'mensaje' => 'Acceso restringido.']);
}

$body          = leerBody();
$reservacionId = (int) ($body['reservacion_id'] ?? 0);
$metodo        = limpiar($body['metodo'] ?? 'efectivo');

if ($reservacionId <= 0) {
    responder(400, ['ok' => false, 'mensaje' => 'ID de reservación inválido.']);
}

$metodosValidos = ['efectivo', 'transferencia', 'tarjeta', 'otro'];
if (!in_array($metodo, $metodosValidos, true)) {
    responder(400, ['ok' => false, 'mensaje' => 'Método de pago inválido.']);
}

$pdo = getPDO();

$stmt = $pdo->prepare(
    'SELECT id, estado, total, habitacion_id FROM reservaciones WHERE id = :id LIMIT 1'
);
$stmt->execute([':id' => $reservacionId]);
$reservacion = $stmt->fetch();

if (!$reservacion) {
    responder(404, ['ok' => false, 'mensaje' => 'Reservación no encontrada.']);
}

if ($reservacion['estado'] === 'confirmada') {
    responder(409, ['ok' => false, 'mensaje' => 'Esta reservación ya está confirmada.']);
}

if (in_array($reservacion['estado'], ['cancelada', 'completada'], true)) {
    responder(409, ['ok' => false, 'mensaje' => 'No se puede confirmar una reservación ' . $reservacion['estado'] . '.']);
}

// ── Transacción: confirmar reserva + registrar pago 
try {
    $pdo->beginTransaction();

    // 1. Confirmar la reservación
    $pdo->prepare(
        'UPDATE reservaciones SET estado = "confirmada" WHERE id = :id'
    )->execute([':id' => $reservacionId]);

   // 2. Registrar el pago en tabla pagos
    $pdo->prepare(
        'INSERT INTO pagos (reservacion_id, metodo, monto, estado, referencia)
         VALUES (:rid, :metodo, :monto, "completado", :ref)
         ON DUPLICATE KEY UPDATE 
            estado = "completado", 
            metodo = :metodo_upd' 
    )->execute([
        ':rid'        => $reservacionId,
        ':metodo'     => $metodo,
        ':monto'      => $reservacion['total'],
        ':ref'        => 'DASH-' . strtoupper($metodo) . '-' . date('YmdHis'),
        ':metodo_upd' => $metodo  
    ]);
    // 3. La habitación ya está ocupada — no se toca
    // (permanece ocupada porque la reserva está confirmada)

    $pdo->commit();

    responder(200, [
        'ok'      => true,
        'mensaje' => 'Pago confirmado correctamente. Método: ' . $metodo . '.',
    ]);

} catch (Exception $e) {
    $pdo->rollBack();
    error_log('Confirmar pago error: ' . $e->getMessage());
    responder(500, ['ok' => false, 'mensaje' => 'Error al confirmar el pago.']);
}