<?php
// ============================================================
//  api/reservaciones/crear-manual.php — Hotel Quinta Dalam
//  Reservación manual desde el dashboard (huésped en recepción).
//  Bypasa Mercado Pago — pago en efectivo/transferencia.
//  Solo admin y recepcionista.
//
//  Método: POST
//  Body: {
//    habitacion_id, fecha_entrada, fecha_salida,
//    nombre_huesped, correo_huesped, num_huespedes,
//    metodo_pago, notas
//  }
// ============================================================

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/response.php';

setCorsHeaders();
soloMetodo('POST');

session_start();

// ── RBAC ─────────────────────────────────────────────────────
$rol        = $_SESSION['rol']        ?? '';
$operadorId = $_SESSION['usuario_id'] ?? 0;

if (!in_array($rol, ['admin', 'recepcionista'], true)) {
    responder(403, ['ok' => false, 'mensaje' => 'Acceso restringido.']);
}

$body = leerBody();

// ── Validaciones ─────────────────────────────────────────────
$habitacionId  = (int)    ($body['habitacion_id']  ?? 0);
$fechaEntrada  = limpiar($body['fecha_entrada']    ?? '');
$fechaSalida   = limpiar($body['fecha_salida']     ?? '');
$nombreHuesped = limpiar($body['nombre_huesped']   ?? '');
$correoHuesped = limpiar($body['correo_huesped']   ?? '');
$numHuespedes  = (int)    ($body['num_huespedes']  ?? 1);
$metodoPago    = limpiar($body['metodo_pago']      ?? 'efectivo');
$notas         = limpiar($body['notas']            ?? '');

if (!$habitacionId || !$fechaEntrada || !$fechaSalida || !$nombreHuesped) {
    responder(400, ['ok' => false, 'mensaje' => 'Faltan campos obligatorios.']);
}

// ── Validar fechas ────────────────────────────────────────────
$entradaDT = DateTime::createFromFormat('Y-m-d', $fechaEntrada);
$salidaDT  = DateTime::createFromFormat('Y-m-d', $fechaSalida);

if (!$entradaDT || !$salidaDT || $salidaDT <= $entradaDT) {
    responder(400, ['ok' => false, 'mensaje' => 'Fechas inválidas.']);
}

$noches = $entradaDT->diff($salidaDT)->days;

$pdo = getPDO();

// ── Verificar habitación ──────────────────────────────────────
$stmtH = $pdo->prepare(
    'SELECT id, nombre, precio_noche, capacidad, estado
     FROM habitaciones WHERE id = :id LIMIT 1'
);
$stmtH->execute([':id' => $habitacionId]);
$habitacion = $stmtH->fetch();

if (!$habitacion) {
    responder(404, ['ok' => false, 'mensaje' => 'Habitación no encontrada.']);
}

if ($habitacion['estado'] !== 'disponible') {
    responder(409, ['ok' => false, 'mensaje' => 'La habitación no está disponible.']);
}

// ── Verificar disponibilidad en fechas ────────────────────────
$stmtDisp = $pdo->prepare(
    'SELECT id FROM reservaciones
     WHERE habitacion_id = :hab_id
       AND estado NOT IN ("cancelada", "completada")
       AND fecha_entrada  < :fecha_salida
       AND fecha_salida   > :fecha_entrada
     LIMIT 1'
);
$stmtDisp->execute([
    ':hab_id'        => $habitacionId,
    ':fecha_entrada' => $fechaEntrada,
    ':fecha_salida'  => $fechaSalida,
]);

if ($stmtDisp->fetch()) {
    responder(409, ['ok' => false, 'mensaje' => 'La habitación no está disponible en esas fechas.']);
}

// ── Buscar usuario registrado por correo (opcional) ───────────
// Si el huésped tiene cuenta, la vinculamos.
// Si no, la reservación queda con usuario_id = NULL
// y el nombre se guarda en huesped_nombre.
$usuarioId = null;
if ($correoHuesped) {
    $stmtU = $pdo->prepare('SELECT id FROM usuarios WHERE correo = :correo LIMIT 1');
    $stmtU->execute([':correo' => $correoHuesped]);
    $usuarioExistente = $stmtU->fetch();
    if ($usuarioExistente) {
        $usuarioId = (int) $usuarioExistente['id'];
    }
}

$precioNoche = (float) $habitacion['precio_noche'];
$total       = $noches * $precioNoche;
$codigo      = 'DASH-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -4));

// ── TRANSACCIÓN: INSERT reserva + pago + UPDATE habitación ────
try {
    $pdo->beginTransaction();

    // 1. Crear reservación directamente en estado "confirmada"
    //    Guardamos huesped_nombre siempre para tener trazabilidad
    //    aunque el huésped tenga cuenta registrada.
    $stmtR = $pdo->prepare(
        'INSERT INTO reservaciones
            (codigo, usuario_id, huesped_nombre, habitacion_id,
             fecha_entrada, fecha_salida, num_huespedes,
             precio_noche, total, estado, notas)
         VALUES
            (:codigo, :uid, :huesped_nombre, :hab_id,
             :entrada, :salida, :num_h,
             :precio, :total, "confirmada", :notas)'
    );
    $stmtR->execute([
        ':codigo'         => $codigo,
        ':uid'            => $usuarioId,
        ':huesped_nombre' => $nombreHuesped,
        ':hab_id'         => $habitacionId,
        ':entrada'        => $fechaEntrada,
        ':salida'         => $fechaSalida,
        ':num_h'          => $numHuespedes,
        ':precio'         => $precioNoche,
        ':total'          => $total,
        ':notas'          => ($notas ?: null),
    ]);
    $nuevaId = (int) $pdo->lastInsertId();

    // 2. Registrar el pago inmediatamente
    //    La columna reservacion_id tiene UNIQUE KEY,
    //    ON DUPLICATE KEY UPDATE previene doble registro.
    $pdo->prepare(
        'INSERT INTO pagos (reservacion_id, metodo, monto, estado, referencia)
         VALUES (:rid, :metodo, :monto, "completado", :ref)
         ON DUPLICATE KEY UPDATE
            estado    = "completado",
            metodo    = :metodo,
            referencia = :ref'
    )->execute([
        ':rid'    => $nuevaId,
        ':metodo' => $metodoPago,
        ':monto'  => $total,
        ':ref'    => $codigo,
    ]);

    // 3. Marcar habitación como ocupada
    $pdo->prepare(
        'UPDATE habitaciones SET estado = "ocupada" WHERE id = :id'
    )->execute([':id' => $habitacionId]);

    $pdo->commit();

    responder(201, [
        'ok'      => true,
        'mensaje' => 'Reservación creada exitosamente desde recepción.',
        'reservacion' => [
            'id'             => $nuevaId,
            'codigo'         => $codigo,
            'huesped_nombre' => $nombreHuesped,
            'habitacion'     => $habitacion['nombre'],
            'fecha_entrada'  => $fechaEntrada,
            'fecha_salida'   => $fechaSalida,
            'noches'         => $noches,
            'total'          => $total,
            'estado'         => 'confirmada',
            'metodo_pago'    => $metodoPago,
        ]
    ]);

} catch (Exception $e) {
    $pdo->rollBack();
    error_log('Crear manual error: ' . $e->getMessage());
    responder(500, ['ok' => false, 'mensaje' => 'Error al crear la reservación.']);
}