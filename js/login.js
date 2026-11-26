document.addEventListener("DOMContentLoaded", () => {
  const user = Store.get("user", null);
  if (user) {
    qs("#auth-root").innerHTML = `
      <h2>Signed in as ${esc(user.name)}</h2>
      <p class="muted">${esc(user.email)}</p>
      <div class="modal-actions"><a class="btn btn-dark" href="bookings.html">My bookings</a><button class="btn btn-ghost" id="logout">Sign out</button></div>`;
    qs("#logout").addEventListener("click", () => { Store.set("user", null); location.reload(); });
    return;
  }

  const tabs = { login: qs("#tab-login"), signup: qs("#tab-signup") };
  function show(which) {
    Object.entries(tabs).forEach(([k, t]) => t.setAttribute("aria-selected", k === which));
    qs("#login-form").hidden = which !== "login";
    qs("#signup-form").hidden = which !== "signup";
  }
  tabs.login.addEventListener("click", () => show("login"));
  tabs.signup.addEventListener("click", () => show("signup"));

  const setErr = (input, msg) => {
    input.closest(".field").classList.toggle("invalid", !!msg);
    input.closest(".field").querySelector(".error").textContent = msg;
    return !msg;
  };
  const emailOk = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

  qs("#login-form").addEventListener("submit", e => {
    e.preventDefault();
    const em = qs("#li-email"), pw = qs("#li-pass");
    const ok = [setErr(em, emailOk(em.value.trim()) ? "" : "Enter a valid email address."), setErr(pw, pw.value ? "" : "Enter your password.")];
    if (ok.includes(false)) return;
    const accounts = Store.get("accounts", []);
    const acc = accounts.find(a => a.email === em.value.trim().toLowerCase());
    if (!acc) { setErr(em, "No account uses this email. Create an account instead."); return; }
    Store.set("user", acc);
    location.href = "bookings.html";
  });

  qs("#signup-form").addEventListener("submit", e => {
    e.preventDefault();
    const nm = qs("#su-name"), em = qs("#su-email"), pw = qs("#su-pass");
    const ok = [
      setErr(nm, nm.value.trim().length >= 2 ? "" : "Enter your name."),
      setErr(em, emailOk(em.value.trim()) ? "" : "Enter a valid email address."),
      setErr(pw, pw.value.length >= 8 && /\d/.test(pw.value) ? "" : "Use at least 8 characters, including a number."),
    ];
    if (ok.includes(false)) return;
    const acc = { name: nm.value.trim(), email: em.value.trim().toLowerCase() };
    Store.set("accounts", [...Store.get("accounts", []).filter(a => a.email !== acc.email), acc]);
    Store.set("user", acc);
    location.href = "cars.html";
  });
});
