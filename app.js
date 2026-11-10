/* ============ VMF · APP ============ */
const WA_NUMBER = "50578051963";
const money = () => "";
let products = [], cart = [], favorites = new Set(), activeProduct = null;
const $ = s => document.querySelector(s);
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

try {
  favorites = new Set(JSON.parse(localStorage.getItem("vmf-favs") || "[]"));
  cart = JSON.parse(localStorage.getItem("vmf-cart") || "[]");
} catch (e) { favorites = new Set(); cart = []; }
const saveState = () => {
  try {
    localStorage.setItem("vmf-favs", JSON.stringify([...favorites]));
    localStorage.setItem("vmf-cart", JSON.stringify(cart));
  } catch (e) {}
};
const img = p => `images/${p.id}.jpg`;
const fallbackImg = e => { e.target.onerror = null; e.target.src = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800"><rect width="100%" height="100%" fill="#e2dcc9"/><text x="50%" y="50%" text-anchor="middle" font-family="serif" font-size="42" fill="#a48b60">VMF</text></svg>'); };

async function init() {
  try {
    const r = await fetch("src/data/productos.json");
    if (!r.ok) throw new Error("HTTP " + r.status);
    products = await r.json();
    if (!Array.isArray(products) || !products.length) throw new Error("Catálogo vacío");
    buildFilters(); render(); bind(); counters(); observeScene();
  } catch (err) {
    console.error("VMF: no se pudo cargar el catálogo:", err);
    const grid = $("#products");
    if (grid) grid.innerHTML = '<p class="empty">No se pudo cargar el catálogo. Abre la página desde la carpeta del proyecto o usa un servidor local.</p>';
  }
}

/* ---------- filtros ---------- */
function buildFilters() {
  const brands = [...new Set(products.map(p => p.marca).filter(Boolean))].sort();
  const colors = [...new Set(products.flatMap(p => p.colores || []))].sort();
  brands.forEach(x => $("#brand").add(new Option(x, x)));
  colors.forEach(x => $("#color").add(new Option(x, x)));
}
function filtered() {
  const q = $("#search").value.toLowerCase().trim();
  const a = $("#audience").value, c = $("#category").value, b = $("#brand").value, k = $("#color").value;
  return products.filter(p =>
    (!q || [p.producto, p.codigo, p.codi, p.marca].filter(Boolean).join(" ").toLowerCase().includes(q)) &&
    (!a || p.publico === a) && (!c || p.categoria === c) && (!b || p.marca === b) && (!k || (p.colores || []).includes(k))
  );
}

/* ---------- catálogo ---------- */
function render() {
  const list = filtered();
  $("#result-count").textContent = `${list.length} de ${products.length} piezas`;
  const grid = $("#products");
  $("#empty-state").hidden = list.length > 0;
  grid.innerHTML = list.map(p => {
    const fav = favorites.has(p.id);
    return `<article class="product-card" data-id="${p.id}">
      <div class="product-media" data-detail="${p.id}">
        <img src="${img(p)}" alt="${p.producto}" loading="lazy" decoding="async" onerror="fallbackImg(event)">
        ${p.codigo ? `<span class="product-badge">${p.codigo}</span>` : ""}
        <button class="heart ${fav ? "active" : ""}" data-fav="${p.id}" aria-label="Favorito"><svg viewBox="0 0 24 24"><path d="M12 21c-6-4.5-9-8-9-11.5A5 5 0 0 1 12 6a5 5 0 0 1 9 3.5C21 13 18 16.5 12 21z"/></svg></button>
      </div>
      <div class="product-info">
        <div class="brand-name">${p.marca || "Colección VMF"}</div>
        <h3 data-detail="${p.id}">${p.producto}</h3>
        <div class="product-meta">${(p.colores || []).join(" · ")}${p.tallas ? `<br>Tallas: ${p.tallas.join(", ")}` : ""}${p.publico ? `<br>${p.publico}` : ""}</div>
        <div class="product-actions"><button data-detail="${p.id}">Ver detalles</button><button data-add="${p.id}">Añadir +</button></div>
      </div>
    </article>`;
  }).join("");
  requestAnimationFrame(() => grid.querySelectorAll(".product-card").forEach((el, i) => {
    setTimeout(() => el.classList.add("visible"), reduceMotion ? 0 : Math.min(i * 45, 500));
  }));
}

/* ---------- interacción ---------- */
function showToast(t) { const e = $("#toast"); e.textContent = t; e.classList.add("show"); clearTimeout(e._t); e._t = setTimeout(() => e.classList.remove("show"), 2200); }
function openDrawer(title, content) { $("#drawer-title").textContent = title; $("#drawer-content").innerHTML = content; $("#drawer").classList.add("show"); $("#overlay").classList.add("show"); }
function closeDrawer() { $("#drawer").classList.remove("show"); if (!$("#product-modal").classList.contains("show")) $("#overlay").classList.remove("show"); }
function counters() { $("#cart-count").textContent = cart.length; const f = $("#fav-count"); f.textContent = favorites.size; f.hidden = favorites.size === 0; }

function details(id) {
  const p = products.find(x => x.id === id); if (!p) return;
  activeProduct = p;
  const waMsg = encodeURIComponent(`Hola, me interesa este producto:\n\n${p.producto}\nCódigo: ${p.codigo || p.id}\n${p.marca ? "Marca: " + p.marca + "\n" : ""}${p.codi ? "Codi: " + p.codi + "\n" : ""}`);
  $("#modal-content").innerHTML = `<div class="modal-grid">
    <div class="modal-media"><img src="${img(p)}" alt="${p.producto}" onerror="fallbackImg(event)"></div>
    <div class="modal-body">
      <p class="eyebrow">${p.marca || "VARIEDADES MENDEZ FAFFORD"}</p>
      <h2>${p.producto}</h2>
      <p><b>Colores:</b> ${(p.colores || []).join(", ")}</p>
      <p><b>Tallas:</b> ${p.tallas ? p.tallas.join(", ") : "No especificadas"}</p>
      <p><b>Público:</b> ${p.publico || "—"} · <b>Categoría:</b> ${p.categoria || "—"}</p>
      <div class="modal-divider"></div>
      <p><b>Código:</b> ${p.codigo || "No proporcionado"}<br><b>Codi:</b> ${p.codi || "No proporcionado"}<br><b>Precio:</b> Por confirmar</p>
      <div class="product-actions"><button class="btn btn-dark" id="modal-add">Agregar a la bolsa</button><a class="btn btn-light" target="_blank" rel="noopener" href="https://wa.me/${WA_NUMBER}?text=${waMsg}">Consultar por WhatsApp ↗</a></div>
    </div></div>`;
  $("#product-modal").classList.add("show"); $("#overlay").classList.add("show");
  $("#modal-add").onclick = () => { add(id); $("#product-modal").classList.remove("show"); closeDrawer(); };
}
function add(id) {
  cart.push({ id }); saveState(); counters(); showToast("Producto agregado a tu bolsa");
}
function showCart() {
  let html;
  if (cart.length) {
    html = cart.map((x, i) => {
      const p = products.find(pr => pr.id === x.id); if (!p) return "";
      const waMsg = encodeURIComponent(`Hola, quisiera pedir:\n\n${p.producto}\nCódigo: ${p.codigo || p.id}\n`);
      return `<div class="drawer-item"><img src="${img(p)}" alt="" onerror="this.style.display='none'"><span>${p.producto}<br><small class="muted">${p.codigo || p.id}</small></span><span style="display:flex;flex-direction:column;gap:6px;align-items:flex-end"><a href="https://wa.me/${WA_NUMBER}?text=${waMsg}" target="_blank" rel="noopener" style="font-size:10px;letter-spacing:1px;color:#8f7647">PEDIR ↗</a><button data-remove="${i}">Quitar</button></span></div>`;
    }).join("") + `<div class="modal-divider"></div><a class="btn btn-dark" style="width:100%;justify-content:center" href="${cartWhatsApp()}" target="_blank" rel="noopener">Enviar pedido por WhatsApp ↗</a><p class="muted" style="margin-top:12px">Los precios están pendientes. No se calcula ningún total.</p>`;
  } else html = `<p class="drawer-empty">Tu bolsa está vacía.</p>`;
  openDrawer("Tu bolsa", html);
}
function cartWhatsApp() {
  const lines = cart.map(x => { const p = products.find(pr => pr.id === x.id); return p ? `• ${p.producto}${p.codigo ? " (Código: " + p.codigo + ")" : ""}` : ""; }).filter(Boolean);
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Hola, quisiera pedir:\n\n" + lines.join("\n") + "\n\nGracias.")}`;
}
function showFav() {
  const ids = [...favorites];
  openDrawer("Tus favoritos", ids.length ? ids.map(id => {
    const p = products.find(pr => pr.id === id); if (!p) return "";
    return `<div class="drawer-item"><img src="${img(p)}" alt="" onerror="this.style.display='none'"><span>${p.producto}</span><button data-detail="${id}">Ver</button></div>`;
  }).join("") : `<p class="drawer-empty">Aún no tienes favoritos.</p>`);
}

/* ---------- eventos ---------- */
function bind() {
  ["search", "audience", "category", "brand", "color"].forEach(id => $("#" + id).addEventListener("input", render));
  document.body.addEventListener("click", e => {
    const d = e.target.closest("[data-detail]"), a = e.target.closest("[data-add]"), f = e.target.closest("[data-fav]");
    if (f) { const id = f.dataset.fav; favorites.has(id) ? favorites.delete(id) : favorites.add(id); saveState(); counters(); f.classList.toggle("active"); showToast(favorites.has(id) ? "Guardado en favoritos ♥" : "Eliminado de favoritos"); return; }
    if (a) { add(a.dataset.add); return; }
    if (d && !e.target.closest(".heart")) details(d.dataset.detail);
    const rm = e.target.closest("[data-remove]");
    if (rm) { cart.splice(+rm.dataset.remove, 1); saveState(); counters(); showCart(); }
    if (e.target.dataset && e.target.dataset.detail && e.target.closest("#drawer-content")) details(e.target.dataset.detail);
  });
  document.querySelectorAll(".category-tile").forEach(b => b.onclick = () => { $("#category").value = b.dataset.category; render(); $("#tienda").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" }); });
  $("#cart-open").onclick = showCart;
  $("#fav-shortcut").onclick = showFav;
  $("#drawer-close").onclick = closeDrawer;
  $("#overlay").onclick = () => { $("#product-modal").classList.remove("show"); closeDrawer(); };
  $("#modal-close").onclick = () => { $("#product-modal").classList.remove("show"); $("#overlay").classList.remove("show"); };
  $("#clear-filters").onclick = () => { ["search", "audience", "category", "brand", "color"].forEach(id => $("#" + id).value = ""); render(); };
  $("#search-open").onclick = () => { $("#search").focus(); $("#tienda").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" }); };
  $("#menu-toggle").onclick = () => $("#nav").classList.toggle("open");
  document.querySelectorAll("#nav a").forEach(a => a.onclick = () => $("#nav").classList.remove("open"));
  window.addEventListener("keydown", e => { if (e.key === "Escape") { $("#product-modal").classList.remove("show"); closeDrawer(); } });
}

/* ---------- escena: reveal + parallax + tilt ---------- */
function observeScene() {
  if (reduceMotion || !("IntersectionObserver" in window)) { document.querySelectorAll(".reveal,.product-card").forEach(el => el.classList.add("visible")); return; }
  const io = new IntersectionObserver(entries => entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("visible"); io.unobserve(en.target); } }), { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  document.querySelectorAll(".reveal").forEach(el => io.observe(el));

  if (window.matchMedia("(hover:hover)").matches) {
    document.querySelectorAll(".category-tile,.contact-card").forEach(el => {
      el.addEventListener("mousemove", ev => {
        const r = el.getBoundingClientRect();
        const x = (ev.clientX - r.left) / r.width - 0.5, y = (ev.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg)`;
      });
      el.addEventListener("mouseleave", () => el.style.transform = "");
      el.style.transition = "transform .3s ease-out";
    });
  }
}
function parallaxLoop() {
  if (reduceMotion) return;
  const els = document.querySelectorAll("[data-parallax]");
  let ticking = false;
  const update = () => {
    const vh = window.innerHeight;
    els.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      const speed = parseFloat(el.dataset.parallax) || 0.2;
      const offset = (r.top + r.height / 2 - vh / 2) * -speed;
      el.style.transform = `translate3d(0,${offset.toFixed(1)}px,0)`;
    });
    ticking = false;
  };
  window.addEventListener("scroll", () => { if (!ticking) { requestAnimationFrame(update); ticking = true; } }, { passive: true });
  update();
  const header = $("#header");
  window.addEventListener("scroll", () => header.classList.toggle("scrolled", window.scrollY > 40), { passive: true });
}

init();
document.addEventListener("DOMContentLoaded", parallaxLoop);
