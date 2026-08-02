// =========================================================
// Las Gaviotas — opiniones.js
// Listado de opiniones + formulario para agregar una nueva.
// =========================================================

document.addEventListener("DOMContentLoaded", () => {

  const grid = document.getElementById("opiniones-grid");
  const summary = document.getElementById("opiniones-summary");
  const form = document.getElementById("opinion-form");
  if (!grid || typeof LG === "undefined") return;

  function stars(n) {
    return "★".repeat(n) + "☆".repeat(5 - n);
  }

  function iniciales(nombre) {
    return nombre
      .split(" ")
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() || "")
      .join("");
  }

  function render() {
    const opiniones = LG.getOpiniones();

    const promedio = opiniones.length
      ? (opiniones.reduce((acc, o) => acc + Number(o.calificacion), 0) / opiniones.length)
      : 0;

    summary.innerHTML = `
      <div class="opiniones-avg">
        <strong>${promedio.toFixed(1)}</strong>
        <span class="opiniones-avg-stars">${stars(Math.round(promedio))}</span>
      </div>
      <p>${opiniones.length} opinión${opiniones.length === 1 ? "" : "es"} de huéspedes</p>
    `;

    grid.innerHTML = opiniones
      .map(
        (o) => `
        <article class="opinion-card">
          <div class="opinion-head">
            <div class="opinion-avatar">${iniciales(o.nombre)}</div>
            <div>
              <h3>${o.nombre}</h3>
              <span class="opinion-stars">${stars(Number(o.calificacion))}</span>
            </div>
          </div>
          <p>${o.comentario}</p>
          <span class="opinion-date">${LG.formatFecha(o.creada)}</span>
        </article>
      `
      )
      .join("");
  }

  render();

  if (!form) return;

  function setError(field, message) {
    const span = form.querySelector(`.field-error[data-error-for="${field}"]`);
    const input = form.querySelector(`#${field}`);
    if (span) span.textContent = message || "";
    if (input) input.classList.toggle("invalid", Boolean(message));
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    let ok = true;
    const nombre = form.nombre.value.trim();
    const comentario = form.comentario.value.trim();

    if (nombre.length < 3) {
      setError("op-nombre", "Ingresá tu nombre completo.");
      ok = false;
    } else {
      setError("op-nombre", "");
    }

    if (comentario.length < 10) {
      setError("op-comentario", "Contanos un poco más sobre tu estadía (mín. 10 caracteres).");
      ok = false;
    } else {
      setError("op-comentario", "");
    }

    if (!ok) return;

    LG.saveOpinion({
      nombre,
      calificacion: Number(form.calificacion.value),
      comentario,
    });

    form.reset();
    render();

    const msg = document.getElementById("opinion-form-msg");
    msg.textContent = "¡Gracias por tu opinión! Ya está publicada.";
    setTimeout(() => (msg.textContent = ""), 4000);

    grid.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});
