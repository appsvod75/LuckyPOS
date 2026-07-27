# LuckyPOS - Handover

## Descripción General
Sistema de Punto de Venta (POS) moderno con soporte multi-sucursal, inventario avanzado, cuentas por cobrar/pagar, cierres de caja automatizados, y PWA para uso en tablets/móviles.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19 + TypeScript + Vite 7 |
| Backend | Node.js + Express 5 + Prisma ORM |
| BD Producción | MySQL |
| BD Desarrollo | SQLite (por defecto en .env) |
| Tiempo Real | Socket.IO |
| PWA | vite-plugin-pwa con autoUpdate |
| UI/UX | Framer Motion, Lucide React, react-hot-toast |

## Estructura del Proyecto

```
LuckyPOS/
├── backend/
│   ├── server.js              # Entry point (Express + Socket.IO)
│   ├── controllers/           # 18 controladores
│   ├── routes/                # 17 rutas
│   ├── middleware/             # auth.middleware.js (JWT Bearer)
│   ├── services/              # cron.service, backup.service, dbSeed
│   ├── prisma/
│   │   ├── schema.prisma      # 22 modelos
│   │   ├── migrations/        # Migraciones MySQL
│   │   └── seed.js            # Seed data
│   ├── utils/                 # timezone.js, validate.js, socket.js, audit.js
│   └── deploy.sh              # Script deploy VPS con PM2
│
├── frontend/
│   ├── src/
│   │   ├── pages/             # 25 páginas (POS, Admin, Inventory, Lookup, etc.)
│   │   ├── components/        # Sidebar, modales, teclados, ticket, etc.
│   │   ├── services/          # api.ts (axios), socket.ts, offlineQueue.ts
│   │   ├── context/           # CartContext (carrito de compras), ThemeContext
│   │   ├── utils/             # exportCsv.ts
│   │   └── styles/            # global.css, dashboard-routes.css
│   ├── public/                # PWA icons, version.json
│   └── dist/                  # Build de producción (se sube a VPS)
│
└── email_webhook.gs           # Google Apps Script para envío de tickets por email
```

## Base de Datos (22 modelos clave)

- **Branch** - Sucursales
- **User** - Usuarios (autenticación por PIN, roles Admin/Super Admin/Vendedor)
- **Role** - Roles con permisos JSON (granular por módulo)
- **Category** - Categorías de productos
- **Product** - Productos (con SKU, precio base, costo promedio, medicina/servicio flag)
- **ProductVariant** - Variantes por producto (talla, presentación, tiers de precio)
- **Inventory** - Stock por sucursal (con min/max stock)
- **InventoryLot** - Lotes con fecha de vencimiento y número de lote
- **Provider** - Proveedores
- **ProductProvider** - Relación producto-proveedor (con preferencia)
- **PurchaseH / PurchaseD** - Compras (cabecera + detalle)
- **Client** - Clientes (con documento, teléfono, email)
- **SaleH / SaleD** - Ventas (cabecera + detalle)
- **ClientPayment / PaymentApplication** - Abonos de clientes aplicados a ventas
- **Transfer / TransferDetail** - Traslados entre sucursales
- **Expense** - Gastos por sucursal
- **CashClosing** - Cierres de caja (unique por fecha + sucursal)
- **SalesGoal** - Metas de ventas por sucursal/mes
- **AuditLog** - Auditoría de acciones
- **AiCache** - Caché de respuestas de IA (Gemini)
- **MasterConfig** - Configuración global del sistema

## API Endpoints (17 rutas)

