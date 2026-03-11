/**
 * Nelsmari Sous Vide — Checkout Page
 * Renderiza resumen del pedido con combos y genera mensaje WhatsApp
 */

(() => {
  const summaryEl = document.getElementById('checkout-summary');
  if (!summaryEl) return;

  let allProducts = [];
  let comboResult = null;

  // Load products for combo detection
  Papa.parse('/products.csv', {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete(results) {
      allProducts = results.data;
      render();
    }
  });

  function render() {
    const items = Cart.getItems();

    if (items.length === 0) {
      summaryEl.innerHTML = `
        <div class="checkout-empty">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="color: var(--color-text-light); margin-bottom: var(--space-lg);">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          <h2>Tu carrito está vacío</h2>
          <p>Agrega platos desde nuestro menú para armar tu pedido.</p>
          <a href="/sous-vide/" class="btn btn--primary btn--lg">Ver Menú</a>
        </div>
      `;
      return;
    }

    // Calculate combos
    comboResult = Combos.calculate(items, allProducts);

    summaryEl.innerHTML = `
      <!-- Items -->
      <div class="checkout-items">
        ${items.map(item => `
          <div class="checkout-item">
            <div class="checkout-item__image">
              <img src="/assets/img/products/${item.id}-thumb.jpg"
                   alt="${item.nombre}"
                   onerror="this.parentElement.classList.add('card__image--placeholder')">
            </div>
            <div class="checkout-item__info">
              <span class="checkout-item__name">${item.nombre}</span>
              <span class="checkout-item__unit">${Cart.formatPrice(item.precio)} c/u</span>
            </div>
            <div class="checkout-item__controls">
              <div class="qty-selector">
                <button class="qty-selector__btn" onclick="Checkout.changeQty('${item.id}', -1)" aria-label="Menos">−</button>
                <span class="qty-selector__value">${item.qty}</span>
                <button class="qty-selector__btn" onclick="Checkout.changeQty('${item.id}', 1)" aria-label="Más">+</button>
              </div>
            </div>
            <div class="checkout-item__total">
              <strong>${Cart.formatPrice(item.precio * item.qty)}</strong>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Combos aplicados -->
      ${comboResult.applied.length > 0 ? `
        <div class="checkout-combos">
          <h3 class="checkout-combos__title">Promos aplicadas</h3>
          ${comboResult.applied.map(combo => `
            <div class="checkout-combo">
              <div class="checkout-combo__info">
                <span class="checkout-combo__name">${combo.nombre}</span>
                <span class="checkout-combo__desc">${combo.descripcion}</span>
              </div>
              <span class="checkout-combo__savings">-${Cart.formatPrice(combo.ahorro)}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <!-- Tips dinámicos -->
      ${(() => {
        const tips = Combos.getTips(comboResult, items, allProducts);
        if (tips.length === 0) return '';
        const tipIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
        return tips.map(tip => `
          <div class="checkout-tip">
            ${tipIcon}
            <span>${tip}</span>
          </div>
        `).join('');
      })()}

      <!-- Totales -->
      <div class="checkout-totals">
        ${comboResult.descuento > 0 ? `
          <div class="checkout-totals__row">
            <span>Subtotal</span>
            <span>${Cart.formatPrice(comboResult.subtotal)}</span>
          </div>
          <div class="checkout-totals__row checkout-totals__row--discount">
            <span>Descuento promos</span>
            <span>-${Cart.formatPrice(comboResult.descuento)}</span>
          </div>
        ` : ''}
        <div class="checkout-totals__row checkout-totals__row--total">
          <span>Total estimado</span>
          <strong>${Cart.formatPrice(comboResult.total)}</strong>
        </div>
      </div>

      <!-- Datos del cliente -->
      <div class="checkout-form">
        <div class="form-group">
          <label class="form-label" for="customer-name">Tu nombre</label>
          <input type="text" id="customer-name" class="form-input" placeholder="¿Cómo te llamas?" required autocomplete="given-name">
          <p class="checkout-form__hint" id="name-error" style="display: none;">Por favor ingresa tu nombre para continuar.</p>
        </div>
      </div>

      <!-- Acciones -->
      <div class="checkout-actions">
        <button class="btn btn--whatsapp btn--lg btn--full" onclick="Checkout.send()">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Completar pedido por WhatsApp
        </button>
        <a href="/sous-vide/" class="btn btn--secondary btn--full" style="margin-top: var(--space-md);">
          Editar pedido
        </a>
      </div>

      <!-- Info -->
      <div class="checkout-note">
        <p>El pedido se enviará como mensaje a nuestro WhatsApp. Coordinaremos la entrega y el pago directamente contigo.</p>
      </div>
    `;
  }

  // Checkout actions (global)
  window.Checkout = {
    changeQty(productId, delta) {
      const currentQty = Cart.getItemQty(productId);
      const newQty = currentQty + delta;
      if (newQty <= 0) {
        Cart.removeItem(productId);
      } else {
        Cart.updateQty(productId, newQty);
      }
      render();
    },

    send() {
      const nameInput = document.getElementById('customer-name');
      const nameError = document.getElementById('name-error');
      const name = nameInput.value.trim();

      if (!name) {
        nameInput.classList.add('form-input--error');
        nameError.style.display = 'block';
        nameInput.focus();
        return;
      }

      nameInput.classList.remove('form-input--error');
      nameError.style.display = 'none';

      WhatsApp.sendOrder(name, comboResult);
    }
  };
})();
