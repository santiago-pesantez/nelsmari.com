<p align="center">
  <img src="assets/img/ui/logo.png" alt="Nelsmari Sous Vide" width="320">
</p>

<h3 align="center">Comida gourmet preparada al vacío, lista para calentar y servir.</h3>

<p align="center">
  <a href="https://nelsmari.com">nelsmari.com</a> &nbsp;&bull;&nbsp;
  Valle de los Chillos, Ecuador
</p>

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/GitHub%20Pages-222?style=flat&logo=github&logoColor=white" alt="GitHub Pages">
</p>

---

## Acerca del proyecto

**Nelsmari Sous Vide** es un emprendimiento ecuatoriano de comida gourmet preparada con la técnica sous vide (cocción al vacío a baja temperatura). Este repositorio contiene el sitio web estático que sirve como catálogo digital, sistema de pedidos y vitrina de la marca.

El sitio está construido sin frameworks ni dependencias de build — solo **HTML, CSS y JavaScript vanilla** — y se despliega automáticamente en **GitHub Pages** con dominio personalizado.

## Características

| Característica | Descripción |
|:---|:---|
| **Menú dinámico** | Se carga desde `products.csv` con PapaParse. Editar el CSV actualiza todo el menú. |
| **Carrito persistente** | Almacenado en `localStorage`. Sidebar en desktop, barra flotante en mobile. |
| **Combos automáticos** | Detecta y aplica descuentos (Combo Balanceado, Combo Nelsmari, Promo Lanzamiento). |
| **Pedidos por WhatsApp** | El checkout genera un mensaje formateado y abre WhatsApp con un clic. |
| **Mapa de zonas** | Mapa interactivo con Leaflet.js mostrando el polígono de cobertura de entrega. |
| **Hero slideshow** | Imágenes de fondo que rotan con transiciones suaves cada 5 segundos. |
| **Responsive** | Mobile-first. Optimizado para todos los tamaños de pantalla. |
| **SEO** | Meta tags, Open Graph, `sitemap.xml`, `robots.txt`, favicon set completo. |

## Páginas

```
/                              Inicio (hero, beneficios, platos destacados, combos)
/sous-vide/                    Menú completo con filtros y carrito
/sous-vide/producto/?id=...    Detalle de producto (nutrición, alérgenos, calentamiento)
/sous-vide/checkout.html       Checkout con resumen, combos y envío por WhatsApp
/sous-vide/como-calentar.html  Guía de calentamiento
/sous-vide/seguridad.html      Seguridad alimentaria y empaques BPA-free
/sous-vide/zonas.html          Mapa de zonas de entrega
/sous-vide/nosotros.html       Nuestra historia
/404.html                      Página de error personalizada
```

## Stack técnico

- **HTML5 / CSS3 / Vanilla JS** — sin frameworks, sin build tools
- **PapaParse** (CDN) — parsing de CSV para el catálogo de productos
- **Leaflet.js** (CDN) — mapa interactivo de zonas de entrega
- **Google Fonts** — Playfair Display + Lato
- **GitHub Pages** — hosting estático gratuito con dominio custom
- **CSS Custom Properties** — sistema de diseño con variables para colores, tipografía y espaciado

## Estructura del proyecto

```
nelsmari.com/
├── index.html                  # Página principal
├── products.csv                # Base de datos del menú
├── sitemap.xml                 # Sitemap para SEO
├── robots.txt                  # Directivas para buscadores
├── CNAME                       # Dominio custom (nelsmari.com)
├── MANUAL-USUARIO.md           # Manual para el cliente
├── assets/
│   ├── css/style.css           # Sistema de diseño completo (~1700 líneas)
│   ├── js/
│   │   ├── cart.js             # Carrito (localStorage + UI)
│   │   ├── menu.js             # Menú dinámico con filtros
│   │   ├── combos.js           # Motor de combos y promociones
│   │   ├── checkout.js         # Página de checkout
│   │   ├── whatsapp.js         # Generador de mensajes WhatsApp
│   │   ├── home.js             # Platos destacados en home
│   │   └── product-detail.js   # Página de detalle de producto
│   └── img/
│       ├── hero/               # Fotos del slideshow principal
│       ├── products/           # Fotos de cada plato
│       └── ui/                 # Logo, favicons, OG image
└── sous-vide/
    ├── index.html              # Menú
    ├── checkout.html           # Checkout
    ├── producto/index.html     # Detalle de producto (dinámico)
    ├── como-calentar.html      # Guía de calentamiento
    ├── seguridad.html          # Seguridad y empaques
    ├── zonas.html              # Mapa de entrega
    └── nosotros.html           # Sobre nosotros
```

## Sistema de combos

Los descuentos se calculan automáticamente en el carrito:

| Combo | Contenido | Precio |
|:---|:---|:---:|
| **Combo Balanceado** | 1 proteína + 1 carbohidrato + 1 vegetal | **$5,00** (ahorro $0,50) |
| **Combo Nelsmari** | 5 proteínas + 5 carbohidratos + 4 vegetales | **$25,00** (ahorro $2,50) |
| **Promo Lanzamiento** | Compra 4 proteínas → 1 vegetal gratis | ahorro $1,00 |

## Gestión de contenido

El menú se administra editando un solo archivo CSV:

```csv
id,categoria,nombre,precio,descripcion_corta,...,disponible,destacado
arroz-chaufa,carbohidratos,Arroz chaufa,1.25,Arroz salteado...,true,false
```

- Cambiar `disponible` a `false` oculta un plato sin borrarlo
- Cambiar `destacado` a `true` lo muestra en la página principal
- Las fotos se suben a `assets/img/products/` con el nombre del `id`

Ver **[MANUAL-USUARIO.md](MANUAL-USUARIO.md)** para la guía completa.

## Despliegue

El sitio se despliega automáticamente en GitHub Pages al hacer push a `main`. Dominio configurado: **nelsmari.com**.

```bash
git add .
git commit -m "descripción del cambio"
git push
```

Los cambios se reflejan en ~1-2 minutos.

## Paleta de colores

| Color | Hex | Uso |
|:---|:---|:---|
| 🟢 Verde primario | `#2D4A1E` | Textos principales, header |
| 🫒 Oliva | `#4A6741` | Acentos, enlaces, navegación |
| 🟡 Dorado | `#C9A84C` | Precios, badges, destacados |
| 🟤 Beige | `#F5EFE0` | Fondos cálidos, secciones alternas |

---

<p align="center">
  <sub>Hecho con cariño en Ecuador 🇪🇨</sub>
</p>
