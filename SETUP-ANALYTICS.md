# Configurar Analytics - Nelsmari Sous Vide

El sitio ya tiene integrado un sistema de analytics custom que captura eventos y los envia a una hoja de Google Sheets. Solo falta crear la hoja y conectarla.

---

## Paso 1: Crear la hoja de calculo

1. Ve a [sheets.google.com](https://sheets.google.com) y crea una nueva hoja
2. Nombrala **Nelsmari Analytics**
3. Renombra la primera pestana (tab de abajo) a **Events**
4. En la **fila 1**, escribe estos encabezados, uno por columna desde la A hasta la U:

| A | B | C | D | E | F | G | H | I | J | K |
|---|---|---|---|---|---|---|---|---|---|---|
| timestamp | session_id | event | page | referrer | device | product_id | category | price | combo_type | items |

| L | M | N | O | P | Q | R | S | T | U |
|---|---|---|---|---|---|---|---|---|---|
| tip_text | product | related_tip | total | item_count | combos | message | file | line | error |

> **Tip:** Puedes copiar esta linea y pegarla en la celda A1, luego usar "Datos > Dividir texto en columnas" con separador `|`:
> `timestamp|session_id|event|page|referrer|device|product_id|category|price|combo_type|items|tip_text|product|related_tip|total|item_count|combos|message|file|line|error`

---

## Paso 2: Crear el Apps Script

1. En la hoja de calculo, ve al menu **Extensiones > Apps Script**
2. Se abre un editor de codigo. Borra todo lo que aparece
3. Pega el siguiente codigo:

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Events');
    var events = JSON.parse(e.postData.contents);

    var columns = [
      'timestamp','session_id','event','page','referrer','device',
      'product_id','category','price','combo_type','items','tip_text',
      'product','related_tip','total','item_count','combos',
      'message','file','line','error'
    ];

    events.forEach(function(evt) {
      var row = columns.map(function(col) {
        return evt[col] !== undefined ? String(evt[col]) : '';
      });
      sheet.appendRow(row);
    });

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok', count: events.length }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. Guarda con **Ctrl+S** (o el icono de disquete)

---

## Paso 3: Desplegar como Web App

1. En el editor de Apps Script, haz click en **Implementar > Nueva implementacion** (boton azul arriba a la derecha)
2. En el icono de engranaje, selecciona el tipo **App web**
3. Configura asi:
   - **Descripcion:** `Nelsmari Analytics`
   - **Ejecutar como:** `Yo (tu correo)`
   - **Quien tiene acceso:** `Cualquier persona`
4. Haz click en **Implementar**
5. Google te pedira autorizar el acceso - acepta todos los permisos
6. **Copia la URL** que aparece (tiene este formato):
   ```
   https://script.google.com/macros/s/AKfycbw.../exec
   ```

> **Importante:** Guarda esta URL. Es la conexion entre el sitio web y tu hoja de calculo.

---

## Paso 4: Activar en el sitio

1. Abre el archivo `assets/js/analytics.js`
2. Busca esta linea al inicio (linea 7):
   ```javascript
   const ENDPOINT = '';
   ```
3. Pega la URL dentro de las comillas:
   ```javascript
   const ENDPOINT = 'https://script.google.com/macros/s/AKfycbw.../exec';
   ```
4. Guarda el archivo y publica los cambios (git push)

---

## Paso 5: Verificar que funciona

1. Abre [nelsmari.com](https://nelsmari.com) en tu navegador
2. Navega por algunas paginas, agrega productos al carrito
3. Espera 30 segundos (o cierra la pestana)
4. Abre tu hoja de Google Sheets - deberian aparecer filas nuevas en la pestana "Events"

Si no aparece nada despues de 1 minuto:
- Verifica que la URL en `analytics.js` es correcta
- Verifica que la pestana de la hoja se llama exactamente **Events**
- Verifica que el Apps Script esta desplegado como "Cualquier persona"

---

## Que eventos se capturan

| Evento | Que significa | Datos que registra |
|--------|--------------|-------------------|
| `page_view` | Alguien visito una pagina | pagina, referrer, dispositivo |
| `add_to_cart` | Agrego un producto al carrito | producto, categoria, precio |
| `remove_from_cart` | Elimino un producto del carrito | producto |
| `filter_used` | Uso un filtro en el menu | categoria seleccionada |
| `product_view` | Vio el detalle de un producto | producto |
| `checkout_start` | Entro a la pagina de checkout | total, cantidad de items |
| `combo_applied` | Se aplico un combo/promo | tipo de combo |
| `tip_shown` | Se mostro un tip de promo | texto del tip |
| `whatsapp_click` | Hizo click en "Pedir por WhatsApp" | total, combos, cantidad |
| `js_error` | Ocurrio un error en el sitio | mensaje, archivo, linea |
| `csv_load_fail` | Fallo al cargar el menu | error |

---

## Preguntas de negocio que puedes responder

Con estos datos puedes analizar:

- **Cuantas visitas tiene el sitio por dia** - filtrar por `page_view`
- **Que productos son los mas vistos y agregados** - filtrar por `product_view` y `add_to_cart`
- **Cuantos pedidos se completan por WhatsApp** - filtrar por `whatsapp_click`
- **Tasa de conversion** - comparar `page_view` del menu vs `whatsapp_click`
- **Que promos funcionan mejor** - filtrar por `combo_applied`
- **Desde que dispositivo compran** - columna `device` en `page_view`
- **Carritos abandonados** - `checkout_start` sin `whatsapp_click` en la misma sesion

---

## Notas tecnicas

- Los eventos se acumulan en el navegador y se envian cada **30 segundos** o al cerrar la pestana
- No se usan cookies ni se rastrea informacion personal
- Si el endpoint no esta configurado, el sitio funciona normalmente sin enviar datos
- Google Apps Script tiene un limite de ~20,000 llamadas/dia en su plan gratuito (mas que suficiente)
- Si necesitas actualizar el Apps Script, recuerda crear una **nueva implementacion** para que tome los cambios
