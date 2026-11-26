document.addEventListener("DOMContentLoaded", () => {
  const form = qs("#booking-form");
  const carSel = qs("#car"), from = qs("#from"), to = qs("#to");
  const YOUNG_FEE = 95;

  carSel.innerHTML = `<option value="">Choose a car</option>` + CARS.map(c =>
    `<option value="${c.id}"${c.available ? "" : " disabled"}>${esc(c.name)}, ${rand(c.price)}/day${c.available ? "" : " (booked out)"}</option>`).join("");
  qs("#location").innerHTML = locationOptions(param("location") || "jnb");
  qs("#extras").innerHTML = EXTRAS.map(x =>
    `<label class="check"><input type="checkbox" name="extras" value="${x.id}"><span>${x.name} <span class="muted">(${rand(x.price)} per ${x.per})</span></span></label>`).join("");

  const preCar = CARS.find(c => c.id === Number(param("car")) && c.available);
  if (preCar) carSel.value = preCar.id;

  from.min = todayISO();
  from.value = param("from") && param("from") >= todayISO() ? param("from") : addDays(todayISO(), 1);
  to.value = param("to") && param("to") > from.value ? param("to") : addDays(from.value, 3);
  to.min = addDays(from.value, 1);

  // Prefill from signed-in user
  const user = Store.get("user", null);
  if (user) { qs("#name").value = user.name || ""; qs("#email").value = user.email || ""; }

  function quote() {
    const car = CARS.find(c => c.id === Number(carSel.value));
    const days = from.value && to.value ? daysBetween(from.value, to.value) : 0;
    const extras = qsa('input[name="extras"]:checked').map(i => EXTRAS.find(x => x.id === i.value));
    const age = Number(qs("#age").value);
    const base = car && days > 0 ? car.price * days : 0;
    const discount = days >= 7 ? Math.round(base * 0.1) : 0;
    const extrasTotal = days > 0 ? extras.reduce((s, x) => s + x.price * days, 0) : 0;
    const young = age >= 21 && age <= 24 && days > 0 ? YOUNG_FEE * days : 0;
    return { car, days, extras, base, discount, extrasTotal, young, total: base - discount + extrasTotal + young };
  }

  function renderSummary() {
    const q = quote();
    const branch = LOCATIONS.find(l => l.id === qs("#location").value);
    qs("#summary").innerHTML = q.car ? `
      <img src="${q.car.image}" alt="" width="400" height="230">
      <h2>${esc(q.car.name)}</h2>
      <dl>
        <dt>Pickup</dt><dd>${from.value ? fmtDate(from.value) : "–"}</dd>
        <dt>Return</dt><dd>${to.value ? fmtDate(to.value) : "–"}</dd>
        <dt>Branch</dt><dd>${esc(branch.short)}</dd>
        <dt>${q.days > 0 ? q.days : 0} × ${rand(q.car.price)}</dt><dd>${rand(q.base)}</dd>
        ${q.discount ? `<dt>Weekly discount (10%)</dt><dd>−${rand(q.discount)}</dd>` : ""}
        ${q.extras.map(x => `<dt>${x.name}</dt><dd>${rand(x.price * Math.max(q.days, 0))}</dd>`).join("")}
        ${q.young ? `<dt>Young-driver fee</dt><dd>${rand(q.young)}</dd>` : ""}
      </dl>
      <div class="total"><span>Total incl. VAT</span><strong>${rand(q.total)}</strong></div>`
      : `<h2>Your booking</h2><p style="color:#c9cdd1">Choose a car to see the price.</p>`;
  }

  const rules = {
    car: () => carSel.value ? "" : "Choose a car.",
    from: () => !from.value ? "Choose a pickup date." : from.value < todayISO() ? "Pickup date can't be in the past." : "",
    to: () => !to.value ? "Choose a return date." : to.value <= from.value ? "Return date must be at least one day after pickup." : daysBetween(from.value, to.value) > 60 ? "Bookings can be up to 60 days. Call us for longer rentals." : "",
    name: () => { const v = qs("#name").value.trim(); return !v ? "Enter your full name." : v.split(/\s+/).length < 2 ? "Enter your first name and surname." : ""; },
    email: () => { const v = qs("#email").value.trim(); return !v ? "Enter your email address." : /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? "" : "Enter an email address like name@example.com."; },
    phone: () => { const v = qs("#phone").value.replace(/[\s()-]/g, ""); return !v ? "Enter your mobile number." : /^(\+27|0)[6-8]\d{8}$/.test(v) ? "" : "Enter a South African mobile number, e.g. 082 123 4567."; },
    age: () => { const v = Number(qs("#age").value); return !qs("#age").value ? "Enter the driver's age." : v < 21 ? "Drivers must be 21 or older." : v > 99 ? "Check the driver's age." : ""; },
    terms: () => qs("#terms").checked ? "" : "Confirm you have a valid licence and accept the terms.",
  };

  function check(key) {
    const msg = rules[key]();
    const el = qs(`.error[data-for="${key}"]`);
    if (el) el.textContent = msg;
    const field = qs("#" + key).closest(".field");
    if (field) field.classList.toggle("invalid", !!msg);
    qs("#" + key).setAttribute("aria-invalid", msg ? "true" : "false");
    return !msg;
  }

  from.addEventListener("change", () => {
    to.min = addDays(from.value, 1);
    if (to.value <= from.value) to.value = addDays(from.value, 1);
  });
  form.addEventListener("input", renderSummary);
  form.addEventListener("change", renderSummary);
  Object.keys(rules).forEach(k => {
    const el = qs("#" + k);
    // Check on blur once something is entered; clear errors while typing so the layout doesn't jump on click.
    if (el.type === "checkbox") el.addEventListener("change", () => check(k));
    else {
      el.addEventListener("blur", () => { if (el.value) check(k); });
      el.addEventListener("input", () => { if (el.getAttribute("aria-invalid") === "true") check(k); });
      el.addEventListener("change", () => { if (el.getAttribute("aria-invalid") === "true") check(k); });
    }
  });

  form.addEventListener("submit", e => {
    e.preventDefault();
    const results = Object.keys(rules).map(check);
    if (results.includes(false)) {
      const first = qs('[aria-invalid="true"]');
      if (first) first.focus();
      toast("Some details need fixing before we can send your booking.");
      return;
    }
    const q = quote();
    const ref = "LW-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    const booking = {
      ref, carId: q.car.id, location: qs("#location").value, from: from.value, to: to.value,
      name: qs("#name").value.trim(), email: qs("#email").value.trim(), phone: qs("#phone").value.trim(),
      extras: q.extras.map(x => x.id), total: q.total, status: "confirmed", createdAt: new Date().toISOString(),
    };
    Store.set("bookings", [booking, ...Store.get("bookings", [])]);
    qs("#ref-code").textContent = ref;
    qs("#confirm-text").textContent = `We've reserved the ${q.car.name} from ${fmtDate(from.value)} to ${fmtDate(to.value)}. A confirmation will be sent to ${booking.email}.`;
    const t = qs(".toast"); if (t) t.classList.remove("show");
    qs("#confirm-modal").classList.add("open");
    qs("#confirm-modal .btn").focus();
  });

  // Closing the confirmation clears the form so the same booking isn't sent twice
  document.addEventListener("keydown", e => {
    if (e.key !== "Escape" || !qs("#confirm-modal").classList.contains("open")) return;
    qs("#confirm-modal").classList.remove("open");
    form.reset();
    from.value = addDays(todayISO(), 1); to.value = addDays(from.value, 3);
    renderSummary();
  });
  renderSummary();
});
