# GOBY Filters — Sitio Web Corporativo

Sitio web estático desarrollado en HTML5, CSS3 y JavaScript ES6, preparado para migración a WordPress Theme personalizado.

## Stack

- HTML5 semántico
- CSS3 con Custom Properties (sin frameworks)
- JavaScript ES6 con módulos nativos (sin jQuery)

## Estructura

```
gobyfilters.com/
│
├── index.html                 ← Inicio
├── nosotros.html              ← Quiénes somos
├── productos.html             ← Catálogo
├── avisos-legales.html        ← Documentos legales
├── distribuidor.html          ← Contacta un distribuidor
├── recursos.html              ← Descargas y herramientas
│
├── assets/
│   ├── css/
│   │   ├── style.css          ← Entrada principal (@import)
│   │   ├── variables.css      ← Design tokens
│   │   ├── reset.css          ← Modern CSS reset
│   │   ├── buttons.css        ← Sistema de botones
│   │   ├── header.css         ← Header sticky + menú móvil
│   │   ├── footer.css         ← Footer completo
│   │   ├── hero.css           ← Heroes (principal + pequeño)
│   │   ├── cards.css          ← Sistema de cards
│   │   ├── sections.css       ← Secciones reutilizables
│   │   └── responsive.css     ← Breakpoints globales
│   │
│   ├── js/
│   │   ├── main.js            ← Entry point (importa módulos)
│   │   ├── header.js          ← Sticky, menú móvil, accesibilidad
│   │   ├── slider.js          ← Carrusel sin dependencias
│   │   └── animations.js      ← IntersectionObserver, contadores
│   │
│   ├── images/
│   │   ├── logo/
│   │   ├── banners/
│   │   ├── products/
│   │   ├── icons/
│   │   └── backgrounds/
│   │
│   └── fonts/
```

## Convenciones

- Nomenclatura BEM: `.bloque__elemento--modificador`
- Variables CSS en `variables.css`, nunca valores hardcodeados
- Sin estilos inline, sin CSS en HTML, sin JS en HTML
- Un solo `H1` por página
- `aria-label`, `alt`, roles y `tabindex` en todos los elementos interactivos

## Breakpoints

| Nombre   | Ancho    |
|----------|----------|
| Mobile S | 360px    |
| Mobile   | 480px    |
| Tablet   | 768px    |
| Laptop   | 1024px   |
| Desktop  | 1280px   |
| Wide     | 1440px   |
| Full HD  | 1920px   |

## Migración a WordPress

Cada página HTML corresponde a un template de WordPress:

| HTML                  | WordPress template        |
|-----------------------|---------------------------|
| `index.html`          | `front-page.php`          |
| `nosotros.html`       | `page-nosotros.php`       |
| `productos.html`      | `page-productos.php`      |
| `avisos-legales.html` | `page-avisos-legales.php` |
| `distribuidor.html`   | `page-distribuidor.php`   |
| `recursos.html`       | `page-recursos.php`       |

El `<header>` se convierte en `header.php` (llamado con `get_header()`).  
El `<footer>` se convierte en `footer.php` (llamado con `get_footer()`).  
Los CSS se registran con `wp_enqueue_style()`.  
Los JS con `wp_enqueue_script()` usando `type="module"`.

## Estado de desarrollo

- [x] Header
- [x] Footer
- [x] Inicio (index.html)
- [x] Nosotros (nosotros.html)
- [x] Productos (productos.html)
- [ ] Avisos legales
- [ ] Contacta un distribuidor
- [ ] Recursos y herramientas
"# prueba_gofilters" 

## worpress
administrador
Carlos@2026*
