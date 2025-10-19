// ==========================
// Script Principal - Asherfb.dev
// ==========================

// Actualiza el año automáticamente en el footer
document.getElementById("year").textContent = new Date().getFullYear();

// Esperar a que el DOM esté cargado para inicializar todo
document.addEventListener("DOMContentLoaded", function () {
  // Configuración del Intersection Observer para animaciones al hacer scroll
  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.1,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, observerOptions);

  // Observar elementos para animaciones de scroll
  document
    .querySelectorAll(
      ".card, .project, .skill-chip, .section-title, .hero-orbit-item, .hero-core"
    )
    .forEach((el) => {
      observer.observe(el);
    });

  // Inicializar funciones principales
  inicializarTema();
  inicializarNavegacion();
  inicializarHero();
  inicializarCanvas();
  inicializarFormulario();
  inicializarDescargaCV();
});

// Inicialización del tema (claro/oscuro) con localStorage y preferencias del sistema
function inicializarTema() {
  const themeToggle = document.getElementById("theme-toggle");
  const body = document.body;
  const currentTheme = localStorage.getItem("theme");

  body.classList.add("js-enabled");

  // Aplicar tema con efecto de transición suave
  function aplicarTema(theme) {
    if (theme === "light") {
      body.classList.add("light");
      body.classList.remove("dark");
      themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
      body.classList.add("dark");
      body.classList.remove("light");
      themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }

    // Clase temporal para transición suave
    body.classList.add("theme-transition");
    setTimeout(() => {
      body.classList.remove("theme-transition");
    }, 300);
  }

  // Tema inicial basado en localStorage o preferencias del sistema
  if (
    currentTheme === "light" ||
    (!currentTheme &&
      window.matchMedia("(prefers-color-scheme: light)").matches)
  ) {
    aplicarTema("light");
  } else {
    aplicarTema("dark");
  }

  // Evento para alternar tema
  themeToggle.addEventListener("click", (event) => {
    const nuevoTema = body.classList.contains("light") ? "dark" : "light";
    aplicarTema(nuevoTema);
    localStorage.setItem("theme", nuevoTema);

    // Efecto ripple en el botón de tema
    const ripple = document.createElement("span");
    ripple.classList.add("ripple");
    const rect = themeToggle.getBoundingClientRect();
    ripple.style.left = `${event.clientX - rect.left}px`;
    ripple.style.top = `${event.clientY - rect.top}px`;
    themeToggle.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  });
}

// Inicialización de la navegación y scroll suave
function inicializarNavegacion() {
  const sections = document.querySelectorAll("section");
  const navLinks = document.querySelectorAll(".nav-link");
  const menuToggle = document.getElementById("menu-toggle");
  const menu = document.getElementById("menu");

  // Función para cerrar menú móvil
  const cerrarMenu = () => {
    if (menu && menu.classList.contains("active")) {
      menu.classList.remove("active");
      document.body.classList.remove("nav-open");
    }
    if (menuToggle) {
      menuToggle.classList.remove("active");
      menuToggle.setAttribute("aria-expanded", "false");
    }
  };

  // Toggle del menú móvil
  if (menuToggle && menu) {
    menuToggle.addEventListener("click", () => {
      const isOpen = menu.classList.toggle("active");
      menuToggle.classList.toggle("active", isOpen);
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      document.body.classList.toggle("nav-open", isOpen);
    });
  }

  // Función para scroll suave a sección
  const scrollToSection = (targetId, smooth = true) => {
    const targetSection = document.getElementById(targetId);
    if (!targetSection) return;
    const navHeight = document.querySelector(".nav")?.offsetHeight || 0;
    const targetOffset =
      targetSection.getBoundingClientRect().top +
      window.scrollY -
      navHeight -
      12;
    window.scrollTo({
      top: targetOffset,
      behavior: smooth ? "smooth" : "auto",
    });
  };

  // Eventos de enlaces de navegación
  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || !href.startsWith("#")) {
        return;
      }
      event.preventDefault();
      const targetId = href.substring(1);
      scrollToSection(targetId);
      history.replaceState(null, "", `#${targetId}`);
      cerrarMenu();
    });
  });

  // Observer para secciones: activa clases y animaciones al entrar en vista
  const visibleSections = new Map();
  const animatedSections = new WeakSet();

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const section = entry.target;
        const id = section.id;
        if (!id) return;

        if (entry.isIntersecting) {
          section.classList.add("in-view");
          visibleSections.set(id, entry.intersectionRatio);
          if (!animatedSections.has(section)) {
            animarElementos(section);
            animatedSections.add(section);
          }
        } else {
          section.classList.remove("in-view");
          visibleSections.delete(id);
        }
      });

      // Actualizar enlace activo en navbar basado en sección más visible
      if (visibleSections.size > 0) {
        const [currentSection] = [...visibleSections.entries()].sort(
          (a, b) => b[1] - a[1]
        )[0];
        navLinks.forEach((link) => {
          const href = link.getAttribute("href");
          if (!href || !href.startsWith("#")) return;
          link.classList.toggle("active", href === `#${currentSection}`);
        });
      }
    },
    {
      threshold: [0.25, 0.45, 0.7],
      rootMargin: "-18% 0px -22% 0px",
    }
  );

  sections.forEach((section) => sectionObserver.observe(section));

  // Manejo de hash en URL para scroll inicial o cambio
  window.addEventListener("hashchange", () => {
    const hash = window.location.hash.substring(1);
    if (hash) {
      scrollToSection(hash);
    } else {
      scrollToSection("inicio");
    }
  });

  const initialHash = window.location.hash.substring(1);
  if (initialHash) {
    setTimeout(() => {
      scrollToSection(initialHash, false);
    }, 120);
  }
}

