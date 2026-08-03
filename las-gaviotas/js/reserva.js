// =========================================================
// Las Gaviotas — reserva.js
// Formulario de reserva: resumen en vivo, validaciones y
// confirmación visual (guarda en localStorage vía data.js).
// =========================================================

document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("reserva-form");
  if (!form) return;

  const selectHabitacion = document.getElementById("habitacion");
  const inputCheckin = document.getElementById("checkin");
  const inputCheckout = document.getElementById("checkout");
  const inputHuespedes = document.getElementById("huespedes");
  const summaryBox = document.getElementById("reserva-summary");

  const params = new URLSearchParams(window.location.search);
  const roomFromQuery = params.get("room");

  /* ---------- Setear fecha mínima = hoy ---------- */
  const today = new Date().toISOString().split("T")[0];
  inputCheckin.min = today;
  inputCheckout.min = today;

  /* ---------- Poblar select de habitaciones ---------- */
  selectHabitacion.innerHTML = LG.ROOMS.map(
    (r) => `<option value="${r.id}">${r.nombre} — ${LG.formatMoney(r.precio)}/noche</option>`
  ).join("");

  if (roomFromQuery && LG.getRoom(roomFromQuery)) {
    selectHabitacion.value = roomFromQuery;
  }

  /* ---------- Resumen en vivo ---------- */
  function renderSummary() {
    const room = LG.getRoom(selectHabitacion.value) || LG.ROOMS[0];
    const noches = LG.nightsBetween(inputCheckin.value, inputCheckout.value);
    const total = noches * room.precio;

    summaryBox.innerHTML = `
      <div class="summary-room">
        <img src="${room.imagen}" alt="${room.nombre}">
        <div>
          <h3>${room.nombre}</h3>
          <p>${room.descripcion}</p>
        </div>
      </div>
      <ul class="summary-amenities">
        ${room.comodidades.map((c) => `<li>${c}</li>`).join("")}
      </ul>
      <div class="summary-line">
        <span>Precio por noche</span>
        <strong>${LG.formatMoney(room.precio)}</strong>
      </div>
      <div class="summary-line">
        <span>Noches seleccionadas</span>
        <strong>${noches || "—"}</strong>
      </div>
      <div class="summary-line summary-total">
        <span>Total estimado</span>
        <strong>${noches ? LG.formatMoney(total) : "—"}</strong>
      </div>
    `;
  }

  [selectHabitacion, inputCheckin, inputCheckout].forEach((el) =>
    el.addEventListener("change", renderSummary)
  );
  renderSummary();

  /* ---------- Validación ----------
     La lógica de validación vive en LG.validarDatosReserva (js/data.js),
     que es una función pura y está cubierta por tests de Jest.
     Acá solo mapeamos el resultado a mensajes de error en el DOM. */
  function setError(field, message) {
    const span = form.querySelector(`.field-error[data-error-for="${field}"]`);
    const input = form.querySelector(`#${field}`);
    if (span) span.textContent = message || "";
    if (input) input.classList.toggle("invalid", Boolean(message));
  }

  function validate() {
    const { ok, errores } = LG.validarDatosReserva({
      nombre: form.nombre.value,
      email: form.email.value,
      telefono: form.telefono.value,
      habitacionId: form.habitacion.value,
      checkin: inputCheckin.value,
      checkout: inputCheckout.value,
      huespedes: inputHuespedes.value,
    });

    ["nombre", "email", "telefono", "habitacion", "checkin", "checkout", "huespedes"].forEach(
      (campo) => setError(campo, errores[campo] || "")
    );

    return ok;
  }

  /* ---------- Envío ---------- */
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validate()) {
      form.querySelector(".invalid")?.focus();
      return;
    }

    const room = LG.getRoom(form.habitacion.value);
    const noches = LG.nightsBetween(inputCheckin.value, inputCheckout.value);

    const reserva = LG.saveReserva({
      nombre: form.nombre.value.trim(),
      email: form.email.value.trim(),
      telefono: form.telefono.value.trim(),
      roomId: room.id,
      roomNombre: room.nombre,
      checkin: inputCheckin.value,
      checkout: inputCheckout.value,
      noches,
      huespedes: Number(inputHuespedes.value),
      comentarios: form.comentarios.value.trim(),
      precioNoche: room.precio,
      total: noches * room.precio,
    });

    mostrarConfirmacion(reserva, room);
  });

  function mostrarConfirmacion(reserva, room) {
    document.querySelector(".page-hero").classList.add("oculto");
    document.querySelector(".reserva-section").classList.add("oculto");

    const confirmacion = document.getElementById("confirmacion");
    const detalle = document.getElementById("confirmacion-detalle");

    detalle.innerHTML = `
      <div class="confirmacion-row"><span>Código de reserva</span><strong>${reserva.id}</strong></div>
      <div class="confirmacion-row"><span>Huésped</span><strong>${reserva.nombre}</strong></div>
      <div class="confirmacion-row"><span>Habitación</span><strong>${room.nombre}</strong></div>
      <div class="confirmacion-row"><span>Check-in</span><strong>${LG.formatFecha(reserva.checkin)}</strong></div>
      <div class="confirmacion-row"><span>Check-out</span><strong>${LG.formatFecha(reserva.checkout)}</strong></div>
      <div class="confirmacion-row"><span>Huéspedes</span><strong>${reserva.huespedes}</strong></div>
      <div class="confirmacion-row confirmacion-total"><span>Total estimado</span><strong>${LG.formatMoney(reserva.total)}</strong></div>
    `;

    confirmacion.classList.remove("oculto");
    confirmacion.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  document.getElementById("nueva-reserva")?.addEventListener("click", (e) => {
    e.preventDefault();
    form.reset();
    document.getElementById("confirmacion").classList.add("oculto");
    document.querySelector(".page-hero").classList.remove("oculto");
    document.querySelector(".reserva-section").classList.remove("oculto");
    renderSummary();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});
