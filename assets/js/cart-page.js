/* ==========================================================================
   The Sapling Co. — cart page: line items, coupon, checkout → WhatsApp order.
   Reads SaplingCart (shared state). No payment gateway: the order is handed to
   WhatsApp as a structured message; delivery is confirmed there after PIN check.
   ========================================================================== */
(function () {
  "use strict";
  var C = window.SaplingCart;
  if (!C) return;
  var WHATSAPP = "918902262452";

  var wrap = document.getElementById("cart-wrap");
  var empty = document.getElementById("cart-empty");
  var linesEl = document.getElementById("cart-lines");
  if (!wrap || !linesEl) return;

  var tt = function (k) { return (window.SaplingI18n && window.SaplingI18n.t) ? window.SaplingI18n.t(k) : k; };
  var inr = function (n) { return "₹" + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 }); };
  var coupon = null, coupons = [];

  fetch("assets/data/coupons.json").then(function (r) { return r.json(); }).then(function (d) { coupons = d || []; }).catch(function () {});

  function totals() {
    var sub = C.subtotal(), disc = 0;
    if (coupon) disc = coupon.type === "percent" ? sub * coupon.value / 100 : coupon.value;
    disc = Math.min(disc, sub);
    disc = Math.round(disc * 100) / 100; // exact to the paisa, no integer rounding
    return { sub: sub, disc: disc, total: Math.round((sub - disc) * 100) / 100 };
  }

  function render() {
    var items = C.read();
    if (!items.length) { wrap.hidden = true; empty.hidden = false; return; }
    wrap.hidden = false; empty.hidden = true;

    linesEl.innerHTML = "";
    items.forEach(function (i) {
      var el = document.createElement("div");
      el.className = "cart-line";
      var media = i.image
        ? '<div class="cart-line__media"><img src="' + i.image + '" alt="" loading="lazy"></div>'
        : '<div class="cart-line__media"></div>';
      el.innerHTML = media +
        '<div class="cart-line__info">' +
          '<strong>' + i.name + "</strong>" +
          '<span class="muted">' + (i.variant ? i.variant + " · " : (i.size ? "Size " + i.size + " · " : "")) + i.sku + "</span>" +
          '<button class="cart-line__remove" data-rm="' + i.sku + '">' + (window.SaplingIcon ? window.SaplingIcon("trash") : "") + '<span data-i18n="sc_remove">' + tt("sc_remove") + "</span></button>" +
        "</div>" +
        '<div class="cart-line__right">' +
          '<div class="stepper"><button class="stepper__btn" type="button" data-dec="' + i.sku + '">−</button><span class="stepper__n">' + i.qty + '</span><button class="stepper__btn" type="button" data-inc="' + i.sku + '">+</button></div>' +
          '<span class="cart-line__price">' + inr(i.price * i.qty) + "</span>" +
        "</div>";
      linesEl.appendChild(el);
    });

    var t = totals();
    setText("t-subtotal", inr(t.sub));
    setText("t-total", inr(t.total));
    var rd = document.getElementById("row-discount");
    if (t.disc > 0) { rd.hidden = false; setText("t-discount", "−" + inr(t.disc)); } else if (rd) rd.hidden = true;
  }
  function setText(id, v) { var e = document.getElementById(id); if (e) e.textContent = v; }

  // line interactions
  linesEl.addEventListener("click", function (e) {
    var inc = e.target.closest("[data-inc]"), dec = e.target.closest("[data-dec]"), rm = e.target.closest("[data-rm]");
    if (inc) C.inc(inc.getAttribute("data-inc"));
    else if (dec) C.dec(dec.getAttribute("data-dec"));
    else if (rm) C.remove(rm.getAttribute("data-rm"));
  });
  document.addEventListener("sapling-cart-change", render);

  // coupon
  var applyBtn = document.getElementById("apply-coupon");
  if (applyBtn) applyBtn.addEventListener("click", function () {
    var input = document.getElementById("coupon");
    var code = (input.value || "").trim().toUpperCase();
    var msg = document.getElementById("coupon-msg");
    var found = coupons.filter(function (c) { return c.code === code && c.active; })[0];
    var sub = C.subtotal();
    msg.className = "coupon-msg";
    if (!code) { coupon = null; msg.textContent = ""; render(); return; }
    if (!found) { coupon = null; msg.className = "coupon-msg err"; msg.textContent = "Invalid coupon code."; render(); return; }
    if (found.minOrder && sub < found.minOrder) {
      coupon = null; msg.className = "coupon-msg err";
      msg.textContent = "Add " + inr(found.minOrder - sub) + " more to use " + code + "."; render(); return;
    }
    coupon = found; msg.className = "coupon-msg ok";
    msg.textContent = code + " applied — " + (found.type === "percent" ? found.value + "% off" : inr(found.value) + " off") + ".";
    render();
  });

  // WhatsApp same-number toggle
  var waSame = document.querySelector('[name="waSame"]');
  var waFld = document.getElementById("wa-field");
  if (waSame && waFld) waSame.addEventListener("change", function () { waFld.hidden = waSame.checked; });

  // build + open order
  var orderBtn = document.getElementById("order-wa");
  if (orderBtn) orderBtn.addEventListener("click", function () {
    var f = document.getElementById("checkout");
    var g = function (n) { return (f.elements[n] && f.elements[n].value || "").trim(); };
    [].slice.call(f.querySelectorAll("[required]")).forEach(function (el) { el.style.borderColor = ""; });
    var missing = [].slice.call(f.querySelectorAll("[required]")).filter(function (el) { return !el.value.trim(); });
    if (!waSame.checked && !g("wa")) missing.push(f.elements["wa"]);
    if (missing.length) {
      missing.forEach(function (el) { el.style.borderColor = "#B23A48"; });
      missing[0].scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    var t = totals(), items = C.read();
    var wa = waSame.checked ? g("phone") : g("wa");
    var lines = items.map(function (i) { return i.qty + "× " + i.name + (i.variant ? " — " + i.variant : (i.size ? " (" + i.size + ")" : "")) + " — " + i.sku + " — " + inr(i.price * i.qty); });
    var msg = ["🌱 New Sapling Co. order", ""]
      .concat(lines, [""])
      .concat([
        tt("cart_subtotal") + ": " + inr(t.sub),
        t.disc > 0 ? tt("cart_discount") + " " + coupon.code + ": −" + inr(t.disc) : null,
        tt("cart_delivery") + ": " + tt("cart_delivery_tbd"),
        tt("cart_total") + ": " + inr(t.total), "",
        "👤 " + g("name"),
        "📞 " + g("phone") + (waSame.checked ? "" : "  (WhatsApp: " + wa + ")"),
        "📍 " + g("address") + ", PIN " + g("pin") + (g("landmark") ? " (" + g("landmark") + ")" : ""),
        g("notes") ? "📝 " + g("notes") : null
      ].filter(Boolean)).join("\n");
    window.open("https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(msg), "_blank");
  });

  render();
})();
