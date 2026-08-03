// =========================================================
// Las Gaviotas — app.js
// Vanilla JS: menú móvil, revelado al hacer scroll,
// resaltado del link activo del nav.
// =========================================================

document.addEventListener("DOMContentLoaded", () => {

  /* ---------- Habitaciones (home) ---------- */
  const roomsGrid = document.getElementById("rooms-grid");
  if (roomsGrid && typeof LG !== "undefined") {
    roomsGrid.innerHTML = LG.ROOMS.map(
      (room) => `
        <article class="room-card">
          <div class="room-card-img">
            <img src="${room.imagen}" alt="${room.nombre}">
            <span class="room-price">${LG.formatMoney(room.precio)} <small>/ noche</small></span>
          </div>
          <div class="room-card-body">
            <h3>${room.nombre}</h3>
            <p>${room.descripcion}</p>
            <ul class="room-amenities">
              ${room.comodidades.slice(0, 3).map((c) => `<li>${c}</li>`).join("")}
            </ul>
            <div class="room-card-footer">
              <span class="room-capacity">👤 Hasta ${room.capacidad} huéspedes</span>
              <a href="reserva.html?room=${room.id}" class="room-cta">Reservar</a>
            </div>
          </div>
        </article>
      `
    ).join("");
  }

  /* ---------- Menú móvil ---------- */
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.classList.toggle("is-active", isOpen);
    });

    // cerrar el menú al elegir un link (útil en mobile)
    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Header: sombra al hacer scroll ---------- */
  const header = document.querySelector("header");
  const onScroll = () => {
    if (window.scrollY > 10) {
      header.style.boxShadow = "0 6px 20px rgba(22, 33, 62, 0.08)";
    } else {
      header.style.boxShadow = "none";
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Revelado al hacer scroll ---------- */
  const revealTargets = document.querySelectorAll(
    ".heritage-text, .heritage-image, .gallery-grid > div, .service-card, .section-title, .room-card"
  );

  revealTargets.forEach((el, i) => {
    el.classList.add("reveal");
    el.style.transitionDelay = `${Math.min(i % 6, 5) * 60}ms`;
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    revealTargets.forEach((el) => observer.observe(el));
  } else {
    // sin soporte: mostrar todo directamente
    revealTargets.forEach((el) => el.classList.add("in-view"));
  }

  /* ---------- Resaltar link activo según la sección visible ---------- */
  const sections = document.querySelectorAll("main section[id]");
  const navAnchors = document.querySelectorAll(".nav-links a");

  if (sections.length && "IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("id");
            navAnchors.forEach((a) => {
              a.classList.toggle("active", a.getAttribute("href") === `#${id}`);
            });
          }
        });
      },
      { rootMargin: "-40% 0px -50% 0px" }
    );

    sections.forEach((section) => sectionObserver.observe(section));
  }

  /* ---------- Flecha "scroll down" del hero ---------- */
  const scrollDown = document.querySelector(".scroll-down");
  if (scrollDown) {
    scrollDown.addEventListener("click", (e) => {
      const target = document.querySelector(scrollDown.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  }
});
