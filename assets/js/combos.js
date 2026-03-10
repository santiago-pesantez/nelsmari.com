/**
 * Nelsmari Sous Vide — Combos & Promotions
 * Detecta automáticamente combos aplicables al carrito
 */

const Combos = (() => {

  // Precios base por categoría
  const PRICES = {
    proteinas: 3.25,
    carbohidratos: 1.25,
    vegetales: 1.00
  };

  // Definición de combos
  const COMBO_DEFS = [
    {
      id: 'combo-balanceado',
      nombre: 'Combo Balanceado',
      descripcion: '1 proteína + 1 carbohidrato + 1 vegetal',
      requires: { proteinas: 1, carbohidratos: 1, vegetales: 1 },
      precio: 5.00,
      precioNormal: 5.50
    },
    {
      id: 'combo-nelsmari',
      nombre: 'Combo Nelsmari',
      descripcion: '5 proteínas + 5 carbohidratos + 4 vegetales',
      requires: { proteinas: 5, carbohidratos: 5, vegetales: 4 },
      precio: 25.00,
      precioNormal: 27.50
    }
  ];

  // Promo: 4 proteínas → 1 vegetal gratis
  const PROMO_4P = {
    id: 'promo-4-proteinas',
    nombre: 'Promo Lanzamiento',
    descripcion: 'Compra 4 proteínas y recibe 1 vegetal gratis',
    requiresProteinas: 4,
    freeVegetales: 1
  };

  /**
   * Cuenta items por categoría a partir del carrito y la lista de productos
   */
  function countByCategory(cartItems, products) {
    const counts = { proteinas: 0, carbohidratos: 0, vegetales: 0 };
    cartItems.forEach(item => {
      const product = products.find(p => p.id === item.id);
      if (product && counts[product.categoria] !== undefined) {
        counts[product.categoria] += item.qty;
      }
    });
    return counts;
  }

  /**
   * Calcula los combos y promos aplicados al carrito actual.
   * Retorna { combos: [...], subtotal, descuento, total }
   */
  function calculate(cartItems, products) {
    const counts = countByCategory(cartItems, products);
    const remaining = { ...counts };
    const applied = [];
    let totalDescuento = 0;

    // 1. Intentar aplicar Combo Nelsmari primero (es el más grande)
    const comboNelsmari = COMBO_DEFS.find(c => c.id === 'combo-nelsmari');
    while (canApply(remaining, comboNelsmari.requires)) {
      applyCombo(remaining, comboNelsmari.requires);
      const ahorro = comboNelsmari.precioNormal - comboNelsmari.precio;
      totalDescuento += ahorro;
      applied.push({
        ...comboNelsmari,
        ahorro
      });
    }

    // 2. Intentar aplicar Combo Balanceado
    const comboBalanceado = COMBO_DEFS.find(c => c.id === 'combo-balanceado');
    while (canApply(remaining, comboBalanceado.requires)) {
      applyCombo(remaining, comboBalanceado.requires);
      const ahorro = comboBalanceado.precioNormal - comboBalanceado.precio;
      totalDescuento += ahorro;
      applied.push({
        ...comboBalanceado,
        ahorro
      });
    }

    // 3. Promo 4 proteínas → 1 vegetal gratis (sobre los items restantes)
    while (remaining.proteinas >= PROMO_4P.requiresProteinas && remaining.vegetales >= PROMO_4P.freeVegetales) {
      remaining.proteinas -= PROMO_4P.requiresProteinas;
      remaining.vegetales -= PROMO_4P.freeVegetales;
      const ahorro = PRICES.vegetales * PROMO_4P.freeVegetales;
      totalDescuento += ahorro;
      applied.push({
        ...PROMO_4P,
        ahorro
      });
    }

    // Calcular subtotal (precio sin descuentos)
    const subtotal = cartItems.reduce((sum, item) => sum + item.precio * item.qty, 0);

    return {
      applied,
      subtotal,
      descuento: totalDescuento,
      total: subtotal - totalDescuento
    };
  }

  function canApply(remaining, requires) {
    return Object.keys(requires).every(cat => remaining[cat] >= requires[cat]);
  }

  function applyCombo(remaining, requires) {
    Object.keys(requires).forEach(cat => {
      remaining[cat] -= requires[cat];
    });
  }

  /**
   * Retorna las definiciones de combos para mostrar en el menú
   */
  function getDefinitions() {
    return [...COMBO_DEFS, PROMO_4P];
  }

  return { calculate, getDefinitions };
})();