// Inicialización de interacciones en la sección Hero
function inicializarHero() {
  const heroSection = document.getElementById("inicio");
  if (!heroSection) return;

  // Crear cursor si no existe
  let heroCursor = heroSection.querySelector(".hero-cursor");
  if (!heroCursor) {
    heroCursor = document.createElement("span");
    heroCursor.className = "hero-cursor";
    heroSection.appendChild(heroCursor);
  }

  // Animaciones secuenciales en hero
  const heroCopy = heroSection.querySelector(".hero-copy");
  if (heroCopy) {
    setTimeout(() => {
      heroCopy.classList.add("animating");
    }, 100);
  }

  // Llamar a animarElementos para hero
  const animatedSections = new WeakSet();
  animarElementos(heroSection);
  animatedSections.add(heroSection);

  // Efecto cursor en hero
  const setHeroCursor = (clientX, clientY) => {
    const rect = heroSection.getBoundingClientRect();
    const relativeX = ((clientX - rect.left) / rect.width) * 100;
    const relativeY = ((clientY - rect.top) / rect.height) * 100;
    heroSection.style.setProperty("--cursor-x", `${relativeX}%`);
    heroSection.style.setProperty("--cursor-y", `${relativeY}%`);
    heroCursor.style.opacity = "0.65";
  };

  const resetHeroCursor = () => {
    heroSection.classList.remove("has-pointer");
    heroSection.style.setProperty("--cursor-x", "50%");
    heroSection.style.setProperty("--cursor-y", "48%");
    heroCursor.style.opacity = "0";
  };

  heroSection.addEventListener("mousemove", (event) => {
    setHeroCursor(event.clientX, event.clientY);
    heroSection.classList.add("has-pointer");
  });

  heroSection.addEventListener(
    "touchmove",
    (event) => {
      if (!event.touches.length) return;
      const touch = event.touches[0];
      setHeroCursor(touch.clientX, touch.clientY);
      heroSection.classList.add("has-pointer");
    },
    { passive: true }
  );

  heroSection.addEventListener("mouseleave", resetHeroCursor);
  heroSection.addEventListener("touchend", resetHeroCursor);
  heroSection.addEventListener("touchcancel", resetHeroCursor);

  // Efecto tilt en elemento visual del hero
  const heroVisual = document.querySelector(".hero-visual");
  if (!heroVisual) return;

  const maxTilt = 8;

  const aplicarTilt = (x, y) => {
    heroVisual.style.setProperty("--tilt-x", `${x}deg`);
    heroVisual.style.setProperty("--tilt-y", `${y}deg`);
  };

  const procesarPointer = (clientX, clientY) => {
    const rect = heroVisual.getBoundingClientRect();
    const relativeX = (clientX - rect.left) / rect.width - 0.5;
    const relativeY = (clientY - rect.top) / rect.height - 0.5;
    const tiltX = relativeX * maxTilt;
    const tiltY = relativeY * -maxTilt;
    heroVisual.classList.add("is-tilting");
    aplicarTilt(tiltX, tiltY);
  };

  const resetTilt = () => {
    heroVisual.classList.remove("is-tilting");
    aplicarTilt(0, 0);
  };

  heroVisual.addEventListener("mousemove", (event) => {
    procesarPointer(event.clientX, event.clientY);
  });

  heroVisual.addEventListener("mouseleave", resetTilt);

  heroVisual.addEventListener(
    "touchmove",
    (event) => {
      if (!event.touches[0]) return;
      procesarPointer(event.touches[0].clientX, event.touches[0].clientY);
    },
    { passive: true }
  );

  heroVisual.addEventListener("touchend", resetTilt);
  heroVisual.addEventListener("touchcancel", resetTilt);
}

