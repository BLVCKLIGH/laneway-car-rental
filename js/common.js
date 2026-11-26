/* Shared helpers: storage, theme, header/footer, formatting, car cards. */
const Store = {
  get(key, fallback) {
    try { const v = localStorage.getItem("laneway:" + key); return v === null ? fallback : JSON.parse(v); }
    catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem("laneway:" + key, JSON.stringify(value)); } catch { /* storage unavailable */ }
  },
};

const rand = n => "R" + Number(n).toLocaleString("en-ZA", { maximumFractionDigits: 0 }).replace(/,/g, " ");
const qs = (s, el = document) => el.querySelector(s);
const qsa = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const todayISO = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
const addDays = (iso, n) => { const d = new Date(iso + "T00:00:00"); d.setDate(d.getDate() + n); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
const daysBetween = (a, b) => Math.round((new Date(b + "T00:00:00") - new Date(a + "T00:00:00")) / 86400000);
const fmtDate = iso => new Date(iso + "T00:00:00").toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });
const param = name => new URLSearchParams(location.search).get(name);

const ICONS = {
  seat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="7" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/></svg>',
  fuel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M3 21h12M4 10h10M14 8l3 2v8a2 2 0 0 0 4 0V9l-3-3"/></svg>',
  gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="5" cy="5" r="2"/><circle cx="12" cy="5" r="2"/><circle cx="19" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="12" cy="19" r="2"/><path d="M5 7v12M12 7v12M19 7v5H5"/></svg>',
  bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="4" y="7" width="16" height="13" rx="2"/><path d="M9 7V4h6v3"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
  sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
  facebook: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H8v4h2v8h4v-8h3l1-4h-4V8z"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.8 3h3.3l-7.2 8.2L22.4 21h-6.6l-5.2-6.8L4.7 21H1.4l7.7-8.8L1 3h6.8l4.7 6.2L17.8 3zm-1.2 16.2h1.8L7.5 4.7H5.5l11.1 14.5z"/></svg>',
  linkedin: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 3a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM2 9h4v12H2zM9 9h4v1.7A4.5 4.5 0 0 1 17 9c3 0 5 2 5 5.5V21h-4v-6c0-1.7-.7-2.8-2.2-2.8-1.7 0-2.8 1.1-2.8 3V21H9z"/></svg>',
};

const LOGO = '<svg class="logo-mark" viewBox="0 0 34 34" aria-hidden="true"><rect width="34" height="34" rx="5" fill="#f2c230"/><path d="M11 6v22M23 6v22" stroke="#24282d" stroke-width="3"/><path d="M17 7v4M17 15v4M17 23v4" stroke="#24282d" stroke-width="3"/></svg>';

/* Theme */
(function initTheme() {
  const saved = Store.get("theme", null);
  const prefersDark = window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.dataset.theme = saved || (prefersDark ? "dark" : "light");
})();

function toggleTheme() {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  Store.set("theme", next);
  const btn = qs("#theme-btn");
  if (btn) { btn.innerHTML = next === "dark" ? ICONS.sun : ICONS.moon; btn.setAttribute("aria-label", next === "dark" ? "Switch to light mode" : "Switch to dark mode"); }
}

function renderHeader() {
  const page = document.body.dataset.page;
  const user = Store.get("user", null);
  const links = [["index.html", "Home", "home"], ["cars.html", "Our cars", "cars"], ["index.html#locations", "Locations", "locations"], ["booking.html", "Book a car", "booking"], ["bookings.html", "My bookings", "bookings"]];
  const dark = document.documentElement.dataset.theme === "dark";
  qs("#site-header").outerHTML = `
  <header class="site-header">
    <a class="skip" href="#main">Skip to content</a>
    <nav class="nav wrap" aria-label="Main">
      <a class="logo" href="index.html">${LOGO}<span>Laneway</span></a>
      <ul class="nav-links" id="nav-links">
        ${links.map(([href, label, key]) => `<li><a href="${href}"${key === page ? ' aria-current="page"' : ""}>${label}</a></li>`).join("")}
      </ul>
      <div class="nav-actions">
        <button class="icon-btn" id="theme-btn" type="button" aria-label="${dark ? "Switch to light mode" : "Switch to dark mode"}">${dark ? ICONS.sun : ICONS.moon}</button>
        ${user ? `<a class="user-chip" href="login.html" title="Account">${esc(user.name.split(" ")[0])}</a>` : `<a class="btn btn-primary btn-small" href="login.html">Sign in</a>`}
        <button class="icon-btn menu-btn" id="menu-btn" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="nav-links">${ICONS.menu}</button>
      </div>
    </nav>
  </header>`;
  qs("#theme-btn").addEventListener("click", toggleTheme);
  qs("#menu-btn").addEventListener("click", e => {
    const open = qs("#nav-links").classList.toggle("open");
    e.currentTarget.setAttribute("aria-expanded", open);
  });
}

