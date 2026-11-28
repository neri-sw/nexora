# Puerto Chill · Tienda online (demo)

Esqueleto navegable de la tienda online de **Puerto Chill, bazar y marroquinería** (Washington 5502, Isidro Casanova), armado a partir del PDF `Puerto_Chill_Tienda_Online.pdf`.

Los datos viven en un JSON privado en Vercel Blob (`<entorno>/state.json`, uno por entorno de Vercel), igual que Titán Studios. Sin `BLOB_READ_WRITE_TOKEN` (por ejemplo `npm run dev` sin configurar nada) el sitio funciona como demo local con `localStorage`.

## API

| Ruta | Quién | Qué hace |
|---|---|---|
| `GET /api/state` | cualquiera | Datos de la tienda **sin pedidos** (sin datos de clientes). |
| `GET/PUT /api/admin/state` | panel | Datos completos. El PUT lleva `baseRev`; si otro guardó antes responde 409 y el panel reaplica sus cambios. |
| `POST /api/orders` | cualquiera | Registra un pedido. El servidor valida, calcula precios, envío, descuento y cuotas con los datos guardados (`src/lib/pricing.ts`, el mismo cálculo que muestra el carrito) y descuenta stock. No se cobra nada: el dueño coordina el pago. |

Variables en Vercel: `ADMIN_PASSWORD`, `ADMIN_PATH` (ruta secreta del panel) y `BLOB_READ_WRITE_TOKEN`. Sin `ADMIN_PATH` el panel queda en `/admin`.

## Cómo correrlo

```powershell
npm install
```

```powershell
npm run dev
```

Abrí http://localhost:3000.

## Rutas

| Ruta | Qué es |
|---|---|
| `/` | Selector: entrar a **la tienda** o abrir **el panel**. |
| `/tienda` | Vista pública: vidriera, catálogo con búsqueda, filtros y orden, carrito y checkout de prueba. |
| `/<ADMIN_PATH>` | Panel (en `/admin` si no hay `ADMIN_PATH`): resumen, productos, pedidos, envíos y pagos, textos del sitio. Acepta `?tab=productos|pedidos|ventas|contenido`. Con `ADMIN_PATH`, `/admin` y la API privada directa dan 404. |

## Criterios de aceptación (usados para avanzar)

**Selector**
- [x] La home ofrece dos entradas claras: tienda y panel, cada una con lo que permite hacer.

**Tienda (inferido del PDF)**
- [x] Barra de anuncio azul petróleo con texto editable desde el panel.
- [x] Encabezado con logo, navegación (Inicio, Tienda, Bazar, Bolsos y carteras) y botón "Mi carrito (n)"; menú propio en móvil.
- [x] Vidriera con título, texto y botón "Explorar la tienda" (editables).
- [x] Franja de beneficios: compra online, retiro en el local, envíos (refleja envío gratis y cuotas).
- [x] Catálogo "Elegidos para vos": búsqueda (sin tildes), filtros por categoría con contador, orden por precio.
- [x] Tarjeta de producto: categoría, "Precio ilustrativo", precio, precio anterior y % off, cuotas, avisos de "Últimas N" y "Sin stock".
- [x] "Agregar al carrito" con respuesta visible (botón "Agregado", etiqueta que vuela al carrito, contador que late) y tope en el stock.
- [x] Carrito lateral con cantidades +/−, quitar, subtotal, cuotas y barra de progreso para el envío gratis.
- [x] Checkout: nombre, correo, teléfono; retiro o envío (con dirección); Mercado Pago (simulado), transferencia con descuento o efectivo al retirar; elección de cuotas; validación con mensajes claros.
- [x] Confirmación "Gracias por tu compra de prueba" con número de pedido; el pedido queda en el panel y el stock se descuenta.
- [x] Franja de cierre "Pequeños detalles, grandes momentos." con dirección, horario y mapa; pie con redes y enlace a la administración.

**Panel**
- [x] Resumen: pedidos, ventas, unidades, productos publicados, últimos pedidos, stock bajo, atajos de envío gratis y cuotas.
- [x] Productos: editar precio y precio anterior, stock +/−, publicar u ocultar, destacar, eliminar (con confirmación), crear producto nuevo.
- [x] Pedidos: lista filtrable por estado, detalle desplegable, cambio de estado.
- [x] Envíos y pagos: retiro, envío y su costo, envío gratis y monto mínimo, medios de pago, descuento por transferencia, cuotas (3/6/12), umbral de stock bajo.
- [x] Textos del sitio: anuncio, vidriera, frase de cierre, dirección, horarios, Instagram y WhatsApp.
- [x] "Restablecer demo" vuelve a los datos de ejemplo.

## Pendiente para producción

- Integración real de Mercado Pago y cotización de envíos.
- Fotos reales: las de `public/products/` son recortes de baja resolución del PDF; los productos de bazar usan ilustraciones provisorias.
- Logo definitivo (hoy hay un logotipo provisorio), Instagram, WhatsApp y horarios reales.
- Precios: los del PDF están marcados como ilustrativos, y los productos 5 a 8 son de ejemplo.

## Stack

Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · Gelasio + Hanken Grotesk (`next/font`).
