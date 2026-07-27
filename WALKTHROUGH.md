# LuckyPOS - Walkthrough

## Flujo de Trabajo

```
[Desarrollo Local] → [Build Frontend] → [Subir a VPS]
```

---

## 1. Desarrollo Local

### Backend
```bash
cd backend
npm install
cp .env.example .env   # Configurar DATABASE_URL y SUPER_ADMIN_PIN
npx prisma generate    # Generar cliente Prisma
npm run dev            # Inicia en :3015 con node --watch
```

### Frontend
```bash
cd frontend
npm install
npm run dev            # Inicia en :4000 con proxy a :3015
```

Abrir `http://localhost:4000`

---

## 2. Build de Producción

```bash
cd frontend
npm run build
```

Esto genera:
- `frontend/dist/` - Archivos estáticos (index.html, assets/JS/CSS, PWA assets)
- Actualiza automáticamente `public/version.json` con timestamp para forzar actualización en clientes

---

## 3. Despliegue a VPS (Producción)

### Script Automático
```bash
cd /ruta/local/LuckyPOS
bash deploy.sh
```

El script:
1. Build del frontend
2. Rsync del backend al VPS
3. Rsync del frontend/dist al VPS
4. Ejecuta `npm install`, `npx prisma generate` y `pm2 restart variospos-api`

### Manualmente
```bash
# Backend
rsync -avz backend/ root@tudominio:/var/www/variospos/server/
ssh root@tudominio "cd /var/www/variospos/server && npm install && npx prisma generate && pm2 restart variospos-api"

# Frontend
cd frontend && npm run build
rsync -avz --delete dist/ root@tudominio:/var/www/variospos/client/dist/
```

---

## URLs en Producción

| Servicio | URL |
|----------|-----|
| Frontend | `https://tudominio.com` |
| Backend API | `https://tudominio.com/api` |
| Puerto interno | `:3015` (o el configurado en `PORT`) |

---

## Mantenimiento

### Actualizar versión en clientes
El sistema detecta cambios en `/version.json` y fuerza recarga automática. Al hacer build se regenera automáticamente.

### Reset de datos (danger zone)
Desde Settings → Danger Zone:
- Reset Sales: Limpia ventas y cierres
- Reset Inventory: Reinicia stock a 0
- Reset Products: Elimina productos (requiere PIN admin)

PIN configurable desde Settings → Negocio → PIN de Administrador, o en `SUPER_ADMIN_PIN` del `.env`.

### Gastos (CRUD con PIN)
Editar y eliminar gastos requiere PIN de administrador. El flujo es:
- Click en acción → Modal de PIN → Si es válido → Modal de edición o confirmación de borrado

### Anular Ventas
Desde Historial de Ventas → Detalle → Botón "Anular". Restaura stock automáticamente.

### Roles y Permisos
Desde Settings → Roles. Se puede asignar permisos granulares por módulo a cada rol.
Los permisos se almacenan como JSON array en la base de datos.

### Backup de BD
Desde Settings → Backups. Usa `mysqldump` para crear backups de la base MySQL.
Los archivos se almacenan en `backend/backups/`.

### Migraciones de BD
```bash
cd backend
npx prisma migrate dev --name nombre_migracion   # Desarrollo
npx prisma migrate deploy                          # Producción
```

### Seed
```bash
cd backend
npm run seed   # node prisma/seed.js
```

---

## Variables de Entorno (.env)

```
PORT=3015
ALLOWED_ORIGINS=http://localhost:4000,http://localhost:5173
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=luckypos
JWT_SECRET=tu_secret_key
GEMINI_API_KEY=tu_api_key
DATABASE_URL="mysql://root:@localhost:3306/luckypos"
SUPER_ADMIN_PIN=020518
```

---

## Monitoreo

- Backend logs: `backend/server.log`, `backend/error.log`
- Frontend build logs: `frontend/build_log.txt`
- PM2: `pm2 logs variospos-api`

---

## Consideraciones Importantes

1. **Siempre hacer build antes de subir** - Verificar que no hay errores de TypeScript
2. **Version.json** - Se regenera en cada build, los clientes detectan el cambio y actualizan solos
3. **BD** - Las migraciones Prisma deben ejecutarse después de actualizar el backend en producción
4. **PWA** - Si se cambian assets, el service worker los actualizará en segundo plano
5. **Offline** - Las ventas offline se guardan en localStorage y se sincronizan automáticamente al recuperar conexión
6. **Carrito POS** - Cada tap en un producto crea una línea nueva (no incrementa existente). Útil para ingreso por lote al final del día
7. **Gastos CRUD** - Editar y eliminar gastos requiere PIN de admin. El borrado muestra alerta de irreversibilidad
8. **Permisos** - Los usuarios deben cerrar sesión y volver a entrar después de cambiar permisos de rol
9. **Backups** - `mysqldump` debe estar instalado en el VPS (viene con MySQL/MariaDB)
10. **Configuración de sidebar y dashboard** - Se almacena como JSON en MasterConfig, formato `{ sidebar: [...], dashboard: [...] }`
