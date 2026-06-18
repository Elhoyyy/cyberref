#!/bin/bash
# setup.sh — instala nginx y despliega CyberRef en Oracle Cloud (Ubuntu/Debian)
# Ejecutar como root: sudo bash setup.sh
# Estructura esperada en el mismo directorio: index.html, css/, js/

set -e
WEBROOT="/var/www/cyberref"
NGINX_CONF="/etc/nginx/sites-available/cyberref"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "[1/5] Actualizando paquetes e instalando nginx..."
apt-get update -qq
apt-get install -y nginx

echo "[2/5] Creando directorio web y copiando ficheros..."
mkdir -p "$WEBROOT"
cp -r "$SCRIPT_DIR"/index.html "$SCRIPT_DIR"/css "$SCRIPT_DIR"/js "$WEBROOT/"
chown -R www-data:www-data "$WEBROOT"
chmod -R 755 "$WEBROOT"

echo "[3/5] Configurando nginx..."
cat > "$NGINX_CONF" << 'NGINX'
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    root /var/www/cyberref;
    index index.html;

    server_name _;

    add_header X-Frame-Options SAMEORIGIN;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    gzip on;
    gzip_types text/html text/css application/javascript;

    location / {
        try_files $uri $uri/ =404;
    }

    location ~ /\. {
        deny all;
    }
}
NGINX

ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/cyberref
rm -f /etc/nginx/sites-enabled/default

echo "[4/5] Abriendo puerto 80 con iptables (Oracle Cloud)..."
iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
if command -v netfilter-persistent &>/dev/null; then
    netfilter-persistent save
else
    apt-get install -y iptables-persistent -y || true
    netfilter-persistent save 2>/dev/null || iptables-save > /etc/iptables/rules.v4 2>/dev/null || true
fi

echo "[5/5] Reiniciando nginx..."
nginx -t && systemctl enable nginx && systemctl restart nginx

echo ""
echo "========================================="
echo "  CyberRef desplegado correctamente!"
echo "  Accede en: http://$(curl -s ifconfig.me 2>/dev/null || echo TU_IP)"
echo "========================================="
echo ""
echo "Recuerda abrir el puerto 80 en el Security List de OCI:"
echo "  OCI Console > Networking > VCN > Security Lists"
echo "  Ingress rule: TCP, port 80, source 0.0.0.0/0"
