<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/response.php';

setCorsHeaders();

session_start();
if (($_SESSION['rol'] ?? '') !== 'admin') {
    responder(403, ['ok' => false, 'mensaje' => 'Solo el administrador puede gestionar habitaciones.']);
}

$metodo = $_SERVER['REQUEST_METHOD'];
if (!in_array($metodo, ['POST', 'PUT'], true)) {
    responder(405, ['ok' => false, 'mensaje' => 'Método no permitido.']);
}

$body = leerBody();
$pdo  = getPDO();

$tiposValidos   = ['Estándar','Familiar','Suite','Suite Deluxe','Suite Presidencial','Ejecutiva','Master Familiar'];
$estadosValidos = ['disponible','ocupada','mantenimiento','inactiva'];

// ── CREAR habitación nueva (POST) 
if ($metodo === 'POST') {
    $numero      = limpiar($body['numero']       ?? '');
    $nombre      = limpiar($body['nombre']       ?? '');
    $tipo        = limpiar($body['tipo']         ?? '');
    $precioNoche = (float) ($body['precio_noche'] ?? 0);
    $capacidad   = (int)   ($body['capacidad']   ?? 1);
    $descripcion = limpiar($body['descripcion']  ?? '');
    $estado      = limpiar($body['estado']       ?? 'disponible');

    if (!$numero || !$nombre || !$tipo || $precioNoche <= 0) {
        responder(400, ['ok' => false, 'mensaje' => 'Faltan campos obligatorios.']);
    }
    if (!in_array($tipo, $tiposValidos, true)) {
        responder(400, ['ok' => false, 'mensaje' => 'Tipo de habitación inválido.']);
    }
    if (!in_array($estado, $estadosValidos, true)) $estado = 'disponible';

    // Verificar que el número no exista ya
    $stmtCheck = $pdo->prepare('SELECT id FROM habitaciones WHERE numero = :numero LIMIT 1');
    $stmtCheck->execute([':numero' => $numero]);
    if ($stmtCheck->fetch()) {
        responder(409, ['ok' => false, 'mensaje' => "El número de habitación $numero ya existe."]);
    }

    $stmt = $pdo->prepare(
        'INSERT INTO habitaciones (numero, nombre, tipo, precio_noche, capacidad, descripcion, estado)
         VALUES (:numero, :nombre, :tipo, :precio, :capacidad, :descripcion, :estado)'
    );
    $stmt->execute([
        ':numero'      => $numero,
        ':nombre'      => $nombre,
        ':tipo'        => $tipo,
        ':precio'      => $precioNoche,
        ':capacidad'   => $capacidad,
        ':descripcion' => $descripcion ?: null,
        ':estado'      => $estado,
    ]);

    responder(201, [
        'ok'      => true,
        'mensaje' => "Habitación $nombre creada exitosamente.",
        'id'      => (int) $pdo->lastInsertId(),
    ]);
}

// ── ACTUALIZAR habitación (PUT)
if ($metodo === 'PUT') {
    $id          = (int)   ($body['id']           ?? 0);
    $nombre      = limpiar($body['nombre']        ?? '');
    $tipo        = limpiar($body['tipo']          ?? '');
    $precioNoche = (float) ($body['precio_noche'] ?? 0);
    $capacidad   = (int)   ($body['capacidad']    ?? 1);
    $descripcion = limpiar($body['descripcion']   ?? '');
    $estado      = limpiar($body['estado']        ?? '');

    if (!$id) {
        responder(400, ['ok' => false, 'mensaje' => 'ID de habitación requerido.']);
    }

    // Verificar que existe
    $stmtH = $pdo->prepare('SELECT id, estado FROM habitaciones WHERE id = :id LIMIT 1');
    $stmtH->execute([':id' => $id]);
    $hab = $stmtH->fetch();
    if (!$hab) {
        responder(404, ['ok' => false, 'mensaje' => 'Habitación no encontrada.']);
    }

    // Validar tipo y estado si se enviaron
    if ($tipo && !in_array($tipo, $tiposValidos, true)) {
        responder(400, ['ok' => false, 'mensaje' => 'Tipo de habitación inválido.']);
    }
    if ($estado && !in_array($estado, $estadosValidos, true)) {
        responder(400, ['ok' => false, 'mensaje' => 'Estado de habitación inválido.']);
    }

    // Si se cambia a 'inactiva', verificar que no tenga reservas activas
    if ($estado === 'inactiva') {
        $stmtRes = $pdo->prepare(
            'SELECT COUNT(*) FROM reservaciones
             WHERE habitacion_id = :id
               AND estado IN ("pendiente", "confirmada", "activa")'
        );
        $stmtRes->execute([':id' => $id]);
        if ((int) $stmtRes->fetchColumn() > 0) {
            responder(409, ['ok' => false, 'mensaje' => 'No se puede desactivar: tiene reservaciones activas.']);
        }
    }

    // Construir UPDATE dinámico solo con campos enviados
    $sets   = [];
    $params = [':id' => $id];
    if ($nombre)      { $sets[] = 'nombre = :nombre';           $params[':nombre']      = $nombre;      }
    if ($tipo)        { $sets[] = 'tipo = :tipo';               $params[':tipo']        = $tipo;        }
    if ($precioNoche) { $sets[] = 'precio_noche = :precio';     $params[':precio']      = $precioNoche; }
    if ($capacidad)   { $sets[] = 'capacidad = :capacidad';     $params[':capacidad']   = $capacidad;   }
    if ($descripcion !== '') { $sets[] = 'descripcion = :desc'; $params[':desc']        = $descripcion ?: null; }
    if ($estado)      { $sets[] = 'estado = :estado';           $params[':estado']      = $estado;      }

    if (empty($sets)) {
        responder(400, ['ok' => false, 'mensaje' => 'No hay campos para actualizar.']);
    }

    $pdo->prepare('UPDATE habitaciones SET ' . implode(', ', $sets) . ' WHERE id = :id')
        ->execute($params);

    responder(200, ['ok' => true, 'mensaje' => 'Habitación actualizada correctamente.']);
}