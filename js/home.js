document.addEventListener("DOMContentLoaded", () => {
  const featuredIds = [1, 4, 6, 12];
  qs("#featured").innerHTML = CARS.filter(c => featuredIds.includes(c.id)).map(carCard).join("");

  qs("#location-list").innerHTML = LOCATIONS.map(l => {
    const [place, city] = l.name.includes(",") ? l.name.split(", ") : [l.name, "Cape Town"];
    return `<div class="loc"><h3>${esc(place)}</h3><p>${esc(city)}</p><p>${esc(l.hours)}</p></div>`;
  }).join("");

  // Quick search
  qs("#qs-location").innerHTML = locationOptions("jnb");
  qs("#qs-cat").innerHTML += CATEGORIES.map(c => `<option>${c}</option>`).join("");
  const from = qs("#qs-from"), to = qs("#qs-to");
  from.min = todayISO(); from.value = addDays(todayISO(), 1);
  to.min = from.value; to.value = addDays(from.value, 3);
  from.addEventListener("change", () => { to.min = from.value; if (to.value <= from.value) to.value = addDays(from.value, 1); });

  qs("#quick-search").addEventListener("submit", e => {
    e.preventDefault();
    const err = qs("#qs-error");
    if (!from.value || !to.value) { err.textContent = "Choose a pickup and return date."; return; }
    if (from.value < todayISO()) { err.textContent = "Pickup date can't be in the past."; return; }
    if (to.value <= from.value) { err.textContent = "Return date must be after the pickup date."; return; }
    err.textContent = "";
    const p = new URLSearchParams({ location: qs("#qs-location").value, from: from.value, to: to.value });
    if (qs("#qs-cat").value) p.set("category", qs("#qs-cat").value);
    location.href = "cars.html?" + p.toString();
  });
});