| Ruta | Descripción |
|------|------------|
| `/api/auth` | Login (PIN), CRUD usuarios, verify pin, delete user |
| `/api/products` | CRUD productos, categorías, variantes |
| `/api/inventory` | Stock, transfers, kardex, low-stock report |
| `/api/sales` | Crear/editar/anular venta, historial, cuentas por cobrar |
| `/api/clients` | CRUD clientes, estado de cuenta |
| `/api/providers` | CRUD proveedores |
| `/api/purchases` | Compras, cuentas por pagar, abonos |
| `/api/branches` | CRUD sucursales |
| `/api/expenses` | CRUD gastos |
| `/api/closings` | Cierres de caja, reportes |
| `/api/audit` | Logs de auditoría |
| `/api/config` | Config global, reseteo de datos (danger) |
| `/api/stats` | Dashboard stats, reportes, rentabilidad |
| `/api/projections` | Metas y proyecciones de ventas |
| `/api/ai` | Información médica de productos (Gemini) |
| `/api/backups` | Crear, listar, descargar y eliminar backups de BD |
| `/api/roles` | CRUD de roles y permisos |

## Puerto y Proxy

- Frontend dev: `:4000`
- Backend dev: `:3015` (por variable `PORT`)
- Proxy de Vite: `/api` y `/socket.io` → `:3015`

## Funcionalidades Clave

- **PWA**: Instalable en mobile/desktop, actualización automática vía service worker + version.json
- **Offline**: Cola de ventas offline en localStorage, sincronización al recuperar conexión
- **Actualización automática**: Compara version.json, si cambia limpia caché y recarga
- **Teclado virtual**: Para ingreso de PIN en dispositivos táctiles
- **Notificaciones en tiempo real**: Socket.IO para todos los CRUDs (productos, inventario, ventas, gastos, clientes, etc.)
- **Cierre de caja automático**: Cron job programable desde MasterConfig
- **Email tickets**: Webhook a Google Apps Script para enviar tickets por correo al cliente
- **AI (Gemini)**: Generación de información médica para productos con flag `is_medicine`
- **Backups de BD**: Creación, descarga y eliminación de backups desde Settings
- **Roles y permisos**: Sistema granular de permisos por módulo (Settings → Roles)
- **Órdenes configurables**: Sidebar y Dashboard con orden personalizable desde Settings
- **Anulación de ventas**: Anular ventas con restauración automática de stock
- **Reporte de rentabilidad**: Ganancias vs costos por producto y período
- **Consultar producto**: Búsqueda por nombre/SKU con escáner de código de barras integrado
- **Exportar CSV**: Exportación de reportes a Excel/CSV
- **Tema oscuro/claro**: Toggle de tema con persistencia

## Comportamientos Relevantes

### Carrito de Compras (CartContext)
Cada vez que se toca un producto en el POS se crea una **línea nueva** en el carrito, aunque sea el mismo producto. No se incrementa la cantidad de una línea existente. Esto permite registrar ventas múltiples del mismo producto con diferentes cantidades/variantes para ingreso por lote al final del día.

### Gestión de Gastos (CRUD con PIN)
Los gastos tienen CRUD completo protegido por PIN de administrador:
- **Editar**: Permite cambiar descripción, monto y fecha
- **Eliminar**: Muestra alerta de acción irreversible antes de borrar

### Anulación de Ventas
Solo Admin/Super Admin. Restaura el stock automáticamente, elimina aplicaciones de pago y registra auditoría. No se puede deshacer.

### Permisos por Rol
Los roles almacenan permisos como JSON array en la base. Si un rol no tiene permisos configurados, se usa el comportamiento por defecto basado en el nombre del rol. Los permisos se gestionan desde Settings → Roles.

## Autenticación

- Login mediante PIN de 4-6 dígitos (hasheado con bcryptjs)
- JWT token en localStorage, enviado vía Bearer header
- Middleware `auth.middleware.js` protege todas las rutas
- Roles: Admin / Super Admin (redirige a `/admin`), otros roles van a `/pos`
- Rate limiting: 3 intentos fallidos por minuto por IP

## Timezone

Todo el sistema opera en horario de **El Salvador (UTC-6)**. Centralizado en `backend/utils/timezone.js`.

## Validación de Datos

Middleware de validación en `backend/utils/validate.js`. Reglas predefinidas para login, creación de usuarios, productos, ventas, compras, gastos, proveedores, sucursales y traslados.

## Despliegue en Producción (VPS)

Ver `WALKTHROUGH.md` para el flujo completo. El script `deploy.sh` automatiza build, rsync y reinicio de PM2.
