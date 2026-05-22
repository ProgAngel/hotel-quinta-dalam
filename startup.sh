#!/bin/bash
# ============================================================
#  startup.sh — Hotel Quinta Dalam
#  Configura nginx para servir PHP en Azure App Service Linux
# ============================================================

# Crear configuración personalizada de nginx
cat > /etc/nginx/conf.d/default.conf << 'EOF'
server {
    listen 8080;
    root /home/site/wwwroot;
    index index.php index.html;

    # Servir archivos estáticos directamente
    location ~* \.(html|css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2)$ {
        try_files $uri $uri/ =404;
        expires 30d;
    }

    # Procesar archivos PHP
    location ~ \.php$ {
        fastcgi_pass 127.0.0.1:9000;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    # Redirigir todo lo demás al index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

# Reiniciar nginx con la nueva configuración
service nginx restart