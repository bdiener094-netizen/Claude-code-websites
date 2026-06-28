/* ===== E'memento — interactions ===== */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Year in footer ---- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Nav background on scroll ---- */
  var nav = document.getElementById("nav");
  function onNav() {
    if (window.scrollY > 40) nav.classList.add("is-scrolled");
    else nav.classList.remove("is-scrolled");
  }
  onNav();

  /* ---- Reveal on scroll ---- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !prefersReduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---- Hero orbit + phrase swap ---- */
  var hero = document.getElementById("hero");
  var dishes = Array.prototype.slice.call(document.querySelectorAll("[data-orbit]"));
  var phrases = Array.prototype.slice.call(document.querySelectorAll(".hero__phrase"));

  // Each dish gets a starting angle (evenly spaced) and a radius factor.
  var baseAngles = [ -90, 30, 150 ];   // degrees, evenly spaced around the circle

  function radius() {
    // orbit radius scales with viewport; smaller on mobile
    var w = window.innerWidth;
    if (w < 600) return Math.min(w, window.innerHeight) * 0.30;
    if (w < 900) return Math.min(w, window.innerHeight) * 0.32;
    return Math.min(window.innerWidth * 0.30, window.innerHeight * 0.40);
  }

  function setPhrase(idx) {
    phrases.forEach(function (p, i) {
      p.classList.toggle("is-active", i === idx);
    });
  }

  var raf = null;
  function renderHero() {
    raf = null;
    var rect = hero.getBoundingClientRect();
    var scrollable = hero.offsetHeight - window.innerHeight;
    // progress 0..1 across the pinned hero
    var progress = scrollable > 0 ? clamp(-rect.top / scrollable, 0, 1) : 0;

    var r = radius();
    var spin = progress * 300;   // total degrees the constellation rotates

    dishes.forEach(function (dish, i) {
      var ang = (baseAngles[i] + spin) * Math.PI / 180;
      var x = Math.cos(ang) * r;
      var y = Math.sin(ang) * r;
      // gentle individual tilt + subtle scale breathing
      var tilt = Math.sin((progress * 2 + i) * Math.PI) * 8;
      var scale = 0.92 + 0.12 * (0.5 + 0.5 * Math.cos(ang));
      dish.style.transform =
        "translate(-50%, -50%) translate(" + x.toFixed(1) + "px, " + y.toFixed(1) + "px) " +
        "rotate(" + tilt.toFixed(1) + "deg) scale(" + scale.toFixed(3) + ")";
    });

    // phrase index by thirds
    var idx = progress < 0.34 ? 0 : (progress < 0.68 ? 1 : 2);
    setPhrase(idx);
  }

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function onScroll() {
    onNav();
    if (prefersReduced) return;
    if (raf === null) raf = requestAnimationFrame(renderHero);
  }

  if (dishes.length) {
    if (prefersReduced) {
      // Static, pleasant resting layout
      var r0 = radius();
      dishes.forEach(function (dish, i) {
        var ang = baseAngles[i] * Math.PI / 180;
        dish.style.transform =
          "translate(-50%, -50%) translate(" + (Math.cos(ang) * r0) + "px, " + (Math.sin(ang) * r0) + "px)";
      });
      setPhrase(0);
    } else {
      renderHero();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", function () {
        if (raf === null) raf = requestAnimationFrame(renderHero);
      });
    }
  } else {
    window.addEventListener("scroll", onNav, { passive: true });
  }

  /* ---- Booking form (front-end confirmation) ---- */
  var form = document.getElementById("bookingForm");
  var note = document.getElementById("bookingNote");
  if (form) {
    // prevent past dates
    var dateInput = form.querySelector('input[name="date"]');
    if (dateInput) {
      var t = new Date();
      var iso = t.getFullYear() + "-" +
        String(t.getMonth() + 1).padStart(2, "0") + "-" +
        String(t.getDate()).padStart(2, "0");
      dateInput.min = iso;
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var data = new FormData(form);
      var name = (data.get("name") || "").toString().trim();
      note.hidden = false;
      note.textContent = "Благодарим Ви, " + name + "! Получихме Вашето запитване и ще се свържем с Вас за потвърждение.";
      form.reset();
      if (dateInput) dateInput.min = dateInput.min; // keep min after reset
    });
  }
})();
