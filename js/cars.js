document.addEventListener("DOMContentLoaded", () => {
  qs("#search-icon").outerHTML = ICONS.search;
  const FUELS = [...new Set(CARS.map(c => c.fuel))];
  const maxCarPrice = Math.max(...CARS.map(c => c.price));

  const chip = (group, value) => `<label class="chip"><input type="checkbox" name="${group}" value="${value}"><span>${value}</span></label>`;
  qs("#cat-chips").innerHTML = CATEGORIES.map(c => chip("category", c)).join("");
  qs("#fuel-chips").innerHTML = FUELS.map(f => chip("fuel", f)).join("");

  const price = qs("#max-price");
  price.max = maxCarPrice;
  price.value = maxCarPrice;

  // Pre-fill from URL (quick search on the homepage, footer links)
  const urlCat = param("category");
  if (urlCat) qsa('input[name="category"]').forEach(i => { if (i.value === urlCat) i.checked = true; });
  if (param("q")) qs("#search").value = param("q");

  const from = param("from"), to = param("to"), loc = param("location");
  let bookingExtra = "";
  if (from && to) {
    const branch = LOCATIONS.find(l => l.id === loc);
    const days = daysBetween(from, to);
    qs("#trip-line").textContent = `${branch ? branch.name + ", " : ""}${fmtDate(from)} to ${fmtDate(to)} (${days} ${days === 1 ? "day" : "days"}).`;
    bookingExtra = "&" + new URLSearchParams({ from, to, location: loc || "" }).toString();
    qs("#only-available").checked = true;
  }

  const popularity = [1, 2, 4, 6, 13, 12, 5, 14, 3, 8, 7, 9, 11, 10];

  function apply() {
    const term = qs("#search").value.trim().toLowerCase();
    const cats = qsa('input[name="category"]:checked').map(i => i.value);
    const fuels = qsa('input[name="fuel"]:checked').map(i => i.value);
    const max = Number(price.value);
    const seats = Number(qs("#min-seats").value);
    const trans = qs("#transmission").value;
    const onlyAvail = qs("#only-available").checked;

    qs("#max-price-out").textContent = Number(price.value) >= maxCarPrice ? "any" : rand(max);

    let list = CARS.filter(c =>
      (!term || c.name.toLowerCase().includes(term) || c.category.toLowerCase().includes(term)) &&
      (!cats.length || cats.includes(c.category)) &&
      (!fuels.length || fuels.includes(c.fuel)) &&
      c.price <= max &&
      c.seats >= seats &&
      (!trans || c.transmission === trans) &&
      (!onlyAvail || c.available)
    );

    const sort = qs("#sort").value;
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    else if (sort === "seats") list.sort((a, b) => b.seats - a.seats);
    else list.sort((a, b) => popularity.indexOf(a.id) - popularity.indexOf(b.id));

    qs("#count").textContent = `${list.length} of ${CARS.length} cars`;
    qs("#results").innerHTML = list.length
      ? list.map(c => carCard(c, bookingExtra)).join("")
      : `<div class="empty" style="grid-column:1/-1"><h3>No cars match these filters</h3><p class="muted">Try a higher price limit or fewer filters.</p><button class="btn btn-dark" type="button" id="empty-reset">Clear all filters</button></div>`;
    const er = qs("#empty-reset");
    if (er) er.addEventListener("click", reset);
  }

  function reset() {
    qsa(".filters input[type=checkbox]").forEach(i => (i.checked = false));
    price.value = maxCarPrice;
    qs("#min-seats").value = "0";
    qs("#transmission").value = "";
    qs("#search").value = "";
    apply();
  }

  qs("#filters").addEventListener("input", apply);
  qs("#search").addEventListener("input", apply);
  qs("#sort").addEventListener("change", apply);
  qs("#reset").addEventListener("click", reset);
  qs("#filter-toggle").addEventListener("click", e => {
    const open = qs("#filters").classList.toggle("open");
    e.currentTarget.setAttribute("aria-expanded", open);
  });
  apply();
});
