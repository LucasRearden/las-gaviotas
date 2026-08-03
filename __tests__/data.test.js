/**
 * Tests unitarios sobre las funciones de js/data.js (capa de datos
 * de Las Gaviotas: catálogo de habitaciones, validación de reservas
 * y persistencia en localStorage).
 *
 * Cómo se aplicó Jest en este proyecto:
 * - Se identificaron las funciones "puras" o fácilmente aislables
 *   dentro de js/data.js (no dependen del DOM), y se les agregó
 *   `module.exports` para poder hacer `require()` desde Node.
 * - Cada `describe` agrupa los tests de una función específica.
 * - `beforeEach` limpia `localStorage` antes de cada test que lee o
 *   escribe reservas/opiniones, para que los tests sean
 *   independientes entre sí (no compartan estado).
 * - Se corre con `npm test` (ver package.json), usando el entorno
 *   `jsdom` para tener `localStorage` disponible en Node.
 */

const LG = require("../js/data.js");

describe("LG.getRoom", () => {
  test("devuelve la habitación correcta cuando el id existe", () => {
    const room = LG.getRoom("suite-junior");
    expect(room).not.toBeNull();
    expect(room.nombre).toBe("Suite Junior");
    expect(room.capacidad).toBe(3);
  });

  test("devuelve null cuando el id no existe", () => {
    expect(LG.getRoom("habitacion-inexistente")).toBeNull();
  });
});

describe("LG.formatMoney", () => {
  test("formatea un número con el prefijo US$", () => {
    expect(LG.formatMoney(140)).toBe("US$ 140");
  });

  test("acepta strings numéricos", () => {
    expect(LG.formatMoney("90")).toBe("US$ 90");
  });
});

describe("LG.nightsBetween", () => {
  test("calcula correctamente la cantidad de noches entre dos fechas", () => {
    expect(LG.nightsBetween("2026-08-10", "2026-08-13")).toBe(3);
  });

  test("devuelve 0 si el checkout es igual o anterior al checkin", () => {
    expect(LG.nightsBetween("2026-08-10", "2026-08-10")).toBe(0);
    expect(LG.nightsBetween("2026-08-12", "2026-08-10")).toBe(0);
  });

  test("devuelve 0 si falta alguna de las dos fechas", () => {
    expect(LG.nightsBetween("", "2026-08-10")).toBe(0);
    expect(LG.nightsBetween("2026-08-10", "")).toBe(0);
  });
});

describe("LG.validarDatosReserva", () => {
  const datosValidos = {
    nombre: "María Fernández",
    email: "maria@correo.com",
    telefono: "099123456",
    habitacionId: "standard",
    checkin: "2026-08-10",
    checkout: "2026-08-12",
    huespedes: 2,
  };

  test("no genera errores cuando todos los datos son válidos", () => {
    const resultado = LG.validarDatosReserva(datosValidos);
    expect(resultado.ok).toBe(true);
    expect(Object.keys(resultado.errores)).toHaveLength(0);
    expect(resultado.noches).toBe(2);
  });

  test("detecta un email con formato inválido", () => {
    const resultado = LG.validarDatosReserva({ ...datosValidos, email: "esto-no-es-un-mail" });
    expect(resultado.ok).toBe(false);
    expect(resultado.errores.email).toBeDefined();
  });

  test("detecta que la fecha de salida no puede ser anterior o igual a la de entrada", () => {
    const resultado = LG.validarDatosReserva({
      ...datosValidos,
      checkin: "2026-08-12",
      checkout: "2026-08-10",
    });
    expect(resultado.ok).toBe(false);
    expect(resultado.errores.checkout).toBeDefined();
  });

  test("detecta cuando la cantidad de huéspedes supera la capacidad de la habitación", () => {
    // La habitación "standard" admite hasta 2 huéspedes.
    const resultado = LG.validarDatosReserva({ ...datosValidos, huespedes: 5 });
    expect(resultado.ok).toBe(false);
    expect(resultado.errores.huespedes).toMatch(/hasta 2 huéspedes/);
  });
});

describe("LG.saveReserva / LG.getReservas", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("guarda una nueva reserva con estado inicial 'pendiente' y un código único", () => {
    const reserva = LG.saveReserva({ nombre: "Juan Pérez", roomId: "standard", total: 180 });

    expect(reserva.id).toMatch(/^LG-/);
    expect(reserva.estado).toBe("pendiente");

    const todas = LG.getReservas();
    expect(todas).toHaveLength(1);
    expect(todas[0].nombre).toBe("Juan Pérez");
  });

  test("las reservas nuevas se agregan al principio de la lista", () => {
    LG.saveReserva({ nombre: "Primera" });
    LG.saveReserva({ nombre: "Segunda" });

    const todas = LG.getReservas();
    expect(todas[0].nombre).toBe("Segunda");
    expect(todas[1].nombre).toBe("Primera");
  });
});

describe("LG.updateEstadoReserva", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("actualiza el estado solo de la reserva indicada", () => {
    const r1 = LG.saveReserva({ nombre: "Ana" });
    const r2 = LG.saveReserva({ nombre: "Bruno" });

    LG.updateEstadoReserva(r1.id, "confirmada");

    const todas = LG.getReservas();
    expect(todas.find((r) => r.id === r1.id).estado).toBe("confirmada");
    expect(todas.find((r) => r.id === r2.id).estado).toBe("pendiente");
  });
});

describe("LG.deleteReserva", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("elimina únicamente la reserva con el id indicado", () => {
    const r1 = LG.saveReserva({ nombre: "Carla" });
    LG.saveReserva({ nombre: "Diego" });

    LG.deleteReserva(r1.id);

    const todas = LG.getReservas();
    expect(todas).toHaveLength(1);
    expect(todas[0].nombre).toBe("Diego");
  });
});

describe("LG.getOpiniones / LG.saveOpinion", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("la primera vez que se consulta, devuelve las opiniones semilla", () => {
    const opiniones = LG.getOpiniones();
    expect(opiniones.length).toBeGreaterThan(0);
  });

  test("una nueva opinión se agrega al principio del listado", () => {
    const cantidadInicial = LG.getOpiniones().length;

    LG.saveOpinion({ nombre: "Test Automático", calificacion: 5, comentario: "Excelente atención" });

    const opiniones = LG.getOpiniones();
    expect(opiniones).toHaveLength(cantidadInicial + 1);
    expect(opiniones[0].nombre).toBe("Test Automático");
  });
});
