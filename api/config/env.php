<?php
// Evita que PHP colapse si este archivo se incluye múltiples veces
if (!function_exists('env')) {

    function cargarEnv(): void {
        $rutaEnv = dirname(__DIR__, 2) . '/.env';
        
        if (!file_exists($rutaEnv)) return;

        $lineas = file($rutaEnv, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        if (!is_array($lineas)) return;

        foreach ($lineas as $linea) {
            // Validación extra de seguridad
            if (!is_string($linea)) continue; 
            
            $linea = trim($linea);
            
            // Ignorar comentarios o líneas vacías
            if (empty($linea) || str_starts_with($linea, '#')) continue;

            // Si tiene el signo igual, lo procesamos
            if (strpos($linea, '=') !== false) {
                $partes = explode('=', $linea, 2);
                
                if (count($partes) === 2) {
                    $clave = trim($partes[0]);
                    $valor = trim(trim($partes[1]), '"\'');
                    
                    if (!empty($clave)) {
                        $_ENV[$clave] = $valor;
                        putenv("{$clave}={$valor}");
                    }
                }
            }
        }
    }

    // Función helper para leer variables
    function env(string $clave, string $default = ''): string {
        return $_ENV[$clave] ?? getenv($clave) ?: $default;
    }

    // Cargar al incluir el archivo por primera vez
    cargarEnv();
}
?>