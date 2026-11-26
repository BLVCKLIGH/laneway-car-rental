document.addEventListener("DOMContentLoaded", () => {
  const root = qs("#history");

  function render() {
    const list = Store.get("bookings", []);
    if (!list.length) {
      root.innerHTML = `<div class="empty"><h2>No bookings yet</h2><p class="muted">When you book a car it will show up here with its reference number.</p><a class="btn btn-primary" href="cars.html">Find a car</a></div>`;
      return;
    }
    const upcoming = list.filter(b => b.status === "confirmed" && b.to >= todayISO()).length;
    root.innerHTML = `<p class="result-count">${list.length} ${list.length === 1 ? "booking" : "bookings"}, ${upcoming} upcoming</p>` + list.map(b => {
      const car = CARS.find(c => c.id === b.carId) || { name: "Car", image: "" };
      const branch = LOCATIONS.find(l => l.id === b.location);
      const canCancel = b.status === "confirmed" && b.from > todayISO();
      return `
      <article class="trip">
        <img src="${car.image}" alt="" width="400" height="230">
        <div>
          <h3>${esc(car.name)} <span class="status ${b.status}">${b.status === "confirmed" ? "Confirmed" : "Cancelled"}</span></h3>
          <p><span class="ref">${esc(b.ref)}</span>. ${fmtDate(b.from)} to ${fmtDate(b.to)} (${daysBetween(b.from, b.to)} days)</p>
          <p>${branch ? esc(branch.name) : ""}</p>
        </div>
        <div class="trip-actions">
          <span class="price">${rand(b.total)}</span>
          ${canCancel ? `<button class="btn btn-ghost btn-small" data-cancel="${esc(b.ref)}">Cancel booking</button>` : ""}
        </div>
      </article>`;
    }).join("") + `<p style="margin-top:2rem"><button class="btn btn-ghost btn-small" id="clear">Remove cancelled bookings</button></p>`;
  }

  root.addEventListener("click", e => {
    const ref = e.target.dataset.cancel;
    if (ref) {
      const list = Store.get("bookings", []).map(b => b.ref === ref ? { ...b, status: "cancelled" } : b);
      Store.set("bookings", list);
      toast(`Booking ${ref} cancelled. No fee was charged.`);
      render();
    }
    if (e.target.id === "clear") {
      Store.set("bookings", Store.get("bookings", []).filter(b => b.status !== "cancelled"));
      render();
    }
  });
  render();
});
