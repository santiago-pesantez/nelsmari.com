/**
 * Nelsmari Sous Vide — Cart Module
 * Maneja el carrito en localStorage
 */

const Cart = (() => {
  const STORAGE_KEY = 'nelsmari_cart';

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

  function getTotal() {
    return getItems().reduce((sum, item) => sum + item.precio * item.qty, 0);
  }

  function getCount() {
    return getItems().reduce((sum, item) => sum + item.qty, 0);
  }

  function clear() {
    localStorage.removeItem(STORAGE_KEY);
    updateUI();
  }

  function formatPrice(amount) {
    return '$' + amount.toFixed(2).replace('.', ',');
  }

  function updateUI() {
    // Update cart float badge if present
    const countEl = document.getElementById('cart-count');
    const totalEl = document.getElementById('cart-total');
    const floatEl = document.getElementById('cart-float');
    const count = getCount();

    if (countEl) countEl.textContent = count;
    if (totalEl) totalEl.textContent = formatPrice(getTotal());
    if (floatEl) {
      floatEl.classList.toggle('has-items', count > 0);
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
    getTotal,
    getCount,
    clear,
    formatPrice
  };
})();
