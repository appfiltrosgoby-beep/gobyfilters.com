/**
 * GOBY FILTERS — Entry point
 * Importa módulos e inicializa todos los componentes.
 * En WordPress: se encola con wp_enqueue_script(), type="module".
 */

import Header     from './header.js';
import Animations from './animations.js';
import Slider     from './slider.js';
import Products   from './products.js';

// --------------------------------------------------
// FAQ — Acordeón
// --------------------------------------------------

function initFAQ() {
  const items = document.querySelectorAll('.faq__item');

  items.forEach((item) => {
    const question = item.querySelector('.faq__question');
    const answer   = item.querySelector('.faq__answer');

    if (!question || !answer) return;

    // Accesibilidad: atributos ARIA
    const answerId = `faq-answer-${Math.random().toString(36).slice(2, 7)}`;
    answer.id = answerId;
    question.setAttribute('aria-controls', answerId);
    question.setAttribute('aria-expanded', 'false');

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('faq__item--open');

      // Cerrar todos los demás
      items.forEach((other) => {
        if (other !== item) {
          other.classList.remove('faq__item--open');
          const otherQuestion = other.querySelector('.faq__question');
          if (otherQuestion) {
            otherQuestion.setAttribute('aria-expanded', 'false');
          }
        }
      });

      // Toggle el actual
      item.classList.toggle('faq__item--open', !isOpen);
      question.setAttribute('aria-expanded', (!isOpen).toString());
    });
  });
}

// --------------------------------------------------
// Scroll suave a anclas internas
// --------------------------------------------------

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      const headerHeight = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--header-height'),
        10
      ) || 80;

      const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 16;

      window.scrollTo({ top, behavior: 'smooth' });

      // Actualizar hash sin salto
      history.replaceState(null, '', href);

      // Mover foco al destino
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });
}

// --------------------------------------------------
// Lazy loading de imágenes (para navegadores sin soporte nativo)
// --------------------------------------------------

function initLazyImages() {
  if ('loading' in HTMLImageElement.prototype) return;

  const lazyImages = document.querySelectorAll('img[loading="lazy"]');

  if (!lazyImages.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src || img.src;
        observer.unobserve(img);
      }
    });
  });

  lazyImages.forEach((img) => observer.observe(img));
}

// --------------------------------------------------
// Scroll to top button
// --------------------------------------------------

function initScrollToTop() {
  const btn = document.querySelector('[data-scroll-top]');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('is-visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// --------------------------------------------------
// Clientes — loop duplicado para animación infinita
// --------------------------------------------------

function initClientsLoop() {
  const track = document.querySelector('.clients-section__logos');
  if (!track) return;

  // Clonar para loop infinito
  const clone = track.cloneNode(true);
  clone.setAttribute('aria-hidden', 'true');
  track.parentElement.appendChild(clone);
}

// --------------------------------------------------
// Formularios — validación básica del lado cliente
// --------------------------------------------------

function initForms() {
  const forms = document.querySelectorAll('form[data-validate]');

  forms.forEach((form) => {
    form.addEventListener('submit', (e) => {
      const required = form.querySelectorAll('[required]');
      let valid = true;

      required.forEach((field) => {
        const errorId = `${field.id}-error`;
        let errorEl   = document.getElementById(errorId);

        if (!field.value.trim()) {
          valid = false;
          field.classList.add('form-input--error');
          field.setAttribute('aria-invalid', 'true');

          if (!errorEl) {
            errorEl = document.createElement('span');
            errorEl.id = errorId;
            errorEl.className = 'form-error';
            errorEl.textContent = 'Este campo es obligatorio.';
            field.insertAdjacentElement('afterend', errorEl);
          }

          field.setAttribute('aria-describedby', errorId);
        } else {
          field.classList.remove('form-input--error');
          field.removeAttribute('aria-invalid');

          if (errorEl) {
            errorEl.remove();
          }

          field.removeAttribute('aria-describedby');
        }
      });

      if (!valid) {
        e.preventDefault();
        // Enfocar el primer campo inválido
        const firstError = form.querySelector('.form-input--error');
        if (firstError) firstError.focus();
      }
    });

    // Limpiar errores en tiempo real
    form.querySelectorAll('[required]').forEach((field) => {
      field.addEventListener('input', () => {
        if (field.value.trim()) {
          field.classList.remove('form-input--error');
          field.removeAttribute('aria-invalid');

          const errorEl = document.getElementById(`${field.id}-error`);
          if (errorEl) errorEl.remove();
        }
      });
    });
  });
}

// --------------------------------------------------
// DOMContentLoaded — inicialización
// --------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  Header.init();
  Animations.init();
  Slider.init();
  Products.init();
  initFAQ();
  initSmoothScroll();
  initLazyImages();
  initScrollToTop();
  initClientsLoop();
  initForms();
});
