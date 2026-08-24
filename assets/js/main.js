/* ==========================================================================
   The Sapling Co. — site behaviour
   Header/footer, theming, EN/BN language, mobile nav, hero carousel,
   mailto forms, care-guide filtering, map facade, preloader, scroll reveals.
   ========================================================================== */
(function () {
  "use strict";

  var I18N = window.SaplingI18n;
  function t(k) { return I18N ? I18N.t(k) : ""; }

  /* ---------- Business config ------------------------------------------- */
  var BIZ = {
    name: "The Sapling Co.",
    phoneDisplay: "+91 89022 62452",
    phoneTel: "+918902262452",
    email: "thesaplingco@gmail.com",
    whatsapp: "https://wa.me/918902262452",
    instagram: "https://instagram.com/thesaplingco",
    maps: "https://maps.app.goo.gl/GqNG1w4HRkcFBBSw9"
  };

  var NAV = [
    { key: "home", i: "nav_home", href: "/" },
    { key: "shop", i: "nav_shop", href: "/shop.html" },
    { key: "about", i: "nav_about", href: "/about.html" },
    { key: "inventory", i: "nav_inventory", href: "/inventory.html" },
    { key: "care", i: "nav_care", href: "/care-guides.html" },
    { key: "contact", i: "nav_contact", href: "/contact.html" }
  ];

  var CATEGORIES = [
    { slug: "fruit-trees", i: "cat_fruit_name" },
    { slug: "palms-coconut", i: "cat_palm_name" },
    { slug: "flowering-shrubs", i: "cat_flower_name" },
    { slug: "ornamental-foliage", i: "cat_orn_name" },
    { slug: "indoor-plants", i: "cat_indoor_name" },
    { slug: "succulents-cactus", i: "cat_succ_name" },
    { slug: "landscape-plants", i: "cat_land_name" }
  ];

  /* ---------- Icon set (inline SVG, Lucide-style) ----------------------- */
  var A = 'width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"';
  var ICONS = {
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
    cart: '<path d="M6 6h15l-1.6 8.5a2 2 0 0 1-2 1.6H9.2a2 2 0 0 1-2-1.6L5 3H2"/><circle cx="9.5" cy="20" r="1.4"/><circle cx="17.5" cy="20" r="1.4"/>',
    trash: '<path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13"/>',
    filter: '<path d="M3 5h18M6 12h12M10 19h4"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    mapPin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
    instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="3.5"/><circle cx="17.5" cy="6.5" r="1"/>',
    whatsapp: '<path d="M17.6 6.31A7.85 7.85 0 0 0 12.04 4a7.94 7.94 0 0 0-6.88 11.9L4 20l4.2-1.1a7.93 7.93 0 0 0 3.79.97h.01a7.94 7.94 0 0 0 5.6-13.56zM12.05 18.54a6.59 6.59 0 0 1-3.36-.92l-.24-.14-2.5.65.67-2.43-.16-.25a6.57 6.57 0 0 1-1.01-3.5 6.59 6.59 0 1 1 6.6 6.59zm3.61-4.93c-.2-.1-1.17-.58-1.35-.64s-.31-.1-.44.1-.51.64-.63.77-.23.15-.42.05a5.4 5.4 0 0 1-1.6-.98 6 6 0 0 1-1.1-1.37c-.11-.2 0-.3.09-.4l.3-.35c.1-.11.13-.2.2-.33a.36.36 0 0 0-.02-.35c-.05-.1-.44-1.07-.6-1.46-.16-.38-.32-.32-.44-.33l-.38-.01a.73.73 0 0 0-.53.25 2.23 2.23 0 0 0-.69 1.65 3.86 3.86 0 0 0 .81 2.05 8.83 8.83 0 0 0 3.38 2.98c.47.2.84.33 1.13.42.47.15.9.13 1.24.08.38-.06 1.17-.48 1.33-.94s.17-.86.12-.94-.18-.14-.38-.24z"/>',
    leaf: '<path d="M11 20A7 7 0 0 1 4 13c0-5 5-9 16-9 0 8-4 13-9 13z"/><path d="M4 20c4-6 7-8 12-9"/>',
    sprout: '<path d="M12 22V10"/><path d="M12 12C12 8 9 5 4 5c0 5 3 7 8 7z"/><path d="M12 10c0-3 2.5-5.5 7-5.5 0 4-3 5.5-7 5.5z"/>',
    box: '<path d="M21 8l-9-5-9 5v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
    truck: '<path d="M3 6h11v9H3z"/><path d="M14 9h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.6"/><circle cx="17.5" cy="18" r="1.6"/>',
    shield: '<path d="M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5z"/><path d="M9 12l2 2 4-4"/>',
    arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    arrowLeft: '<path d="M19 12H5M11 18l-6-6 6-6"/>',
    chevronRight: '<path d="M9 6l6 6-6 6"/>',
    chevronLeft: '<path d="M15 6l-6 6 6 6"/>',
    check: '<path d="M4 12l5 5L20 6"/>',
    checkCircle: '<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>',
    send: '<path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/>',
    star: '<path d="M12 2l3 6.5 7 .9-5 4.8 1.2 7L12 18l-6.4 3.2L6.8 14 2 9.4l7-.9z" fill="currentColor" stroke="none"/>',
    droplet: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
    home: '<path d="M4 11l8-7 8 7"/><path d="M6 10v9h12v-9"/>',
    seedling: '<path d="M12 21v-8"/><path d="M12 13C8 13 5 10 5 6c4 0 7 3 7 7z"/><path d="M12 13c4 0 7-3 7-7-4 0-7 3-7 7z"/>'
  };
  function svg(name, cls) {
    // WhatsApp is a filled brand glyph; the rest are stroked line icons.
    var attrs = name === "whatsapp" ? 'width="24" height="24" viewBox="0 0 24 24" fill="currentColor"' : A;
    return '<svg ' + attrs + (cls ? ' class="' + cls + '"' : "") + ' aria-hidden="true">' + (ICONS[name] || "") + "</svg>";
  }

  /* ---------- Theme ------------------------------------------------------ */
  var THEME_KEY = "sapling-theme";
  function applyTheme(th) {
    document.documentElement.setAttribute("data-theme", th);
    try { localStorage.setItem(THEME_KEY, th); } catch (e) {}
    document.querySelectorAll("[data-theme-toggle]").forEach(function (b) {
      b.innerHTML = svg(th === "dark" ? "sun" : "moon");
      b.setAttribute("aria-label", th === "dark" ? "Switch to light mode" : "Switch to dark mode");
    });
  }
  function toggleTheme() {
    applyTheme((document.documentElement.getAttribute("data-theme") || "light") === "dark" ? "light" : "dark");
  }

  /* ---------- Language --------------------------------------------------- */
  function setLang(lang) {
    if (I18N) I18N.apply(lang);
    document.documentElement.setAttribute("data-lang-open", "false");
  }
  function langControlMarkup() {
    return '<div class="lang-toggle" role="group" aria-label="Language">' +
      '<button type="button" data-set-lang="en">EN</button>' +
      '<button type="button" data-set-lang="bn">বাংলা</button>' +
      "</div>";
  }

  /* ---------- Header / footer / drawer ---------------------------------- */
  function navMarkup() {
    var active = document.body.getAttribute("data-page") || "";
    return NAV.map(function (n) {
      return '<a href="' + n.href + '" data-i18n="' + n.i + '"' + (n.key === active ? ' aria-current="page"' : "") + "></a>";
    }).join("");
  }

  function renderHeader() {
    var host = document.getElementById("site-header");
    if (!host) return;
    host.className = "site-header";
    host.innerHTML =
      '<a class="skip-link" href="#main">Skip to content</a>' +
      '<div class="container header-top">' +
        '<a class="brand" href="/" aria-label="The Sapling Co. — A unit of Shefali Nursery, home">' +
          '<img src="/assets/images/logo/logo-transparent.png" alt="The Sapling Co." width="180" height="56">' +
          '<span class="brand__unit" data-i18n="brand_unit">A unit of Shefali Nursery</span>' +
        "</a>" +
        '<nav class="nav-primary" aria-label="Primary">' + navMarkup() + "</nav>" +
        '<div class="header-actions">' +
          '<button class="icon-btn" data-search-open aria-label="Search">' + svg("search") + "</button>" +
          '<a class="icon-btn cart-link" href="/cart.html" data-cart-link aria-label="Cart">' + svg("cart") + '<span class="cart-badge" data-cart-count hidden>0</span></a>' +
          langControlMarkup() +
          '<button class="icon-btn" data-theme-toggle aria-label="Switch theme"></button>' +
          '<a class="btn btn--primary btn--sm hide-mobile" href="tel:' + BIZ.phoneTel + '" data-i18n="btn_call_us"></a>' +
          '<button class="icon-btn nav-toggle" data-drawer-open aria-label="Open menu" aria-expanded="false">' + svg("menu") + "</button>" +
        "</div>" +
      "</div>";

    if (!document.getElementById("mobileDrawer")) {
      var drawer = document.createElement("aside");
      drawer.id = "mobileDrawer";
      drawer.className = "mobile-drawer";
      drawer.setAttribute("aria-label", "Mobile menu");
      drawer.innerHTML =
        '<div class="drawer-head">' +
          '<img src="/assets/images/logo/logo-transparent.png" alt="The Sapling Co." height="46">' +
          '<button class="icon-btn" data-drawer-close aria-label="Close menu">' + svg("x") + "</button>" +
        "</div>" +
        navMarkup() +
        '<div class="drawer-foot">' + langControlMarkup() +
        '<a class="btn btn--secondary" href="/cart.html" data-cart-link>' + svg("cart") + ' <span data-i18n="sc_cart">Cart</span> <span class="cart-badge" data-cart-count hidden>0</span></a>' +
        '<a class="btn btn--primary" href="tel:' + BIZ.phoneTel + '">' + svg("phone") + BIZ.phoneDisplay + "</a></div>";
      var scrim = document.createElement("div");
      scrim.className = "scrim";
      scrim.setAttribute("data-drawer-close", "");
      document.body.appendChild(scrim);
      document.body.appendChild(drawer);
    }
  }

  function renderFooter() {
    var host = document.getElementById("site-footer");
    if (!host) return;
    host.className = "site-footer";
    var shop = CATEGORIES.map(function (c) {
      return '<a href="/inventory-' + c.slug + '.html" data-i18n="' + c.i + '"></a>';
    }).join("");
    host.innerHTML =
      '<div class="container footer-top">' +
        '<div class="footer-brand">' +
          '<img src="/assets/images/logo/logo-transparent.png" alt="The Sapling Co." height="52">' +
          '<p data-i18n="foot_tagline"></p>' +
        "</div>" +
        '<div class="footer-col"><h4 data-i18n="foot_shop"></h4>' + shop + "</div>" +
        '<div class="footer-col"><h4 data-i18n="foot_help"></h4>' +
          '<a href="/shop.html" data-i18n="nav_shop"></a>' +
          '<a href="/shipping.html" data-i18n="foot_ship"></a>' +
          '<a href="/care-guides.html" data-i18n="nav_care"></a>' +
          '<a href="/contact.html" data-i18n="nav_contact"></a>' +
          '<a href="/inventory.html" data-i18n="foot_browse"></a>' +
        "</div>" +
        '<div class="footer-col"><h4 data-i18n="foot_reach"></h4>' +
          '<div class="footer-contact">' +
            '<a href="tel:' + BIZ.phoneTel + '">' + svg("phone") + BIZ.phoneDisplay + "</a>" +
            '<a href="mailto:' + BIZ.email + '">' + svg("mail") + BIZ.email + "</a>" +
            '<a href="' + BIZ.maps + '" target="_blank" rel="noopener">' + svg("mapPin") + "Raghunathpur, Dankuni, Hooghly</a>" +
          "</div>" +
        "</div>" +
      "</div>" +
      '<div class="container footer-bottom">' +
        '<span data-i18n="foot_rights"></span>' +
        '<div class="socials">' +
          '<a href="' + BIZ.instagram + '" target="_blank" rel="noopener" aria-label="Instagram">' + svg("instagram") + "</a>" +
          '<a href="' + BIZ.whatsapp + '" target="_blank" rel="noopener" aria-label="WhatsApp">' + svg("whatsapp") + "</a>" +
          '<a href="mailto:' + BIZ.email + '" aria-label="Email">' + svg("mail") + "</a>" +
        "</div>" +
      "</div>";
  }

  /* ---------- Interactions ---------------------------------------------- */
  function wireInteractions() {
    document.addEventListener("click", function (e) {
      var t = e.target.closest("[data-theme-toggle],[data-drawer-open],[data-drawer-close],[data-set-lang]");
      if (!t) return;
      if (t.hasAttribute("data-theme-toggle")) toggleTheme();
      else if (t.hasAttribute("data-drawer-open")) setDrawer(true);
      else if (t.hasAttribute("data-drawer-close")) setDrawer(false);
      else if (t.hasAttribute("data-set-lang")) setLang(t.getAttribute("data-set-lang"));
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setDrawer(false); });
  }
  function setDrawer(open) {
    var d = document.getElementById("mobileDrawer"), s = document.querySelector(".scrim"), b = document.querySelector("[data-drawer-open]");
    if (!d) return;
    d.classList.toggle("open", open);
    if (s) s.classList.toggle("open", open);
    if (b) b.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.style.overflow = open ? "hidden" : "";
  }

  /* ---------- Hero carousel --------------------------------------------- */
  function wireCarousel() {
    var root = document.querySelector("[data-carousel]");
    if (!root) return;
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    if (slides.length < 2) { if (slides[0]) playVideoIn(slides[0]); return; }
    var idx = 0;
    var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    var DUR = 5000, timer = null, startTs = 0, remaining = DUR, paused = false;
    function nowMs() { return (window.performance && performance.now) ? performance.now() : Date.now(); }
    function clearTimer() { if (timer) { clearTimeout(timer); timer = null; } }

    var dotsWrap = root.querySelector(".hero-dots");
    slides.forEach(function (s, i) {
      var d = document.createElement("button");
      d.className = "hero-dot"; d.type = "button";
      d.setAttribute("aria-label", "Go to slide " + (i + 1));
      d.innerHTML = '<span class="hero-dot__fill"></span>';
      d.addEventListener("click", function () { go(i); });
      dotsWrap.appendChild(d);
    });
    var dots = Array.prototype.slice.call(dotsWrap.children);
    var fills = dots.map(function (d) { return d.querySelector(".hero-dot__fill"); });

    function playVideoInner(s) {
      var v = s.querySelector("video");
      if (v) { try { v.currentTime = 0; var p = v.play(); if (p && p.catch) p.catch(function () {}); } catch (e) {} }
    }
    function stopVideos() { root.querySelectorAll("video").forEach(function (v) { try { v.pause(); } catch (e) {} }); }

    function show(i) {
      idx = (i + slides.length) % slides.length;
      slides.forEach(function (s, k) { s.classList.toggle("is-active", k === idx); });
      dots.forEach(function (d, k) {
        d.classList.toggle("is-active", k === idx);
        d.setAttribute("aria-current", k === idx ? "true" : "false");
        fills[k].classList.remove("run");
        fills[k].style.animationPlayState = "";
      });
      stopVideos();
      playVideoInner(slides[idx]);
    }
    // Start the 5s countdown on the active dot: CSS animates the fill, a timer
    // is the authoritative trigger to advance. Both pause/resume together.
    function runProgress() {
      if (reduce) return;
      paused = false; remaining = DUR;
      var f = fills[idx];
      f.style.animationPlayState = "running";
      f.classList.remove("run"); void f.offsetWidth; f.classList.add("run");
      startTs = nowMs();
      clearTimer(); timer = setTimeout(advance, DUR);
    }
    function advance() { show(idx + 1); runProgress(); }
    function go(i) { show(i); runProgress(); }
    function pause() {
      if (reduce || paused || !timer) return;
      paused = true; clearTimer();
      remaining = Math.max(0, DUR - (nowMs() - startTs));
      var f = fills[idx]; if (f) f.style.animationPlayState = "paused";
    }
    function resume() {
      if (reduce || !paused) return;
      paused = false;
      var f = fills[idx]; if (f) f.style.animationPlayState = "running";
      startTs = nowMs() - (DUR - remaining);
      clearTimer(); timer = setTimeout(advance, remaining);
    }

    var prev = root.querySelector("[data-hero-prev]"), nxt = root.querySelector("[data-hero-next]");
    if (prev) prev.addEventListener("click", function () { go(idx - 1); });
    if (nxt) nxt.addEventListener("click", function () { go(idx + 1); });

    // Pause only when hovering/focusing the small control bar (dots + arrows) —
    // NOT the whole hero, which fills the viewport and would keep it "frozen".
    var ctrls = root.querySelector(".hero-controls") || dotsWrap;
    if (ctrls) {
      ctrls.addEventListener("mouseenter", pause);
      ctrls.addEventListener("mouseleave", resume);
      ctrls.addEventListener("focusin", pause);
      ctrls.addEventListener("focusout", resume);
    }
    document.addEventListener("visibilitychange", function () { document.hidden ? pause() : resume(); });

    show(0);
    runProgress();
  }
  function playVideoIn(s) { var v = s.querySelector("video"); if (v) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } }

  /* ---------- Inline icon placeholders ---------------------------------- */
  function paintInlineIcons() {
    document.querySelectorAll("[data-icon]").forEach(function (el) {
      if (!el.dataset.painted) { el.insertAdjacentHTML("afterbegin", svg(el.getAttribute("data-icon"))); el.dataset.painted = "1"; }
    });
    document.querySelectorAll("[data-icon-lead]").forEach(function (el) {
      if (!el.dataset.painted) { el.insertAdjacentHTML("afterbegin", svg(el.getAttribute("data-icon-lead"))); el.dataset.painted = "1"; }
    });
  }

  /* ---------- Map facade ------------------------------------------------- */
  function wireMap() {
    document.querySelectorAll(".map-facade[data-map]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var f = document.createElement("iframe");
        f.className = "map-embed"; f.title = "The Sapling Co. nursery location on Google Maps";
        f.src = btn.getAttribute("data-map"); f.loading = "lazy"; f.referrerPolicy = "no-referrer-when-downgrade";
        f.setAttribute("allowfullscreen", "");
        btn.replaceWith(f);
      });
    });
  }

  /* ---------- Forms (mailto) -------------------------------------------- */
  function serialise(form) {
    var out = [];
    Array.prototype.forEach.call(form.elements, function (el) {
      if (!el.name || el.type === "submit") return;
      out.push({ label: el.getAttribute("data-label") || el.name, value: (el.value || "").trim() });
    });
    return out;
  }
  function escapeHtml(s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }
  function wireForm(id, subjectFn) {
    var form = document.getElementById(id);
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var name = (form.elements["name"] && form.elements["name"].value.trim()) || "there";
      var lines = serialise(form).filter(function (f) { return f.value; }).map(function (f) { return f.label + ": " + f.value; });
      lines.push("", "— Sent from thesaplingco.in");
      var mailto = "mailto:" + BIZ.email + "?subject=" + encodeURIComponent(subjectFn(name)) + "&body=" + encodeURIComponent(lines.join("\n"));
      var status = form.querySelector(".form-status");
      if (status) {
        status.innerHTML = svg("checkCircle") + "<span>" + t("form_ok").replace("{name}", escapeHtml(name)) + BIZ.phoneDisplay + ".</span>";
        status.classList.add("show");
      }
      window.location.href = mailto;
    });
  }
  function prefillRequest() {
    var plant = new URLSearchParams(location.search).get("plant");
    if (!plant) return;
    var field = document.getElementById("req-plant");
    if (field) {
      field.value = plant;
      var form = document.getElementById("request-form");
      if (form) setTimeout(function () { form.scrollIntoView({ behavior: "smooth", block: "center" }); field.focus({ preventScroll: true }); }, 350);
    }
  }

  /* ---------- Care guides filter ---------------------------------------- */
  function wireGuides() {
    var grid = document.getElementById("guide-grid");
    if (!grid) return;
    var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-cats]"));
    var search = document.getElementById("guide-search");
    var pills = Array.prototype.slice.call(document.querySelectorAll(".filter-pills .pill"));
    var empty = document.getElementById("guide-empty");
    var activeCat = "all";
    function apply() {
      var q = (search && search.value || "").toLowerCase().trim(), shown = 0;
      cards.forEach(function (c) {
        var okCat = activeCat === "all" || c.getAttribute("data-cats").indexOf(activeCat) !== -1;
        var okText = !q || c.textContent.toLowerCase().indexOf(q) !== -1;
        var show = okCat && okText;
        c.style.display = show ? "" : "none"; if (show) shown++;
      });
      if (empty) empty.style.display = shown ? "none" : "block";
    }
    if (search) search.addEventListener("input", apply);
    pills.forEach(function (p) {
      p.addEventListener("click", function () {
        pills.forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
        p.setAttribute("aria-pressed", "true"); activeCat = p.getAttribute("data-cat"); apply();
      });
    });
  }

  /* ---------- Scroll reveal --------------------------------------------- */
  function wireReveal() {
    var els = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
    if (!els.length) return;
    if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach(function (el) { el.classList.add("in"); }); return;
    }
    var io = new IntersectionObserver(function (ent) {
      ent.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.1, rootMargin: "0px 0px -6% 0px" });
    els.forEach(function (el) { io.observe(el); });
    setTimeout(function () { if (document.querySelectorAll(".reveal.in").length === 0) els.forEach(function (el) { el.classList.add("in"); }); }, 1500);
  }

  /* ---------- Preloader -------------------------------------------------- */
  function hidePreloader() {
    var p = document.getElementById("preloader");
    if (!p) return;
    p.classList.add("done");
    setTimeout(function () { if (p && p.parentNode) p.parentNode.removeChild(p); }, 500);
  }

  /* ---------- Init ------------------------------------------------------- */
  /* ---------- Commerce: cart badge + search overlay -------------------- */
  // Global cart badge — reads the same localStorage the cart module writes,
  // so the count shows on every page (even ones without the cart module).
  function paintCartBadge() {
    var n = 0;
    try { (JSON.parse(localStorage.getItem("sapling-cart")) || []).forEach(function (i) { n += (i.qty || 0); }); } catch (e) {}
    document.querySelectorAll("[data-cart-count]").forEach(function (el) { el.textContent = n; el.hidden = n === 0; });
  }
  var SEARCH_WORDS = ["money plant", "sago palm", "areca palm", "fruits", "snake plant", "peace lily", "aglaonema"];
  function buildSearch() {
    if (document.getElementById("searchOverlay")) return;
    var o = document.createElement("div");
    o.id = "searchOverlay"; o.className = "search-overlay"; o.setAttribute("aria-hidden", "true");
    o.innerHTML =
      '<div class="search-scrim" data-search-close></div>' +
      '<div class="search-panel">' +
        '<div class="search-row">' +
          '<form class="searchbar" role="search" data-search-form>' + svg("search") +
            '<input type="search" id="siteSearch" autocomplete="off" spellcheck="false" aria-label="Search plants">' +
          "</form>" +
          '<button type="button" class="icon-btn" data-search-close aria-label="Close search">' + svg("x") + "</button>" +
        "</div>" +
        '<p class="search-hint" data-i18n="sc_search_hint">Search by plant name, type or benefit.</p>' +
      "</div>";
    document.body.appendChild(o);
    var input = o.querySelector("#siteSearch"), form = o.querySelector("[data-search-form]");
    var wi = 0, timer = null, reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    function pre() { return (I18N && I18N.current && I18N.current() === "bn") ? "খুঁজুন — " : "Search "; }
    function tick() { input.setAttribute("placeholder", pre() + SEARCH_WORDS[wi++ % SEARCH_WORDS.length]); }
    function openS() { o.classList.add("open"); o.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden"; tick(); if (!reduce) timer = setInterval(tick, 2200); setTimeout(function () { input.focus(); }, 60); }
    function closeS() { o.classList.remove("open"); o.setAttribute("aria-hidden", "true"); document.body.style.overflow = ""; if (timer) { clearInterval(timer); timer = null; } }
    document.addEventListener("click", function (e) {
      if (e.target.closest("[data-search-open]")) { e.preventDefault(); openS(); }
      else if (e.target.closest("[data-search-close]")) closeS();
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeS(); });
    form.addEventListener("submit", function (e) { e.preventDefault(); var q = input.value.trim(); location.href = "/shop.html" + (q ? "?q=" + encodeURIComponent(q) : ""); });
  }
  // Branded fallback for images that fail to load (e.g. hotlinked photos that
  // block cross-site loading). Replaced by our own CDN images later.
  var PLACEHOLDER_IMG = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MDAgNDAwIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI0UzRjBEOCIvPjxwYXRoIGQ9Ik0yMDAgMzIyVjE4MiIgc3Ryb2tlPSIjN0ZCRjMzIiBzdHJva2Utd2lkdGg9IjEwIiBzdHJva2UtbGluZWNhcD0icm91bmQiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNMjAwIDIwOGMwLTU1LTQ1LTEwMC0xMTAtMTAwIDAgNTUgNDUgMTAwIDExMCAxMDB6IiBmaWxsPSIjOUJENjQ5Ii8+PHBhdGggZD0iTTIwMCAxNzZjMC00NSAzNy04MiAxMDAtODIgMCA0NS0zNyA4Mi0xMDAgODJ6IiBmaWxsPSIjN0ZCRjMzIi8+PC9zdmc+";
  function wireCommerce() {
    buildSearch();
    paintCartBadge();
    document.addEventListener("sapling-cart-change", paintCartBadge);
    document.addEventListener("error", function (e) {
      var t = e.target;
      if (t && t.tagName === "IMG" && !t.dataset.fallback && String(t.src).slice(0, 5) !== "data:") {
        t.dataset.fallback = "1"; t.src = PLACEHOLDER_IMG;
      }
    }, true);
    if (I18N) I18N.apply(I18N.current ? I18N.current() : "en"); // translate injected commerce chrome
  }

  function init() {
    applyTheme(document.documentElement.getAttribute("data-theme") || "light");
    renderHeader();
    renderFooter();
    applyTheme(document.documentElement.getAttribute("data-theme") || "light");
    paintInlineIcons();
    if (I18N) I18N.apply(I18N.initialLang());
    wireInteractions();
    wireCarousel();
    wireForm("request-form", function (n) { return "Sapling Request from " + n; });
    wireForm("contact-form", function (n) { return "Website enquiry from " + n; });
    prefillRequest();
    wireGuides();
    wireMap();
    wireReveal();
    wireCommerce();
    window.SaplingIcon = svg;
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  // Hide preloader on full load, with a fallback so it never sticks.
  window.addEventListener("load", hidePreloader);
  setTimeout(hidePreloader, 2600);
})();
