/* Qadam front end. Works with the Flask backend, and also on its own (demo mode). */
(function () {
  const { products: PRODUCTS, finance: FIN } = window.QADAM_DATA;
  const $ = (s, r = document) => r.querySelector(s);
  const pkr = (n) => "PKR " + Math.round(n).toLocaleString("en-PK");
  const num = (n) => Math.round(n).toLocaleString("en-PK");
  const img = (p) => `static/images/${p.image}.webp`;
  const byId = (id) => PRODUCTS.find((p) => p.id === Number(id));
  const FREE_OVER = 5000, DELIVERY = 250;
  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  };

  /* ---------- mobile menu ---------- */
  const menuBtn = $("#menuBtn"), nav = $("#nav");
  menuBtn.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", open);
  });
  nav.addEventListener("click", (e) => { if (e.target.tagName === "A") { nav.classList.remove("open"); menuBtn.setAttribute("aria-expanded", false); } });

  /* ---------- shop ---------- */
  let filter = "all", sort = "default";
  function renderGrid() {
    let list = PRODUCTS.filter((p) => filter === "all" || p.gender === filter);
    if (sort === "low") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "high") list = [...list].sort((a, b) => b.price - a.price);
    $("#grid").innerHTML = list.map((p) => `
      <article class="pcard">
        <button class="pimg" data-view="${p.id}" aria-label="View ${p.name}">
          <img src="${img(p)}" alt="${p.name}" loading="lazy" width="450" height="450">
          ${p.badge ? `<span class="badge">${p.badge}</span>` : ""}
        </button>
        <div class="pinfo">
          <span class="ptype">${p.gender} &middot; ${p.type}</span>
          <h3 class="pname">${p.name}</h3>
          <div class="prow"><span class="price">${pkr(p.price)}</span>
            <button class="link-btn" data-order="${p.id}">Order</button></div>
        </div>
      </article>`).join("");
  }
  $("#filters").addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    filter = b.dataset.f;
    document.querySelectorAll("#filters button").forEach((x) => { const on = x === b; x.classList.toggle("on", on); x.setAttribute("aria-pressed", on); });
    renderGrid();
  });
  $("#sort").addEventListener("change", (e) => { sort = e.target.value; renderGrid(); });
  $("#grid").addEventListener("click", (e) => {
    const v = e.target.closest("[data-view]"), o = e.target.closest("[data-order]");
    if (v) openQV(v.dataset.view);
    if (o) goOrder(o.dataset.order);
  });

  /* quick view */
  const qv = $("#qv");
  let qvId = null;
  function openQV(id) {
    const p = byId(id); qvId = p.id;
    $("#qvImg").src = img(p); $("#qvImg").alt = p.name;
    $("#qvMeta").textContent = `${p.gender} · ${p.type}`;
    $("#qvName").textContent = p.name;
    $("#qvPrice").textContent = pkr(p.price);
    $("#qvDesc").textContent = p.description;
    $("#qvFeat").innerHTML = p.features.map((f) => `<li>${f}</li>`).join("");
    qv.showModal();
  }
  $("#qvClose").addEventListener("click", () => qv.close());
  qv.addEventListener("click", (e) => { if (e.target === qv) qv.close(); });
  $("#qvOrder").addEventListener("click", () => { qv.close(); goOrder(qvId); });

  /* ---------- startup costs ---------- */
  const costTotal = FIN.startupCosts.reduce((s, c) => s + c.amount, 0);
  const fundTotal = FIN.fundSources.reduce((s, c) => s + c.amount, 0);
  $("#costList").innerHTML = FIN.startupCosts.map((c) => `
    <li><div class="t"><span>${c.item}</span><span>${pkr(c.amount)}</span></div>
      <small>${c.note}</small>
      <div class="bar-track"><div class="bar-fill" style="width:${(c.amount / costTotal * 100).toFixed(1)}%"></div></div></li>`).join("");
  $("#costTotal").textContent = pkr(costTotal);
  const fundColors = ["#0e2b25", "#c8a15a", "#6f8f84"];
  $("#fundStack").innerHTML = FIN.fundSources.map((f, i) => `<span style="width:${f.amount / fundTotal * 100}%;background:${fundColors[i]}"></span>`).join("");
  $("#fundList").innerHTML = FIN.fundSources.map((f, i) => `
    <li><i class="dot" style="background:${fundColors[i]}"></i><span class="n">${f.source}</span>
      <span class="v">${pkr(f.amount)}</span><span class="p">${Math.round(f.amount / fundTotal * 100)}%</span></li>`).join("");
  $("#fundTotal").textContent = pkr(fundTotal);
  $("#fundNote").textContent = fundTotal === costTotal ? "Funds raised match the startup cost, so no loan is needed." : "";

  /* ---------- calculator ---------- */
  const defaults = () => ({
    units: Object.fromEntries(PRODUCTS.map((p) => [p.id, p.defaultUnits])),
    costPct: FIN.costPercent,
    exp: Object.fromEntries(FIN.monthlyExpenses.map((e) => [e.key, e.amount])),
  });
  let S = defaults();

  function buildCalcInputs() {
    $("#unitRows").innerHTML = PRODUCTS.map((p) => `
      <div class="row"><img src="${img(p)}" alt="" loading="lazy">
        <div class="nm">${p.name.replace(/^(Men's|Women's) /, "")}<small>${p.gender} &middot; ${pkr(p.price)}</small></div>
        <div class="stepper"><button type="button" data-u="${p.id}" data-d="-1" aria-label="Fewer ${p.name}">&minus;</button>
          <input id="u${p.id}" data-uin="${p.id}" inputmode="numeric" value="${S.units[p.id]}" aria-label="Pairs of ${p.name} per month">
          <button type="button" data-u="${p.id}" data-d="1" aria-label="More ${p.name}">+</button></div></div>`).join("");
    $("#expRows").innerHTML = FIN.monthlyExpenses.map((e) => `
      <label class="erow"><span>${e.item}<small>${e.type === "perOrder" ? "PKR per pair sold" : "PKR per month"}</small></span>
        <input data-e="${e.key}" inputmode="numeric" value="${S.exp[e.key]}"></label>`).join("");
    $("#costPct").value = S.costPct;
    const key = document.createElement("div");
    key.className = "flow-key";
    key.innerHTML = `<span><i style="background:#6f8f84"></i>Shoes</span><span><i style="background:#9aa8a3"></i>Expenses</span><span><i style="background:#c8a15a"></i>Profit</span>`;
    $("#flow").after(key);
  }

  function calc() {
    let rev = 0, units = 0;
    PRODUCTS.forEach((p) => { const u = S.units[p.id] || 0; rev += p.price * u; units += u; });
    const cogs = rev * S.costPct / 100;
    let exp = 0;
    FIN.monthlyExpenses.forEach((e) => { exp += e.type === "perOrder" ? S.exp[e.key] * units : S.exp[e.key]; });
    const net = rev - cogs - exp;
    return { units, rev, cogs, gross: rev - cogs, exp, net, margin: rev ? net / rev * 100 : 0, payback: net > 0 ? costTotal / net : null };
  }
  function renderCalc() {
    const r = calc();
    const set = (id, v) => ($(id).textContent = v);
    set("#oProfit", (r.net < 0 ? "-" : "") + pkr(Math.abs(r.net)));
    $("#oProfit").classList.toggle("neg", r.net < 0);
    set("#oMargin", r.rev ? `${r.margin.toFixed(1)}% of sales is profit` : "Enter some sales to begin");
    set("#oUnits", `${num(r.units)} pairs`); set("#oRev", pkr(r.rev)); set("#oCogs", pkr(r.cogs));
    set("#oGross", pkr(r.gross)); set("#oExp", pkr(r.exp)); set("#oNet", pkr(r.net));
    set("#oPay", r.payback ? `${r.payback.toFixed(1)} months` : "Not reached");
    const t = Math.max(r.rev, 1), pr = Math.max(r.net, 0);
    const shoes = r.cogs / t * 100, ex = Math.min(r.exp / t * 100, 100 - shoes), pf = pr / t * 100;
    $("#flow").innerHTML = `<span style="width:${shoes}%;background:#6f8f84"></span><span style="width:${ex}%;background:#9aa8a3"></span><span style="width:${pf}%;background:#c8a15a"></span>`;
    $("#costPctOut").textContent = S.costPct + "%";
  }
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  $("#unitRows").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-u]"); if (!b) return;
    const id = b.dataset.u; S.units[id] = clamp((S.units[id] || 0) + Number(b.dataset.d), 0, 999);
    $("#u" + id).value = S.units[id]; renderCalc();
  });
  $("#unitRows").addEventListener("input", (e) => {
    const i = e.target.closest("[data-uin]"); if (!i) return;
    S.units[i.dataset.uin] = clamp(parseInt(i.value.replace(/\D/g, "")) || 0, 0, 999); renderCalc();
  });
  $("#expRows").addEventListener("input", (e) => {
    const i = e.target.closest("[data-e]"); if (!i) return;
    S.exp[i.dataset.e] = clamp(parseInt(i.value.replace(/\D/g, "")) || 0, 0, 99999999); renderCalc();
  });
  $("#costPct").addEventListener("input", (e) => { S.costPct = Number(e.target.value); renderCalc(); });
  $("#resetCalc").addEventListener("click", () => { S = defaults(); buildCalcInputs(); renderCalc(); });

  /* ---------- order form ---------- */
  const form = $("#orderForm"), msg = $("#formMsg");
  let size = "", qty = 1;
  $("#orderProduct").innerHTML = `<option value="">Choose a product</option>` +
    PRODUCTS.map((p) => `<option value="${p.id}">${p.name} - ${pkr(p.price)}</option>`).join("");

  function renderSizes() {
    const p = byId(form.productId.value);
    const sizes = !p ? [] : p.gender === "Men" ? [40, 41, 42, 43, 44, 45] : [36, 37, 38, 39, 40, 41];
    if (!sizes.includes(Number(size))) size = "";
    $("#sizes").innerHTML = sizes.length
      ? sizes.map((s) => `<button type="button" role="radio" aria-checked="${String(s) === String(size)}" data-s="${s}">${s}</button>`).join("")
      : `<span class="sub" style="margin:0">Choose a product first.</span>`;
  }
  function renderSummary() {
    const p = byId(form.productId.value);
    if (!p) { $("#summary").innerHTML = "<div><span>Choose a product to see your total.</span></div>"; return; }
    const sub = p.price * qty, del = sub >= FREE_OVER ? 0 : DELIVERY;
    $("#summary").innerHTML = `<div><span>${qty} x ${pkr(p.price)}</span><span>${pkr(sub)}</span></div>
      <div><span>Delivery</span><span>${del ? pkr(del) : "Free"}</span></div>
      <div class="tt"><span>Total (pay on delivery)</span><span>${pkr(sub + del)}</span></div>`;
    $("#orderImg").src = img(p); $("#orderImg").alt = p.name;
  }
  function goOrder(id) {
    form.productId.value = id; size = ""; renderSizes(); renderSummary();
    $("#order").scrollIntoView({ behavior: "smooth" });
    setTimeout(() => form.name.focus({ preventScroll: true }), 500);
  }
  form.productId.addEventListener("change", () => { renderSizes(); renderSummary(); });
  $("#sizes").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-s]"); if (!b) return;
    size = b.dataset.s; renderSizes(); showErr("size", "");
  });
  form.addEventListener("click", (e) => {
    const q = e.target.closest("[data-q]"); if (!q) return;
    qty = clamp(qty + Number(q.dataset.q), 1, 10); $("#qty").value = qty; renderSummary();
  });

  function showErr(field, text) {
    const el = form.querySelector(`.err[data-for="${field}"]`); if (el) el.textContent = text;
    const input = form[field]; if (input && input.classList) input.classList.toggle("invalid", !!text);
  }
  function validate() {
    const v = Object.fromEntries(new FormData(form));
    const phone = (v.phone || "").replace(/[\s-]/g, "");
    const errors = {};
    if (!byId(v.productId)) errors.productId = "Choose a product.";
    if ((v.name || "").trim().length < 2) errors.name = "Enter your full name.";
    if (!/^(\+92|0092|0)?3\d{9}$/.test(phone)) errors.phone = "Enter a valid Pakistani mobile number, e.g. 0300 1234567.";
    if (!size) errors.size = "Choose a size.";
    if ((v.city || "").trim().length < 2) errors.city = "Enter your city.";
    if ((v.address || "").trim().length < 8) errors.address = "Enter your full delivery address.";
    ["productId", "name", "phone", "size", "city", "address"].forEach((f) => showErr(f, errors[f] || ""));
    return { errors, v };
  }
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.className = "form-msg"; msg.textContent = "";
    const { errors, v } = validate();
    if (Object.keys(errors).length) { msg.className = "form-msg bad"; msg.textContent = "Please fix the highlighted fields."; const first = form.querySelector(".err:not(:empty)"); first && first.scrollIntoView({ block: "center", behavior: "smooth" }); return; }
    const payload = { name: v.name.trim(), phone: v.phone, city: v.city.trim(), address: v.address.trim(), note: v.note, productId: Number(v.productId), size, quantity: qty };
    const btn = $("#submitBtn"); btn.disabled = true; btn.textContent = "Sending...";
    try {
      const res = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("json")) throw new Error("no-backend");
      const data = await res.json();
      if (!res.ok) { Object.entries(data.fields || {}).forEach(([f, t]) => showErr(f, t)); throw new Error(data.error || "Order failed"); }
      done(`Order #${data.orderId} received. Total ${pkr(data.total)}, pay on delivery. We will call you to confirm.`);
    } catch (err) {
      if (err.message === "no-backend" || err instanceof TypeError) {
        const p = byId(payload.productId), sub = p.price * payload.quantity, del = sub >= FREE_OVER ? 0 : DELIVERY;
        const list = store.get("qadam_orders", []);
        list.push({ ...payload, productName: p.name, total: sub + del, createdAt: new Date().toISOString() });
        store.set("qadam_orders", list);
        done(`Order request saved in this browser (demo mode, server not running). Total ${pkr(sub + del)}, pay on delivery.`);
      } else { msg.className = "form-msg bad"; msg.textContent = err.message; }
    } finally { btn.disabled = false; btn.textContent = "Send order request"; }
  });
  function done(text) {
    msg.className = "form-msg ok"; msg.textContent = text;
    form.reset(); size = ""; qty = 1; $("#qty").value = 1; renderSizes(); renderSummary();
  }

  /* ---------- contact ---------- */
  const c = FIN.contact;
  $("#contactGrid").innerHTML = [
    ["Phone", c.phone, `tel:${c.phone.replace(/\s/g, "")}`],
    ["WhatsApp", "Message us", `https://wa.me/${c.whatsapp}`],
    ["Email", c.email, `mailto:${c.email}`],
    ["Instagram", c.instagram, `https://instagram.com/${c.instagram.replace("@", "")}`],
  ].map(([l, v, h]) => `<a class="ccard" href="${h}"><span>${l}</span><strong>${v}</strong></a>`).join("");

  /* init */
  renderGrid(); buildCalcInputs(); renderCalc(); renderSizes(); renderSummary();
})();
