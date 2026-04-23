/**
 * Nelsmari Sous Vide - WhatsApp Message Generator
 * Genera el mensaje de pedido y abre WhatsApp
 */

const WhatsApp = (() => {
  const PHONE = typeof Config !== 'undefined' ? Config.WHATSAPP_PHONE : '593979316659';

  function generateMessage(customerName, items, comboResult) {
    const lines = items.map(item =>
      `• ${item.qty}x ${item.nombre} - ${Cart.formatPrice(item.precio * item.qty)}`
    );

    const parts = [
      `Hola Nelsmari, soy ${customerName}. Quiero hacer el siguiente pedido:`,
      '',
      ...lines,
    ];

    if (comboResult && comboResult.applied.length > 0) {
      parts.push('');
      parts.push('Promos aplicadas:');
      comboResult.applied.forEach(combo => {
        parts.push(`✓ ${combo.nombre} (-${Cart.formatPrice(combo.ahorro)})`);
      });
      parts.push('');
      parts.push(`Subtotal: ${Cart.formatPrice(comboResult.subtotal)}`);
      parts.push(`Descuento: -${Cart.formatPrice(comboResult.descuento)}`);
      parts.push(`Total estimado: ${Cart.formatPrice(comboResult.total)}`);
    } else {
      parts.push('');
      parts.push(`Total estimado: ${Cart.formatPrice(comboResult ? comboResult.total : Cart.getTotal())}`);
    }

    return parts.join('\n');
  }

  function sendOrder(customerName, comboResult) {
    const items = Cart.getItems();
    if (items.length === 0) return;

    if (typeof Analytics !== 'undefined') {
      Analytics.track('whatsapp_click', {
        total: comboResult ? comboResult.total : Cart.getTotal(),
        combos: comboResult ? comboResult.applied.map(function (c) { return c.id; }).join(',') : '',
        item_count: items.reduce(function (s, i) { return s + i.qty; }, 0)
      });
      Analytics.flush();
    }

    const message = generateMessage(customerName, items, comboResult);
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${PHONE}?text=${encoded}`, '_blank');
  }

  return { generateMessage, sendOrder };
})();
