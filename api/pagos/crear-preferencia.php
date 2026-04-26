<?php
// ============================================================
//  api/pagos/crear-preferencia.php — Hotel Quinta Dalam
//  Crea una preferencia de pago en Mercado Pago y devuelve
//  la URL del checkout al frontend.
//
//  Método: POST
//  Body:   { "reservacion_id": 1 }
//  Éxito:  { "ok": true, "init_point": "https://..." }
//
//  FLUJO:
//  1. Frontend envía el ID de la reservación
//  2. PHP verifica que la reservación pertenece al usuario
//  3. PHP crea la preferencia en la API de Mercado Pago
//  4. MP devuelve una URL de checkout (init_point)
//  5. Frontend redirige al usuario a esa URL
// ============================================================

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/response.php';

setCorsHeaders();
soloMetodo('POST');

// ── Verificar sesión activa ──────────────────────────────────
session_start();
if (empty($_SESSION['usuario_id'])) {
    responder(401, ['ok' => false, 'mensaje' => 'Debes iniciar sesión para pagar.']);
}

// ── Credenciales de Mercado Pago ─────────────────────────────
// ⚠️  SANDBOX (Pruebas) — reemplazar con producción al desplegar
// Las credenciales de prueba las encuentras en:
// mercadopago.com/developers → Tu aplicación → Credenciales → Pruebas
define('MP_ACCESS_TOKEN', 'TEST-AQUI_VA_TU_ACCESS_TOKEN_DE_PRUEBA');
define('MP_API_URL',      'https://api.mercadopago.com/checkout/preferences');
define('MP_WEBHOOK_SECRET', 'TU_CLAVE_SECRETA_WEBHOOK'); // para verificar autenticidad

// URL base de tu sitio (cambiar en Hostinger)
define('SITE_URL', 'http://localhost/hotel-quinta-dalam');

$body = leerBody();
$reservacionId = isset($body['reservacion_id']) ? (int) $body['reservacion_id'] : 0;

if ($reservacionId <= 0) {
    responder(400, ['ok' => false, 'mensaje' => 'ID de reservación inválido.']);
}

// ── Obtener datos de la reservación ─────────────────────────
$pdo = getPDO();

$stmt = $pdo->prepare(
    'SELECT r.id, r.codigo, r.total, r.estado, r.usuario_id,
            h.nombre AS habitacion_nombre, h.tipo AS habitacion_tipo,
            r.fecha_entrada, r.fecha_salida
     FROM reservaciones r
     INNER JOIN habitaciones h ON h.id = r.habitacion_id
     WHERE r.id = :id
     LIMIT 1'
);
$stmt->execute([':id' => $reservacionId]);
$reservacion = $stmt->fetch();

if (!$reservacion) {
    responder(404, ['ok' => false, 'mensaje' => 'Reservación no encontrada.']);
}

// Verificar que la reservación pertenece al usuario autenticado
if ((int) $reservacion['usuario_id'] !== (int) $_SESSION['usuario_id']) {
    responder(403, ['ok' => false, 'mensaje' => 'No tienes permiso para pagar esta reservación.']);
}

// Verificar que no esté ya pagada
if (in_array($reservacion['estado'], ['confirmada', 'completada'], true)) {
    responder(409, ['ok' => false, 'mensaje' => 'Esta reservación ya fue pagada.']);
}

if ($reservacion['estado'] === 'cancelada') {
    responder(409, ['ok' => false, 'mensaje' => 'Esta reservación fue cancelada.']);
}

