/* =====================
   SLIDER
===================== */
const slider = document.getElementById("slider");

function slideLeft() {
  slider.scrollBy({ left: -300, behavior: "smooth" });
}
function slideRight() {
  slider.scrollBy({ left: 300, behavior: "smooth" });
}

/* =====================
   MOBILE SWIPE
===================== */
let isDown = false;
let startX, scrollLeft;

if (slider) {
  slider.addEventListener("touchstart", e => {
    isDown = true;
    startX = e.touches[0].pageX;
    scrollLeft = slider.scrollLeft;
  });

  slider.addEventListener("touchmove", e => {
    if (!isDown) return;
    const x = e.touches[0].pageX;
    slider.scrollLeft = scrollLeft + (startX - x) * 1.3;
  });

  slider.addEventListener("touchend", () => isDown = false);
}

/* =====================
   CART SYSTEM
===================== */
let cart = JSON.parse(localStorage.getItem("cart")) || [];

function addToCart(name, price, image = "") {
  if (!selectedSize) {
    alert("Pilih size dulu 👟");
    return;
  }

  cart.push({
    name,
    price,
    image,
    size: selectedSize,
    qty: 1
  });

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartBadge();
  cartFeedback();
}

/* =====================
   CART BADGE
===================== */
function updateCartBadge() {
  const badge = document.getElementById("cartBadge");
  if (badge) badge.innerText = cart.length;
}
updateCartBadge();

let currentCatalog = "all";
let searchQuery = "";
function applyCatalogFilter() {
  const tiles = document.querySelectorAll(".catalog-grid .tile");
  let count = 0;
  tiles.forEach(t => {
    const name = t.querySelector(".name")?.textContent?.toLowerCase() || "";
    const sub = t.querySelector(".sub")?.textContent?.toLowerCase() || "";
    const matchesText = !searchQuery || name.includes(searchQuery) || sub.includes(searchQuery);
    const matchesCat = currentCatalog === "all" || t.dataset.cat === currentCatalog;
    const show = searchQuery ? matchesText : (matchesText && matchesCat);
    t.style.display = show ? "" : "none";
    if (show) count++;
  });
  const emptyEl = document.getElementById("catalogEmpty");
  if (emptyEl) emptyEl.style.display = count ? "none" : "block";
}
function setCatalog(cat) {
  currentCatalog = cat;
  const pb = document.getElementById("pillBrand");
  const pl = document.getElementById("pillLokal");
  if (pb) pb.classList.toggle("active", cat === "brand");
  if (pl) pl.classList.toggle("active", cat === "lokal");
  applyCatalogFilter();
}
document.addEventListener("DOMContentLoaded", () => {
  const si = document.getElementById("searchInput");
  if (si) {
    si.addEventListener("input", e => {
      searchQuery = e.target.value.trim().toLowerCase();
      const catalogGrid = document.querySelector(".catalog-grid");
      if (catalogGrid) {
        applyCatalogFilter();
      }
    });
    si.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        const sec = document.getElementById("catalog");
        if (sec) {
          sec.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          // Redirect to shop page if search from home
          window.location.href = "shop.html?q=" + encodeURIComponent(searchQuery);
        }
      }
    });
  }
  // Handle search query from URL (e.g., from home page)
  const params = new URLSearchParams(window.location.search);
  const q = params.get("q");
  if (q && si) {
    si.value = q;
    searchQuery = q.toLowerCase();
    applyCatalogFilter();
  }
  
  applyCatalogFilter();
});

function currentUser() {
  try {
    return JSON.parse(localStorage.getItem("currentUser")) || null;
  } catch { return null }
}
function updateUserUI() {
  const btns = document.querySelectorAll(".user-btn-container");
  const user = currentUser();
  
  btns.forEach(container => {
    if (user && user.name) {
      container.innerHTML = `
        <button class="icon-btn logged-in" onclick="userButtonClick()">
          <img src="icon/user.png" alt="User" style="width: 20px; height: 20px;">
          <span class="user-name-label">${user.name.split(" ")[0]}</span>
        </button>
      `;
    } else {
      container.innerHTML = `
        <button class="icon-btn" onclick="userButtonClick()">
          <img src="icon/user.png" alt="User" style="width: 20px; height: 20px;">
        </button>
      `;
    }
  });
}

