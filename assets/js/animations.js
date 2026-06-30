/**
 * GOBY FILTERS — Animaciones
 * IntersectionObserver para fade-in de elementos al hacer scroll.
 * No depende de librerías externas.
 */

const Animations = (() => {

  // --------------------------------------------------
  // Fade-in on scroll
  // --------------------------------------------------

  function initScrollAnimations() {
    // Respetar preferencia del usuario por movimiento reducido
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const targets = document.querySelectorAll('.animate-on-scroll');

    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -60px 0px',
        threshold: 0.1
      }
    );

    targets.forEach((target) => observer.observe(target));
  }

  // --------------------------------------------------
  // Contador animado de números (hero stats, etc.)
  // --------------------------------------------------

  function animateCounter(element, target, duration = 1600) {
    const start     = 0;
    const increment = target / (duration / 16);
    let   current   = start;

    const suffix = element.dataset.suffix || '';
    const prefix = element.dataset.prefix || '';

    const timer = setInterval(() => {
      current += increment;

      if (current >= target) {
        current = target;
        clearInterval(timer);
      }

      const value = Number.isInteger(target) ? Math.floor(current) : current.toFixed(1);
      element.textContent = `${prefix}${value}${suffix}`;
    }, 16);
  }

  function initCounters() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const counters = document.querySelectorAll('[data-counter]');

    if (!counters.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = parseFloat(entry.target.dataset.counter);
            animateCounter(entry.target, target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((counter) => observer.observe(counter));
  }

  // --------------------------------------------------
  // Parallax suave en el hero background
  // --------------------------------------------------

  function initHeroParallax() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.innerWidth < 768) return;

    const heroBg = document.querySelector('.hero__bg-image');
    if (!heroBg) return;

    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrolled = window.scrollY;
          heroBg.style.transform = `translateY(${scrolled * 0.25}px)`;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // --------------------------------------------------
  // Stagger para grids de cards
  // Añade delay progresivo a cards dentro de un grid.
  // --------------------------------------------------

  function initCardStagger() {
    const grids = document.querySelectorAll('.cards-grid');

    grids.forEach((grid) => {
      const cards = grid.querySelectorAll('.animate-on-scroll');

      cards.forEach((card, index) => {
        const delay = Math.min(index * 80, 400);
        card.style.transitionDelay = `${delay}ms`;
      });
    });
  }

  // --------------------------------------------------
  // Init general
  // --------------------------------------------------

  function init() {
    initScrollAnimations();
    initCounters();
    initHeroParallax();
    initCardStagger();
  }

  return { init };

})();

export default Animations;
