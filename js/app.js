(function () {
  "use strict";

  const EVENT = {
    title: "XV Mia Orosco",
    description: "Te espero para celebrar mis XV anos.",
    location: "La Terraza",
    start: "20260801T220000Z",
    end: "20260802T030000Z",
  };

  const WHATSAPP_NUMBER = "";
  const PHOTO_LINK = "https://drive.google.com/";

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  document.addEventListener("DOMContentLoaded", () => {
    removeImageTitles();
    applyUrlOptions();
    setupEntrance();
    setupMusicButton();
    setupScrollAnimations();
    setupCountdown();
    setupCalendarButton();
    setupMapModal();
    setupOptionalButtons();
  });

  function removeImageTitles() {
    $$("img[title]").forEach((img) => img.removeAttribute("title"));
  }

  function applyUrlOptions() {
    const params = new URLSearchParams(window.location.search);
    if ((params.get("ocultar") || "").toLowerCase() === "si") {
      document.body.classList.add("ocultar-cuerpo");
    }
  }

  function setupEntrance() {
    const overlay = $("#v2-capa-bloqueo");
    const enterButton = overlay?.querySelector(".v2-boton-entrar a, .v2-boton-entrar [role='button']");
    const audio = $("#v2-musica");
    const musicButton = $("#v2-boton-control");

    if (!overlay || !enterButton) return;

    document.body.style.overflow = "hidden";

    enterButton.addEventListener(
      "click",
      (event) => {
        event.preventDefault();

        const requestFullscreen =
          document.documentElement.requestFullscreen ||
          document.documentElement.webkitRequestFullscreen ||
          document.documentElement.msRequestFullscreen ||
          document.documentElement.mozRequestFullScreen;

        if (requestFullscreen) {
          Promise.resolve(requestFullscreen.call(document.documentElement)).catch(() => {});
        }

        if (audio) {
          audio.play().catch(() => {});
        }

        if (musicButton) {
          musicButton.style.display = "flex";
          window.setTimeout(() => {
            musicButton.style.opacity = "1";
          }, 100);
        }

        overlay.classList.add("v2-abrir");

        window.setTimeout(() => {
          document.body.style.overflow = "auto";
        }, 1000);

        window.setTimeout(() => {
          overlay.style.display = "none";
        }, 1500);
      },
      { once: true }
    );
  }

  function setupMusicButton() {
    const audio = $("#v2-musica");
    const button = $("#v2-boton-control");

    if (!audio || !button) return;

    button.addEventListener("click", (event) => {
      event.stopPropagation();

      if (audio.paused) {
        audio.play().catch(() => {});
        button.classList.remove("paused");
      } else {
        audio.pause();
        button.classList.add("paused");
      }
    });
  }

  function setupScrollAnimations() {
    const animatedElements = $$(".elementor-invisible[data-settings*='animation']");

    const showAnimated = (element) => {
      const settings = element.getAttribute("data-settings") || "";
      const animation = settings.includes("zoomIn") ? "zoomIn" : "fadeIn";
      element.classList.remove("elementor-invisible");
      element.classList.add("animated", animation);
    };

    if ("IntersectionObserver" in window) {
      const animatedObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              showAnimated(entry.target);
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
      );

      animatedElements.forEach((element) => animatedObserver.observe(element));

      const zoomObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            entry.target.classList.toggle("zoom-in", entry.isIntersecting);
            entry.target.classList.toggle("zoom-out", !entry.isIntersecting);
          });
        },
        { threshold: 0.25 }
      );

      $$(".zoom-animar").forEach((element) => zoomObserver.observe(element));
    } else {
      animatedElements.forEach(showAnimated);
      $$(".zoom-animar").forEach((element) => element.classList.add("zoom-in"));
    }
  }

  function setupCountdown() {
    const wrapper = $(".elementor-countdown-wrapper[data-date]");
    if (!wrapper) return;

    const target = Number(wrapper.dataset.date) * 1000;
    const fields = {
      days: $(".elementor-countdown-days", wrapper),
      hours: $(".elementor-countdown-hours", wrapper),
      minutes: $(".elementor-countdown-minutes", wrapper),
      seconds: $(".elementor-countdown-seconds", wrapper),
    };

    const pad = (value) => String(Math.max(0, value)).padStart(2, "0");

    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      const totalSeconds = Math.floor(diff / 1000);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      if (fields.days) fields.days.textContent = pad(days);
      if (fields.hours) fields.hours.textContent = pad(hours);
      if (fields.minutes) fields.minutes.textContent = pad(minutes);
      if (fields.seconds) fields.seconds.textContent = pad(seconds);
    };

    tick();
    window.setInterval(tick, 1000);
  }

  function setupCalendarButton() {
    const buttons = $$(".elementor-button").filter((button) =>
      normalizeText(button.textContent).includes("agendar evento")
    );

    buttons.forEach((button) => {
      button.setAttribute("href", "#");
      button.addEventListener("click", (event) => {
        event.preventDefault();
        window.open(buildGoogleCalendarUrl(), "_blank", "noopener");
      });
    });
  }

  function buildGoogleCalendarUrl() {
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: EVENT.title,
      dates: `${EVENT.start}/${EVENT.end}`,
      details: EVENT.description,
      location: EVENT.location,
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  function downloadCalendarFile() {
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//SAMIELLE STUDIO//Paper Floral XV//ES",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:${EVENT.start}-paper-floral-xv@local`,
      `DTSTAMP:${toUtcStamp(new Date())}`,
      `DTSTART:${EVENT.start}`,
      `DTEND:${EVENT.end}`,
      `SUMMARY:${escapeIcs(EVENT.title)}`,
      `DESCRIPTION:${escapeIcs(EVENT.description)}`,
      `LOCATION:${escapeIcs(EVENT.location)}`,
      "END:VEVENT",
      "END:VCALENDAR",
      "",
    ].join("\r\n");

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "xv-mia-orosco.ics";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function setupMapModal() {
    const modal = createMapModal();
    document.body.appendChild(modal.root);

    $$(".elementor-button").forEach((button) => {
      const text = normalizeText(button.textContent);
      const actionHref = button.getAttribute("href") || "";
      const holder = button.closest("[data-coords]");
      const coords = holder?.getAttribute("data-coords");

      if (!coords) return;

      const opensMap = text.includes("ver ubicacion") || actionHref.includes("popup%3Aopen");
      if (!opensMap) return;

      button.setAttribute("href", "#");
      button.addEventListener("click", (event) => {
        event.preventDefault();
        modal.open(coords);
      });
    });
  }

  function createMapModal() {
    const root = document.createElement("div");
    root.className = "local-map-modal";
    root.hidden = true;
    root.innerHTML = `
      <div class="local-map-modal__dialog" role="dialog" aria-modal="true" aria-label="Ubicación del evento">
        <button class="local-map-modal__close" type="button" aria-label="Cerrar mapa">×</button>
        <iframe class="local-map-modal__frame" loading="lazy" title="Ubicación del evento"></iframe>
      </div>
    `;

    const frame = $(".local-map-modal__frame", root);
    const closeButton = $(".local-map-modal__close", root);

    const close = () => {
      root.hidden = true;
      frame.removeAttribute("src");
      document.removeEventListener("keydown", onKeydown);
    };

    const open = (coords) => {
      frame.src = `https://maps.google.com/maps?q=${encodeURIComponent(coords)}&t=m&z=16&output=embed`;
      root.hidden = false;
      closeButton.focus();
      document.addEventListener("keydown", onKeydown);
    };

    const onKeydown = (event) => {
      if (event.key === "Escape") close();
    };

    closeButton.addEventListener("click", close);
    root.addEventListener("click", (event) => {
      if (event.target === root) close();
    });

    return { root, open, close };
  }

  function setupOptionalButtons() {
    const photoButton = $$(".elementor-button").find((button) =>
      normalizeText(button.textContent).includes("compartir fotos")
    );

    if (photoButton) {
      photoButton.setAttribute("href", "#");
      photoButton.addEventListener("click", (event) => {
        event.preventDefault();
        if (PHOTO_LINK) {
          window.open(PHOTO_LINK, "_blank", "noopener");
        } else {
          showToast("Configura PHOTO_LINK en js/app.js para compartir fotos.");
        }
      });
    }

    const confirmButton = $$(".elementor-button").find((button) =>
      normalizeText(button.textContent).includes("confirmar asistencia")
    );

    if (confirmButton) {
      confirmButton.setAttribute("href", "#");
      confirmButton.addEventListener("click", (event) => {
        event.preventDefault();

        const message = "Hola, confirmo mi asistencia a los XV años de María Fernanda.";
        if (WHATSAPP_NUMBER) {
          window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
        } else {
          showToast("Configura WHATSAPP_NUMBER en js/app.js para confirmar por WhatsApp.");
        }
      });
    }
  }

  function showToast(message) {
    let toast = $(".local-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "local-toast";
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 2800);
  }

  function normalizeText(value) {
    return (value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }

  function escapeIcs(value) {
    return String(value)
      .replace(/\\/g, "\\\\")
      .replace(/\n/g, "\\n")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;");
  }

  function toUtcStamp(date) {
    return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  }
})();
