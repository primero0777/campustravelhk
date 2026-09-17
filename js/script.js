(() => {
  "use strict";

  /* ---------- Année dans le footer ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Menu mobile (dropdown) ---------- */
  const navToggle = document.getElementById("navToggle");
  const mainNav = document.getElementById("mainNav");

  if (navToggle && mainNav) {
    const closeNav = () => {
      mainNav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    };

    navToggle.addEventListener("click", (event) => {
      event.stopPropagation();
      const open = mainNav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(open));
    });

    mainNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeNav);
    });

    document.addEventListener("click", (event) => {
      if (mainNav.classList.contains("open") && !mainNav.contains(event.target)) {
        closeNav();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeNav();
    });
  }

  /* ---------- Reveal au scroll ---------- */
  const revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && revealEls.length) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in-view"));
  }

  /* ---------- Compteurs animés (stats "Pourquoi nous") ---------- */
  const statNumbers = document.querySelectorAll(".stat-number");
  if (statNumbers.length && "IntersectionObserver" in window) {
    const duration = 1600;

    const animateCount = (el) => {
      const target = parseInt(el.dataset.target, 10) || 0;
      const suffix = el.dataset.suffix || "";
      const start = performance.now();
      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const statObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            statObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    statNumbers.forEach((el) => statObserver.observe(el));
  }

  /* ---------- Accordéon FAQ ---------- */
  document.querySelectorAll(".acc-item").forEach((item) => {
    const trigger = item.querySelector(".acc-trigger");
    if (!trigger) return;
    trigger.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");

      document.querySelectorAll(".acc-item.open").forEach((openItem) => {
        if (openItem !== item) {
          openItem.classList.remove("open");
          openItem.querySelector(".acc-trigger").setAttribute("aria-expanded", "false");
        }
      });

      item.classList.toggle("open", !isOpen);
      trigger.setAttribute("aria-expanded", String(!isOpen));
    });
  });

  /* ---------- Header : transparent en haut, plein au scroll ----------
     Le logo blanc est une vraie image (assets/logo-white.png), pas un
     filtre CSS : certains navigateurs mobiles peinent à repeindre un
     <img> filtré au premier chargement, ce qui le rendait invisible. */
  const header = document.getElementById("siteHeader");
  const headerLogo = header ? header.querySelector(".brand-mark") : null;

  if (header) {
    const onScroll = () => {
      const scrolled = window.scrollY > 24;
      header.classList.toggle("scrolled", scrolled);
      if (headerLogo) {
        const wantSrc = scrolled ? "assets/logo.png" : "assets/logo-white.png";
        if (!headerLogo.src.endsWith(wantSrc)) headerLogo.src = wantSrc;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Formulaire de contact (mailto de secours) ---------- */
  const form = document.getElementById("contactForm");
  const formNote = document.getElementById("formNote");

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const data = new FormData(form);
      const name = data.get("name");
      const email = data.get("email");
      const phone = data.get("phone");
      const destination = data.get("destination");
      const message = data.get("message");

      const subject = `Demande de renseignements : ${destination}`;
      const body =
        `Nom : ${name}\n` +
        `Email : ${email}\n` +
        `Téléphone : ${phone}\n` +
        `Destination visée : ${destination}\n\n` +
        `Message :\n${message}`;

      const mailtoUrl = `mailto:contact@campustravelhk.com?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`;

      window.location.href = mailtoUrl;

      if (formNote) {
        formNote.textContent =
          "Votre client mail devrait s'ouvrir avec votre demande pré-remplie. Vous pouvez aussi nous écrire directement à contact@campustravelhk.com.";
      }
    });
  }

  /* ---------- Lightbox galerie réseaux sociaux ---------- */
  const socialPosts = Array.from(document.querySelectorAll(".social-post"));
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxClose = document.getElementById("lightboxClose");
  const lightboxPrev = document.getElementById("lightboxPrev");
  const lightboxNext = document.getElementById("lightboxNext");

  if (socialPosts.length && lightbox && lightboxImg) {
    let currentIndex = 0;
    let lastFocused = null;

    const showAt = (index) => {
      currentIndex = (index + socialPosts.length) % socialPosts.length;
      const img = socialPosts[currentIndex].querySelector("img");
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
    };

    const openLightbox = (index) => {
      lastFocused = document.activeElement;
      showAt(index);
      lightbox.hidden = false;
      document.body.style.overflow = "hidden";
      lightboxClose.focus();
    };

    const closeLightbox = () => {
      lightbox.hidden = true;
      document.body.style.overflow = "";
      if (lastFocused) lastFocused.focus();
    };

    socialPosts.forEach((btn, index) => {
      btn.addEventListener("click", () => openLightbox(index));
    });

    lightboxClose.addEventListener("click", closeLightbox);
    lightboxPrev.addEventListener("click", () => showAt(currentIndex - 1));
    lightboxNext.addEventListener("click", () => showAt(currentIndex + 1));

    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) closeLightbox();
    });

    document.addEventListener("keydown", (event) => {
      if (lightbox.hidden) return;
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowLeft") showAt(currentIndex - 1);
      if (event.key === "ArrowRight") showAt(currentIndex + 1);
    });
  }
})();
