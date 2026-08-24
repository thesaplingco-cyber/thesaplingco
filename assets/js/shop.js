/* ==========================================================================
   The Sapling Co. — shop page: filter, sort, search
   Operates on the product cards already rendered into shop.html (data-* attrs),
   so there is no extra data fetch. Images lazy-load, so hidden cards cost little.
   Reads ?q= / ?category= / ?subcategory= / ?goal= for deep links + header search.
   ========================================================================== */
(function () {
  "use strict";
  var grid = document.getElementById("shop-grid");
  if (!grid) return;
  var cards = [].slice.call(grid.querySelectorAll(".product-card"));
  var countEl = document.getElementById("shop-count");
  var noneEl = document.getElementById("shop-none");
  var sortSel = document.getElementById("shop-sort");

  var norm = function (s) { return (s || "").toLowerCase().replace(/[^a-z0-9ঀ-৿ ]+/g, " ").replace(/\s+/g, " ").trim(); };
  var params = new URLSearchParams(location.search);
  var query = norm(params.get("q") || "");
  var qTokens = query ? query.split(" ") : [];
  var trait = params.get("trait") || "";

  function checked(cls) {
    return [].slice.call(document.querySelectorAll("." + cls + ":checked")).map(function (c) { return c.value; });
  }
  function apply() {
    var cats = checked("f-cat"), subs = checked("f-sub"), goals = checked("f-goal"), sizes = checked("f-size");
    var inStockOnly = document.getElementById("f-instock") && document.getElementById("f-instock").checked;
    var shown = 0;
    cards.forEach(function (c) {
      var cardGoals = (c.getAttribute("data-goals") || "").split("|");
      var cardSizes = (c.getAttribute("data-sizes") || "").split("|");
      var cardTraits = (c.getAttribute("data-traits") || "").split("|");
      var ok =
        (!cats.length || cats.indexOf(c.getAttribute("data-cat")) > -1) &&
        (!subs.length || subs.indexOf(c.getAttribute("data-sub")) > -1) &&
        (!sizes.length || sizes.some(function (s) { return cardSizes.indexOf(s) > -1; })) &&
        (!goals.length || goals.some(function (g) { return cardGoals.indexOf(g) > -1; })) &&
        (!trait || cardTraits.indexOf(trait) > -1) &&
        (!inStockOnly || c.getAttribute("data-instock") === "1") &&
        (!qTokens.length || qTokens.every(function (t) { return (c.getAttribute("data-search") || "").indexOf(t) > -1; }));
      c.hidden = !ok;
      if (ok) shown++;
    });
    if (countEl) countEl.textContent = shown;
    if (noneEl) noneEl.hidden = shown !== 0;
    sortCards();
  }
  function sortCards() {
    var mode = sortSel ? sortSel.value : "featured";
    var vis = cards.filter(function (c) { return !c.hidden; });
    vis.sort(function (a, b) {
      if (mode === "low") return (+a.getAttribute("data-price")) - (+b.getAttribute("data-price"));
      if (mode === "high") return (+b.getAttribute("data-price")) - (+a.getAttribute("data-price"));
      return (+b.getAttribute("data-feat")) - (+a.getAttribute("data-feat")); // featured (default order)
    });
    vis.forEach(function (c) { grid.appendChild(c); });
  }

  // pre-apply deep links from URL (?category=, ?subcategory=, ?goal=)
  function preselect(param, cls) {
    var v = params.get(param); if (!v) return;
    var box = document.querySelector("." + cls + '[value="' + v.replace(/"/g, "") + '"]');
    if (box) box.checked = true;
  }
  preselect("category", "f-cat");
  preselect("subcategory", "f-sub");
  preselect("goal", "f-goal");

  // show active search term
  var qBar = document.getElementById("shop-query");
  if (qBar) {
    var term = params.get("q") || trait || "";
    if (term) { qBar.hidden = false; qBar.querySelector("[data-q-text]").textContent = term; }
    var clr = qBar.querySelector("[data-q-clear]");
    if (clr) clr.addEventListener("click", function () { location.href = "shop.html"; });
  }

  document.querySelectorAll(".f-cat,.f-sub,.f-goal,.f-size,#f-instock").forEach(function (c) {
    c.addEventListener("change", apply);
  });
  if (sortSel) sortSel.addEventListener("change", sortCards);
  var clearBtn = document.getElementById("shop-clear");
  if (clearBtn) clearBtn.addEventListener("click", function () {
    document.querySelectorAll(".shop-filters input:checked").forEach(function (c) { c.checked = false; });
    apply();
  });

  // mobile filter drawer
  var filters = document.querySelector(".shop-filters");
  var scrim = document.querySelector(".filters-scrim");
  function openF(o) { if (filters) filters.classList.toggle("open", o); if (scrim) scrim.classList.toggle("open", o); document.body.style.overflow = o ? "hidden" : ""; }
  document.querySelectorAll("[data-filters-open]").forEach(function (b) { b.addEventListener("click", function () { openF(true); }); });
  document.querySelectorAll("[data-filters-close]").forEach(function (b) { b.addEventListener("click", function () { openF(false); }); });
  if (scrim) scrim.addEventListener("click", function () { openF(false); });

  apply();
})();