// Inicialización del formulario de contacto con EmailJS
function inicializarFormulario() {
  const form = document.getElementById("form-contacto");
  const status = document.getElementById("status");
  if (!form || !status) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    const nombre = document.getElementById("nombre").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const mensaje = document.getElementById("mensaje").value.trim();
    const originalText = submitBtn.innerHTML;

    if (!nombre || !correo || !mensaje) {
      status.style.display = "block";
      status.style.color = "#ff8080";
      status.textContent = "❌ Por favor completa todos los campos.";
      return;
    }

    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
    submitBtn.disabled = true;
    status.style.display = "block";
    status.style.color = "#fff";
    status.textContent = "Enviando mensaje...";

    emailjs
      .sendForm("service_33az3nh", "template_9pqlzlr", form)
      .then(() => {
        status.textContent = "✅ ¡Mensaje enviado correctamente!";
        status.style.color = "#a0ffc8";
        form.reset();
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;

        setTimeout(() => {
          status.style.display = "none";
        }, 5000);
      })
      .catch(() => {
        status.textContent = "❌ Ocurrió un error al enviar el mensaje.";
        status.style.color = "#ff8080";
        submitBtn.innerHTML = "Intentar de nuevo";
        submitBtn.disabled = false;
      });
  });
}

// Descarga de CV con feedback mejorado
function inicializarDescargaCV() {
  const btnCV = document.getElementById("btn-cv");
  if (!btnCV) return;

  btnCV.addEventListener("click", (e) => {
    const link = e.currentTarget;
    if (!link.getAttribute("href") || link.getAttribute("href") === "#") {
      e.preventDefault();
      // Alerta moderna si falta el enlace
      const alerta = document.createElement("div");
      alerta.innerHTML = `
        <div style="
          position: fixed;
          top: 20px;
          right: 20px;
          background: #ff6b6b;
          color: white;
          padding: 15px 20px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 1000;
          animation: slideInRight 0.3s ease;
        ">
          <i class="fas fa-exclamation-circle"></i>
          Por favor, agrega el enlace a tu CV en el botón de descarga.
        </div>
      `;
      document.body.appendChild(alerta);

      setTimeout(() => {
        if (alerta.parentNode) {
          alerta.parentNode.removeChild(alerta);
        }
      }, 3000);
    } else {
      // Confirmación de descarga
      const originalText = link.innerHTML;
      link.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Descargando...';
      setTimeout(() => {
        link.innerHTML = originalText;
      }, 2000);
    }
  });
}

