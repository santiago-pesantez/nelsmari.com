/**
 * Nelsmari Sous Vide — Home Page
 * Carga platos destacados desde products.csv
 */

(() => {
  const grid = document.getElementById('featured-products');
  if (!grid) return;

  Papa.parse('/products.csv', {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete(results) {
      const featured = results.data.filter(
        p => p.disponible === 'true' && p.destacado === 'true'
      );
      renderFeatured(featured);
    }
  });

  function renderFeatured(products) {
    grid.innerHTML = products.map(product => `
      <a href="/sous-vide/producto/?id=${product.id}" class="card card--featured">
        <div class="card__image">
          <img src="/assets/img/products/${product.imagen_miniatura}"
               alt="${product.nombre}"
               loading="lazy"
               onerror="this.parentElement.classList.add('card__image--placeholder'); this.parentElement.dataset.name='${product.nombre}'">
        </div>
        <div class="card__body">
          <h3 class="card__title">${product.nombre}</h3>
          <p class="card__description">${product.descripcion_corta}</p>
          <span class="card__price">${Cart.formatPrice(parseFloat(product.precio))}</span>
        </div>
      </a>
    `).join('');
  }
})();
