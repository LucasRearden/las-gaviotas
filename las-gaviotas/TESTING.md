# Pruebas unitarias (Jest) — Las Gaviotas

## Cómo se aplicó Jest en este proyecto

El obligatorio exige el proyecto en **HTML5 + CSS3 + JavaScript Vanilla, sin
frameworks ni librerías externas**. Esa restricción aplica al **código que
corre en el navegador**: `index.html`, `reserva.html`, `opiniones.html`,
`admin.html` y todo lo que hay en `js/` siguen siendo JS puro, sin ninguna
dependencia. **Jest se usa únicamente como herramienta de testing**, es decir,
código que corre en la terminal del desarrollador para verificar la lógica,
pero que nunca se envía al navegador ni se referencia desde ningún `<script>`.

Pasos que se siguieron:

1. **Se identificaron las funciones de negocio** dentro de `js/data.js`
   (la capa de datos del sitio): búsqueda de habitaciones, cálculo de noches,
   validación de una reserva, y el CRUD de reservas/opiniones sobre
   `localStorage` (que reemplaza al backend, ya que el obligatorio no permite
   usar uno).
2. **Se les agregó `module.exports = LG;`** al final del archivo, protegido
   por `if (typeof module !== "undefined" ...)`. Esto permite hacer
   `require("../js/data.js")` desde Node/Jest sin romper el uso normal como
   `<script src="js/data.js">` en el navegador (ahí `module` no existe, así
   que esa línea simplemente no hace nada).
3. **Se separó la lógica de la manipulación del DOM.** Antes, la validación
   del formulario de reserva vivía mezclada con el DOM dentro de
   `js/reserva.js`. Se extrajo a una función pura,
   `LG.validarDatosReserva(datos)`, que recibe un objeto plano y devuelve
   `{ ok, errores, noches, room }` sin tocar el DOM. `reserva.js` ahora solo
   llama a esa función y pinta los mensajes de error — así la regla de
   negocio se puede testear de forma aislada.
4. **Se instaló Jest como `devDependency`** (`package.json`), con
   `jest-environment-jsdom` para tener `localStorage` disponible en los
   tests (igual que en un navegador).
5. **Se escribieron los tests** en `__tests__/data.test.js`, agrupados con
   `describe` por función, con `beforeEach(() => localStorage.clear())` en
   los que leen/escriben reservas u opiniones, para que cada test sea
   independiente del resto.

## Cómo correrlos

```bash
npm install   # instala Jest (una sola vez)
npm test      # corre toda la suite
```

## Funciones cubiertas (8 funciones, 16 tests — se pedían mínimo 5)

| Función | Qué se testea |
|---|---|
| `LG.getRoom(id)` | Devuelve la habitación correcta / `null` si no existe |
| `LG.formatMoney(n)` | Formato de moneda `US$ ...` |
| `LG.nightsBetween(checkin, checkout)` | Cálculo de noches, casos borde (fechas invertidas, iguales o faltantes) |
| `LG.validarDatosReserva(datos)` | Caso válido, email inválido, fechas invertidas, huéspedes por encima de la capacidad de la habitación |
| `LG.saveReserva(datos)` / `LG.getReservas()` | Se guarda con estado `"pendiente"` y código único; orden de inserción |
| `LG.updateEstadoReserva(id, estado)` | Actualiza solo la reserva indicada, no afecta a las demás |
| `LG.deleteReserva(id)` | Elimina solo la reserva indicada |
| `LG.getOpiniones()` / `LG.saveOpinion(datos)` | Semilla inicial de opiniones; una nueva opinión se agrega al principio |

## Bug real encontrado y corregido gracias a los tests

Al escribir el test de `updateEstadoReserva` (crear dos reservas seguidas y
cambiar el estado de una sola), el test falló: **ambas reservas terminaban
con el mismo estado**. La causa era que el código de reserva se generaba con
`Date.now().toString(36)`, y si dos reservas se creaban en el mismo
milisegundo (algo común en un test, o si dos huéspedes reservan casi al mismo
tiempo) terminaban con el **mismo id**, y `updateEstadoReserva` actualizaba a
las dos por error. Se corrigió agregando un sufijo aleatorio al id
(`LG-<timestamp><random>`), y el test volvió a pasar. Este es un buen ejemplo
para la reflexión del grupo: los tests unitarios encontraron un bug real
antes de que llegara a producción.
