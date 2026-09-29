# 2000department — tienda online

Sitio estático (HTML/CSS/JS, sin backend ni build) inspirado en la **estructura y el estilo
visual** de [yabangbcn.com](https://www.yabangbcn.com/): barra de envío, header con carrito,
hero, "New Arrivals", mega-menú de categorías al estilo Yabang, página de Designers, ficha de
producto con medidor de estado y carrito lateral. Paleta estrictamente **blanco / negro / gris**
(sin color de acento), tarjetas de esquina cuadrada sobre gris claro, líneas finas de 1px entre
productos, botón "+" de añadir rápido al pasar el ratón por una tarjeta.

**Todo el texto del sitio está en inglés** (títulos de producto incluidos, traducidos del
catálogo original en español). El código y este README se quedan en español para ti.

Tiene **modo claro y modo oscuro** con un botón toggle (☀/🌙) en el header, guardado en
`localStorage` por navegador — respeta el tema del sistema hasta que el visitante lo cambia a
mano.

La tienda se posiciona como **curadores de moda vintage y de diseñador vintage** — no como
tienda de "segunda mano" (esa palabra se quitó deliberadamente de todos los títulos, textos y
descripciones de producto; si añades copy nuevo, usa "vintage", no "secondhand"/"segunda mano").
El carrito usa `localStorage` (por navegador, no hay base de datos ni servidor). El botón
**Checkout** abre un aviso de "Payment coming soon" con un contacto — sustitúyelo por tu
pasarela real (Stripe, Redsys, PayPal…) cuando la tengas.

## Cómo verlo

Puedes abrir `index.html` con doble clic directamente — los productos cargan desde
`js/products.js` (un script normal, no un `fetch()`), así que funciona sin servidor.

Si prefieres verlo servido por HTTP (más parecido a como se verá publicado), desde la raíz del
repo:

```bash
python -m http.server 8090
```

y abre `http://localhost:8090/STUDIO/index.html`. También hay una config lista en
`.claude/launch.json` → `"STUDIO Store"`.

## Navegación

- **Shop** (header): al pasar el ratón muestra un mega-menú de categorías inspirado en la
  captura que diste de Yabang (Outerwear, Bottoms, Tops, Footwear, Accessories,
  Collaborations con sus subcategorías). Como el catálogo actual solo guarda la categoría de
  nivel superior por producto (no subcategoría), la mayoría de los enlaces del submenú llevan
  al filtro de esa categoría general en `shop.html?category=...`; solo "Skirts" y "Dresses"
  tienen su propia categoría real en los datos. "Collaborations" no tiene productos todavía,
  aparece como "Coming soon".
- **Designers** (`designers.html`): lista todas las marcas presentes en `js/products.js`,
  generada automáticamente (no hay que mantenerla a mano) — cada una enlaza a
  `shop.html?brand=...`.
- **About**: sección de texto en `index.html#about` (antes era el bloque de "Drops", que se ha
  quitado del sitio por completo — ya no se vende por drops).

## Qué cambiar tú

### 1. Nombre de la marca
Ya no es un placeholder: es **"2000department"**. Aparece en:
- `<title>` y `js/main.js` → `CONFIG.storeName`
- El wordmark `2000department.` en el header y el footer de `index.html`, `shop.html`,
  `product.html`, `designers.html`
- `footer-wordmark` (la palabra gigante del footer)

Si vuelves a cambiar el nombre, busca "2000department" en esos 4 archivos HTML + `js/main.js`.

### 2. Contacto de checkout (mientras no haya pasarela)
`js/main.js` → `CONFIG.checkoutContact`. Ahora mismo es `contacto@tu-dominio.com`; cámbialo por
tu email o WhatsApp real antes de publicar el sitio.

### 3. Precios
En `js/products.js`, cada producto tiene `price` (precio de venta) y `compareAtPrice`
(precio "antes de"). Ahora mismo llevan los precios que saqué del catálogo Micolet
(`precio_final` o, si no existía, `precio_rebajado`) — **son de partida, no los definitivos**.
Edita el campo `price` de cada pieza cuando me des las cifras reales.

### 4. Añadir productos
Cada producto es un objeto dentro del array `PRODUCTS` de `js/products.js`:

```json
{
  "id": 43,
  "handle": "mi-marca-nombre-pieza-43",
  "brand": "MI MARCA",
  "title": "Nombre de la pieza",
  "price": 120,
  "compareAtPrice": 250,
  "size": "M",
  "category": "Outerwear",
  "condition": "Great",
  "status": "in_stock",
  "image": "img/products/p43.jpg",
  "description": "Descripción corta de la pieza.",
  "drop": "Founding"
}
```

- `id` único, correlativo al último que exista.
- `category`: una de `Outerwear, Bottoms, Tops, Dresses, Skirts, Footwear, Accessories` (o una
  nueva — aparecerá sola en el filtro y en el home si algún producto la usa).
- `condition`: `New`, `Great`, `Gently Worn` o `Used` — controla el medidor de estado en la ficha.
- `status`: `in_stock`, `sold` o `draft` (`sold` muestra "Sold out" en la ficha; `draft` se usa
  para piezas importadas desde `micolet-tool/` que aún no tienen foto propia — no aparece en
  home/shop/designers hasta que cambies su `status` a `in_stock`).
- `drop`: campo interno heredado del catálogo original, ya no se muestra en ningún sitio de la
  web (el bloque de "Drops" se quitó) — puedes dejarlo o ignorarlo, no hace falta mantenerlo.
- Sube la foto a `img/products/` con el mismo nombre que pongas en `image`.

No hace falta tocar nada más: home, tienda, designers y fichas se generan solos a partir de
este archivo. También puedes añadir productos (con su categoría/talla/precio) directamente
desde `micolet-tool/`, que además los deja ya conectados al monitor de stock — ver
`micolet-tool/README.md`.

## Estructura

```
STUDIO/
  index.html        Home (hero, New Arrivals, categorías, About)
  shop.html          Listado con filtros (categoría, marca, orden, búsqueda)
  designers.html      Índice de marcas, generado desde products.js
  product.html        Ficha de producto (?id=N)
  css/styles.css      Estilos, tokens de color claro/oscuro, mega-menú
  js/main.js          Config de tienda + lógica de carrito
  js/products.js      Catálogo de productos (edítalo para añadir/quitar piezas)
  img/products/       Fotos de producto
```

## Pendiente cuando llegue el momento

- Pasarela de pago real → sustituir el modal de `openCheckoutModal()` en `js/main.js` por la
  integración elegida (Stripe Checkout es la más simple para un sitio sin backend, con
  Payment Links).
- Cuenta de cliente / historial de pedidos → no existe todavía, es venta directa por contacto.
- Newsletter del footer → el formulario solo muestra una confirmación visual, no está conectado
  a ningún proveedor de email (Mailchimp, Brevo…) todavía.
- El submenú de "Shop" tiene subcategorías visuales (Fur Jackets, Bombers, Sneakers…) que hoy
  filtran por la categoría general porque no existe ese nivel de detalle en los datos — si más
  adelante quieres el filtro fino de verdad, habría que añadir un campo `subcategory` a
  `products.js` y ajustar `shop.html`.
