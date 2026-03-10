/**
 * Nelsmari Sous Vide — Menu Module
 * Carga products.csv con PapaParse y renderiza el catálogo
 */

(() => {
  const grid = document.getElementById('product-grid');
  const filtersContainer = document.getElementById('category-filters');
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

  function renderProducts() {
    if (!grid) return;

    const filtered = activeCategory === 'todas'
      ? allProducts
      : allProducts.filter(p => p.categoria === activeCategory);

    grid.innerHTML = filtered.map(product => `
      <div class="card" data-id="${product.id}">
        <div class="card__image">
          <img src="/assets/img/products/${product.imagen_miniatura}"
               alt="${product.nombre}"
               onerror="this.style.display='none'">
        </div>
        <div class="card__body">
          <h3 class="card__title">${product.nombre}</h3>
          <p class="card__description">${product.descripcion_corta}</p>
          <div class="card__actions">
            <span class="card__price">${Cart.formatPrice(parseFloat(product.precio))}</span>
            <button class="btn btn--primary btn--sm" onclick="addToCart('${product.id}')">
              Agregar
            </button>
          </div>
        </div>
      </div>
    `).join('');
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
    });
  }

  // Global function for onclick
  window.addToCart = function(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (product) {
      Cart.addItem(product);

      // Brief visual feedback
      const btn = document.querySelector(`[data-id="${productId}"] .btn`);
      if (btn) {
        const original = btn.textContent;
        btn.textContent = 'Agregado';
        btn.classList.remove('btn--primary');
        btn.classList.add('btn--accent');
        setTimeout(() => {
          btn.textContent = original;
          btn.classList.remove('btn--accent');
          btn.classList.add('btn--primary');
        }, 800);
      }
    }
  };
})();
