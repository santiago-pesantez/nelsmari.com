/**
 * Nelsmari Sous Vide — Cart Module
 * Maneja el carrito en localStorage
 */

const Cart = (() => {
  const STORAGE_KEY = 'nelsmari_cart';
  const listeners = [];

  function getItems() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveItems(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    updateUI();
    listeners.forEach(fn => fn(items));
  }

  function addItem(product) {
    const items = getItems();
    const existing = items.find(item => item.id === product.id);
    if (existing) {
      existing.qty += 1;
    } else {
      items.push({
        id: product.id,
        nombre: product.nombre,
        precio: parseFloat(product.precio),
        qty: 1
      });
    }
    saveItems(items);
  }

  function removeItem(productId) {
    const items = getItems().filter(item => item.id !== productId);
    saveItems(items);
  }

  function updateQty(productId, qty) {
    const items = getItems();
    const item = items.find(i => i.id === productId);
    if (item) {
      item.qty = Math.max(0, qty);
      if (item.qty === 0) {
        saveItems(items.filter(i => i.id !== productId));
      } else {
        saveItems(items);
      }
    }
  }

  function getItemQty(productId) {
    const item = getItems().find(i => i.id === productId);
    return item ? item.qty : 0;
  }

  function getTotal() {
    return getItems().reduce((sum, item) => sum + item.precio * item.qty, 0);
  }

  function getCount() {
    return getItems().reduce((sum, item) => sum + item.qty, 0);
  }

  function clear() {
    localStorage.removeItem(STORAGE_KEY);
    updateUI();
    listeners.forEach(fn => fn([]));
  }

  function formatPrice(amount) {
    return '$' + amount.toFixed(2).replace('.', ',');
  }

  function onChange(fn) {
    listeners.push(fn);
  }

  function updateUI() {
    const count = getCount();
    const total = formatPrice(getTotal());

    // Mobile cart float
    const countEl = document.getElementById('cart-count');
    const totalEl = document.getElementById('cart-total');
    const floatEl = document.getElementById('cart-float');
    if (countEl) countEl.textContent = count;
    if (totalEl) totalEl.innerHTML = total;
    if (floatEl) floatEl.classList.toggle('has-items', count > 0);

    // Desktop sidebar
    const sidebarCount = document.getElementById('sidebar-count');
    const sidebarTotal = document.getElementById('sidebar-total');
    const sidebarItems = document.getElementById('sidebar-items');
    const sidebarFooter = document.getElementById('sidebar-footer');

    if (sidebarCount) sidebarCount.textContent = count;
    if (sidebarTotal) sidebarTotal.textContent = total;

    if (sidebarItems) {
      const items = getItems();
      if (items.length === 0) {
        sidebarItems.innerHTML = '<p class="cart-sidebar__empty">Tu carrito está vacío. Agrega platos desde el menú.</p>';
        if (sidebarFooter) sidebarFooter.style.display = 'none';
      } else {
        sidebarItems.innerHTML = items.map(item => `
          <div class="cart-item" data-id="${item.id}">
            <div class="cart-item__info">
              <span class="cart-item__name">${item.nombre}</span>
              <span class="cart-item__price">${formatPrice(item.precio * item.qty)}</span>
            </div>
            <div class="cart-item__controls">
              <div class="qty-selector">
                <button class="qty-selector__btn" onclick="Cart.updateQty('${item.id}', ${item.qty - 1}); Menu.refreshCards();" aria-label="Menos">−</button>
                <span class="qty-selector__value">${item.qty}</span>
                <button class="qty-selector__btn" onclick="Cart.updateQty('${item.id}', ${item.qty + 1}); Menu.refreshCards();" aria-label="Más">+</button>
              </div>
              <button class="cart-item__remove" onclick="Cart.removeItem('${item.id}'); Menu.refreshCards();" aria-label="Eliminar">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>
        `).join('');
        if (sidebarFooter) sidebarFooter.style.display = 'block';
      }
    }
  }

  // Initialize UI on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateUI);
  } else {
    updateUI();
  }

  return {
    getItems,
    addItem,
    removeItem,
    updateQty,
    getItemQty,
    getTotal,
    getCount,
    clear,
    formatPrice,
    onChange
  };
})();
