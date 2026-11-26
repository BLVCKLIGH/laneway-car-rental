document.addEventListener("DOMContentLoaded", () => {
  const car = CARS.find(c => c.id === Number(param("id")));
  const root = qs("#detail-root");

  if (!car) {
    qs("#car-name").textContent = "Car not found";
    root.innerHTML = `<div class="empty" style="margin:3rem 0"><h2>We couldn't find that car</h2><p class="muted">It may have been removed from the fleet.</p><a class="btn btn-dark" href="cars.html">Browse all cars</a></div>`;
    qs("#similar").closest("section").remove();
    return;
  }

  document.title = `${car.name} | Laneway Car Hire`;
  qs("#crumb").textContent = car.name;
  qs("#car-name").textContent = car.name;
  qs("#car-sub").textContent = `${car.category}, ${car.year} model. ${car.blurb}`;

  root.innerHTML = `
  <div class="detail">
    <div>
      <div class="gallery"><img src="${car.image}" alt="${esc(car.name)}, side view" width="400" height="230" style="width:100%"></div>
      <h2 style="margin-top:2rem">Specifications</h2>
      <table class="spec-table">
        <tr><th scope="row">Type</th><td>${car.category}</td></tr>
        <tr><th scope="row">Fuel</th><td>${car.fuel}</td></tr>
        <tr><th scope="row">Consumption</th><td>${car.consumption}</td></tr>
        <tr><th scope="row">Gearbox</th><td>${car.transmission}</td></tr>
        <tr><th scope="row">Seats</th><td>${car.seats}</td></tr>
        <tr><th scope="row">Large bags</th><td>${car.bags}</td></tr>
        <tr><th scope="row">Kilometres</th><td>Unlimited</td></tr>
      </table>
      <h2>What's included</h2>
      <ul class="feature-list">${car.features.map(f => `<li>${esc(f)}</li>`).join("")}</ul>
    </div>
    <aside class="panel" aria-label="Price and booking">
      <p class="muted" style="margin:0">From</p>
      <div class="price">${rand(car.price)} <small>/ day</small></div>
      <p style="margin-top:.5rem"><span class="badge${car.available ? "" : " out"}" style="position:static">${car.available ? "Available to book" : "Booked out for the next two weeks"}</span></p>
      <div class="field" style="margin-top:1.25rem">
        <label for="calc-days">How many days?</label>
        <input type="number" id="calc-days" min="1" max="60" value="3">
      </div>
      <p>Estimated total: <strong id="calc-total"></strong><br><span class="muted" style="font-size:.9rem">Rentals of 7 days or more get 10% off.</span></p>
      ${car.available
        ? `<a class="btn btn-primary btn-block" href="booking.html?car=${car.id}">Book this car</a>`
        : `<button class="btn btn-primary btn-block" disabled>Not available right now</button>`}
      <p class="muted" style="font-size:.9rem;margin-top:1rem">Refundable deposit of ${rand(car.price >= 1500 ? 10000 : 5000)} held on your credit card at pickup.</p>
    </aside>
  </div>`;

  const days = qs("#calc-days");
  const update = () => {
    const n = Math.max(1, Math.min(60, Number(days.value) || 1));
    const total = car.price * n * (n >= 7 ? 0.9 : 1);
    qs("#calc-total").textContent = `${rand(total)} for ${n} ${n === 1 ? "day" : "days"}`;
  };
  days.addEventListener("input", update);
  update();

  const similar = CARS.filter(c => c.id !== car.id && c.category === car.category).slice(0, 3);
  const fill = similar.length ? similar : CARS.filter(c => c.id !== car.id).slice(0, 3);
  qs("#similar").innerHTML = fill.map(c => carCard(c)).join("");
});
