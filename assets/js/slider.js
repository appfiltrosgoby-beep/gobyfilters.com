/**
 * GOBY FILTERS — Slider / Carrusel
 * Slider accesible sin dependencias.
 * Uso: <div class="slider" data-slider> ... </div>
 * Opciones via data-attributes:
 *   data-slider-autoplay="4000"   — intervalo en ms (0 = desactivado)
 *   data-slider-loop="true"       — loop infinito
 */

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
      this.startX       = 0;
      this.deltaX       = 0;

      if (this.totalSlides < 2) return;

      this._buildDots();
      this._bindEvents();
      this._goTo(0, false);

      if (this.autoplayMs > 0) {
        this._startAutoplay();
      }
    }

    // --------------------------------------------------
    // Navegación
    // --------------------------------------------------

    _goTo(index, animate = true) {
      if (this.loop) {
        if (index < 0)                 index = this.totalSlides - 1;
        if (index >= this.totalSlides) index = 0;
      } else {
        index = Math.max(0, Math.min(index, this.totalSlides - 1));
      }

      this.currentIndex = index;

      // Mover track
      if (animate) {
        this.track.style.transition = 'transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)';
      } else {
        this.track.style.transition = 'none';
      }

      this.track.style.transform = `translateX(-${index * 100}%)`;

      // Actualizar estados ARIA
      this.slides.forEach((slide, i) => {
        const isActive = i === index;
        slide.setAttribute('aria-hidden', !isActive);
        slide.setAttribute('tabindex', isActive ? '0' : '-1');
      });

      // Actualizar dots
      this._updateDots();

      // Actualizar botones
      this._updateButtons();
    }

    prev() {
      this._goTo(this.currentIndex - 1);
      this._resetAutoplay();
    }

    next() {
      this._goTo(this.currentIndex + 1);
      this._resetAutoplay();
    }

    // --------------------------------------------------
    // Dots
    // --------------------------------------------------

    _buildDots() {
      if (!this.dotsWrapper) return;

      this.dots = this.slides.map((_, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'slider__dot';
        dot.setAttribute('aria-label', `Ir a la diapositiva ${i + 1}`);
        dot.addEventListener('click', () => {
          this._goTo(i);
          this._resetAutoplay();
        });
        this.dotsWrapper.appendChild(dot);
        return dot;
      });
    }

    _updateDots() {
      if (!this.dots) return;

      this.dots.forEach((dot, i) => {
        dot.classList.toggle('slider__dot--active', i === this.currentIndex);
        dot.setAttribute('aria-pressed', i === this.currentIndex ? 'true' : 'false');
      });
    }

    // --------------------------------------------------
    // Botones prev/next
    // --------------------------------------------------

    _updateButtons() {
      if (this.loop) return;

      if (this.prevBtn) {
        this.prevBtn.disabled = this.currentIndex === 0;
      }

      if (this.nextBtn) {
        this.nextBtn.disabled = this.currentIndex === this.totalSlides - 1;
      }
    }

    // --------------------------------------------------
    // Autoplay
    // --------------------------------------------------

    _startAutoplay() {
      this.autoplayTimer = setInterval(() => this._goTo(this.currentIndex + 1), this.autoplayMs);
    }

    _stopAutoplay() {
      clearInterval(this.autoplayTimer);
    }

    _resetAutoplay() {
      if (this.autoplayMs > 0) {
        this._stopAutoplay();
        this._startAutoplay();
      }
    }

    // --------------------------------------------------
    // Swipe táctil y arrastre con ratón
    // --------------------------------------------------

    _onPointerStart(e) {
      this.isDragging = true;
      this.startX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
      this.track.style.transition = 'none';
    }

    _onPointerMove(e) {
      if (!this.isDragging) return;
      this.deltaX = (e.type === 'touchmove' ? e.touches[0].clientX : e.clientX) - this.startX;
    }

    _onPointerEnd() {
      if (!this.isDragging) return;
      this.isDragging = false;

      const threshold = 50;

      if (this.deltaX < -threshold) {
        this.next();
      } else if (this.deltaX > threshold) {
        this.prev();
      } else {
        this._goTo(this.currentIndex);
      }

      this.deltaX = 0;
    }

    // --------------------------------------------------
    // Eventos
    // --------------------------------------------------

    _bindEvents() {
      if (this.prevBtn) {
        this.prevBtn.addEventListener('click', () => this.prev());
      }

      if (this.nextBtn) {
        this.nextBtn.addEventListener('click', () => this.next());
      }

      // Teclado
      this.root.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft')  this.prev();
        if (e.key === 'ArrowRight') this.next();
      });

      // Touch
      this.track.addEventListener('touchstart', (e) => this._onPointerStart(e), { passive: true });
      this.track.addEventListener('touchmove',  (e) => this._onPointerMove(e),  { passive: true });
      this.track.addEventListener('touchend',   ()  => this._onPointerEnd());

      // Mouse drag
      this.track.addEventListener('mousedown',  (e) => this._onPointerStart(e));
      this.track.addEventListener('mousemove',  (e) => this._onPointerMove(e));
      this.track.addEventListener('mouseup',    ()  => this._onPointerEnd());
      this.track.addEventListener('mouseleave', ()  => { if (this.isDragging) this._onPointerEnd(); });

      // Pausar autoplay al hacer foco o hover
      if (this.autoplayMs > 0) {
        this.root.addEventListener('mouseenter', () => this._stopAutoplay());
        this.root.addEventListener('mouseleave', () => this._startAutoplay());
        this.root.addEventListener('focusin',    () => this._stopAutoplay());
        this.root.addEventListener('focusout',   () => this._startAutoplay());
      }
    }

    destroy() {
      this._stopAutoplay();
    }
  }

  // --------------------------------------------------
  // Init — busca todos los sliders en la página
  // --------------------------------------------------

  function init() {
    const sliders = document.querySelectorAll('[data-slider]');
    return [...sliders].map((el) => new SliderInstance(el));
  }

  return { init };

})();

export default Slider;
