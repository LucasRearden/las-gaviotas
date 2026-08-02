// =========================================================
// Las Gaviotas — data.js
// Capa de datos 100% cliente (localStorage), ya que el
// obligatorio no permite backend ni frameworks.
// =========================================================

const LG = {

  KEYS: {
    RESERVAS: "lg_reservas",
    OPINIONES: "lg_opiniones",
  },

  ROOMS: [
    {
      id: "standard",
      nombre: "Habitación Standard",
      precio: 90,
      capacidad: 2,
      imagen: "img/room-standard.jpg",
      descripcion: "Cómoda y luminosa, ideal para estadías cortas.",
      comodidades: ["Wifi de alta velocidad", "Aire acondicionado", "TV smart", "Baño privado"],
    },
    {
      id: "deluxe",
      nombre: "Habitación Deluxe",
      precio: 140,
      capacidad: 2,
      imagen: "img/room-deluxe.jpg",
      descripcion: "Vista parcial al mar y detalles superiores de confort.",
      comodidades: ["Vista al mar", "Minibar", "Bata y pantuflas", "Cafetera"],
    },
    {
      id: "suite-junior",
      nombre: "Suite Junior",
      precio: 210,
      capacidad: 3,
      imagen: "img/room-suite-junior.jpg",
      descripcion: "Living independiente y balcón privado.",
      comodidades: ["Balcón privado", "Sala de estar", "Bañera de hidromasaje", "Room service prioritario"],
    },
    {
      id: "suite-presidential",
      nombre: "Suite Presidencial",
      precio: 380,
      capacidad: 4,
      imagen: "img/room-suite-presidential.jpg",
      descripcion: "La máxima expresión de lujo de Las Gaviotas.",
      comodidades: ["Vista panorámica 180°", "Mayordomo 24h", "Jacuzzi privado", "Traslado VIP incluido"],
    },
  ],

  getRoom(id) {
    return this.ROOMS.find((r) => r.id === id) || null;
  },

  /* ---------------- Reservas ---------------- */

  getReservas() {
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.RESERVAS)) || [];
    } catch (e) {
      return [];
    }
  },

  saveReserva(data) {
    const reservas = this.getReservas();
    const codigo = "LG-" + Date.now().toString(36).toUpperCase();
    const reserva = {
      id: codigo,
      estado: "pendiente", // pendiente | confirmada | cancelada
      creada: new Date().toISOString(),
      ...data,
    };
    reservas.unshift(reserva);
    localStorage.setItem(this.KEYS.RESERVAS, JSON.stringify(reservas));
    return reserva;
  },

  updateEstadoReserva(id, estado) {
    const reservas = this.getReservas().map((r) =>
      r.id === id ? { ...r, estado } : r
    );
    localStorage.setItem(this.KEYS.RESERVAS, JSON.stringify(reservas));
  },

  deleteReserva(id) {
    const reservas = this.getReservas().filter((r) => r.id !== id);
    localStorage.setItem(this.KEYS.RESERVAS, JSON.stringify(reservas));
  },

  /* ---------------- Opiniones ---------------- */

  SEED_OPINIONES: [
    {
      id: "seed-1",
      nombre: "Martina Suárez",
      calificacion: 5,
      comentario: "La atención fue impecable y la suite superó nuestras expectativas. Volveremos seguro.",
      creada: "2026-05-12T10:00:00.000Z",
    },
    {
      id: "seed-2",
      nombre: "Diego Ferreira",
      calificacion: 4,
      comentario: "Muy buena ubicación y desayuno delicioso. El check-in demoró un poco más de lo esperado.",
      creada: "2026-06-02T10:00:00.000Z",
    },
    {
      id: "seed-3",
      nombre: "Lucía Ramos",
      calificacion: 5,
      comentario: "La piscina infinity y el trato del personal hicieron de nuestra luna de miel algo inolvidable.",
      creada: "2026-06-20T10:00:00.000Z",
    },
  ],

  getOpiniones() {
    let data;
    try {
      data = JSON.parse(localStorage.getItem(this.KEYS.OPINIONES));
    } catch (e) {
      data = null;
    }
    if (!data) {
      data = this.SEED_OPINIONES;
      localStorage.setItem(this.KEYS.OPINIONES, JSON.stringify(data));
    }
    return data;
  },

  saveOpinion(data) {
    const opiniones = this.getOpiniones();
    const opinion = {
      id: "op-" + Date.now().toString(36),
      creada: new Date().toISOString(),
      ...data,
    };
    opiniones.unshift(opinion);
    localStorage.setItem(this.KEYS.OPINIONES, JSON.stringify(opiniones));
    return opinion;
  },

  /* ---------------- Utils ---------------- */

  formatFecha(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString("es-UY", { day: "2-digit", month: "short", year: "numeric" });
  },

  formatMoney(n) {
    return "US$ " + Number(n).toLocaleString("es-UY");
  },
};
