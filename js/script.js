(() => {
  "use strict";

  /* ---------- Année dans le footer ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Avions décoratifs : trajectoires courbes (SVG Path + rAF) ----------
     Chaque avion vole d'un point hors-champ à un autre (les côtés ou les coins
     bas de .hero-bg, qui joue le rôle de "viewport" local grâce à son
     overflow:hidden ; jamais le bord du haut ni les coins hauts, voir MIN_Y
     plus bas) en suivant une courbe de Bézier cubique, parfois avec une
     boucle complète insérée en cours de route. La position ET la rotation sont
     recalculées à chaque frame via un seul transform (translate3d + rotate),
     piloté par une unique boucle requestAnimationFrame partagée par tous les
     avions (pas une par avion). Le chemin lui-même n'est qu'un <path> SVG créé
     en mémoire (jamais inséré dans le DOM) : getPointAtLength()/getTotalLength()
     fonctionnent très bien sur un path détaché, donc rien à cacher visuellement.
     On garde la règle "au moins 5 trajectoires différentes de suite" de
     l'ancien système, adaptée aux nouvelles combinaisons entrée/sortie/boucle. */
  const planeIcons = document.querySelectorAll(".plane-icon");
  if (planeIcons.length) {
    // Pas de "N", "NE", "NW" : l'avion ne doit jamais entrer/sortir par le
    // haut ni les coins hauts, seulement les côtés et le bas.
    const ZONES = ["S", "E", "W", "SE", "SW"];
    const CIRCLE_K = 0.5522847498; // cubic-bezier quarter-circle constant
    const MIN_Y = 6; // marge de sécurité sous le bord haut, en px
    const TRAIL_DOTS = 9; // 7 à 10 pointillés visibles derrière l'avion
    const TRAIL_SPACING = 14; // écart en px le long du chemin entre deux pointillés
    const TRAIL_MAX_OPACITY = 0.55;
    // Le point d'ancrage de l'avion (translate3d) tombe vers le centre du
    // glyphe ✈, pas sur sa queue : on recule le premier pointillé de cette
    // distance pour qu'il parte bien de derrière l'avion, pas de son aile.
    const TRAIL_TAIL_OFFSET = 16;

    const sub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y });
    const add = (a, b) => ({ x: a.x + b.x, y: a.y + b.y });
    const scale = (a, s) => ({ x: a.x * s, y: a.y * s });
    const len = (a) => Math.hypot(a.x, a.y);
    const norm = (a) => { const l = len(a) || 1; return { x: a.x / l, y: a.y / l }; };
    const perp = (a) => ({ x: -a.y, y: a.x });
    // Une courbe de Bézier cubique reste toujours dans l'enveloppe convexe de
    // ses 4 points : si on force chacun d'eux à rester sous MIN_Y, la courbe
    // entière ne peut mathématiquement jamais remonter au-dessus.
    const clampY = (p) => (p.y < MIN_Y ? { x: p.x, y: MIN_Y } : p);

    // A point well outside the .hero-bg box, from one of the allowed zones
    // (jamais en haut : uniquement les côtés et le bas).
    const zonePoint = (zone, w, h) => {
      const margin = Math.max(120, Math.max(w, h) * 0.22);
      const rx = () => Math.random() * w;
      const ry = () => Math.random() * h;
      switch (zone) {
        case "S": return { x: rx(), y: h + margin };
        case "E": return { x: w + margin, y: ry() };
        case "W": return { x: -margin, y: ry() };
        case "SE": return { x: w + margin, y: h + margin };
        default: return { x: -margin, y: h + margin }; // SW
      }
    };

    // De Casteljau point + tangent direction at t on a cubic Bezier, used to
    // find where to splice a loop into the base curve.
    const cubicPointAndTangent = (p0, p1, p2, p3, t) => {
      const a = { x: p0.x + (p1.x - p0.x) * t, y: p0.y + (p1.y - p0.y) * t };
      const b = { x: p1.x + (p2.x - p1.x) * t, y: p1.y + (p2.y - p1.y) * t };
      const c = { x: p2.x + (p3.x - p2.x) * t, y: p2.y + (p3.y - p2.y) * t };
      const d = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
      const e = { x: b.x + (c.x - b.x) * t, y: b.y + (c.y - b.y) * t };
      const point = { x: d.x + (e.x - d.x) * t, y: d.y + (e.y - d.y) * t };
      const tangent = norm(sub(e, d));
      return { point, tangent };
    };

    // A full 360° loop (4 quarter-arc cubic segments) tangent to `dir` at its
    // own start/end point, so it splices into the flight path with no kink.
    // Chaque point est aussi bridé sous MIN_Y au cas où la boucle se formerait
    // trop près du bord haut.
    const loopSegments = (center, r, dir, clockwise) => {
      const startAngle = Math.atan2(-dir.y, -dir.x) + (clockwise ? Math.PI / 2 : -Math.PI / 2);
      const sweep = clockwise ? Math.PI / 2 : -Math.PI / 2;
      // Les 5 points du cercle (retour au point de départ inclus) sont
      // calculés puis bridés une seule fois chacun, pour que deux segments
      // consécutifs partagent exactement le même point de jonction (sinon un
      // bridage appliqué différemment des deux côtés créerait un petit saut).
      const corners = [];
      for (let i = 0; i <= 4; i++) {
        const a = startAngle + sweep * i;
        corners.push({ a, p: clampY({ x: center.x + r * Math.cos(a), y: center.y + r * Math.sin(a) }) });
      }
      let segs = "";
      for (let i = 0; i < 4; i++) {
        const { a: a0, p: p0 } = corners[i];
        const { a: a1, p: p3 } = corners[i + 1];
        const t0 = { x: -Math.sin(a0), y: Math.cos(a0) };
        const t1 = { x: -Math.sin(a1), y: Math.cos(a1) };
        const k = r * CIRCLE_K * (clockwise ? 1 : -1);
        const c1 = clampY(add(p0, scale(t0, k)));
        const c2 = clampY(sub(p3, scale(t1, k)));
        segs += ` C ${c1.x},${c1.y} ${c2.x},${c2.y} ${p3.x},${p3.y}`;
      }
      return segs;
    };

    // Builds one full "d" attribute: start -> (optional loop) -> end, as a
    // smooth chain of cubic Beziers with a genuine direction change midway.
    const buildPathD = (start, end, w, h) => {
      const d = sub(end, start);
      const dist = len(d) || 1;
      const dir = norm(d);
      const side = perp(dir);
      const bow1 = (0.14 + Math.random() * 0.22) * dist * (Math.random() < 0.5 ? 1 : -1);
      const bow2 = (0.14 + Math.random() * 0.22) * dist * (Math.random() < 0.5 ? 1 : -1);
      const cp1 = clampY(add(add(start, scale(dir, dist * 0.33)), scale(side, bow1)));
      const cp2 = clampY(add(add(start, scale(dir, dist * 0.66)), scale(side, bow2)));

      if (Math.random() < 0.35) {
        const { point: mid, tangent } = cubicPointAndTangent(start, cp1, cp2, end, 0.45 + Math.random() * 0.1);
        const r = Math.min(90, Math.max(28, dist * 0.09));
        const loopSide = perp(tangent);
        const clockwise = Math.random() < 0.5;
        const center = add(mid, scale(loopSide, r * (clockwise ? 1 : -1)));
        const loop = loopSegments(center, r, tangent, clockwise);
        const remainderStart = add(mid, scale(tangent, 1));
        const remDir = norm(sub(end, remainderStart));
        const remDist = len(sub(end, remainderStart)) || 1;
        const remSide = perp(remDir);
        const bow3 = (0.12 + Math.random() * 0.2) * remDist * (Math.random() < 0.5 ? 1 : -1);
        const cp3 = clampY(add(add(remainderStart, scale(remDir, remDist * 0.4)), scale(remSide, bow3)));
        const cp4 = clampY(add(add(remainderStart, scale(remDir, remDist * 0.75)), scale(remSide, bow3 * 0.4)));
        return `M ${start.x},${start.y} C ${cp1.x},${cp1.y} ${cp2.x},${cp2.y} ${mid.x},${mid.y}` +
          loop +
          ` C ${cp3.x},${cp3.y} ${cp4.x},${cp4.y} ${end.x},${end.y}`;
      }

      return `M ${start.x},${start.y} C ${cp1.x},${cp1.y} ${cp2.x},${cp2.y} ${end.x},${end.y}`;
    };

    const scratchPath = document.createElementNS("http://www.w3.org/2000/svg", "path");

    const states = Array.from(planeIcons).map((el) => {
      const container = el.closest(".hero-bg") || el.parentElement;
      // Les pointillés de la traînée sont insérés juste avant l'avion dans le
      // DOM : même contexte d'empilement, mais peints avant lui, donc l'avion
      // reste visuellement au-dessus de sa propre traînée.
      const trailDots = [];
      for (let i = 0; i < TRAIL_DOTS; i++) {
        const dot = document.createElement("span");
        dot.className = "plane-trail-dot";
        dot.style.opacity = "0";
        container.insertBefore(dot, el);
        trailDots.push(dot);
      }
      return { el, container, trailDots, history: [], pathD: "", totalLength: 0, duration: 0, startTime: 0 };
    });

    const newTrajectory = (state, now) => {
      const rect = state.container.getBoundingClientRect();
      const w = rect.width, h = rect.height;

      let zoneA, zoneB, signature;
      for (let attempt = 0; attempt < 20; attempt++) {
        zoneA = ZONES[(Math.random() * ZONES.length) | 0];
        zoneB = ZONES[(Math.random() * ZONES.length) | 0];
        signature = `${zoneA}-${zoneB}`;
        if (!state.history.includes(signature)) break;
      }
      state.history.push(signature);
      if (state.history.length > 4) state.history.shift();

      if (zoneB === zoneA) {
        zoneB = ZONES[(ZONES.indexOf(zoneA) + 1 + ((Math.random() * (ZONES.length - 1)) | 0)) % ZONES.length];
      }

      const start = zonePoint(zoneA, w, h);
      const end = zonePoint(zoneB, w, h);
      state.pathD = buildPathD(start, end, w, h);

      scratchPath.setAttribute("d", state.pathD);
      state.totalLength = scratchPath.getTotalLength();

      const speed = 55 + Math.random() * 45; // px/s, keeps loops from feeling rushed
      state.duration = Math.min(26, Math.max(11, state.totalLength / speed));
      state.startTime = now;

      // Reusable per-state path element for getPointAtLength during the flight.
      if (!state.pathEl) state.pathEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
      state.pathEl.setAttribute("d", state.pathD);
    };

    states.forEach((state) => newTrajectory(state, performance.now()));

    const lastAngle = new Map();
    const tick = (now) => {
      for (const state of states) {
        let t = (now - state.startTime) / (state.duration * 1000);
        if (t >= 1) {
          newTrajectory(state, now);
          t = 0;
        }
        const distance = t * state.totalLength;
        const p1 = state.pathEl.getPointAtLength(distance);
        const p2 = state.pathEl.getPointAtLength(Math.min(state.totalLength, distance + 1));
        let angle = lastAngle.get(state) || 0;
        if (p2.x !== p1.x || p2.y !== p1.y) {
          angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI);
          lastAngle.set(state, angle);
        }
        state.el.style.transform = `translate3d(${p1.x}px, ${p1.y}px, 0) rotate(${angle}deg)`;

        // Traînée : ~9 pointillés qui suivent l'avion en s'estompant vers
        // l'arrière, jamais toute la trajectoire affichée d'un coup.
        for (let i = 0; i < state.trailDots.length; i++) {
          const dot = state.trailDots[i];
          const dotDistance = distance - TRAIL_TAIL_OFFSET - i * TRAIL_SPACING;
          if (dotDistance <= 0) {
            dot.style.opacity = "0";
            continue;
          }
          const dp = state.pathEl.getPointAtLength(dotDistance);
          dot.style.opacity = String(TRAIL_MAX_OPACITY * (1 - i / state.trailDots.length));
          dot.style.transform = `translate3d(${dp.x}px, ${dp.y}px, 0)`;
        }
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

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
