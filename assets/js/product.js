/* Product page — gallery thumbnails, variant selection, and buy-now. */

/* 1. Gallery thumbnail switching */
(function () {
  "use strict";
  var main = document.getElementById("pdp-main-img");
  var thumbs = [].slice.call(document.querySelectorAll(".pdp-thumb"));
  if (!main || thumbs.length < 2) return;
  thumbs.forEach(function (t) {
    t.addEventListener("click", function () {
      var full = t.getAttribute("data-full");
      if (full) main.setAttribute("src", full);
      thumbs.forEach(function (x) { x.classList.remove("is-active"); });
      t.classList.add("is-active");
    });
  });
})();

/* 2. Variant selection — updates price, image, and the add-to-cart target */
(function () {
  "use strict";
  var dataEl = document.getElementById("pdp-variants");
  var chips = [].slice.call(document.querySelectorAll(".variant-chip"));
  if (!dataEl || chips.length < 2) return;
  var data; try { data = JSON.parse(dataEl.textContent); } catch (e) { return; }
  var variants = data.variants || [];
  var main = document.getElementById("pdp-main-img");
  var priceEl = document.getElementById("pdp-price");
  var ctl = document.querySelector(".pdp-actions [data-cart-control]");
  var buy = document.querySelector("[data-buy-now]");
  var inr = function (n) { return "₹" + Number(n || 0).toLocaleString("en-IN"); };

  function select(i, initial) {
    var v = variants[i]; if (!v) return;
    chips.forEach(function (c, ci) { c.classList.toggle("is-active", ci === i); });
    if (priceEl) priceEl.innerHTML = '<span class="price__now">' + inr(v.price) + "</span>" +
      (v.mrp > v.price ? '<span class="price__mrp">' + inr(v.mrp) + '</span><span class="price__off">' + v.discount + "% off</span>" : "");
    // on a user switch, replace the image and drop the stale srcset so the new
    // variant photo wins (on initial load we keep the generator's responsive srcset)
    if (v.image && main && !initial) { main.removeAttribute("srcset"); main.setAttribute("src", v.image); }
    [ctl, buy].forEach(function (el) {
      if (!el) return;
      el.setAttribute("data-sku", v.sku);
      el.setAttribute("data-price", v.price);
      el.setAttribute("data-size", v.size || "");
      el.setAttribute("data-variant", v.label || "");
      if (v.image) el.setAttribute("data-image", v.image);
      if (el === ctl) { if (v.inStock) el.removeAttribute("data-oos"); else el.setAttribute("data-oos", "1"); }
    });
    if (window.SaplingCart && window.SaplingCart.paint) window.SaplingCart.paint();
  }
  chips.forEach(function (c, i) { c.addEventListener("click", function () { if (!c.hasAttribute("disabled")) select(i); }); });
  var def = variants.map(function (v) { return v.inStock; }).indexOf(true);
  select(def < 0 ? 0 : def, true);
})();

/* 3. "Order on WhatsApp" — ensure current variant is in the cart, then go */
(function () {
  "use strict";
  var buy = document.querySelector("[data-buy-now]");
  if (!buy || !window.SaplingCart) return;
  buy.addEventListener("click", function (e) {
    e.preventDefault();
    var sku = buy.getAttribute("data-sku");
    if (window.SaplingCart.qty(sku) === 0) {
      window.SaplingCart.add({ sku: sku, name: buy.getAttribute("data-name"), price: buy.getAttribute("data-price"),
        size: buy.getAttribute("data-size"), slug: buy.getAttribute("data-slug"), image: buy.getAttribute("data-image"),
        variant: buy.getAttribute("data-variant") });
    }
    location.href = "/cart.html";
  });
})();
