/**
 * Nelsmari Sous Vide — WhatsApp Message Generator
 * Genera el mensaje de pedido y abre WhatsApp
 */

const WhatsApp = (() => {
  const PHONE = '593995052703';

  function generateMessage(customerName, items, total) {
    const lines = items.map(item =>
      `• ${item.qty}x ${item.nombre} — ${Cart.formatPrice(item.precio * item.qty)}`
    );

    return [
      `Hola Nelsmari, soy ${customerName}. Quiero hacer el siguiente pedido:`,
      '',
      ...lines,
      '',
      `Total estimado: ${Cart.formatPrice(total)}`
    ].join('\n');
  }

  function sendOrder(customerName) {
    const items = Cart.getItems();
    if (items.length === 0) return;

    const message = generateMessage(customerName, items, Cart.getTotal());
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${PHONE}?text=${encoded}`, '_blank');
  }

  return { generateMessage, sendOrder };
})();
