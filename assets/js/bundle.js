/*!
 * GOBY FILTERS — Bundle para desarrollo local (file://)
 * Concatenación de todos los módulos sin import/export.
 * En WordPress / producción se usan los archivos individuales con type="module".
 */

(function () {
  'use strict';

  /* ============================================================
     HEADER
  ============================================================ */

  const Header = (() => {
    let header, burger, nav, overlay, navLinks;
    let lastScrollY = 0;
    let ticking = false;

    function onScroll() {
      lastScrollY = window.scrollY;
      if (!ticking) {
        window.requestAnimationFrame(updateStickyState);
        ticking = true;
      }
    }

    function updateStickyState() {
      header.classList.toggle('site-header--scrolled', lastScrollY > 10);
      ticking = false;
    }

    function openMenu() {
      nav.classList.add('site-nav--open');
      overlay.classList.add('site-header__overlay--visible');
      burger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      trapFocus(nav);
      const firstLink = nav.querySelector('.site-nav__link');
      if (firstLink) firstLink.focus();
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
      burger.getAttribute('aria-expanded') === 'true' ? closeMenu() : openMenu();
    }

    let focusTrapHandler = null;

    function getFocusableElements(container) {
      return [...container.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )];
    }

    function trapFocus(container) {
      const focusable = getFocusableElements(container);
      if (!focusable.length) return;
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];
      focusTrapHandler = (e) => {
        if (e.key !== 'Tab') return;
        if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus(); } }
        else            { if (document.activeElement === last)  { e.preventDefault(); first.focus(); } }
      };
      container.addEventListener('keydown', focusTrapHandler);
    }

    function releaseFocus() {
      if (focusTrapHandler && nav) {
        nav.removeEventListener('keydown', focusTrapHandler);
        focusTrapHandler = null;
      }
    }

    function setActiveLink() {
      const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
      navLinks.forEach((link) => {
        const href = link.getAttribute('href');
        if (!href) return;
        const linkPath = href.replace(/\/$/, '') || '/';
        const isActive = currentPath === linkPath || currentPath.endsWith(linkPath);
        link.classList.toggle('site-nav__link--active', isActive);
        isActive ? link.setAttribute('aria-current', 'page') : link.removeAttribute('aria-current');
      });
    }

    function init() {
      header  = document.querySelector('.site-header');
      burger  = document.querySelector('.site-header__burger');
      nav     = document.querySelector('.site-nav');
      overlay = document.querySelector('.site-header__overlay');
      if (!header) return;
      navLinks = header.querySelectorAll('.site-nav__link');
      window.addEventListener('scroll', onScroll, { passive: true });
      updateStickyState();
      if (burger && nav) {
        burger.addEventListener('click', toggleMenu);
        if (overlay) overlay.addEventListener('click', closeMenu);
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') closeMenu();
        });
        window.addEventListener('resize', () => {
          if (window.innerWidth > 1024 && burger.getAttribute('aria-expanded') === 'true') closeMenu();
        }, { passive: true });
        nav.querySelectorAll('.site-nav__link').forEach((link) => {
          link.addEventListener('click', () => { if (window.innerWidth <= 1024) closeMenu(); });
        });
      }
      setActiveLink();
    }

    return { init };
  })();

  /* ============================================================
     ANIMATIONS
  ============================================================ */

  const Animations = (() => {
    function initScrollAnimations() {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const targets = document.querySelectorAll('.animate-on-scroll');
      if (!targets.length) return;
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
        });
      }, { root: null, rootMargin: '0px 0px -60px 0px', threshold: 0.1 });
      targets.forEach((t) => observer.observe(t));
    }

    function animateCounter(element, target, duration = 1600) {
      const increment = target / (duration / 16);
      let current = 0;
      const suffix = element.dataset.suffix || '';
      const prefix = element.dataset.prefix || '';
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) { current = target; clearInterval(timer); }
        const value = Number.isInteger(target) ? Math.floor(current) : current.toFixed(1);
        element.textContent = `${prefix}${value}${suffix}`;
      }, 16);
    }

    function initCounters() {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const counters = document.querySelectorAll('[data-counter]');
      if (!counters.length) return;
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) { animateCounter(entry.target, parseFloat(entry.target.dataset.counter)); observer.unobserve(entry.target); }
        });
      }, { threshold: 0.5 });
      counters.forEach((c) => observer.observe(c));
    }

    function initHeroParallax() {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      if (window.innerWidth < 768) return;
      const heroBg = document.querySelector('.hero__bg-image');
      if (!heroBg) return;
      let ticking = false;
      window.addEventListener('scroll', () => {
        if (!ticking) {
          window.requestAnimationFrame(() => { heroBg.style.transform = `translateY(${window.scrollY * 0.25}px)`; ticking = false; });
          ticking = true;
        }
      }, { passive: true });
    }

    function initCardStagger() {
      document.querySelectorAll('.cards-grid').forEach((grid) => {
        grid.querySelectorAll('.animate-on-scroll').forEach((card, i) => {
          card.style.transitionDelay = `${Math.min(i * 80, 400)}ms`;
        });
      });
    }

    function init() {
      initScrollAnimations();
      initCounters();
      initHeroParallax();
      initCardStagger();
    }

    return { init };
  })();

  /* ============================================================
     SLIDER
  ============================================================ */

  const Slider = (() => {
    class SliderInstance {
      constructor(element) {
        this.root        = element;
        this.track       = element.querySelector('[data-slider-track]');
        this.slides      = [...element.querySelectorAll('[data-slider-slide]')];
        this.prevBtn     = element.querySelector('[data-slider-prev]');
        this.nextBtn     = element.querySelector('[data-slider-next]');
        this.dotsWrapper = element.querySelector('[data-slider-dots]');
        this.currentIndex = 0;
        this.totalSlides  = this.slides.length;
        this.autoplayMs   = parseInt(element.dataset.sliderAutoplay, 10) || 0;
        this.loop         = element.dataset.sliderLoop !== 'false';
        this.autoplayTimer= null;
        this.isDragging   = false;
        this.startX = 0;
        this.deltaX = 0;
        if (this.totalSlides < 2) return;
        this._buildDots();
        this._bindEvents();
        this._goTo(0, false);
        if (this.autoplayMs > 0) this._startAutoplay();
      }
      _goTo(index, animate = true) {
        if (this.loop) {
          if (index < 0) index = this.totalSlides - 1;
          if (index >= this.totalSlides) index = 0;
        } else {
          index = Math.max(0, Math.min(index, this.totalSlides - 1));
        }
        this.currentIndex = index;
        this.track.style.transition = animate ? 'transform 0.45s cubic-bezier(0.4,0,0.2,1)' : 'none';
        this.track.style.transform = `translateX(-${index * 100}%)`;
        this.slides.forEach((s, i) => { s.setAttribute('aria-hidden', i !== index); s.setAttribute('tabindex', i === index ? '0' : '-1'); });
        this._updateDots();
        this._updateButtons();
      }
      prev() { this._goTo(this.currentIndex - 1); this._resetAutoplay(); }
      next() { this._goTo(this.currentIndex + 1); this._resetAutoplay(); }
      _buildDots() {
        if (!this.dotsWrapper) return;
        this.dots = this.slides.map((_, i) => {
          const dot = document.createElement('button');
          dot.type = 'button'; dot.className = 'slider__dot';
          dot.setAttribute('aria-label', `Ir a la diapositiva ${i + 1}`);
          dot.addEventListener('click', () => { this._goTo(i); this._resetAutoplay(); });
          this.dotsWrapper.appendChild(dot);
          return dot;
        });
      }
      _updateDots() {
        if (!this.dots) return;
        this.dots.forEach((d, i) => { d.classList.toggle('slider__dot--active', i === this.currentIndex); d.setAttribute('aria-pressed', i === this.currentIndex ? 'true' : 'false'); });
      }
      _updateButtons() {
        if (this.loop) return;
        if (this.prevBtn) this.prevBtn.disabled = this.currentIndex === 0;
        if (this.nextBtn) this.nextBtn.disabled = this.currentIndex === this.totalSlides - 1;
      }
      _startAutoplay()  { this.autoplayTimer = setInterval(() => this._goTo(this.currentIndex + 1), this.autoplayMs); }
      _stopAutoplay()   { clearInterval(this.autoplayTimer); }
      _resetAutoplay()  { if (this.autoplayMs > 0) { this._stopAutoplay(); this._startAutoplay(); } }
      _onPointerStart(e) { this.isDragging = true; this.startX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX; this.track.style.transition = 'none'; }
      _onPointerMove(e)  { if (!this.isDragging) return; this.deltaX = (e.type === 'touchmove' ? e.touches[0].clientX : e.clientX) - this.startX; }
      _onPointerEnd() {
        if (!this.isDragging) return; this.isDragging = false;
        if (this.deltaX < -50) this.next(); else if (this.deltaX > 50) this.prev(); else this._goTo(this.currentIndex);
        this.deltaX = 0;
      }
      _bindEvents() {
        if (this.prevBtn) this.prevBtn.addEventListener('click', () => this.prev());
        if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.next());
        this.root.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') this.prev(); if (e.key === 'ArrowRight') this.next(); });
        this.track.addEventListener('touchstart', (e) => this._onPointerStart(e), { passive: true });
        this.track.addEventListener('touchmove',  (e) => this._onPointerMove(e),  { passive: true });
        this.track.addEventListener('touchend',   ()  => this._onPointerEnd());
        this.track.addEventListener('mousedown',  (e) => this._onPointerStart(e));
        this.track.addEventListener('mousemove',  (e) => this._onPointerMove(e));
        this.track.addEventListener('mouseup',    ()  => this._onPointerEnd());
        this.track.addEventListener('mouseleave', ()  => { if (this.isDragging) this._onPointerEnd(); });
        if (this.autoplayMs > 0) {
          this.root.addEventListener('mouseenter', () => this._stopAutoplay());
          this.root.addEventListener('mouseleave', () => this._startAutoplay());
          this.root.addEventListener('focusin',    () => this._stopAutoplay());
          this.root.addEventListener('focusout',   () => this._startAutoplay());
        }
      }
    }
    function init() { return [...document.querySelectorAll('[data-slider]')].map((el) => new SliderInstance(el)); }
    return { init };
  })();

  /* ============================================================
     PRODUCTS
  ============================================================ */

  const Products = (() => {
    const PAGE_SIZE = 12;
    let state = { query: '', category: 'all', sort: 'default', page: 1 };
    let cards = [], visibleCards = [];
    let searchInput, countEl, emptyEl, grid, paginationEl, liveRegion;

    function collectCards() {
      cards = [...document.querySelectorAll('.card--product[data-product]')].map((el) => ({
        el,
        title:    (el.querySelector('.card__title')?.textContent ?? '').toLowerCase(),
        category: el.dataset.category ?? '',
      }));
    }

    function applyFilters() {
      const q = state.query.toLowerCase().trim();
      visibleCards = cards.filter(({ title, category }) => {
        return (state.category === 'all' || category === state.category) && (!q || title.includes(q));
      });
      if (state.sort === 'az') visibleCards.sort((a, b) => a.title.localeCompare(b.title));
      if (state.sort === 'za') visibleCards.sort((a, b) => b.title.localeCompare(a.title));
      state.page = 1;
      render();
    }

    function render() {
      const total     = visibleCards.length;
      const pageCards = visibleCards.slice((state.page - 1) * PAGE_SIZE, state.page * PAGE_SIZE);
      cards.forEach(({ el }) => el.setAttribute('aria-hidden', 'true'));
      pageCards.forEach(({ el }) => el.setAttribute('aria-hidden', 'false'));
      if (countEl) countEl.innerHTML = `Mostrando <strong>${pageCards.length}</strong> de <strong>${total}</strong> productos`;
      if (emptyEl) emptyEl.classList.toggle('products-empty--visible', total === 0);
      renderPagination(total);
      if (liveRegion) {
        const msg = total === 0 ? 'No se encontraron productos.' : `${total} producto${total === 1 ? '' : 's'} encontrado${total === 1 ? '' : 's'}.`;
        liveRegion.textContent = '';
        requestAnimationFrame(() => { liveRegion.textContent = msg; });
      }
    }

    function renderPagination(total) {
      if (!paginationEl) return;
      const totalPages = Math.ceil(total / PAGE_SIZE);
      if (totalPages <= 1) { paginationEl.innerHTML = ''; return; }
      const current = state.page;
      const getRange = (c, t) => {
        if (t <= 7) return Array.from({ length: t }, (_, i) => i + 1);
        if (c <= 4) return [1,2,3,4,5,'…',t];
        if (c >= t - 3) return [1,'…',t-4,t-3,t-2,t-1,t];
        return [1,'…',c-1,c,c+1,'…',t];
      };
      let html = `<button class="pagination__item" data-page="${current-1}" aria-label="Anterior" ${current===1?'disabled':''}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg></button>`;
      getRange(current, totalPages).forEach((p) => {
        if (p === '…') { html += `<span class="pagination__item pagination__item--ellipsis" aria-hidden="true">…</span>`; }
        else { html += `<button class="pagination__item ${p===current?'pagination__item--active':''}" data-page="${p}" aria-label="Página ${p}" ${p===current?'aria-current="page"':''}>${p}</button>`; }
      });
      html += `<button class="pagination__item" data-page="${current+1}" aria-label="Siguiente" ${current===totalPages?'disabled':''}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg></button>`;
      paginationEl.innerHTML = html;
      paginationEl.querySelectorAll('[data-page]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const p = parseInt(btn.dataset.page, 10);
          if (!isNaN(p) && p !== state.page) {
            state.page = p; render();
            if (grid) window.scrollTo({ top: grid.getBoundingClientRect().top + window.scrollY - 160, behavior: 'smooth' });
          }
        });
      });
    }

    function init() {
      grid         = document.querySelector('[data-products-grid]');
      searchInput  = document.querySelector('[data-products-search]');
      countEl      = document.querySelector('[data-products-count]');
      emptyEl      = document.querySelector('[data-products-empty]');
      paginationEl = document.querySelector('[data-products-pagination]');
      if (!grid) return;
      liveRegion = document.createElement('div');
      liveRegion.setAttribute('role', 'status');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      document.body.appendChild(liveRegion);
      collectCards();
      if (searchInput) {
        let timer;
        searchInput.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(() => { state.query = searchInput.value; applyFilters(); }, 300); });
        searchInput.addEventListener('keydown', (e) => { if (e.key === 'Escape') { searchInput.value = ''; state.query = ''; applyFilters(); } });
      }
      document.querySelectorAll('[data-filter-cat]').forEach((btn) => {
        btn.addEventListener('click', () => {
          state.category = btn.dataset.filterCat;
          document.querySelectorAll('[data-filter-cat]').forEach((b) => {
            const active = b.dataset.filterCat === state.category;
            b.classList.toggle('filter-tab--active', active);
            b.setAttribute('aria-pressed', String(active));
          });
          applyFilters();
        });
      });
      const sortSelect = document.querySelector('[data-products-sort]');
      if (sortSelect) sortSelect.addEventListener('change', () => { state.sort = sortSelect.value; applyFilters(); });
      applyFilters();
    }

    return { init };
  })();

  /* ============================================================
     FAQ
  ============================================================ */

  function initFAQ() {
    const items = document.querySelectorAll('.faq__item');
    items.forEach((item) => {
      const question = item.querySelector('.faq__question');
      const answer   = item.querySelector('.faq__answer');
      if (!question || !answer) return;
      const answerId = `faq-${Math.random().toString(36).slice(2,7)}`;
      answer.id = answerId;
      question.setAttribute('aria-controls', answerId);
      question.setAttribute('aria-expanded', 'false');
      question.addEventListener('click', () => {
        const isOpen = item.classList.contains('faq__item--open');
        items.forEach((o) => { if (o !== item) { o.classList.remove('faq__item--open'); o.querySelector('.faq__question')?.setAttribute('aria-expanded','false'); } });
        item.classList.toggle('faq__item--open', !isOpen);
        question.setAttribute('aria-expanded', String(!isOpen));
      });
    });
  }

  /* ============================================================
     SMOOTH SCROLL
  ============================================================ */

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        const headerHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height'), 10) || 80;
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - headerHeight - 16, behavior: 'smooth' });
        history.replaceState(null, '', href);
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      });
    });
  }

  /* ============================================================
     SCROLL TO TOP
  ============================================================ */

  function initScrollToTop() {
    const btn = document.querySelector('[data-scroll-top]');
    if (!btn) return;
    window.addEventListener('scroll', () => btn.classList.toggle('is-visible', window.scrollY > 400), { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ============================================================
     CLIENTES LOOP
  ============================================================ */

  function initClientsLoop() {
    const track = document.querySelector('.clients-section__logos');
    if (!track) return;
    const clone = track.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.parentElement.appendChild(clone);
  }

  /* ============================================================
     FORMULARIOS
  ============================================================ */

  function initForms() {
    document.querySelectorAll('form[data-validate]').forEach((form) => {
      form.addEventListener('submit', (e) => {
        let valid = true;
        form.querySelectorAll('[required]').forEach((field) => {
          const errorId = `${field.id}-error`;
          let errorEl = document.getElementById(errorId);
          if (!field.value.trim()) {
            valid = false;
            field.classList.add('form-input--error');
            field.setAttribute('aria-invalid', 'true');
            if (!errorEl) {
              errorEl = document.createElement('span');
              errorEl.id = errorId; errorEl.className = 'form-error';
              errorEl.textContent = 'Este campo es obligatorio.';
              field.insertAdjacentElement('afterend', errorEl);
            }
            field.setAttribute('aria-describedby', errorId);
          } else {
            field.classList.remove('form-input--error');
            field.removeAttribute('aria-invalid');
            if (errorEl) errorEl.remove();
            field.removeAttribute('aria-describedby');
          }
        });
        if (!valid) { e.preventDefault(); form.querySelector('.form-input--error')?.focus(); }
      });
      form.querySelectorAll('[required]').forEach((field) => {
        field.addEventListener('input', () => {
          if (field.value.trim()) {
            field.classList.remove('form-input--error');
            field.removeAttribute('aria-invalid');
            document.getElementById(`${field.id}-error`)?.remove();
          }
        });
      });
    });
  }

  /* ============================================================
     FORMULARIO PQR — Peticiones, Quejas y Reclamos
  ============================================================ */

  function initPQRForm() {
    const form = document.querySelector('[data-pqr-form]');
    if (!form) return;

    const successEl  = document.getElementById('pqr-success');
    const errorEl    = document.getElementById('pqr-error');
    const radicadoEl = document.getElementById('pqr-radicado');
    const requiredFields = form.querySelectorAll('[required]');

    function validateField(field) {
      const errorEl = document.getElementById(`${field.id}-error`);
      const isEmpty = !field.value.trim();

      field.classList.toggle('form-input--error', isEmpty);
      field.setAttribute('aria-invalid', isEmpty ? 'true' : 'false');

      if (errorEl) {
        errorEl.textContent = isEmpty ? (field.type === 'checkbox' ? 'Debe aceptar la política de datos.' : 'Este campo es obligatorio.') : '';
      }

      return !isEmpty;
    }

    requiredFields.forEach((field) => {
      field.addEventListener('change', () => validateField(field));
      field.addEventListener('input',  () => validateField(field));
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      let valid = true;
      requiredFields.forEach((field) => {
        if (!validateField(field)) valid = false;
      });

      if (!valid) {
        form.querySelector('.form-input--error')?.focus();
        return;
      }

      const submitBtn = form.querySelector('[type="submit"]');
      const submitBtnLabel = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando…';
      if (errorEl) errorEl.hidden = true;

      fetch('pqr-handler.php', {
        method: 'POST',
        body: new FormData(form),
      })
        .then((res) => res.json())
        .then((data) => {
          if (!data.success) throw new Error(data.message || 'Error al enviar.');

          if (radicadoEl) radicadoEl.textContent = data.radicado || '';
          form.hidden = true;
          if (successEl) successEl.hidden = false;
          successEl?.focus();
        })
        .catch(() => {
          if (errorEl) {
            errorEl.hidden = false;
            errorEl.focus();
          }
          submitBtn.disabled = false;
          submitBtn.textContent = submitBtnLabel;
        });
    });
  }

  /* ============================================================
     INIT
  ============================================================ */

  document.addEventListener('DOMContentLoaded', () => {
    Header.init();
    Animations.init();
    Slider.init();
    Products.init();
    initFAQ();
    initSmoothScroll();
    initScrollToTop();
    initClientsLoop();
    initForms();
    initPQRForm();
  });

})();
