/**
 * GOBY FILTERS — Catálogo de Productos
 * Filtrado por categoría, búsqueda en tiempo real, ordenamiento,
 * alternancia de vista grid/lista y paginación cliente.
 */

const Products = (() => {

  const PAGE_SIZE = 12;

  let state = {
    query:    '',
    category: 'all',
    sort:     'default',
    view:     'grid',
    page:     1,
  };

  let cards         = [];
  let visibleCards  = [];
  let searchInput   = null;
  let countEl       = null;
  let emptyEl       = null;
  let grid          = null;
  let paginationEl  = null;

  // --------------------------------------------------
  // Recopilar datos de cada card desde el DOM
  // --------------------------------------------------

  function collectCards() {
    const els = document.querySelectorAll('.card--product[data-product]');

    cards = [...els].map((el) => ({
      el,
      title:    (el.querySelector('.card__title')?.textContent ?? '').toLowerCase(),
      category: el.dataset.category ?? '',
      sort:     parseFloat(el.dataset.sort ?? '0'),
    }));
  }

  // --------------------------------------------------
  // Filtrar y ordenar
  // --------------------------------------------------

  function applyFilters() {
    const q   = state.query.toLowerCase().trim();
    const cat = state.category;

    visibleCards = cards.filter(({ title, category }) => {
      const matchCat   = cat === 'all' || category === cat;
      const matchQuery = !q || title.includes(q);
      return matchCat && matchQuery;
    });

    // Ordenamiento
    if (state.sort === 'az') {
      visibleCards.sort((a, b) => a.title.localeCompare(b.title));
    } else if (state.sort === 'za') {
      visibleCards.sort((a, b) => b.title.localeCompare(a.title));
    }

    state.page = 1;
    render();
  }

  // --------------------------------------------------
  // Render — mostrar/ocultar cards y paginación
  // --------------------------------------------------

  function render() {
    const total = visibleCards.length;
    const start = (state.page - 1) * PAGE_SIZE;
    const end   = start + PAGE_SIZE;
    const pageCards = visibleCards.slice(start, end);

    // Ocultar todas
    cards.forEach(({ el }) => el.setAttribute('aria-hidden', 'true'));

    // Mostrar las de la página actual
    pageCards.forEach(({ el }) => el.setAttribute('aria-hidden', 'false'));

    // Contador
    if (countEl) {
      countEl.innerHTML = `Mostrando <strong>${pageCards.length}</strong> de <strong>${total}</strong> productos`;
    }

    // Estado vacío
    if (emptyEl) {
      emptyEl.classList.toggle('products-empty--visible', total === 0);
    }

    // Paginación
    renderPagination(total);

    // Anuncio para lectores de pantalla
    announceResults(total);
  }

  // --------------------------------------------------
  // Paginación
  // --------------------------------------------------

  function renderPagination(total) {
    if (!paginationEl) return;

    const totalPages = Math.ceil(total / PAGE_SIZE);

    if (totalPages <= 1) {
      paginationEl.innerHTML = '';
      return;
    }

    const current = state.page;
    let html = '';

    // Anterior
    html += `
      <button
        class="pagination__item"
        data-page="${current - 1}"
        aria-label="Página anterior"
        ${current === 1 ? 'disabled aria-disabled="true"' : ''}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
    `;

    // Páginas numeradas con ellipsis
    const pages = getPaginationRange(current, totalPages);

    pages.forEach((p) => {
      if (p === '…') {
        html += `<span class="pagination__item pagination__item--ellipsis" aria-hidden="true">…</span>`;
      } else {
        html += `
          <button
            class="pagination__item ${p === current ? 'pagination__item--active' : ''}"
            data-page="${p}"
            aria-label="Página ${p}"
            ${p === current ? 'aria-current="page"' : ''}
          >${p}</button>
        `;
      }
    });

    // Siguiente
    html += `
      <button
        class="pagination__item"
        data-page="${current + 1}"
        aria-label="Página siguiente"
        ${current === totalPages ? 'disabled aria-disabled="true"' : ''}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>
    `;

    paginationEl.innerHTML = html;

    // Eventos en los botones generados
    paginationEl.querySelectorAll('.pagination__item[data-page]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const page = parseInt(btn.dataset.page, 10);
        if (!isNaN(page) && page !== state.page) {
          state.page = page;
          render();
          scrollToGrid();
        }
      });
    });
  }

  function getPaginationRange(current, total) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    if (current <= 4) return [1, 2, 3, 4, 5, '…', total];
    if (current >= total - 3) return [1, '…', total - 4, total - 3, total - 2, total - 1, total];

    return [1, '…', current - 1, current, current + 1, '…', total];
  }

  function scrollToGrid() {
    if (!grid) return;
    const top = grid.getBoundingClientRect().top + window.scrollY - 160;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  // --------------------------------------------------
  // Accesibilidad — anuncio de resultados para SR
  // --------------------------------------------------

  let liveRegion = null;

  function announceResults(total) {
    if (!liveRegion) return;
    const msg = total === 0
      ? 'No se encontraron productos.'
      : `${total} producto${total === 1 ? '' : 's'} encontrado${total === 1 ? '' : 's'}.`;
    liveRegion.textContent = '';
    requestAnimationFrame(() => { liveRegion.textContent = msg; });
  }

  // --------------------------------------------------
  // Vista grid / lista
  // --------------------------------------------------

  function setView(view) {
    if (!grid) return;
    state.view = view;
    grid.classList.toggle('products-grid--list', view === 'list');

    document.querySelectorAll('.view-toggle__btn').forEach((btn) => {
      const isActive = btn.dataset.view === view;
      btn.classList.toggle('view-toggle__btn--active', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
    });
  }

  // --------------------------------------------------
  // Toolbar sticky shadow
  // --------------------------------------------------

  function initToolbarShadow() {
    const toolbar = document.querySelector('.products-toolbar');
    if (!toolbar) return;

    const observer = new IntersectionObserver(
      ([entry]) => toolbar.classList.toggle('products-toolbar--shadow', !entry.isIntersecting),
      { threshold: 1, rootMargin: `-${getComputedStyle(document.documentElement).getPropertyValue('--header-height').trim()} 0px 0px 0px` }
    );

    const sentinel = document.createElement('div');
    sentinel.style.cssText = 'height:1px;pointer-events:none;';
    toolbar.insertAdjacentElement('beforebegin', sentinel);
    observer.observe(sentinel);
  }

  // --------------------------------------------------
  // Init
  // --------------------------------------------------

  function init() {
    grid         = document.querySelector('[data-products-grid]');
    searchInput  = document.querySelector('[data-products-search]');
    countEl      = document.querySelector('[data-products-count]');
    emptyEl      = document.querySelector('[data-products-empty]');
    paginationEl = document.querySelector('[data-products-pagination]');

    if (!grid) return;

    // Live region para lectores de pantalla
    liveRegion = document.createElement('div');
    liveRegion.setAttribute('role', 'status');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    document.body.appendChild(liveRegion);

    collectCards();

    // Búsqueda con debounce
    if (searchInput) {
      let debounceTimer;
      searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          state.query = searchInput.value;
          applyFilters();
        }, 300);
      });

      // Limpiar búsqueda con Escape
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          searchInput.value = '';
          state.query = '';
          applyFilters();
        }
      });
    }

    // Filtros de categoría
    document.querySelectorAll('[data-filter-cat]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.category = btn.dataset.filterCat;

        document.querySelectorAll('[data-filter-cat]').forEach((b) => {
          const isActive = b.dataset.filterCat === state.category;
          b.classList.toggle('filter-tab--active', isActive);
          b.setAttribute('aria-pressed', String(isActive));
        });

        applyFilters();
      });
    });

    // Ordenamiento
    const sortSelect = document.querySelector('[data-products-sort]');
    if (sortSelect) {
      sortSelect.addEventListener('change', () => {
        state.sort = sortSelect.value;
        applyFilters();
      });
    }

    // Toggle vista
    document.querySelectorAll('.view-toggle__btn').forEach((btn) => {
      btn.addEventListener('click', () => setView(btn.dataset.view));
    });

    initToolbarShadow();

    // Render inicial
    applyFilters();
  }

  return { init };

})();

export default Products;
