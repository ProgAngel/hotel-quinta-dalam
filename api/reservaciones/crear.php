<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/response.php';

setCorsHeaders();
soloMetodo('POST');

$body = leerBody();

//  1. Extraer campos
$usuarioId    = isset($body['usuario_id'])    ? (int) $body['usuario_id']    : 0;
$habitacionId = isset($body['habitacion_id']) ? (int) $body['habitacion_id'] : 0;
$fechaEntrada = limpiar($body['fecha_entrada'] ?? '');
$fechaSalida  = limpiar($body['fecha_salida']  ?? '');
$numHuespedes = isset($body['num_huespedes'])  ? (int) $body['num_huespedes'] : 1;
$notas        = limpiar($body['notas']         ?? '');

// 2. Validaciones básicas 
$errores = [];

if ($usuarioId <= 0)    $errores['usuario_id']    = 'ID de usuario inválido.';
if ($habitacionId <= 0) $errores['habitacion_id'] = 'ID de habitación inválido.';

// Validar formato de fechas
$entradaDT = DateTime::createFromFormat('Y-m-d', $fechaEntrada);
$salidaDT  = DateTime::createFromFormat('Y-m-d', $fechaSalida);
$hoy       = new DateTime('today');

if (!$entradaDT) {
    $errores['fecha_entrada'] = 'Formato de fecha inválido (YYYY-MM-DD).';
} elseif ($entradaDT < $hoy) {
    $errores['fecha_entrada'] = 'La fecha de entrada no puede ser en el pasado.';
}

if (!$salidaDT) {
    $errores['fecha_salida'] = 'Formato de fecha inválido (YYYY-MM-DD).';
} elseif ($entradaDT && $salidaDT <= $entradaDT) {
    $errores['fecha_salida'] = 'La fecha de salida debe ser posterior a la de entrada.';
}

if ($numHuespedes < 1 || $numHuespedes > 20) {
    $errores['num_huespedes'] = 'Número de huéspedes inválido.';
}

if (!empty($errores)) {
    responder(400, ['ok' => false, 'mensaje' => 'Datos inválidos.', 'errores' => $errores]);
}

$pdo = getPDO();

// 3. Verificar que el usuario existe 
$stmtU = $pdo->prepare('SELECT id FROM usuarios WHERE id = :id AND estado = "activo" LIMIT 1');
$stmtU->execute([':id' => $usuarioId]);
if (!$stmtU->fetch()) {
    responder(404, ['ok' => false, 'mensaje' => 'Usuario no encontrado o inactivo.']);
}

// 4. Verificar que la habitación existe y obtener precio
$stmtH = $pdo->prepare(
    'SELECT id, nombre, precio_noche, capacidad, estado
     FROM habitaciones WHERE id = :id LIMIT 1'
);
$stmtH->execute([':id' => $habitacionId]);
$habitacion = $stmtH->fetch();

if (!$habitacion) {
    responder(404, ['ok' => false, 'mensaje' => 'Habitación no encontrada.']);
}

if ($habitacion['estado'] === 'mantenimiento') {
    responder(409, ['ok' => false, 'mensaje' => 'La habitación está en mantenimiento.']);
}

if ($numHuespedes > (int) $habitacion['capacidad']) {
    responder(400, [
        'ok'      => false,
        'mensaje' => "La habitación tiene capacidad máxima de {$habitacion['capacidad']} personas."
    ]);
}
// Detecta cualquier reserva activa que se solape con las fechas pedidas
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
    responder(409, [
        'ok'      => false,
        'mensaje' => 'La habitación no está disponible en las fechas seleccionadas.'
    ]);
}

// 6. Calcular total 
$noches      = $entradaDT->diff($salidaDT)->days;
$precioNoche = (float) $habitacion['precio_noche'];
$total       = $noches * $precioNoche;

// 7. Generar código único de reservación 
$codigo = 'R-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -4));

// 8. TRANSACCIÓN PDO — evita race conditions 
try {
    $pdo->beginTransaction();

    // Verificar disponibilidad DENTRO de la transacción
    // (segunda verificación para proteger contra race conditions)
    $stmtCheck = $pdo->prepare(
        'SELECT id FROM reservaciones
         WHERE habitacion_id = :hab_id
           AND estado NOT IN ("cancelada", "completada")
           AND fecha_entrada  < :fecha_salida
           AND fecha_salida   > :fecha_entrada
         LIMIT 1'
    );
    $stmtCheck->execute([
        ':hab_id'        => $habitacionId,
        ':fecha_entrada' => $fechaEntrada,
        ':fecha_salida'  => $fechaSalida,
    ]);

    if ($stmtCheck->fetch()) {
        $pdo->rollBack();
        responder(409, [
            'ok'      => false,
            'mensaje' => 'La habitación fue reservada por otro usuario. Elige otras fechas.'
        ]);
    }

    // Insertar reservación
    $insert = $pdo->prepare(
        'INSERT INTO reservaciones
            (codigo, usuario_id, habitacion_id, fecha_entrada, fecha_salida,
             num_huespedes, precio_noche, total, estado, notas)
         VALUES
            (:codigo, :usuario_id, :habitacion_id, :fecha_entrada, :fecha_salida,
             :num_huespedes, :precio_noche, :total, "pendiente", :notas)'
    );
    $insert->execute([
        ':codigo'         => $codigo,
        ':usuario_id'     => $usuarioId,
        ':habitacion_id'  => $habitacionId,
        ':fecha_entrada'  => $fechaEntrada,
        ':fecha_salida'   => $fechaSalida,
        ':num_huespedes'  => $numHuespedes,
        ':precio_noche'   => $precioNoche,
        ':total'          => $total,
        ':notas'          => $notas ?: null,
    ]);

    $nuevaId = (int) $pdo->lastInsertId();

    // Marcar habitación como ocupada
    $pdo->prepare('UPDATE habitaciones SET estado = "ocupada" WHERE id = :id')
        ->execute([':id' => $habitacionId]);

    $pdo->commit();

} catch (Exception $e) {
    $pdo->rollBack();
    responder(500, ['ok' => false, 'mensaje' => 'Error al procesar la reservación. Intenta de nuevo.']);
}

// 9. Respuesta 
responder(201, [
    'ok'      => true,
    'mensaje' => 'Reservación creada exitosamente.',
    'reservacion' => [
        'id'            => $nuevaId,
        'codigo'        => $codigo,
        'habitacion'    => $habitacion['nombre'],
        'fecha_entrada' => $fechaEntrada,
        'fecha_salida'  => $fechaSalida,
        'noches'        => $noches,
        'precio_noche'  => $precioNoche,
        'total'         => $total,
        'estado'        => 'pendiente',
    ]
]);