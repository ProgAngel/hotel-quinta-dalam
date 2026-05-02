<?php

require_once __DIR__ . '/../config/response.php';

setCorsHeaders();
soloMetodo('POST');

// Destruir la sesión PHP — invalida la cookie PHPSESSID
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
session_unset();
session_destroy();

// Expirar la cookie del cliente
if (isset($_COOKIE[session_name()])) {
    setcookie(
        session_name(), '',
        time() - 42000,
        '/', '', isset($_SERVER['HTTPS']), true
    );
}

responder(200, ['ok' => true, 'mensaje' => 'Sesión cerrada correctamente.']);