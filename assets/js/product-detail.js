/**
 * Nelsmari Sous Vide — Product Detail Page
 * Lee ?id= de la URL y renderiza el detalle completo del producto
 */

(() => {
  const container = document.getElementById('product-detail');
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');

  if (!productId) {
    showNotFound();
    return;
  }

  CsvLoader.load().then(data => {
    const product = data.find(p => p.id === productId);
    if (!product) {
      showNotFound();
      return;
    }
    render(product);
    document.title = `${product.nombre} — Nelsmari Sous Vide`;
    if (typeof Analytics !== 'undefined') Analytics.track('product_view', { product_id: product.id });
    injectSchema(product);
  });

  function showNotFound() {
    container.innerHTML = `
      <div class="text-center" style="padding: var(--space-3xl) 0;">
        <h2>Producto no encontrado</h2>
        <p style="color: var(--color-text-light);">El producto que buscas no existe o ya no está disponible.</p>
        <a href="/sous-vide/" class="btn btn--primary" style="margin-top: var(--space-lg);">Volver al menú</a>
      </div>
    `;
  }

  function getCategoryLabel(cat) {
    return { proteinas: 'Proteínas', carbohidratos: 'Carbohidratos', vegetales: 'Vegetales' }[cat] || cat;
  }

  function getAllergens(product) {
    const allergens = [];
    if (product.alergeno_mariscos === 'true') allergens.push('Mariscos');
    if (product.alergeno_gluten === 'true') allergens.push('Gluten');
    if (product.alergeno_lacteos === 'true') allergens.push('Lácteos');
    return allergens;
  }

  function render(product) {
    const price = parseFloat(product.precio);
    const allergens = getAllergens(product);
    const qty = Cart.getItemQty(product.id);

    container.innerHTML = `
      <div class="pd-layout">
        <!-- Image -->
        <div class="pd-image">
          <img src="/assets/img/products/${product.imagen_grande}"
               alt="${product.nombre}"
               onerror="this.parentElement.classList.add('pd-image--placeholder'); this.parentElement.dataset.name='${product.nombre}'">
        </div>

        <!-- Info -->
        <div class="pd-info">
          <span class="pd-category">${getCategoryLabel(product.categoria)}</span>
          <h1 class="pd-title">${product.nombre}</h1>
          <p class="pd-price">${Cart.formatPrice(price)}</p>
          <p class="pd-description">${product.descripcion_larga}</p>

          <!-- Allergens -->
          ${allergens.length > 0 ? `
            <div class="pd-allergens">
              <strong>Alérgenos:</strong>
              ${allergens.map(a => `<span class="allergen-badge">${a}</span>`).join(' ')}
            </div>
          ` : `
            <div class="pd-allergens">
              <span class="allergen-badge" style="background: rgba(39,174,96,0.15); color: #27AE60;">Sin alérgenos comunes</span>
            </div>
          `}

          <!-- Add to cart -->
          <div class="pd-actions" id="pd-actions">
            <div class="qty-selector qty-selector--lg">
              <button class="qty-selector__btn" onclick="PD.changeQty(-1)" aria-label="Menos">−</button>
              <span class="qty-selector__value" id="pd-qty">${Math.max(qty, 1)}</span>
              <button class="qty-selector__btn" onclick="PD.changeQty(1)" aria-label="Más">+</button>
            </div>
            <button class="btn btn--primary btn--lg" onclick="PD.addToCart()" id="pd-add-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Agregar al pedido
            </button>
          </div>

          <!-- Quick WhatsApp -->
          <a href="${typeof Config !== 'undefined' ? Config.WHATSAPP_URL : 'https://wa.me/593995052703'}?text=${encodeURIComponent(`Hola Nelsmari, quiero pedir: ${product.nombre} ($${price.toFixed(2)})`)}"
             target="_blank" rel="noopener"
             class="btn btn--whatsapp btn--full pd-whatsapp">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Pedir solo este plato por WhatsApp
          </a>

          <!-- Nutrition -->
          <div class="pd-nutrition">
            <h3>Información nutricional</h3>
            <p class="pd-nutrition__note">Valores aproximados por porción</p>
            <table class="nutrition-table">
              <tbody>
                <tr><th>Calorías</th><td>${product.calorias} kcal</td></tr>
                <tr><th>Proteínas</th><td>${product.proteinas_g} g</td></tr>
                <tr><th>Carbohidratos</th><td>${product.carbohidratos_g} g</td></tr>
                <tr><th>Grasas</th><td>${product.grasas_g} g</td></tr>
              </tbody>
            </table>
          </div>

          <!-- Heating -->
          <div class="pd-heating">
            <h3>Cómo calentar</h3>
            <div class="pd-heating__methods">
              <div class="pd-heating__method">
                <strong>Agua caliente (recomendado)</strong>
                <p>Sumerge la bolsa cerrada en agua hirviendo por 5-8 minutos.</p>
              </div>
              <div class="pd-heating__method">
                <strong>Microondas</strong>
                <p>Abre la bolsa, sirve en un plato y calienta 30-60 segundos.</p>
              </div>
            </div>
            <a href="/sous-vide/como-calentar.html" class="pd-heating__link">Ver guía completa de calentamiento</a>
          </div>
        </div>
      </div>
    `;

    // Store product data for actions
    window._currentProduct = product;
  }

  function injectSchema(product) {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.nombre,
      description: product.descripcion_larga,
      image: 'https://nelsmari.com/assets/img/products/' + product.imagen_grande,
      url: 'https://nelsmari.com/sous-vide/producto/?id=' + product.id,
      brand: { '@type': 'Brand', name: 'Nelsmari Sous Vide' },
      offers: {
        '@type': 'Offer',
        price: parseFloat(product.precio).toFixed(2),
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock'
      },
      nutrition: {
        '@type': 'NutritionInformation',
        calories: product.calorias + ' cal',
        proteinContent: product.proteinas_g + ' g',
        carbohydrateContent: product.carbohidratos_g + ' g',
        fatContent: product.grasas_g + ' g'
      }
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    // Actualizar canonical con el id del producto
    let canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.href = 'https://nelsmari.com/sous-vide/producto/?id=' + product.id;
  }

  // Product detail actions
  let selectedQty = 1;

  window.PD = {
    changeQty(delta) {
      selectedQty = Math.max(1, selectedQty + delta);
      const el = document.getElementById('pd-qty');
      if (el) el.textContent = selectedQty;
    },

    addToCart() {
      const product = window._currentProduct;
      if (!product) return;
      if (typeof Analytics !== 'undefined') Analytics.track('add_to_cart', { product_id: product.id, category: product.categoria, price: parseFloat(product.precio) });

      // Set quantity directly
      const currentQty = Cart.getItemQty(product.id);
      if (currentQty === 0) {
        Cart.addItem(product);
        if (selectedQty > 1) {
          Cart.updateQty(product.id, selectedQty);
        }
      } else {
        Cart.updateQty(product.id, currentQty + selectedQty);
      }

      // Visual feedback
      const btn = document.getElementById('pd-add-btn');
      if (btn) {
        const original = btn.innerHTML;
        btn.innerHTML = '&#10003; Agregado al pedido';
        btn.classList.remove('btn--primary');
        btn.classList.add('btn--accent');
        setTimeout(() => {
          btn.innerHTML = original;
          btn.classList.remove('btn--accent');
          btn.classList.add('btn--primary');
        }, 1200);
      }
    }
  };
})();
