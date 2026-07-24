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
│   ├── controllers/           # 16 controladores (auth, product, sale, etc.)
│   ├── routes/                # 15 rutas (una por controlador)
│   ├── middleware/             # auth.middleware.js (JWT Bearer)
│   ├── services/              # cron.service (cierre automático), dbSeed, etc.
│   ├── prisma/
│   │   ├── schema.prisma      # 22 modelos
│   │   ├── migrations/        # Migraciones MySQL
│   │   └── seed.js            # Seed data
│   └── deploy.sh              # Script deploy VPS con PM2
│
├── frontend/
│   ├── src/
│   │   ├── pages/             # 24 páginas (POS, Admin, Inventory, etc.)
│   │   ├── components/        # Sidebar, modales, teclados, ticket, etc.
│   │   ├── services/          # api.ts (axios), socket.ts, offlineQueue.ts
│   │   ├── context/           # CartContext (carrito de compras)
│   │   └── styles/            # global.css, dashboard-routes.css
│   ├── public/                # PWA icons, version.json
│   └── dist/                  # Build de producción (se sube a VPS)
│
└── email_webhook.gs           # Google Apps Script para envío de tickets por email
```

## Base de Datos (22 modelos clave)

- **Branch** - Sucursales
- **User** - Usuarios (autenticación por PIN, roles Admin/Super Admin)
- **Role** - Roles con permisos
- **Category** - Categorías de productos
- **Product** - Productos (con SKU, precio base, costo promedio, medicina/servicio flag)
- **ProductVariant** - Variantes por producto (talla, presentación, etc.)
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

## API Endpoints (15 rutas)

| Ruta | Descripción |
|------|------------|
| `/api/auth` | Login (PIN), CRUD usuarios, verify pin |
| `/api/products` | CRUD productos, categorías, variantes |
| `/api/inventory` | Stock, transfers, kardex, low-stock report |
| `/api/sales` | Crear venta, historial, cuentas por cobrar |
| `/api/clients` | CRUD clientes, estado de cuenta |
| `/api/providers` | CRUD proveedores |
| `/api/purchases` | Compras, cuentas por pagar, abonos |
| `/api/branches` | CRUD sucursales |
| `/api/expenses` | CRUD gastos (POST, GET/daily, PUT/:id, DELETE/:id) |
| `/api/closings` | Cierres de caja, reportes |
| `/api/audit` | Logs de auditoría |
| `/api/config` | Config global, reseteo de datos (danger) |
| `/api/stats` | Dashboard stats, reportes |
| `/api/projections` | Metas y proyecciones de ventas |
| `/api/ai` | Información médica de productos (Gemini) |

## Puerto y Proxy

- Frontend dev: `:4000`
- Backend dev: `:3015` (por variable `PORT`)
- Proxy de Vite: `/api` y `/socket.io` → `:3015`

## Funcionalidades Clave

- **PWA**: Instalable en mobile/desktop, actualización automática vía service worker + version.json
- **Offline**: Cola de ventas offline en localStorage, sincronización al recuperar conexión
- **Actualización automática**: Compara version.json, si cambia limpia caché y recarga
- **Teclado virtual**: Para ingreso de PIN en dispositivos táctiles
- **Notificaciones en tiempo real**: Socket.IO para eventos de productos, inventario, force logout
- **Cierre de caja automático**: Cron job programable desde MasterConfig
- **Email tickets**: Webhook a Google Apps Script para enviar tickets por correo al cliente
- **AI (Gemini)**: Generación de información médica para productos con flag `is_medicine`

## Comportamientos Relevantes

### Carrito de Compras (CartContext)
Cada vez que se toca un producto en el POS se crea una **línea nueva** en el carrito, aunque sea el mismo producto. No se incrementa la cantidad de una línea existente. Esto permite registrar ventas múltiples del mismo producto con diferentes cantidades/variantes para ingreso por lote al final del día.

### Gestión de Gastos (CRUD con PIN)
Los gastos tienen CRUD completo protegido por PIN de administrador:
- **Editar**: Permite cambiar descripción, monto y fecha
- **Eliminar**: Muestra alerta de acción irreversible antes de borrar

## Autenticación

- Login mediante PIN de 4-6 dígitos (hasheado con bcryptjs)
- JWT token en localStorage, enviado vía Bearer header
- Middleware `auth.middleware.js` protege todas las rutas
- Roles: Admin / Super Admin (redirige a `/admin`), otros roles van a `/pos`

## Despliegue en Producción (VPS)

Ver `WALKTHROUGH.md` para el flujo completo.
