<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// ... aquí sigue el resto de tu código normal (require_once, etc.)
// ============================================================
//  api/pagos/crear-preferencia.php — Hotel Quinta Dalam
//  Crea una preferencia de pago en Mercado Pago usando el SDK
//  oficial y devuelve la URL del checkout al frontend.
//
//  Método: POST
//  Body:   { "reservacion_id": 1 }
//  Éxito:  { "ok": true, "init_point": "https://..." }
// ============================================================

require_once __DIR__ . '/../../vendor/autoload.php'; // SDK de Composer
require_once __DIR__ . '/../config/database.php';     // carga .env + PDO
require_once __DIR__ . '/../config/response.php';

use MercadoPago\Client\Preference\PreferenceClient;
use MercadoPago\MercadoPagoConfig;

setCorsHeaders();
soloMetodo('POST');

// ── Verificar sesión activa ──────────────────────────────────
session_start();
if (empty($_SESSION['usuario_id'])) {
    responder(401, ['ok' => false, 'mensaje' => 'Debes iniciar sesión para pagar.']);
}

// ── Credenciales desde .env ──────────────────────────────────
MercadoPagoConfig::setAccessToken(env('MP_ACCESS_TOKEN'));
$siteUrl = env('SITE_URL', 'http://localhost/Hotel-quinta-dalam');

// ── Leer y validar el body ───────────────────────────────────
$body          = leerBody();
$reservacionId = isset($body['reservacion_id']) ? (int) $body['reservacion_id'] : 0;

if ($reservacionId <= 0) {
    responder(400, ['ok' => false, 'mensaje' => 'ID de reservación inválido.']);
}

// ── Obtener datos de la reservación ─────────────────────────
$pdo  = getPDO();
$stmt = $pdo->prepare(
    'SELECT r.id, r.codigo, r.total, r.estado, r.usuario_id,
            h.nombre AS habitacion_nombre, h.tipo AS habitacion_tipo,
            r.fecha_entrada, r.fecha_salida
     FROM reservaciones r
     INNER JOIN habitaciones h ON h.id = r.habitacion_id
     WHERE r.id = :id LIMIT 1'
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

// Verificar que no esté ya pagada o cancelada
if (in_array($reservacion['estado'], ['confirmada', 'completada'], true)) {
    responder(409, ['ok' => false, 'mensaje' => 'Esta reservación ya fue pagada.']);
}
if ($reservacion['estado'] === 'cancelada') {
    responder(409, ['ok' => false, 'mensaje' => 'Esta reservación fue cancelada.']);
}

// ── Crear preferencia con SDK oficial ───────────────────────
$client = new PreferenceClient();

try {
    $preferencia = $client->create([
        'items' => [[
            // Forzamos TODO a ser String explícitamente
            'id'          => (string) ('HAB-' . $reservacion['codigo']), 
            
            'title'       => (string) ('Habitación ' . $reservacion['habitacion_nombre']),
            
            'description' => (string) ($reservacion['habitacion_tipo'] . ' — ' 
                           . $reservacion['fecha_entrada'] . ' al ' 
                           . $reservacion['fecha_salida']),
                           
            'category_id' => 'travels',
            'quantity'    => 1,
            'currency_id' => 'MXN',
            
            // Mantenemos el float para el precio
            'unit_price'  => (float) str_replace(['$', ','], '', $reservacion['total']),
        ]],
        'back_urls' => [
            'success' => $siteUrl . '/exito.html?reservacion=' . $reservacion['codigo'],
            'failure' => $siteUrl . '/error-pago.html?reservacion=' . $reservacion['codigo'],
            'pending' => $siteUrl . '/pendiente.html?reservacion=' . $reservacion['codigo'],
        ],
        // auto_return requiere URLs públicas — solo en producción
        'auto_return' => env('APP_ENV') === 'production' ? 'approved' : null,
        'external_reference' => $reservacion['codigo'],
        // En desarrollo local se omite — MP no puede alcanzar localhost
        // Se activa cuando subas a Hostinger
        'notification_url' => env('APP_ENV') === 'production'
        ? $siteUrl . '/api/pagos/webhook.php'
        : null,
        'expires'            => true,
        'expiration_date_to' => date('Y-m-d\TH:i:s.000-05:00', strtotime('+24 hours')),
    ]);
} catch (\MercadoPago\Exceptions\MPApiException $e) {
    // Esto atrapa los rechazos oficiales de la API de Mercado Pago
    $errorDetalle = $e->getApiResponse()->getContent();
    responder(500, [
        'ok' => false, 
        'mensaje' => 'Rechazo de Mercado Pago', 
        'detalle' => $errorDetalle
    ]);
}

// ── Guardar trazabilidad en tabla pagos ──────────────────────
try {
    $pdo->prepare(
        'INSERT INTO pagos (reservacion_id, metodo, monto, estado, referencia)
         VALUES (:rid, "tarjeta", :monto, "pendiente", :ref)'
    )->execute([
        ':rid'   => $reservacionId,
        ':monto' => $reservacion['total'],
        ':ref'   => $preferencia->id,
    ]);
} catch (Exception $e) {
    error_log('Pagos insert error: ' . $e->getMessage());
}

// ── Devolver URL de checkout ─────────────────────────────────
// En desarrollo usamos sandbox_init_point
// En producción usamos init_point
$esSandbox = env('APP_ENV', 'development') === 'development';
$url = $esSandbox
    ? ($preferencia->sandbox_init_point ?? $preferencia->init_point)
    : $preferencia->init_point;

responder(200, [
    'ok'             => true,
    'init_point'     => $url,
    'preferencia_id' => $preferencia->id,
]);