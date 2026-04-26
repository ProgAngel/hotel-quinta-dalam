<?php
// ============================================================
//  api/pagos/webhook.php — Hotel Quinta Dalam
//  Recibe notificaciones de Mercado Pago (servidor a servidor)
//  y actualiza el estado de la reservación en la BD.
//
//  ⚠️  REGLA DE ORO: Este es el ÚNICO lugar donde se confirma
//      un pago. Nunca actualices la BD desde exito.html.
//      Cualquiera puede visitar exito.html directamente.
//
//  CÓMO FUNCIONA:
//  1. MP hace un POST a esta URL cuando cambia el estado del pago
//  2. Verificamos que la firma del request es de MP (seguridad)
//  3. Consultamos la API de MP para confirmar el estado real
//  4. Si el pago está aprobado → actualizamos la BD
//
//  LOG: Todos los eventos se guardan en logs/webhook.log
//       para auditoría y debugging.
// ============================================================

require_once __DIR__ . '/../config/database.php';

// Headers para MP (no usar response.php — MP no espera nuestro formato)
header('Content-Type: application/json');

// ── Credenciales (mismas que crear-preferencia.php) ──────────
define('MP_ACCESS_TOKEN',   'TEST-AQUI_VA_TU_ACCESS_TOKEN_DE_PRUEBA');
define('MP_WEBHOOK_SECRET', 'TU_CLAVE_SECRETA_WEBHOOK');

// ── Función de logging ────────────────────────────────────────
function wlog(string $msg): void {
    $dir = __DIR__ . '/../../logs';
    if (!is_dir($dir)) mkdir($dir, 0755, true);
    file_put_contents(
        $dir . '/webhook.log',
        '[' . date('Y-m-d H:i:s') . '] ' . $msg . PHP_EOL,
        FILE_APPEND
    );
}

// ── Leer el cuerpo del request ────────────────────────────────
$body    = file_get_contents('php://input');
$payload = json_decode($body, true);

wlog('Webhook recibido: ' . $body);

// ── Responder 200 inmediatamente ──────────────────────────────
// MP requiere una respuesta 200 en menos de 5 segundos.
// Si tardamos, MP reintentará el webhook creyendo que falló.
// Procesamos de forma asíncrona después de responder.
http_response_code(200);
echo json_encode(['ok' => true]);

// Cerrar la conexión para que MP reciba su 200
if (function_exists('fastcgi_finish_request')) {
    fastcgi_finish_request();
}

// ── Verificar firma del webhook (seguridad) ──────────────────
// MP firma cada notificación con x-signature.
// Si la firma no coincide, alguien está simulando ser MP.
$xSignature  = $_SERVER['HTTP_X_SIGNATURE']  ?? '';
$xRequestId  = $_SERVER['HTTP_X_REQUEST_ID'] ?? '';

if ($xSignature && MP_WEBHOOK_SECRET) {
    // Extraer ts y hash de la firma
    $parts = [];
    foreach (explode(',', $xSignature) as $part) {
        [$k, $v]    = explode('=', trim($part), 2);
        $parts[$k]  = $v;
    }
    $ts      = $parts['ts']   ?? '';
    $v1      = $parts['v1']   ?? '';
    $dataId  = $payload['data']['id'] ?? '';

    // Construir el string a verificar (según doc de MP)
    $manifest  = "id:{$dataId};request-id:{$xRequestId};ts:{$ts};";
    $computed  = hash_hmac('sha256', $manifest, MP_WEBHOOK_SECRET);

    if (!hash_equals($computed, $v1)) {
        wlog('ERROR: Firma inválida — posible intento de fraude');
        exit; // Ya respondimos 200, solo dejamos de procesar
    }
}

// ── Procesar solo eventos de pago ────────────────────────────
$tipo = $payload['type'] ?? '';

if ($tipo !== 'payment') {
    wlog("Evento ignorado: tipo = {$tipo}");
    exit;
}

$pagoId = $payload['data']['id'] ?? null;
if (!$pagoId) {
    wlog('ERROR: No se recibió data.id en el webhook');
    exit;
}

