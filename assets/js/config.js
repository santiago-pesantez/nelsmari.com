/**
 * Nelsmari Sous Vide — Configuración central del negocio
 * Todas las constantes del negocio en un solo lugar.
 */

const Config = (() => {
  const WHATSAPP_PHONE = '593979316659';
  const WHATSAPP_URL = 'https://wa.me/' + WHATSAPP_PHONE;
  const MIN_ORDER = 10.00;
  const BUSINESS_NAME = 'Nelsmari';

  return {
    WHATSAPP_PHONE,
    WHATSAPP_URL,
    MIN_ORDER,
    BUSINESS_NAME
  };
})();
