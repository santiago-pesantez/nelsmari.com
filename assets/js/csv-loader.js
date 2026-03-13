/**
 * Nelsmari Sous Vide — CSV Loader (shared cache)
 * Carga products.csv una sola vez y comparte los datos entre módulos
 */

const CsvLoader = (() => {
  let _promise = null;

  function load() {
    if (_promise) return _promise;
    _promise = new Promise((resolve, reject) => {
      Papa.parse('/products.csv', {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete(results) { resolve(results.data); },
        error(err) { reject(err); }
      });
    });
    return _promise;
  }

  return { load };
})();
