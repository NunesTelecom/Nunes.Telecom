(() => {
  "use strict";

  const menuToggle = document.querySelector(".menu-toggle");
  const mainNav = document.querySelector("#main-nav");
  const header = document.querySelector(".site-header");
  const year = document.querySelector("#year");
  const desktopQuery = window.matchMedia("(min-width: 901px)");

  const setMenuState = (isOpen, { returnFocus = false } = {}) => {
    if (!menuToggle || !mainNav) return;

    mainNav.classList.toggle("is-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");

    if (returnFocus) menuToggle.focus();
  };

  if (menuToggle && mainNav) {
    const closeMenu = (options) => setMenuState(false, options);

    setMenuState(menuToggle.getAttribute("aria-expanded") === "true");

    menuToggle.addEventListener("click", () => {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      setMenuState(!isOpen);
    });

    mainNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => closeMenu());
    });

    document.addEventListener("click", (event) => {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      if (isOpen && !mainNav.contains(event.target) && !menuToggle.contains(event.target)) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", (event) => {
      const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
      if (event.key === "Escape" && isOpen) {
        closeMenu({ returnFocus: true });
      }
    });

    const handleViewportChange = (event) => {
      if (event.matches) closeMenu();
    };

    if (typeof desktopQuery.addEventListener === "function") {
      desktopQuery.addEventListener("change", handleViewportChange);
    } else if (typeof desktopQuery.addListener === "function") {
      desktopQuery.addListener(handleViewportChange);
    }
  }

  if (header) {
    const updateHeaderState = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 16);
    };

    window.addEventListener("scroll", updateHeaderState, { passive: true });
    updateHeaderState();
  }

  if (year) year.textContent = String(new Date().getFullYear());

  const heroCarousel = document.querySelector("[data-hero-carousel]");
  if (heroCarousel) {
    const slides = [
      { src: "./carrossel-01-cftv.jpg", alt: "Câmera dome de segurança instalada no interior de uma loja" },
      { src: "./carrossel-02-pabx.jpg", alt: "Telefone corporativo VoIP na recepção de um escritório" },
      { src: "./carrossel-03-alarmes.jpg", alt: "Sensor de presença instalado próximo à entrada de uma residência" },
      { src: "./carrossel-04-cerca-eletrica.jpg", alt: "Cerca elétrica instalada no perímetro de um imóvel comercial" },
      { src: "./carrossel-05-motores-portao.jpg", alt: "Motor profissional automatizando um portão de garagem" },
      { src: "./carrossel-06-redes-estruturadas-com-tecnico.jpg", alt: "Técnico da Nunes Telecom instalando cabeamento estruturado em rack" },
      { src: "./carrossel-07-interfonia-acesso.jpg", alt: "Monitor de videoporteiro em hall residencial mostrando a entrada" },
      { src: "./carrossel-08-concertina.jpg", alt: "Concertina de segurança instalada sobre muro de imóvel industrial" },
      { src: "./carrossel-09-manutencao-suporte-com-tecnico.jpg", alt: "Técnico da Nunes Telecom fazendo diagnóstico de equipamentos" }
    ];

    const images = Array.from(heroCarousel.querySelectorAll("[data-hero-slide]"));
    const previousButton = heroCarousel.querySelector("[data-hero-prev]");
    const nextButton = heroCarousel.querySelector("[data-hero-next]");
    const toggleButton = heroCarousel.querySelector("[data-hero-toggle]");
    const pauseIcon = toggleButton?.querySelector("[data-pause-icon]");
    const playIcon = toggleButton?.querySelector("[data-play-icon]");

    if (slides.length > 1 && images.length >= 2 && previousButton && nextButton && toggleButton) {
      let currentIndex = 0;
      let activeImage = images.find((image) => image.classList.contains("is-active")) || images[0];
      let timer = null;
      let userPaused = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let pointerInside = false;
      let focusInside = false;
      let transitionId = 0;

      slides.forEach(({ src }) => {
        const preload = new Image();
        preload.src = src;
      });

      const shouldRotate = () => !userPaused && !pointerInside && !focusInside && !document.hidden;

      const updateToggle = () => {
        const paused = userPaused;
        const label = paused ? "Retomar apresentação automática" : "Pausar apresentação automática";
        toggleButton.setAttribute("aria-label", label);
        toggleButton.setAttribute("title", label);
        toggleButton.setAttribute("aria-pressed", String(paused));
        if (pauseIcon) pauseIcon.hidden = paused;
        if (playIcon) playIcon.hidden = !paused;
      };

      const scheduleRotation = () => {
        window.clearInterval(timer);
        timer = null;
        if (shouldRotate()) timer = window.setInterval(() => showSlide(currentIndex + 1), 5000);
      };

      const showSlide = (requestedIndex) => {
        const targetIndex = (requestedIndex + slides.length) % slides.length;
        if (targetIndex === currentIndex) return;
        const incoming = images.find((image) => image !== activeImage);
        const slide = slides[targetIndex];
        if (!incoming || !slide?.src) return;

        const thisTransition = ++transitionId;
        let activated = false;
        const activate = () => {
          if (activated || thisTransition !== transitionId) return;
          activated = true;
          incoming.classList.add("is-active");
          incoming.removeAttribute("aria-hidden");
          activeImage.classList.remove("is-active");
          activeImage.setAttribute("aria-hidden", "true");
          activeImage.alt = "";
          activeImage = incoming;
          currentIndex = targetIndex;
          scheduleRotation();
        };

        incoming.onload = activate;
        incoming.onerror = () => {};
        incoming.alt = slide.alt || "Imagem de uma solução Nunes Telecom";
        incoming.src = slide.src;
        if (incoming.complete && incoming.naturalWidth) window.requestAnimationFrame(activate);
        scheduleRotation();
      };

      previousButton.addEventListener("click", () => showSlide(currentIndex - 1));
      nextButton.addEventListener("click", () => showSlide(currentIndex + 1));
      toggleButton.addEventListener("click", () => {
        userPaused = !userPaused;
        updateToggle();
        scheduleRotation();
      });
      heroCarousel.addEventListener("pointerenter", () => {
        pointerInside = true;
        scheduleRotation();
      });
      heroCarousel.addEventListener("pointerleave", () => {
        pointerInside = false;
        scheduleRotation();
      });
      heroCarousel.addEventListener("focusin", () => {
        focusInside = true;
        scheduleRotation();
      });
      heroCarousel.addEventListener("focusout", (event) => {
        focusInside = heroCarousel.contains(event.relatedTarget);
        scheduleRotation();
      });
      document.addEventListener("visibilitychange", scheduleRotation);
      updateToggle();
      scheduleRotation();
    }
  }

  document.querySelectorAll(".service-media").forEach((media) => {
    const image = media.querySelector("img");
    if (!image) return;
    const markAsReady = () => media.classList.add("has-image");
    const showFallback = () => {
      image.hidden = true;
      media.classList.add("is-missing");
    };
    image.addEventListener("load", markAsReady, { once: true });
    image.addEventListener("error", showFallback, { once: true });
    if (image.complete) image.naturalWidth ? markAsReady() : showFallback();
  });

  if (mainNav && "IntersectionObserver" in window) {
    const internalLinks = Array.from(mainNav.querySelectorAll('a[href^="#"]'));
    const linksById = new Map();
    const sections = [];

    internalLinks.forEach((link) => {
      const id = link.getAttribute("href").slice(1);
      const target = id ? document.getElementById(id) : null;
      if (target) {
        linksById.set(id, link);
        sections.push(target);
      }
    });

    if (sections.length) {
      const observer = new IntersectionObserver((entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (!visible.length) return;

        const activeId = visible[0].target.id;
        internalLinks.forEach((link) => link.classList.remove("is-active"));
        const activeLink = linksById.get(activeId);
        if (activeLink) activeLink.classList.add("is-active");
      }, {
        rootMargin: "-20% 0px -55%",
        threshold: [0, 0.25, 0.5, 0.75, 1]
      });

      sections.forEach((section) => observer.observe(section));
    }
  }
})();
