#!/bin/bash
# ============================================
# LuckyPOS - Script de Deploy
# Uso: bash deploy.sh
# ============================================

SSH_HOST="root@64.23.176.98"
REMOTE_SERVER="/var/www/variospos/server"
REMOTE_CLIENT="/var/www/variospos/client"
LOCAL_BACKEND="/home/renosa/Documentos/mis_apps/LuckyPOS/backend"
LOCAL_FRONTEND="/home/renosa/Documentos/mis_apps/LuckyPOS/frontend"

echo "========================================"
echo "  LuckyPOS - Deploy a Producción"
echo "========================================"
echo ""

# --- 1. BUILD FRONTEND ---
echo "[1/5] Build del frontend..."
cd "$LOCAL_FRONTEND"
npm run build
if [ $? -ne 0 ]; then
    echo "ERROR: Falló el build del frontend"
    exit 1
fi
echo "✓ Build completado"
echo ""

# --- 2. SUBIR BACKEND ---
echo "[2/5] Subiendo backend..."
rsync -avz --progress \
    --include='controllers/' \
    --include='routes/' \
    --include='services/' \
    --include='utils/' \
    --include='middleware/' \
    --include='server.js' \
    --include='package.json' \
    --exclude='node_modules/' \
    --exclude='prisma/migrations/' \
    --exclude='prisma/dev.db' \
    --exclude='.env' \
    --exclude='*.log' \
    --exclude='*.pid' \
    "$LOCAL_BACKEND/" "$SSH_HOST:$REMOTE_SERVER/"
echo "✓ Backend subido"
echo ""

# --- 3. SUBIR FRONTEND (dist) ---
echo "[3/5] Subiendo frontend (dist)..."
rsync -avz --progress --delete \
    "$LOCAL_FRONTEND/dist/" "$SSH_HOST:$REMOTE_CLIENT/dist/"
echo "✓ Frontend subido"
echo ""

# --- 4. COMANDOS EN VPS ---
echo "[4/5] Ejecutando comandos en el VPS..."
ssh "$SSH_HOST" bash << 'EOF'
    set -e
    echo "  → Instalando dependencias (si hay cambios)..."
    cd /var/www/variospos/server
    npm install --production 2>/dev/null || echo "  ✓ Dependencias OK"

    echo "  → Regenerando Prisma Client..."
    npx prisma generate

    echo "  → Reiniciando PM2..."
    pm2 restart variospos-api

    echo "  ✓ Comandos ejecutados"
EOF
if [ $? -ne 0 ]; then
    echo "ERROR: Fallaron los comandos en el VPS"
    exit 1
fi
echo ""

# --- 5. VERIFICAR ---
echo "[5/5] Verificando deploy..."
sleep 2
ssh "$SSH_HOST" "pm2 list | grep variospos-api && curl -s http://localhost:3015/health | head -c 200"
echo ""
echo "========================================"
echo "  Deploy completado!"
echo "  Revisa logs: pm2 logs variospos-api"
echo "========================================"
