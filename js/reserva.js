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
  function nightsBetween(a, b) {
    if (!a || !b) return 0;
    const start = new Date(a);
    const end = new Date(b);
    const diff = Math.round((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }

  function renderSummary() {
    const room = LG.getRoom(selectHabitacion.value) || LG.ROOMS[0];
    const noches = nightsBetween(inputCheckin.value, inputCheckout.value);
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

  /* ---------- Validación ---------- */
  function setError(field, message) {
    const span = form.querySelector(`.field-error[data-error-for="${field}"]`);
    const input = form.querySelector(`#${field}`);
    if (span) span.textContent = message || "";
    if (input) input.classList.toggle("invalid", Boolean(message));
  }

  function validate() {
    let ok = true;

    const nombre = form.nombre.value.trim();
    if (nombre.length < 3) {
      setError("nombre", "Ingresá tu nombre completo.");
      ok = false;
    } else {
      setError("nombre", "");
    }

    const email = form.email.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("email", "Ingresá un correo electrónico válido.");
      ok = false;
    } else {
      setError("email", "");
    }

    const telefono = form.telefono.value.trim();
    if (telefono.length < 6) {
      setError("telefono", "Ingresá un teléfono de contacto válido.");
      ok = false;
    } else {
      setError("telefono", "");
    }

    if (!form.habitacion.value) {
      setError("habitacion", "Elegí un tipo de habitación.");
      ok = false;
    } else {
      setError("habitacion", "");
    }

    const checkin = inputCheckin.value;
    const checkout = inputCheckout.value;
    if (!checkin) {
      setError("checkin", "Elegí la fecha de entrada.");
      ok = false;
    } else {
      setError("checkin", "");
    }

    if (!checkout) {
      setError("checkout", "Elegí la fecha de salida.");
      ok = false;
    } else if (checkin && nightsBetween(checkin, checkout) <= 0) {
      setError("checkout", "Debe ser posterior a la fecha de entrada.");
      ok = false;
    } else {
      setError("checkout", "");
    }

    const room = LG.getRoom(form.habitacion.value);
    const huespedes = Number(inputHuespedes.value);
    if (!huespedes || huespedes < 1) {
      setError("huespedes", "Ingresá la cantidad de huéspedes.");
      ok = false;
    } else if (room && huespedes > room.capacidad) {
      setError("huespedes", `Esta habitación admite hasta ${room.capacidad} huéspedes.`);
      ok = false;
    } else {
      setError("huespedes", "");
    }

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
    const noches = nightsBetween(inputCheckin.value, inputCheckout.value);

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
