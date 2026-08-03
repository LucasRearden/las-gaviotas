// =========================================================
// Las Gaviotas — admin.js
// Panel de Carolina: listar, filtrar, cambiar estado y
// eliminar reservas guardadas en localStorage.
// =========================================================

document.addEventListener("DOMContentLoaded", () => {

  const tbody = document.getElementById("admin-tbody");
  if (!tbody || typeof LG === "undefined") return;

  const statsBox = document.getElementById("admin-stats");
  const emptyMsg = document.getElementById("admin-empty");
  const buscarInput = document.getElementById("admin-buscar");
  const filtroEstado = document.getElementById("admin-filtro-estado");

  const ESTADOS = ["pendiente", "confirmada", "cancelada"];

  function renderStats(reservas) {
    const total = reservas.length;
    const pendientes = reservas.filter((r) => r.estado === "pendiente").length;
    const confirmadas = reservas.filter((r) => r.estado === "confirmada").length;
    const canceladas = reservas.filter((r) => r.estado === "cancelada").length;

    statsBox.innerHTML = `
      <div class="admin-stat">
        <span>${total}</span>
        <small>Total de reservas</small>
      </div>
      <div class="admin-stat admin-stat-pendiente">
        <span>${pendientes}</span>
        <small>Pendientes</small>
      </div>
      <div class="admin-stat admin-stat-confirmada">
        <span>${confirmadas}</span>
        <small>Confirmadas</small>
      </div>
      <div class="admin-stat admin-stat-cancelada">
        <span>${canceladas}</span>
        <small>Canceladas</small>
      </div>
    `;
  }

  function filaHTML(r) {
    return `
      <tr data-id="${r.id}">
        <td><strong>${r.id}</strong></td>
        <td>${r.nombre}</td>
        <td>
          <div class="admin-contacto">
            <span>${r.email}</span>
            <span>${r.telefono}</span>
          </div>
        </td>
        <td>${r.roomNombre}</td>
        <td>${LG.formatFecha(r.checkin)}</td>
        <td>${LG.formatFecha(r.checkout)}</td>
        <td>${r.huespedes}</td>
        <td>${LG.formatMoney(r.total)}</td>
        <td>
          <select class="admin-estado-select estado-${r.estado}" data-id="${r.id}">
            ${ESTADOS.map(
              (e) => `<option value="${e}" ${e === r.estado ? "selected" : ""}>${e[0].toUpperCase()}${e.slice(1)}</option>`
            ).join("")}
          </select>
        </td>
        <td><button class="admin-delete" data-id="${r.id}" title="Eliminar reserva">🗑️</button></td>
      </tr>
    `;
  }

  function render() {
    const todas = LG.getReservas();
    renderStats(todas);

    const texto = (buscarInput.value || "").trim().toLowerCase();
    const estado = filtroEstado.value;

    const filtradas = todas.filter((r) => {
      const coincideTexto =
        !texto ||
        r.nombre.toLowerCase().includes(texto) ||
        r.id.toLowerCase().includes(texto);
      const coincideEstado = estado === "todas" || r.estado === estado;
      return coincideTexto && coincideEstado;
    });

    tbody.innerHTML = filtradas.map(filaHTML).join("");
    emptyMsg.classList.toggle("oculto", todas.length > 0);
    tbody.closest("table").classList.toggle("oculto", todas.length === 0);
  }

  render();

  buscarInput.addEventListener("input", render);
  filtroEstado.addEventListener("change", render);

  tbody.addEventListener("change", (e) => {
    if (e.target.classList.contains("admin-estado-select")) {
      const id = e.target.dataset.id;
      LG.updateEstadoReserva(id, e.target.value);
      render();
    }
  });

  tbody.addEventListener("click", (e) => {
    const btn = e.target.closest(".admin-delete");
    if (!btn) return;
    const id = btn.dataset.id;
    const ok = window.confirm(`¿Eliminar la reserva ${id}? Esta acción no se puede deshacer.`);
    if (ok) {
      LG.deleteReserva(id);
      render();
    }
  });
});
