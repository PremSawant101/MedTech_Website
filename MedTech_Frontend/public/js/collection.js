gsap.registerPlugin(ScrollTrigger);

const BASE = "http://localhost:3000";

// ============================
// STATE
// ============================
let allProducts = [];
let activeCategory = "all";
let minPrice = 0;
let maxPrice = 2000;

// ============================
// CART
// ============================

async function updateCartCount() {
  try {
    const userEmail = localStorage.getItem("userEmail");
    const token = localStorage.getItem("token");
    if (!userEmail || !token) return;

    const res = await fetch(`${BASE}/api/cart?email=${userEmail}`, {
      headers: { Authorization: token }
    });
    if (!res.ok) return;
    const cart = await res.json();
    if (!Array.isArray(cart)) return;

    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById("cart-count");
    if (badge) badge.textContent = count;
  } catch (err) {
    console.error("Cart count error:", err);
  }
}

async function addToCart(product) {
  const userEmail = localStorage.getItem("userEmail");
  if (!userEmail) {
    alert("Please login first");
    window.location.href = "auth/login.html";
    return;
  }
  try {
    await fetch(`${BASE}/api/cart`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userEmail, item: product })
    });
    updateCartCount();
  } catch (err) {
    console.error("Add to cart error:", err);
  }
}

// ============================
// PRODUCT CARD HTML
// ============================

function productCardHTML(product) {
  const discountedPrice = Math.round(
    product.price - (product.price * (product.discount || 0) / 100)
  );
  return `
    <article class="product-card" data-id="${product._id}">
      <a class="card-link" href="./product.html?id=${product._id}">
        ${product.discount > 0
      ? `<span class="product-badge">${product.discount}% OFF</span>`
      : ""}
        <div class="product-image-wrap">
          <img src="${product.image}" alt="${product.name}" loading="lazy">
        </div>
        <div class="product-content">
          <p class="product-category-tag">${product.category || ""}</p>
          <h3>${product.name}</h3>
          <p>${product.description || ""}</p>
          <div class="product-price">
            ${product.discount > 0
      ? `<span class="old-price">₹${product.price}</span>
                 <span class="new-price">₹${discountedPrice}</span>`
      : `<span class="new-price">₹${product.price}</span>`
    }
          </div>
        </div>
      </a>
      <div class="product-actions">
        <button class="cart-btn"
          data-id="${product._id}"
          data-name="${product.name}"
          data-price="${product.price}"
          data-discount="${product.discount || 0}"
          data-image="${product.image}">
          Add to Cart
        </button>
        <a class="buy-now-btn" href="./product.html?id=${product._id}">Buy Now</a>
      </div>
    </article>
  `;
}

// ============================
// FILTER + RENDER
// ============================

function getFilteredProducts() {
  return allProducts.filter(p => {
    const price = Math.round(p.price - (p.price * (p.discount || 0) / 100));
    const catMatch = activeCategory === "all" || p.category === activeCategory;
    const priceMatch = price >= minPrice && price <= maxPrice;
    return catMatch && priceMatch;
  });
}

function renderProducts(products, animate = true) {
  const grid = document.getElementById("collection-grid");

  grid.innerHTML = products.map(p => productCardHTML(p)).join("");
  document.getElementById("product-count").textContent =
    products ? products.length : 0;
  const cards = grid.querySelectorAll(".product-card");

  // ✅ ALWAYS visible by default
  cards.forEach(card => {
    card.style.opacity = "1";
    card.style.transform = "none";
  });

  // ✅ Only animate if needed
  if (animate) {
    gsap.fromTo(cards,
      { opacity: 0, y: 40, scale: 0.96 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        stagger: 0.06
      }
    );
  }
  initTiltEffect();
}

function applyFilters(animate = true) {
  const filtered = getFilteredProducts();
  renderProducts(filtered, animate);
  updateActiveFilterRow();
}

function updateActiveFilterRow() {
  const catTag = document.getElementById("active-cat-tag");
  const priceTag = document.getElementById("active-price-tag");

  catTag.textContent = activeCategory === "all" ? "All Products" : activeCategory;
  priceTag.textContent = `₹${minPrice} — ₹${maxPrice}`;
}

// ============================
// FILTER BAR STICKY
// ============================

function initStickyFilter() {
  const filterBar = document.getElementById("filter-bar");
  const sentinel = document.querySelector(".collection-header");

  ScrollTrigger.create({
    trigger: sentinel,
    start: "bottom top",
    onEnter: () => filterBar.classList.add("sticky"),
    onLeaveBack: () => filterBar.classList.remove("sticky"),
  });
}

// ============================
// CATEGORY TABS
// ============================

function initCategoryTabs() {
  const tabs = document.querySelectorAll(".filter-tab");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      activeCategory = tab.dataset.cat;

      // Animate tab indicator
      gsap.fromTo(tab,
        { scale: 0.92 },
        { scale: 1, duration: 0.25, ease: "back.out(2)" }
      );

      applyFilters();
    });
  });
}

// ============================
// PRICE RANGE SLIDER
// ============================

