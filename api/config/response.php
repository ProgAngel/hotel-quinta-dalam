<?php
// ── Headers CORS 
function setCorsHeaders(): void {
    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');

    // Preflight: el navegador pregunta si puede hacer la petición real
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
}

// ── Validar método HTTP 
function soloMetodo(string $metodo): void {
    if ($_SERVER['REQUEST_METHOD'] !== strtoupper($metodo)) {
        responder(405, ['ok' => false, 'mensaje' => 'Método no permitido.']);
    }
}

// ── Responder JSON y terminar ejecución 
function responder(int $codigo, array $datos): void {
    http_response_code($codigo);
    echo json_encode($datos, JSON_UNESCAPED_UNICODE);
    exit;
}

// ── Leer body JSON de la petición 
function leerBody(): array {
    $raw  = file_get_contents('php://input');
    $body = json_decode($raw, true);

    if (!is_array($body)) {
        responder(400, ['ok' => false, 'mensaje' => 'Cuerpo JSON inválido.']);
    }

    return $body;
}

// ── Sanitizar string
function limpiar(string $valor): string {
    return htmlspecialchars(strip_tags(trim($valor)), ENT_QUOTES, 'UTF-8');
}