// Inject Auth Modal
function injectAuthModal() {
  if (document.getElementById("authModal")) return;
  
  const modalHTML = `
    <div id="authBackdrop" class="auth-backdrop" onclick="closeAuth()"></div>
    <div id="authModal" class="auth-modal">
      <div class="auth-head">
        <div class="tabs">
          <button id="tabSignIn" class="tab active" onclick="setAuthTab('in')">Masuk</button>
          <button id="tabSignUp" class="tab" onclick="setAuthTab('up')">Daftar</button>
        </div>
        <button class="close" onclick="closeAuth()">×</button>
      </div>
      <div class="auth-body">
        <form id="formSignIn" class="auth-form" onsubmit="event.preventDefault(); signIn();">
          <input id="inEmail" type="email" placeholder="Email" required>
          <input id="inPassword" type="password" placeholder="Password" required>
          <button type="submit" class="btn">Masuk ke Kicksy</button>
        </form>
        <form id="formSignUp" class="auth-form hidden" onsubmit="event.preventDefault(); signUp();">
          <input id="upName" type="text" placeholder="Nama Lengkap" required>
          <input id="upEmail" type="email" placeholder="Email" required>
          <input id="upPassword" type="password" placeholder="Password" required>
          <button type="submit" class="btn">Buat Akun Kicksy</button>
        </form>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);
}

document.addEventListener("DOMContentLoaded", () => {
  injectAuthModal();
  updateUserUI();
});
document.addEventListener("DOMContentLoaded", () => {
  if (location.hash === "#promo") {
    const sec = document.getElementById("promo");
    if (sec) sec.scrollIntoView({ behavior: "smooth", block: "start" });
  }
});

function openAuth() {
  const b = document.getElementById("authBackdrop");
  const m = document.getElementById("authModal");
  if (!b || !m) return;
  b.style.display = "block";
  m.style.display = "block";
  setAuthTab("in");
}

document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeMobileNav();
});

/* =====================
   COMMENTS SYSTEM
===================== */
let comments = JSON.parse(localStorage.getItem("kicksy_comments")) || [];
let commentsHidden = localStorage.getItem("kicksy_comments_hidden") === "true";

function toggleComments() {
  commentsHidden = !commentsHidden;
  localStorage.setItem("kicksy_comments_hidden", commentsHidden);
  applyCommentsVisibility();
}

function applyCommentsVisibility() {
  const content = document.getElementById("commentsContent");
  const btn = document.getElementById("toggleCommentsBtn");
  if (!content || !btn) return;

  if (commentsHidden) {
    content.classList.add("hidden");
    btn.innerText = "Tampilkan Komentar";
  } else {
    content.classList.remove("hidden");
    btn.innerText = "Sembunyikan Komentar";
  }
}

function addComment() {
  const nameInput = document.getElementById("commentName");
  const rating = document.getElementById("commentRating").value;
  const text = document.getElementById("commentText").value;
  
  const user = currentUser();
  const name = user ? user.name : nameInput.value;
  
  if (!name || !text) {
    alert("Silakan lengkapi nama dan komentar Anda.");
    return;
  }

  const newComment = {
    id: Date.now(),
    name,
    rating: parseInt(rating),
    text,
    date: new Date().toLocaleDateString("id-ID")
  };

  comments.unshift(newComment);
  localStorage.setItem("kicksy_comments", JSON.stringify(comments));
  
  // Reset form
  document.getElementById("commentForm").reset();
  
  // Re-fill name if logged in
  if (user && nameInput) {
    nameInput.value = user.name;
  }
  
  // Refresh display
  renderComments();
}

function renderComments() {
  const list = document.getElementById("commentList");
  const nameInput = document.getElementById("commentName");
  if (!list) return;

  // If user is logged in, pre-fill or hide name input
  const user = currentUser();
  if (user && nameInput) {
    nameInput.value = user.name;
    nameInput.readOnly = true;
    nameInput.style.opacity = "0.7";
    nameInput.title = "Nama diambil dari akun Anda";
  }

  // Keep static comments but clear others
  const staticComments = `
    <div class="testi-card">
      <div class="stars">⭐⭐⭐⭐⭐</div>
      <p>"Sepatu Kanky nya original banget, pengiriman cepet dan CS nya ramah. Bakal langganan di sini!"</p>
      <div class="user">- Andi, Jakarta</div>
    </div>
    <div class="testi-card">
      <div class="stars">⭐⭐⭐⭐⭐</div>
      <p>"Dapet promo KICKSY10 lumayan banget buat beli Nike Dunk. Barang sampe dengan aman pake double box."</p>
      <div class="user">- Budi, Bandung</div>
    </div>
    <div class="testi-card">
      <div class="stars">⭐⭐⭐⭐⭐</div>
      <p>"Gak nyangka brand lokal sekarang kualitasnya oke banget. Thanks Kicksy udah kurasi produk lokal!"</p>
      <div class="user">- Citra, Surabaya</div>
    </div>
  `;

  let dynamicHTML = "";
  comments.forEach(c => {
    let stars = "⭐".repeat(c.rating);
    dynamicHTML += `
      <div class="testi-card">
        <div class="stars">${stars}</div>
        <p>"${c.text}"</p>
        <div class="user">- ${c.name} (${c.date})</div>
      </div>
    `;
  });

  list.innerHTML = dynamicHTML + staticComments;
}

document.addEventListener("DOMContentLoaded", () => {
  renderComments();
  applyCommentsVisibility();
});
function closeAuth() {
  const b = document.getElementById("authBackdrop");
  const m = document.getElementById("authModal");
  if (!b || !m) return;
  b.style.display = "none";
  m.style.display = "none";
}
function setAuthTab(mode) {
  const tIn = document.getElementById("tabSignIn");
  const tUp = document.getElementById("tabSignUp");
  const fIn = document.getElementById("formSignIn");
  const fUp = document.getElementById("formSignUp");
  if (!tIn || !tUp || !fIn || !fUp) return;
  tIn.classList.toggle("active", mode === "in");
  tUp.classList.toggle("active", mode === "up");
  fIn.classList.toggle("hidden", mode !== "in");
  fUp.classList.toggle("hidden", mode !== "up");
}
function userButtonClick() {
  const user = currentUser();
  if (user) {
    const ok = confirm("Keluar dari akun?");
    if (ok) signOut();
  } else {
    openAuth();
  }
}
async function hashPassword(text) {
  const enc = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  const arr = Array.from(new Uint8Array(buf));
  return arr.map(b => b.toString(16).padStart(2, "0")).join("");
}
async function signUp() {
  const name = document.getElementById("upName")?.value?.trim();
  const email = document.getElementById("upEmail")?.value?.trim()?.toLowerCase();
  const pass = document.getElementById("upPassword")?.value || "";
  if (!name || !email || !pass) {
    alert("Lengkapi data");
    return;
  }
  const users = JSON.parse(localStorage.getItem("users") || "{}");
  if (users[email]) {
    alert("Email sudah terdaftar");
    return;
  }
  const hash = await hashPassword(pass);
  users[email] = { name, email, hash };
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("currentUser", JSON.stringify({ name, email }));
  closeAuth();
  updateUserUI();
  renderComments();
}
async function signIn() {
  const email = document.getElementById("inEmail")?.value?.trim()?.toLowerCase();
  const pass = document.getElementById("inPassword")?.value || "";
  if (!email || !pass) {
    alert("Masukkan email dan password");
    return;
  }
  const users = JSON.parse(localStorage.getItem("users") || "{}");
  const user = users[email];
  if (!user) {
    alert("Akun tidak ditemukan");
    return;
  }
  const hash = await hashPassword(pass);
  if (hash !== user.hash) {
    alert("Password salah");
    return;
  }
  localStorage.setItem("currentUser", JSON.stringify({ name: user.name, email }));
  closeAuth();
  updateUserUI();
  renderComments();
}
function signOut() {
  localStorage.removeItem("currentUser");
  updateUserUI();
  
  // Clear comment name input and re-enable it
  const nameInput = document.getElementById("commentName");
  if (nameInput) {
    nameInput.value = "";
    nameInput.readOnly = false;
    nameInput.style.opacity = "1";
    nameInput.title = "";
  }
  
  renderComments();
}
let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
function toggleFav(name) {
  const idx = wishlist.indexOf(name);
  if (idx >= 0) {
    wishlist.splice(idx, 1);
  } else {
    wishlist.push(name);
  }
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
  document
    .querySelectorAll(".tile .name")
    .forEach(el => {
      const n = el.textContent.trim();
      const btn = el.parentElement.querySelector(".fav");
      if (!btn) return;
      if (wishlist.includes(n)) btn.classList.add("active");
      else btn.classList.remove("active");
    });
}
document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelectorAll(".tile .name")
    .forEach(el => {
      const n = el.textContent.trim();
      const btn = el.parentElement.querySelector(".fav");
      if (!btn) return;
      if (wishlist.includes(n)) btn.classList.add("active");
    });
});

function openBag() {
  document.body.classList.add("bag-open");
  renderBag();
}
function closeBag() {
  document.body.classList.remove("bag-open");
}
function renderBag() {
  const wrap = document.getElementById("bagItems");
  const totalEl = document.getElementById("bagTotal");
  const emptyEl = document.getElementById("bagEmpty");
  if (!wrap) return;
  wrap.innerHTML = "";
  let total = 0;
  if (cart.length === 0) {
    emptyEl.style.display = "block";
  } else {
    emptyEl.style.display = "none";
  }
  cart.forEach((item, i) => {
    total += item.price * item.qty;
    wrap.innerHTML += `
      <div class="bag-item">
        <img src="${item.image || 'images/placeholder.png'}">
        <div class="bag-info">
          <h4>${item.name}</h4>
          <p>Size: ${item.size}</p>
          <p>Rp ${item.price.toLocaleString("id-ID")}</p>
          <div class="bag-qty">
            <button onclick="changeQty(${i}, -1)">−</button>
            <span>${item.qty}</span>
            <button onclick="changeQty(${i}, 1)">+</button>
          </div>
        </div>
      </div>
    `;
  });
  if (totalEl) totalEl.innerText = "Rp " + total.toLocaleString("id-ID");
}
function goToCart() {
  closeBag();
  window.location.href = "cart.html";
}
/* =====================
   FEEDBACK
===================== */
function cartFeedback() {
  const toast = document.createElement("div");
  toast.innerText = "✔ Added to Cart";
  Object.assign(toast.style, {
    position: "fixed",
    bottom: "30px",
    right: "30px",
    background: "#00ff99",
    color: "#000",
    padding: "12px 18px",
    borderRadius: "10px",
    fontWeight: "800",
    zIndex: 999,
    boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
    opacity: 0,
    transition: "0.3s ease"
  });

  document.body.appendChild(toast);
  requestAnimationFrame(() => (toast.style.opacity = 1));

  setTimeout(() => {
    toast.style.opacity = 0;
    setTimeout(() => toast.remove(), 300);
  }, 1500);
}

/* =====================
   PRODUCT DETAIL
===================== */
function openDetail(name, price, image, cat = "brand") {
  localStorage.setItem(
    "selectedProduct",
    JSON.stringify({ name, price, image, cat })
  );
  window.location.href = "product.html";
}

/* =====================
   SIZE PICKER
===================== */
let selectedSize = "40"; // Default size for catalog/home adds

function selectSize(btn) {
  document
    .querySelectorAll(".size-options button")
    .forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  selectedSize = btn.innerText;
}

/* =====================
   CART PAGE (cart.html)
===================== */
function renderCart() {
  const wrap = document.getElementById("cartItems");
  const totalEl = document.getElementById("cartTotal");
  if (!wrap) return;

  wrap.innerHTML = "";
  let total = 0;

  cart.forEach((item, i) => {
    total += item.price * item.qty;

    wrap.innerHTML += `
      <div class="cart-item">
        <img src="${item.image || 'images/placeholder.png'}">
        <div class="cart-info">
          <h4>${item.name}</h4>
          <p>Size: ${item.size}</p>
          <p>Rp ${item.price.toLocaleString("id-ID")}</p>

          <div class="cart-actions">
            <button onclick="changeQty(${i}, -1)">−</button>
            <span>${item.qty}</span>
            <button onclick="changeQty(${i}, 1)">+</button>
          </div>
        </div>
      </div>
    `;
  });

  totalEl.innerText = "Rp " + total.toLocaleString("id-ID");
}

function changeQty(index, delta) {
  cart[index].qty += delta;
  if (cart[index].qty <= 0) {
    cart.splice(index, 1);
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartBadge();
  if (document.getElementById("cartItems")) renderCart();
  if (document.getElementById("bagItems")) renderBag();
}

/* =====================
   FAQ
===================== */
document.addEventListener("DOMContentLoaded", () => {
  const faqs = document.querySelectorAll(".faq-question");

  faqs.forEach(btn => {
    btn.addEventListener("click", () => {
      const item = btn.parentElement;

      // optional: biar cuma 1 yang kebuka
      document.querySelectorAll(".faq-item").forEach(f => {
        if (f !== item) f.classList.remove("active");
      });

      item.classList.toggle("active");
    });
  });
});