/**
 * Nelsmari Sous Vide — Menu Module
 * Carga products.csv con PapaParse y renderiza el catálogo con qty selectors
 */

const Menu = (() => {
  const grid = document.getElementById('product-grid');
  const filtersContainer = document.getElementById('category-filters');
  const countEl = document.getElementById('menu-count');
  let allProducts = [];
  let activeCategory = 'todas';

  // Load CSV
  Papa.parse('/products.csv', {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete(results) {
      allProducts = results.data.filter(p => p.disponible === 'true');
      renderProducts();
      setupFilters();
    }
  });

  function getCategoryLabel(cat) {
    const labels = {
      proteinas: 'Proteínas',
      carbohidratos: 'Carbohidratos',
      vegetales: 'Vegetales'
    };
    return labels[cat] || cat;
  }

  function renderProducts() {
    if (!grid) return;

    const filtered = activeCategory === 'todas'
      ? allProducts
      : allProducts.filter(p => p.categoria === activeCategory);

    // Update count
    if (countEl) {
      countEl.textContent = `${filtered.length} plato${filtered.length !== 1 ? 's' : ''} disponible${filtered.length !== 1 ? 's' : ''}`;
    }

    // Group by category if showing all
    if (activeCategory === 'todas') {
      const groups = {};
      filtered.forEach(p => {
        if (!groups[p.categoria]) groups[p.categoria] = [];
        groups[p.categoria].push(p);
      });

      const order = ['proteinas', 'carbohidratos', 'vegetales'];
      grid.innerHTML = order
        .filter(cat => groups[cat])
        .map(cat => `
          <div class="menu-category-header" style="grid-column: 1 / -1;">
            <h2 class="menu-category-title">${getCategoryLabel(cat)}</h2>
          </div>
          ${groups[cat].map(p => renderCard(p)).join('')}
        `).join('');
    } else {
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

  function setupFilters() {
    if (!filtersContainer) return;

    filtersContainer.addEventListener('click', (e) => {
      const pill = e.target.closest('.filter-pill');
      if (!pill) return;

      activeCategory = pill.dataset.category;

      filtersContainer.querySelectorAll('.filter-pill').forEach(p =>
        p.classList.toggle('is-active', p === pill)
      );

      renderProducts();

      // Scroll to grid
      grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function addProduct(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (product) {
      Cart.addItem(product);
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

  /**
   * Actualiza solo la card del producto afectado sin re-renderizar todo el grid.
   * Esto evita el salto de scroll en mobile.
   */
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

  return { addProduct, changeQty, refreshCards };
})();
