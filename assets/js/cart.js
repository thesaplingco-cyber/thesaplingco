/* ==========================================================================
   The Sapling Co. — cart state + synced quantity controls
   Single source of cart truth (localStorage "sapling-cart"). Every add-to-cart
   / stepper on any page is a [data-cart-control]; this module paints them from
   the shared state and repaints ALL of them on any change, so a product's
   quantity stays in sync across cards, product page, related items and header.
   Identity is the SKU (variants never collide). Loaded on store pages.
   ========================================================================== */
(function () {
  "use strict";
  var KEY = "sapling-cart";

  function read() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
  function write(c) {
    try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) {}
    document.dispatchEvent(new CustomEvent("sapling-cart-change"));
  }
  function line(sku) { return read().filter(function (i) { return i.sku === sku; })[0]; }
  function qtyOf(sku) { var l = line(sku); return l ? l.qty : 0; }

  function add(item) {
    if (!item || !item.sku) return;
    var c = read(), l = c.filter(function (i) { return i.sku === item.sku; })[0];
    if (l) l.qty += 1;
    else c.push({ sku: item.sku, name: item.name || item.sku, price: +item.price || 0,
      size: item.size || "", variant: item.variant || "", slug: item.slug || "", image: item.image || "", qty: 1 });
    write(c);
  }
  function setQty(sku, q) {
    var c = read(), l = c.filter(function (i) { return i.sku === sku; })[0];
    if (!l) return;
    l.qty = q;
    if (l.qty <= 0) c = c.filter(function (i) { return i.sku !== sku; });
    write(c);
  }
  function inc(sku) { setQty(sku, qtyOf(sku) + 1); }
  function dec(sku) { setQty(sku, qtyOf(sku) - 1); }
  function remove(sku) { write(read().filter(function (i) { return i.sku !== sku; })); }
  function clear() { write([]); }
  function count() { return read().reduce(function (s, i) { return s + i.qty; }, 0); }
  function subtotal() { return read().reduce(function (s, i) { return s + i.price * i.qty; }, 0); }

  window.SaplingCart = {
    read: read, qty: qtyOf, add: add, setQty: setQty, inc: inc, dec: dec,
    remove: remove, clear: clear, count: count, subtotal: subtotal
  };

  /* ---- synced Add ⇄ stepper controls --------------------------------- */
  function tt(k) { return (window.SaplingI18n && window.SaplingI18n.t) ? window.SaplingI18n.t(k) : k; }
  function paintControls(scope) {
    (scope || document).querySelectorAll("[data-cart-control]").forEach(function (el) {
      var sku = el.getAttribute("data-sku");
      if (el.getAttribute("data-oos") === "1") {
        el.innerHTML = '<button class="btn btn--secondary btn--block" disabled data-i18n="sc_oos">' + tt("sc_oos") + "</button>";
        return;
      }
      var q = qtyOf(sku);
      if (q > 0) {
        el.innerHTML = '<div class="stepper"><button class="stepper__btn" type="button" data-cart-dec aria-label="Decrease quantity">−</button>' +
          '<span class="stepper__n">' + q + "</span>" +
          '<button class="stepper__btn" type="button" data-cart-inc aria-label="Increase quantity">+</button></div>';
      } else {
        el.innerHTML = '<button class="btn btn--primary btn--block" type="button" data-cart-add data-i18n="sc_add">' + tt("sc_add") + "</button>";
      }
    });
  }
  window.SaplingCart.paint = paintControls;

  document.addEventListener("click", function (e) {
    var ctl = e.target.closest("[data-cart-control]");
    if (!ctl) return;
    var sku = ctl.getAttribute("data-sku");
    if (e.target.closest("[data-cart-add]")) {
      e.preventDefault();
      add({ sku: sku, name: ctl.getAttribute("data-name"), price: ctl.getAttribute("data-price"),
        size: ctl.getAttribute("data-size"), variant: ctl.getAttribute("data-variant"),
        slug: ctl.getAttribute("data-slug"), image: ctl.getAttribute("data-image") });
    } else if (e.target.closest("[data-cart-inc]")) { e.preventDefault(); inc(sku); }
    else if (e.target.closest("[data-cart-dec]")) { e.preventDefault(); dec(sku); }
  });

  document.addEventListener("sapling-cart-change", function () { paintControls(); });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { paintControls(); });
  else paintControls();
})();
