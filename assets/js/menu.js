/**
 * Nelsmari Sous Vide — Menu Module
 * Carga products.csv con PapaParse y renderiza el catálogo con búsqueda
 * y filtros de categoría.
 */

const Menu = (() => {
  const grid = document.getElementById('product-grid');
  const filtersContainer = document.getElementById('category-filters');
  const countEl = document.getElementById('menu-count');
  const searchInput = document.getElementById('menu-search');
  const searchClear = document.getElementById('menu-search-clear');

  let allProducts = [];
  let activeCategory = 'todas';
  let searchTerm = '';

  // Load CSV (shared cache)
  CsvLoader.load().then(data => {
    allProducts = data.filter(p => p.disponible === 'true');
    renderProducts();
    setupFilters();
    setupSearch();
  });

  function getCategoryLabel(cat) {
    const labels = {
      proteinas: 'Proteínas',
      carbohidratos: 'Carbohidratos',
      vegetales: 'Vegetales'
    };
    return labels[cat] || cat;
  }

  function getFilteredProducts() {
    let filtered = allProducts;

    // Categoría
    if (activeCategory !== 'todas') {
      filtered = filtered.filter(p => p.categoria === activeCategory);
    }

    // Búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.nombre.toLowerCase().includes(term) ||
        p.descripcion_corta.toLowerCase().includes(term)
      );
    }

    return filtered;
  }

  function renderProducts() {
    if (!grid) return;

    const filtered = getFilteredProducts();

    // Update count
    if (countEl) {
      countEl.textContent = filtered.length === 0
        ? 'No se encontraron platos'
        : `${filtered.length} plato${filtered.length !== 1 ? 's' : ''} disponible${filtered.length !== 1 ? 's' : ''}`;
    }

    // Empty state
    if (filtered.length === 0) {
      grid.className = 'menu-grid menu-grid--flat';
      grid.innerHTML = `
        <div class="menu-empty">
          <h3>No encontramos resultados</h3>
          <p>Intenta con otra búsqueda o cambia los filtros.</p>
        </div>
      `;
      return;
    }

    // Group by category when showing all
    if (activeCategory === 'todas') {
      const groups = {};
      filtered.forEach(p => {
        if (!groups[p.categoria]) groups[p.categoria] = [];
        groups[p.categoria].push(p);
      });

      const order = ['proteinas', 'carbohidratos', 'vegetales'];
      grid.className = 'menu-grid menu-grid--grouped';
      grid.innerHTML = order
        .filter(cat => groups[cat])
        .map(cat => {
          const count = groups[cat].length;
          const countLabel = `${count} plato${count !== 1 ? 's' : ''}`;
          return `
            <section class="menu-group" data-category="${cat}">
              <div class="menu-category-header">
                <h2 class="menu-category-title">${getCategoryLabel(cat)}</h2>
                <span class="menu-category-count">${countLabel}</span>
              </div>
              <div class="menu-group__cards">
                ${groups[cat].map(p => renderCard(p)).join('')}
              </div>
            </section>
          `;
        }).join('');
    } else {
      grid.className = 'menu-grid menu-grid--flat';
      grid.innerHTML = filtered.map(p => renderCard(p)).join('');
    }
  }

  function renderCard(product) {
    const qty = Cart.getItemQty(product.id);
    const price = parseFloat(product.precio);

    return `
      <div class="card card--menu" data-id="${product.id}">
        <a href="/sous-vide/producto/?id=${product.id}" class="card__image">
          <img src="/assets/img/products/${product.imagen_miniatura}"
               alt="${product.nombre}"
               loading="lazy"
               onerror="this.parentElement.classList.add('card__image--placeholder'); this.parentElement.dataset.name='${product.nombre}'">
        </a>
        <div class="card__body">
          <a href="/sous-vide/producto/?id=${product.id}" class="card__title-link">
            <h3 class="card__title">${product.nombre}</h3>
          </a>
          <p class="card__description">${product.descripcion_corta}</p>
          <div class="card__footer">
            <span class="card__price">${Cart.formatPrice(price)}</span>
            ${qty > 0 ? `
              <div class="qty-selector">
                <button class="qty-selector__btn" onclick="Menu.changeQty('${product.id}', -1)" aria-label="Menos">−</button>
                <span class="qty-selector__value">${qty}</span>
                <button class="qty-selector__btn" onclick="Menu.changeQty('${product.id}', 1)" aria-label="Más">+</button>
              </div>
            ` : `
              <button class="btn btn--primary btn--sm" onclick="Menu.addProduct('${product.id}')">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Agregar
              </button>
            `}
          </div>
        </div>
      </div>
    `;
  }

  // --- Setup listeners ---

  function setupFilters() {
    if (!filtersContainer) return;

    filtersContainer.addEventListener('click', (e) => {
      const pill = e.target.closest('.filter-pill');
      if (!pill) return;

      activeCategory = pill.dataset.category;
      if (typeof Analytics !== 'undefined') Analytics.track('filter_used', { category: activeCategory });

      filtersContainer.querySelectorAll('.filter-pill').forEach(p =>
        p.classList.toggle('is-active', p === pill)
      );

      renderProducts();
      grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function setupSearch() {
    if (!searchInput) return;

    let debounceTimer;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        searchTerm = searchInput.value.trim();
        if (searchClear) searchClear.classList.toggle('is-visible', searchTerm.length > 0);
        renderProducts();
      }, 200);
    });

    if (searchClear) {
      searchClear.addEventListener('click', () => {
        searchInput.value = '';
        searchTerm = '';
        searchClear.classList.remove('is-visible');
        searchInput.focus();
        renderProducts();
      });
    }
  }

  // --- Public actions ---

  function addProduct(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (product) {
      Cart.addItem(product);
      if (typeof Analytics !== 'undefined') Analytics.track('add_to_cart', { product_id: product.id, category: product.categoria, price: parseFloat(product.precio) });
      const card = grid.querySelector(`.card--menu[data-id="${productId}"]`);
      if (card) {
        card.style.boxShadow = '0 0 0 2px var(--color-secondary)';
        setTimeout(() => { card.style.boxShadow = ''; }, 300);
      }
      updateCard(productId);
    }
  }

  function changeQty(productId, delta) {
    const currentQty = Cart.getItemQty(productId);
    const newQty = currentQty + delta;
    if (newQty <= 0) {
      Cart.removeItem(productId);
    } else {
      Cart.updateQty(productId, newQty);
    }
    updateCard(productId);
  }

  function updateCard(productId) {
    const card = grid.querySelector(`.card--menu[data-id="${productId}"]`);
    const product = allProducts.find(p => p.id === productId);
    if (!card || !product) {
      renderProducts();
      return;
    }

    const temp = document.createElement('div');
    temp.innerHTML = renderCard(product);
    const newCard = temp.firstElementChild;
    card.replaceWith(newCard);
  }

  function refreshCards() {
    renderProducts();
  }

  // --- Header height → CSS variable (for sticky category headers on mobile) ---
  function updateHeaderHeight() {
    const header = document.querySelector('.header');
    if (!header) return;
    document.documentElement.style.setProperty('--header-height', header.offsetHeight + 'px');
  }
  updateHeaderHeight();
  window.addEventListener('resize', updateHeaderHeight, { passive: true });

  // --- Promos collapse/expand ---
  const promosSection = document.getElementById('promos-section');
  if (promosSection) {
    const toggle = promosSection.querySelector('.menu-category-header--toggle');
    if (toggle) {
      toggle.addEventListener('click', () => {
        const collapsed = promosSection.classList.toggle('is-collapsed');
        toggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
      });
    }
  }

  return { addProduct, changeQty, refreshCards };
})();