// ── Crear preferencia en Mercado Pago ────────────────────────
// La preferencia define qué se vende, cuánto cuesta y
// a dónde redirigir al usuario según el resultado del pago.
$preferencia = [
    // El item que se está comprando
    'items' => [
        [
            'id'          => 'HAB-' . $reservacion['codigo'],
            'title'       => 'Habitación ' . $reservacion['habitacion_nombre'],
            'description' => $reservacion['habitacion_tipo'] . ' — '
                           . $reservacion['fecha_entrada'] . ' al '
                           . $reservacion['fecha_salida'],
            'category_id' => 'travels',
            'quantity'    => 1,
            'currency_id' => 'MXN',
            'unit_price'  => (float) $reservacion['total'],
        ]
    ],

    // URLs de redirección después del pago
    // ⚠️  El usuario llega aquí DESPUÉS del pago, pero NO
    //      actualizamos la BD aquí — eso lo hace el webhook.
    'back_urls' => [
        'success' => SITE_URL . '/exito.html?reservacion=' . $reservacion['codigo'],
        'failure' => SITE_URL . '/error-pago.html?reservacion=' . $reservacion['codigo'],
        'pending' => SITE_URL . '/pendiente.html?reservacion=' . $reservacion['codigo'],
    ],

    // auto_return: redirige automáticamente si el pago fue aprobado
    'auto_return' => 'approved',

    // external_reference: nuestro código interno para identificar
    // la reservación cuando llegue el webhook
    'external_reference' => $reservacion['codigo'],

    // Notificación webhook — MP llama a esta URL en secreto
    // cuando el estado del pago cambia
    'notification_url' => SITE_URL . '/api/pagos/webhook.php',

    // Datos del pagador (prellenados para comodidad del usuario)
    'payer' => [
        'email' => '', // se puede prellenar con el correo del usuario
    ],

    // Expiración de la preferencia: 24 horas
    'expires'          => true,
    'expiration_date_to' => date('Y-m-d\TH:i:s.000-05:00', strtotime('+24 hours')),
];

// ── Llamar a la API de Mercado Pago ──────────────────────────
$ch = curl_init(MP_API_URL);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => json_encode($preferencia),
    CURLOPT_HTTPHEADER     => [
        'Content-Type: application/json',
        'Authorization: Bearer ' . MP_ACCESS_TOKEN,
    ],
    CURLOPT_TIMEOUT        => 15,
]);

$respuesta  = curl_exec($ch);
$httpCode   = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError  = curl_error($ch);
curl_close($ch);

if ($curlError) {
    responder(500, ['ok' => false, 'mensaje' => 'Error de conexión con Mercado Pago.']);
}

$mpData = json_decode($respuesta, true);

if ($httpCode !== 201 || empty($mpData['id'])) {
    // Loguear el error para debugging (no exponer al usuario)
    error_log('MP Error: ' . $respuesta);
    responder(500, ['ok' => false, 'mensaje' => 'Mercado Pago no pudo crear el pago. Intenta de nuevo.']);
}

// ── Guardar la preferencia en la BD (para trazabilidad) ──────
$insP = $pdo->prepare(
    'INSERT INTO pagos (reservacion_id, metodo, monto, estado, referencia)
     VALUES (:rid, "tarjeta", :monto, "pendiente", :ref)
     ON DUPLICATE KEY UPDATE referencia = :ref, updated_at = NOW()'
);
// Nota: puede que la tabla pagos no tenga updated_at aún — simplemente inserta
try {
    $insP->execute([
        ':rid'   => $reservacionId,
        ':monto' => $reservacion['total'],
        ':ref'   => $mpData['id'], // ID de preferencia de MP
    ]);
} catch (Exception $e) {
    // No bloquear el flujo si falla la inserción de trazabilidad
    error_log('Pagos insert error: ' . $e->getMessage());
}

// ── Devolver la URL de checkout al frontend ───────────────────
// sandbox_init_point = URL para pruebas
// init_point         = URL para producción
$url = MP_ACCESS_TOKEN[0] === 'T'
    ? ($mpData['sandbox_init_point'] ?? $mpData['init_point'])
    : $mpData['init_point'];

responder(200, [
    'ok'             => true,
    'init_point'     => $url,
    'preferencia_id' => $mpData['id'],
]);