function initPriceSlider() {
  const sliderMin = document.getElementById("price-min");
  const sliderMax = document.getElementById("price-max");
  const fill = document.getElementById("range-fill");
  const display = document.getElementById("price-display");

  function updateFill() {
    const min = Number(sliderMin.value);
    const max = Number(sliderMax.value);
    const pMin = (min / 2000) * 100;
    const pMax = (max / 2000) * 100;
    fill.style.left = pMin + "%";
    fill.style.width = (pMax - pMin) + "%";
    display.textContent = `₹${min} — ₹${max}`;
  }

  sliderMin.addEventListener("input", () => {
    if (Number(sliderMin.value) > Number(sliderMax.value) - 100) {
      sliderMin.value = Number(sliderMax.value) - 100;
    }
    minPrice = Number(sliderMin.value);
    updateFill();
    applyFilters();
  });

  sliderMax.addEventListener("input", () => {
    if (Number(sliderMax.value) < Number(sliderMin.value) + 100) {
      sliderMax.value = Number(sliderMin.value) + 100;
    }
    maxPrice = Number(sliderMax.value);
    updateFill();
    applyFilters();
  });

  // Init fill
  updateFill();
}

// ============================
// RESET FILTERS
// ============================

function initResetButton() {
  document.getElementById("reset-btn")?.addEventListener("click", () => {
    // Reset category
    activeCategory = "all";
    document.querySelectorAll(".filter-tab").forEach(t => t.classList.remove("active"));
    document.querySelector('.filter-tab[data-cat="all"]').classList.add("active");

    // Reset price
    minPrice = 0; maxPrice = 2000;
    document.getElementById("price-min").value = 0;
    document.getElementById("price-max").value = 2000;
    document.getElementById("range-fill").style.left = "0%";
    document.getElementById("range-fill").style.width = "100%";
    document.getElementById("price-display").textContent = "₹0 — ₹2000";

    applyFilters();
  });
}

// ============================
// TILT EFFECT
// ============================

function initTiltEffect() {
  document.querySelectorAll(".product-card").forEach(card => {

    card.addEventListener("mousemove", (e) => {
      if (window.innerWidth <= 768) return;

      const rect = card.getBoundingClientRect();
      const rotateY = ((e.clientX - rect.left) / rect.width - 0.5) * 16;
      const rotateX = -(((e.clientY - rect.top) / rect.height) - 0.5) * 16;

      gsap.to(card, {
        rotateX,
        rotateY,
        transformPerspective: 1000,
        transformOrigin: "center",
        duration: 0.25,
        ease: "power2.out"
      });
    });

    card.addEventListener("mouseleave", () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.45,
        ease: "power3.out"
      });
    });

  });
}
// ============================
// HAMBURGER
// ============================

function toggleMenu() {
  const hamburger = document.getElementById("hamburger");
  const navItems = document.getElementById("nav-items");
  if (hamburger && navItems) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("open");
      navItems.classList.toggle("open");
    });
    navItems.querySelectorAll(".nav-item").forEach(link => {
      link.addEventListener("click", () => {
        hamburger.classList.remove("open");
        navItems.classList.remove("open");
      });
    });
  }
}

// ============================
// CART BUTTON — event delegation
// ============================

document.addEventListener("click", (e) => {
  const button = e.target.closest(".cart-btn");
  if (!button) return;
  e.preventDefault();
  e.stopPropagation();

  addToCart({
    _id: button.dataset.id,
    name: button.dataset.name,
    price: Number(button.dataset.price),
    discount: Number(button.dataset.discount || 0),
    image: button.dataset.image,
    size: button.dataset.size
  });

  const orig = button.textContent;
  button.textContent = "Added ✓";
  setTimeout(() => { button.textContent = orig; }, 1000);
});

// ============================
// LOAD PRODUCTS
// ============================

async function loadProducts() {
  try {
    const res = await fetch(`${BASE}/api/products`);
    allProducts = await res.json();

    if (!Array.isArray(allProducts)) allProducts = [];

    // Set max price based on actual products
    if (allProducts.length) {
      const prices = allProducts.map(p =>
        Math.round(p.price - (p.price * (p.discount || 0) / 100))
      );
      const actualMax = Math.ceil(Math.max(...prices) / 100) * 100;
      if (actualMax > 0) {
        maxPrice = actualMax;
        document.getElementById("price-max").max = actualMax;
        document.getElementById("price-min").max = actualMax;
        document.getElementById("price-max").value = actualMax;
        document.getElementById("price-display").textContent = `₹0 — ₹${actualMax}`;
        document.getElementById("range-fill").style.width = "100%";
      }
    }

    applyFilters(true);

  } catch (err) {
    console.error("Products load error:", err);
    document.getElementById("collection-grid").innerHTML =
      `<div class="empty-collection"><p>⚠️ Could not load products.</p></div>`;
  }
}

// ============================
// INIT
// ============================

toggleMenu();
updateCartCount();

loadProducts().then(() => {
  initCategoryTabs();
  initPriceSlider();
  initStickyFilter();
  initResetButton();
});