// ── Consultar el estado REAL del pago en la API de MP ────────
// NUNCA confíes en los datos del webhook directamente.
// Siempre consulta la API de MP para obtener el estado real.
$ch = curl_init("https://api.mercadopago.com/v1/payments/{$pagoId}");
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER     => ['Authorization: Bearer ' . MP_ACCESS_TOKEN],
    CURLOPT_TIMEOUT        => 10,
]);
$mpRespuesta = curl_exec($ch);
$httpCode    = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) {
    wlog("ERROR: No se pudo consultar el pago {$pagoId} en MP. HTTP: {$httpCode}");
    exit;
}

$pago = json_decode($mpRespuesta, true);
wlog('Pago consultado: status=' . ($pago['status'] ?? '?') . ' ref=' . ($pago['external_reference'] ?? '?'));

$estadoPago       = $pago['status']             ?? '';
$externalRef      = $pago['external_reference'] ?? ''; // nuestro código de reservación
$montoAprobado    = $pago['transaction_amount'] ?? 0;

if (empty($externalRef)) {
    wlog('ERROR: external_reference vacío en el pago ' . $pagoId);
    exit;
}

// ── Actualizar BD según el estado ────────────────────────────
$pdo = getPDO();

// Obtener la reservación por código
$stmtR = $pdo->prepare(
    'SELECT id, total, estado FROM reservaciones WHERE codigo = :codigo LIMIT 1'
);
$stmtR->execute([':codigo' => $externalRef]);
$reservacion = $stmtR->fetch();

if (!$reservacion) {
    wlog("ERROR: Reservación {$externalRef} no encontrada en BD");
    exit;
}

// No reprocesar reservaciones ya confirmadas
if ($reservacion['estado'] === 'confirmada') {
    wlog("INFO: Reservación {$externalRef} ya estaba confirmada — ignorando");
    exit;
}

try {
    $pdo->beginTransaction();

    if ($estadoPago === 'approved') {
        // ── Pago aprobado ────────────────────────────────────
        // Actualizar reservación a confirmada
        $pdo->prepare(
            'UPDATE reservaciones SET estado = "confirmada" WHERE id = :id'
        )->execute([':id' => $reservacion['id']]);

        // Registrar el pago en la tabla pagos
        $pdo->prepare(
            'INSERT INTO pagos (reservacion_id, metodo, monto, estado, referencia)
             VALUES (:rid, "tarjeta", :monto, "completado", :ref)
             ON DUPLICATE KEY UPDATE estado = "completado", referencia = :ref'
        )->execute([
            ':rid'   => $reservacion['id'],
            ':monto' => $montoAprobado,
            ':ref'   => (string) $pagoId,
        ]);

        $pdo->commit();
        wlog("✅ Reservación {$externalRef} CONFIRMADA — Pago ID: {$pagoId}");

    } elseif (in_array($estadoPago, ['rejected', 'cancelled'], true)) {
        // ── Pago rechazado / cancelado ───────────────────────
        $pdo->prepare(
            'UPDATE pagos SET estado = "fallido"
             WHERE reservacion_id = :rid ORDER BY id DESC LIMIT 1'
        )->execute([':rid' => $reservacion['id']]);

        $pdo->commit();
        wlog("❌ Pago {$pagoId} rechazado para reservación {$externalRef}");

    } elseif ($estadoPago === 'in_process' || $estadoPago === 'pending') {
        // ── Pago pendiente (ej. OXXO, transferencia) ─────────
        $pdo->prepare(
            'UPDATE reservaciones SET estado = "pendiente" WHERE id = :id'
        )->execute([':id' => $reservacion['id']]);

        $pdo->commit();
        wlog("⏳ Pago {$pagoId} pendiente para reservación {$externalRef}");

    } else {
        $pdo->rollBack();
        wlog("INFO: Estado de pago no manejado: {$estadoPago}");
    }

} catch (Exception $e) {
    $pdo->rollBack();
    wlog('ERROR BD: ' . $e->getMessage());
}