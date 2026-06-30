/**
 * GOBY FILTERS — Header
 * Controla: sticky, menú móvil, accesibilidad y trap focus.
 */

const Header = (() => {

  // Referencias DOM
  let header;
  let burger;
  let nav;
  let overlay;
  let navLinks;
  let lastScrollY = 0;
  let ticking = false;

  // --------------------------------------------------
  // Sticky — scroll listener con requestAnimationFrame
  // --------------------------------------------------

  function onScroll() {
    lastScrollY = window.scrollY;

    if (!ticking) {
      window.requestAnimationFrame(updateStickyState);
      ticking = true;
    }
  }

  function updateStickyState() {
    if (lastScrollY > 10) {
      header.classList.add('site-header--scrolled');
    } else {
      header.classList.remove('site-header--scrolled');
    }

    ticking = false;
  }

  // --------------------------------------------------
  // Menú móvil
  // --------------------------------------------------

  function openMenu() {
    nav.classList.add('site-nav--open');
    overlay.classList.add('site-header__overlay--visible');
    burger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    trapFocus(nav);

    // Mover foco al primer link del menú
    const firstLink = nav.querySelector('.site-nav__link');
    if (firstLink) {
      firstLink.focus();
    }
  }

  function closeMenu() {
    nav.classList.remove('site-nav--open');
    overlay.classList.remove('site-header__overlay--visible');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    releaseFocus();
    burger.focus();
  }

  function toggleMenu() {
    const isOpen = burger.getAttribute('aria-expanded') === 'true';
    isOpen ? closeMenu() : openMenu();
  }

  // --------------------------------------------------
  // Trap focus — accesibilidad en menú móvil
  // --------------------------------------------------

  let focusTrapHandler = null;

  function getFocusableElements(container) {
    return [
      ...container.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ];
  }

  function trapFocus(container) {
    const focusable = getFocusableElements(container);

    if (!focusable.length) return;

    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    focusTrapHandler = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    container.addEventListener('keydown', focusTrapHandler);
  }

  function releaseFocus() {
    if (focusTrapHandler && nav) {
      nav.removeEventListener('keydown', focusTrapHandler);
      focusTrapHandler = null;
    }
  }

  // --------------------------------------------------
  // Marcar enlace activo
  // --------------------------------------------------

  function setActiveLink() {
    const currentPath = window.location.pathname.replace(/\/$/, '') || '/';

    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (!href) return;

      const linkPath = href.replace(/\/$/, '') || '/';

      if (currentPath === linkPath || currentPath.endsWith(linkPath)) {
        link.classList.add('site-nav__link--active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('site-nav__link--active');
        link.removeAttribute('aria-current');
      }
    });
  }

  // --------------------------------------------------
  // Init
  // --------------------------------------------------

  function init() {
    header  = document.querySelector('.site-header');
    burger  = document.querySelector('.site-header__burger');
    nav     = document.querySelector('.site-nav');
    overlay = document.querySelector('.site-header__overlay');

    if (!header) return;

    navLinks = header.querySelectorAll('.site-nav__link');

    // Sticky
    window.addEventListener('scroll', onScroll, { passive: true });
    updateStickyState();

    // Menú móvil
    if (burger && nav) {
      burger.addEventListener('click', toggleMenu);

      if (overlay) {
        overlay.addEventListener('click', closeMenu);
      }

      // Cerrar con Escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
          closeMenu();
        }
      });

      // Cerrar al redimensionar a desktop
      window.addEventListener('resize', () => {
        if (window.innerWidth > 1024 && burger.getAttribute('aria-expanded') === 'true') {
          closeMenu();
        }
      }, { passive: true });

      // Cerrar al clickar un enlace del menú móvil
      nav.querySelectorAll('.site-nav__link').forEach((link) => {
        link.addEventListener('click', () => {
          if (window.innerWidth <= 1024) {
            closeMenu();
          }
        });
      });
    }

    // Active link
    setActiveLink();
  }

  return { init };

})();

export default Header;
