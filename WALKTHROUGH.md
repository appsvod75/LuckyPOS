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
cp .env.example .env   # Configurar DATABASE_URL
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

### Backend
```bash
cd backend
./deploy.sh
# O manualmente:
# npm install --production
# npx prisma generate
# pm2 restart variospos-backend
```

### Frontend (archivos dist)
Los archivos en `frontend/dist/` se sirven desde el VPS. Actualmente el backend también sirve los estáticos (Express sirve `dist/` como carpeta pública).

**Pasos:**
1. Hacer build local (`npm run build` en frontend)
2. Subir `frontend/dist/` al servidor (rsync/scp)
3. Si hubo cambios en backend (controllers/routes), subir también esos archivos
4. Reiniciar/recargar el servidor web (`pm2 restart variospos-backend`)

> **Nota:** El backend corre con PM2 bajo el nombre `variospos-backend`. Verificar con `pm2 list`.
>
> **Importante:** Si solo cambia el frontend (dist/), no hace falta reiniciar el backend. Si cambian controllers/routes, sí hay que reiniciar (`pm2 restart`).

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

### Gastos (CRUD con PIN)
Editar y eliminar gastos requiere PIN de administrador. El flujo es:
- Click en acción → Modal de PIN → Si es válido → Modal de edición o confirmación de borrado

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

## Monitoreo

- Backend logs: `backend/server.log`, `backend/error.log`
- Frontend build logs: `frontend/build_log.txt`
- PM2: `pm2 logs variospos-backend`

---

## Consideraciones Importantes

1. **Siempre hacer build antes de subir** - Verificar que no hay errores de TypeScript
2. **Version.json** - Se regenera en cada build, los clientes detectan el cambio y actualizan solos
3. **BD** - Las migraciones Prisma deben ejecutarse después de actualizar el backend en producción
4. **PWA** - Si se cambian assets, el service worker los actualizará en segundo plano
5. **Offline** - Las ventas离线 se guardan en localStorage y se sincronizan automáticamente al recuperar conexión
6. **Carrito POS** - Cada tap en un producto crea una línea nueva (no incrementa existente). Útil para ingreso por lote al final del día
7. **Gastos CRUD** - Editar y eliminar gastos requiere PIN de admin. El borrado muestra alerta de irreversibilidad
