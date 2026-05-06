//  ORDEN DE CARGA REQUERIDO EN CADA HTML:
//  1. React + ReactDOM (CDN)
//  2. @babel/standalone  (CDN)
//  3. Este archivo       (babel-loader.js)
//  4. loadJSX('./js/tuarchivo.js')
// ============================================================

window.loadJSX = function (src) {
  // Verificar que Babel esté disponible antes de continuar
  if (typeof Babel === "undefined") {
    console.error(
      "[babel-loader] Error: Babel no está disponible.\n" +
        "Asegúrate de cargar @babel/standalone ANTES de babel-loader.js",
    );
    return Promise.reject(new Error("Babel no definido"));
  }

  // Verificar que React esté disponible
  if (typeof React === "undefined") {
    console.error(
      "[babel-loader] Error: React no está disponible.\n" +
        "Asegúrate de cargar React CDN ANTES de babel-loader.js",
    );
    return Promise.reject(new Error("React no definido"));
  }

  return fetch(src)
    .then(function (response) {
      if (!response.ok) {
        throw new Error(
          "[babel-loader] No se pudo cargar: " +
            src +
            " (HTTP " +
            response.status +
            ")",
        );
      }
      return response.text();
    })
    .then(function (code) {
      var resultado = Babel.transform(code, {
        presets: ["react"],
        filename: src,
      }).code;

      var script = document.createElement("script");
      script.text = resultado;
      document.body.appendChild(script);
    })
    .catch(function (err) {
      console.error("[babel-loader] Error al procesar " + src + ":", err);
    });
};
