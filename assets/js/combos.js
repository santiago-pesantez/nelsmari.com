/**
 * Nelsmari Sous Vide - Combos & Promotions
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
      descripcion: '5 proteínas + 5 carbohidratos + 5 vegetales',
      requires: { proteinas: 5, carbohidratos: 5, vegetales: 5 },
      precio: 24.00,
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
      remaining,
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

  const CAT_LABELS = {
    proteinas: ['proteína', 'proteínas'],
    carbohidratos: ['carbohidrato', 'carbohidratos'],
    vegetales: ['vegetal', 'vegetales']
  };

  function plural(n, cat) {
    const labels = CAT_LABELS[cat];
    return n === 1 ? `${n} ${labels[0]}` : `${n} ${labels[1]}`;
  }

  /**
   * Genera tips dinámicos basados en los items restantes del carrito
   * (después de aplicar combos). Usa el resultado de calculate().
   */
  function getTips(comboResult, cartItems, products) {
    const remaining = comboResult.remaining;
    const totalItems = cartItems.reduce((sum, item) => sum + item.qty, 0);
    const tips = [];

    if (totalItems === 0) return tips;

    // Verificar cada combo: qué le falta al usuario con los items restantes
    for (const combo of COMBO_DEFS) {
      const missing = {};
      let totalMissing = 0;
      let totalHas = 0;

      for (const cat of Object.keys(combo.requires)) {
        const need = combo.requires[cat];
        const has = remaining[cat] || 0;
        if (has < need) {
          missing[cat] = need - has;
          totalMissing += need - has;
        }
        totalHas += Math.min(has, need);
      }

      const ahorro = Cart.formatPrice(combo.precioNormal - combo.precio);

      if (totalHas > 0 && totalMissing > 0 && totalMissing <= 3) {
        // Tiene parte del combo, le falta poco → sugerencia específica
        const parts = Object.entries(missing).map(
          ([cat, n]) => `<strong>${plural(n, cat)}</strong>`
        );
        tips.push(`Agrega ${parts.join(' y ')} para completar un <strong>${combo.nombre}</strong> y ahorrar ${ahorro}`);
      } else if (totalHas === 0 && comboResult.applied.length === 0) {
        // No tiene nada y no tiene combos aplicados → sugerencia genérica
        tips.push(`Arma un <strong>${combo.nombre}</strong> (${combo.descripcion}) y ahorra ${ahorro}`);
      }
    }

    // Promo 4 proteínas → usar items restantes
    const protRemaining = remaining.proteinas || 0;
    const vegRemaining = remaining.vegetales || 0;

    if (protRemaining >= PROMO_4P.requiresProteinas && vegRemaining === 0) {
      // Tiene 4+ proteínas restantes pero no vegetal → decirle que agarre uno gratis
      tips.unshift(`Tienes ${protRemaining} proteínas sin combo. <strong>Agrega 1 vegetal y es gratis!</strong>`);
    } else if (protRemaining >= 1 && protRemaining < PROMO_4P.requiresProteinas) {
      const faltan = PROMO_4P.requiresProteinas - protRemaining;
      tips.push(`Agrega <strong>${plural(faltan, 'proteinas')}</strong> más para ganar <strong>1 vegetal gratis</strong>`);
    }

    return tips;
  }

  return { calculate, getDefinitions, getTips };
})();