// Inicialización del canvas para estrellas y partículas
function inicializarCanvas() {
  const canvas = document.getElementById("stars-canvas");
  const ctx = canvas.getContext("2d");
  let stars = [];
  let particles = [];
  let mouseX = 0;
  let mouseY = 0;
  let isDark = document.body.classList.contains("dark");

  // Redimensionar canvas
  function redimensionarCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  redimensionarCanvas();
  window.addEventListener("resize", redimensionarCanvas);

  // Crear estrellas
  function crearEstrellas() {
    stars = [];
    const starCount = Math.min(
      200,
      Math.floor((window.innerWidth * window.innerHeight) / 1000)
    );
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5 + 0.5,
        speed: Math.random() * 0.5 + 0.1,
        opacity: Math.random(),
        pulseSpeed: Math.random() * 0.02 + 0.005,
        pulseOffset: Math.random() * Math.PI * 2,
      });
    }
  }

  // Animar estrellas con efecto de pulso
  function animarEstrellas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const time = Date.now() * 0.001;

    stars.forEach((star) => {
      // Mover hacia el mouse con efecto mejorado
      const dx = mouseX - star.x;
      const dy = mouseY - star.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 200) {
        star.x += ((dx / dist) * star.speed * (200 - dist)) / 200;
        star.y += ((dy / dist) * star.speed * (200 - dist)) / 200;
      } else {
        star.x += Math.sin(time * 0.5 + star.x * 0.01) * 0.3;
        star.y += Math.cos(time * 0.5 + star.y * 0.01) * 0.3;
      }

      // Wrap around (envolver en bordes)
      if (star.x > canvas.width) star.x = 0;
      if (star.x < 0) star.x = canvas.width;
      if (star.y > canvas.height) star.y = 0;
      if (star.y < 0) star.y = canvas.height;

      // Efecto de pulso
      const pulse =
        Math.sin(time * star.pulseSpeed + star.pulseOffset) * 0.3 + 0.7;
      const currentOpacity = star.opacity * pulse;

      // Dibujar estrella
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius * pulse, 0, Math.PI * 2);
      ctx.fillStyle = isDark
        ? `rgba(255, 255, 255, ${currentOpacity})`
        : `rgba(0, 0, 0, ${currentOpacity})`;
      ctx.fill();
    });
  }

  // Crear partículas en click
  function crearParticulas(x, y) {
    for (let i = 0; i < 20; i++) {
      particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 15,
        vy: (Math.random() - 0.5) * 15,
        life: 1,
        decay: Math.random() * 0.03 + 0.015,
        size: Math.random() * 3 + 1,
        hue: Math.random() * 30 + 200, // Rango azul a púrpura
      });
    }
  }

  // Animar partículas con física
  function animarParticulas() {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      p.vx *= 0.97;
      p.vy *= 0.97;

      // Gravedad
      p.vy += 0.1;

      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 100%, 70%, ${p.life})`;
      ctx.fill();
    }
  }

  // Eventos de mouse y touch
  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  document.addEventListener("click", (e) => {
    crearParticulas(e.clientX, e.clientY);
  });

  // Observer para cambios de tema en canvas
  const body = document.body;
  const observer = new MutationObserver(() => {
    isDark = body.classList.contains("dark");
  });
  observer.observe(body, { attributes: true, attributeFilter: ["class"] });

  // Loop principal de animación
  function animar() {
    animarEstrellas();
    animarParticulas();
    requestAnimationFrame(animar);
  }

  crearEstrellas();
  animar();

  // Estilos CSS dinámicos para ripple
  const rippleStyle = document.createElement("style");
  rippleStyle.textContent = `
    .ripple {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      transform: scale(0);
      animation: ripple 0.6s linear;
      pointer-events: none;
    }

    @keyframes ripple {
      to {
        transform: scale(2.5);
        opacity: 0;
      }
    }

    .theme-transition * {
      transition: all 0.3s ease !important;
    }
  `;
  document.head.appendChild(rippleStyle);
}

// Función auxiliar para animar elementos
function animarElementos(seccion) {
  const cards = seccion.querySelectorAll(".card");
  const skills = seccion.querySelectorAll(".skill-chip");
  const projects = seccion.querySelectorAll(".project");
  const titles = seccion.querySelectorAll("h2, h3, h4");

  cards.forEach((card, index) => {
    setTimeout(() => {
      card.style.animationDelay = "0s";
      card.classList.add("animate");
    }, index * 100);
  });

  skills.forEach((skill, index) => {
    setTimeout(() => {
      skill.style.animationDelay = "0s";
      skill.classList.add("animate");
    }, index * 50);
  });

  projects.forEach((project, index) => {
    setTimeout(() => {
      project.style.animationDelay = "0s";
      project.classList.add("animate");
    }, index * 150);
  });

  titles.forEach((title, index) => {
    setTimeout(() => {
      title.style.opacity = "0";
      title.style.transform = "translateY(20px)";
      title.style.transition = "all 0.6s ease";
      setTimeout(() => {
        title.style.opacity = "1";
        title.style.transform = "translateY(0)";
      }, 50);
    }, index * 100);
  });
}
