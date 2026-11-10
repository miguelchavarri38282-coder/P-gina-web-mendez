# VARIEDADES MENDEZ FAFFORD · VMF_WEB_FINAL

Rediseño cinematográfico de la tienda, con las 30 fotografías reales del catálogo
emparejadas una a una con sus productos por código visible en la foto.

## Contenido
- `index.html` — estructura de la boutique (hero cinematográfico, colecciones, tienda, editorial, nosotros, contacto)
- `styles.css` — diseño editorial de lujo + animaciones (reveal, parallax, tilt 3D)
- `app.js` — catálogo, búsqueda, filtros, favoritos, bolsa, pedido por WhatsApp
- `src/data/productos.json` — catálogo original, SIN MODIFICAR (nombres, códigos, categorías, colores y tallas intactos)
- `images/VMF-001.jpg … VMF-030.jpg` — fotografías reales, renombradas por ID de producto

## Cómo usarla
1. Copia toda la carpeta a tu computadora.
2. Abre `index.html` en el navegador, o mejor aún sírvela con un servidor local
   (por ejemplo: `python -m http.server`) para garantizar la carga del JSON.

## Funciones conservadas
✔ Catálogo · ✔ Búsqueda · ✔ Filtros (público, categoría, marca, color)
✔ Favoritos (se guardan en el navegador) · ✔ Bolsa/Carrito · ✔ WhatsApp +505 7805 1963
✔ Detalle de producto con consulta directa por WhatsApp

## Detalles técnicos
- Animaciones optimizadas con `requestAnimationFrame` y `IntersectionObserver`.
- Respeta `prefers-reduced-motion` (movimiento reducido del dispositivo).
- Imágenes con `loading="lazy"` y respaldo visual si falta alguna foto.
- Compatible con Android, iPhone y escritorio.

## Copia de seguridad
El proyecto original quedó en `~/BACKUP_VMF_ORIGINAL_YYYYMMDD`.