function renderFooter() {
  qs("#site-footer").outerHTML = `
  <footer class="site-footer">
    <div class="wrap footer-grid">
      <div>
        <a class="logo" href="index.html">${LOGO}<span>Laneway</span></a>
        <p style="margin-top:1rem">Car hire at five branches in Johannesburg, Cape Town and Durban. Unlimited kilometres on every booking.</p>
        <div class="socials">
          <a href="https://facebook.com" aria-label="Facebook">${ICONS.facebook}</a>
          <a href="https://instagram.com" aria-label="Instagram">${ICONS.instagram}</a>
          <a href="https://x.com" aria-label="X">${ICONS.x}</a>
          <a href="https://linkedin.com" aria-label="LinkedIn">${ICONS.linkedin}</a>
        </div>
      </div>
      <div><h3>Rent</h3><ul><li><a href="cars.html">All cars</a></li><li><a href="cars.html?category=SUV">SUVs</a></li><li><a href="cars.html?category=Bakkie">Bakkies</a></li><li><a href="cars.html?category=Luxury">Luxury</a></li></ul></div>
      <div><h3>Your account</h3><ul><li><a href="booking.html">Book a car</a></li><li><a href="bookings.html">My bookings</a></li><li><a href="login.html">Sign in</a></li></ul></div>
      <div><h3>Contact</h3><ul><li><a href="tel:+27110000000">011 000 0000</a></li><li><a href="mailto:hello@laneway.co.za">hello@laneway.co.za</a></li><li>Roadside help, 24 hours</li></ul></div>
    </div>
    <div class="wrap footer-bottom"><span>© ${new Date().getFullYear()} Laneway Car Hire. A demo project.</span><span>Prices include VAT. Drivers must be 21 or older.</span></div>
  </footer>`;
}

function toast(msg) {
  let t = qs(".toast");
  if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove("show"), 3200);
}

function carCard(car, extra = "") {
  return `
  <article class="car-card">
    <div class="pic">
      <span class="badge${car.available ? "" : " out"}">${car.available ? "Available" : "Booked out"}</span>
      <img src="${car.image}" alt="${esc(car.name)}" loading="lazy" width="400" height="230">
    </div>
    <div class="body">
      <h3><a href="car.html?id=${car.id}">${esc(car.name)}</a></h3>
      <div class="cat">${car.category}, ${car.year} model</div>
      <ul class="specs">
        <li>${ICONS.fuel}${car.fuel}</li>
        <li>${ICONS.seat}${car.seats} seats</li>
        <li>${ICONS.gear}${car.transmission}</li>
      </ul>
      <div class="price-row">
        <span class="price">${rand(car.price)} <small>/ day</small></span>
        ${car.available
          ? `<a class="btn btn-dark btn-small" href="booking.html?car=${car.id}${extra}">Book</a>`
          : `<a class="btn btn-ghost btn-small" href="car.html?id=${car.id}">Details</a>`}
      </div>
    </div>
  </article>`;
}

function locationOptions(selected) {
  return LOCATIONS.map(l => `<option value="${l.id}"${l.id === selected ? " selected" : ""}>${esc(l.name)}</option>`).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  if (qs("#site-header")) renderHeader();
  if (qs("#site-footer")) renderFooter();
});
