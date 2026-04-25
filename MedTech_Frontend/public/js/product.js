gsap.registerPlugin(ScrollTrigger);

const BASE = "http://localhost:3000";
const params = new URLSearchParams(window.location.search);
const id = params.get("id");
let product = null;

// ============================
// CART — Backend API
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
// ✅ RENDER INGREDIENTS — Story Section
// ============================

function renderIngredients(ingredients) {
  const stepsEl = document.getElementById("story-steps");
  const stageEl = document.getElementById("floating-stage");
  const storySection = document.getElementById("story-section");

  // Hide story section if no ingredients
  if (!ingredients || !ingredients.length) {
    if (storySection) storySection.style.display = "none";
    return;
  }

  // ✅ Steps (left side) — ingredient name as heading, description as para
  stepsEl.innerHTML = ingredients.map((ing, i) => `
    <div class="story-step ${i === 0 ? "active" : ""} tilt-card">
      <span>0${i + 1}</span>
      <div>
        <h3>${ing.name}</h3>
        <p>${ing.description || "A key ingredient in this premium formula."}</p>
      </div>
    </div>
  `).join("");

  // ✅ Floating cards (right side) — ingredient images
  const floatClasses = ["card-a", "card-b", "card-c"];
  const visibleIngredients = ingredients.slice(0, 3);

  stageEl.innerHTML = visibleIngredients.map((ing, i) => `
    <div class="floating-card ${floatClasses[i] || ""} tilt-card">
      <img
        src="${ing.image || `assets/images/cover-0${i + 1}.jpg`}"
        alt="${ing.name}"
        onerror="this.src='assets/images/cover-0${i + 1}.jpg'"
      />
      <div class="floating-card-content">
        <h4>${ing.name}</h4>
        <p>${ing.description ? ing.description.substring(0, 50) + "..." : "Premium ingredient"}</p>
      </div>
    </div>
  `).join("");
}

// ============================
// ✅ RENDER HOW TO USE — Content Section
// ============================

function renderHowToUse(howToUse) {
  const el = document.getElementById("how-to-use-text");
  if (!el) return;

  if (!howToUse || !howToUse.trim()) {
    el.innerHTML = `<em style="color: var(--muted)">How to use information coming soon.</em>`;
    return;
  }

  // ✅ If howToUse has numbered steps (1. 2. 3.) render as styled list
  const lines = howToUse.split("\n").filter(l => l.trim());
  const hasSteps = lines.some(l => /^\d+[\.\)]/.test(l.trim()));

  if (hasSteps) {
    el.innerHTML = lines.map(line => {
      const isStep = /^\d+[\.\)]/.test(line.trim());
      return isStep
        ? `<div class="how-to-step">${line.trim()}</div>`
        : `<p class="how-to-note">${line.trim()}</p>`;
    }).join("");
  } else {
    el.textContent = howToUse;
  }
}

// ============================
// LOAD PRODUCT
// ============================

async function loadProduct() {
  try {
    const res = await fetch(`${BASE}/api/products/${id}`);
    product = await res.json();

    if (!product || product.message) {
      document.body.innerHTML = "<h2 style='text-align:center;padding:4rem'>Product not found</h2>";
      return;
    }

    // Basic info
    document.getElementById("product-title").textContent = product.name;
    document.getElementById("product-image").src = product.image;
    document.getElementById("product-image").alt = product.name;
    document.getElementById("product-description").textContent = product.description;

    // Discount badge
    const badge = document.getElementById("discount-badge");
    if (product.discount > 0) {
      badge.textContent = `${product.discount}% OFF`;
      badge.style.display = "inline-block";
    } else {
      badge.style.display = "none";
    }

    // Prices
    const newPrice = Math.round(product.price - (product.price * (product.discount || 0) / 100));
    document.getElementById("new-price").textContent = `₹${newPrice}`;
    document.getElementById("old-price").textContent = product.discount > 0 ? `₹${product.price}` : "";

    // Size options
    const sizeOptions = document.getElementById("size-options");
    sizeOptions.innerHTML = "";
    const sizes = ["50 ml", "100 ml", "150 ml"];
    let selectedSize = sizes[0];

    sizes.forEach((size, index) => {
      const btn = document.createElement("button");
      btn.className = "size-pill" + (index === 0 ? " active" : "");
      btn.textContent = size;
      btn.addEventListener("click", () => {
        document.querySelectorAll(".size-pill").forEach(p => p.classList.remove("active"));
        btn.classList.add("active");
        selectedSize = size;
      });
      sizeOptions.appendChild(btn);
    });

    // Add to cart
    document.getElementById("add-to-cart-btn").onclick = function () {
      addToCart({
        _id: product._id, name: product.name,
        price: product.price, discount: product.discount,
        image: product.image, size: selectedSize
      });
      const orig = this.textContent;
      this.textContent = "Added ✓";
      setTimeout(() => { this.textContent = orig; }, 1000);
    };

    // Buy now
    document.getElementById("buy-now-btn").onclick = () => {
      addToCart({
        _id: product._id, name: product.name,
        price: product.price, discount: product.discount,
        image: product.image, size: selectedSize
      });
      window.location.href = "./checkout.html";
    };

    // ✅ Render ingredients in story section
    renderIngredients(product.ingredients || []);

    // ✅ Render how to use
    renderHowToUse(product.howToUse || "");

  } catch (err) {
    console.error("Product load error:", err);
  }
}

// SUGGESTED PRODUCTS
async function renderSuggestedProducts() {
  try {
    const res = await fetch(`${BASE}/api/products`);
    const allProducts = await res.json();
    const suggestedGrid = document.getElementById("suggested-grid");
    if (!suggestedGrid) return;
    const others = allProducts.filter(item => item._id !== product._id).slice(0, 3);
    suggestedGrid.innerHTML = others.map(item => `
      <article class="suggested-card tilt-card">
        <a href="./product.html?id=${item._id}" class="suggested-link">
          <img src="${item.image}" alt="${item.name}">
          <h3>${item.name}</h3>
          <p>${(item.description || "").substring(0, 60)}...</p>
          <div class="suggested-price">
            ${item.discount > 0 ? `<span class="old-price">₹${item.price}</span>` : ""}
            <span class="new-price">₹${Math.round(item.price - (item.price * (item.discount || 0) / 100))}</span>
          </div>
        </a>
        <button class="suggested-btn" data-id="${item._id}" data-name="${item.name}"
          data-price="${item.price}" data-discount="${item.discount || 0}"
          data-image="${item.image}" data-size="100 ml">Add to Cart</button>
      </article>
    `).join("");
    document.querySelectorAll(".suggested-btn").forEach(button => {
      button.addEventListener("click", () => {
        addToCart({ _id: button.dataset.id, name: button.dataset.name, price: Number(button.dataset.price), discount: Number(button.dataset.discount || 0), image: button.dataset.image, size: button.dataset.size });
        const orig = button.textContent; button.textContent = "Added ✓";
        setTimeout(() => { button.textContent = orig; }, 1000);
      });
    });
  } catch (err) { console.error("Suggested error:", err); }

}

// ============================
// GSAP ANIMATIONS
// ============================

gsap.from(".product-visual", { y: 50, opacity: 0, duration: 0.9, ease: "power3.out" });
gsap.from(".product-info > *", { y: 24, opacity: 0, duration: 0.75, stagger: 0.08, delay: 0.12, ease: "power3.out" });

gsap.utils.toArray(".review-card, .suggested-card, .story-step, .card-block, .ingredient-panel").forEach((item, index) => {
  gsap.from(item, {
    scrollTrigger: { trigger: item, start: "top 88%" },
    y: 40, opacity: 0, duration: 0.8,
    delay: index * 0.03, ease: "power3.out"
  });
});

// ============================
// TILT EFFECT
// ============================

function initTiltEffect() {
  const maxRotate = 10;

  document.querySelectorAll(".tilt-card, .visual-card").forEach(card => {
    if (card.classList.contains("floating-card")) return;

    card.addEventListener("mousemove", (e) => {
      if (window.innerWidth <= 768) return;
      const rect = card.getBoundingClientRect();
      const rotateY = ((e.clientX - rect.left) / rect.width - 0.5) * maxRotate * 2;
      const rotateX = -(((e.clientY - rect.top) / rect.height) - 0.5) * maxRotate * 2;

      gsap.to(card, {
        rotateX, rotateY,
        duration: 0.25,
        ease: "power2.out",
        transformPerspective: 1000,
        transformOrigin: "center center"
      });
    });

    card.addEventListener("mouseleave", () => {
      gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.45, ease: "power3.out" });
    });
  });

  const zDefaults = { "card-a": 1, "card-b": 3, "card-c": 2 };

  document.querySelectorAll(".floating-card").forEach(card => {
    const defaultZ = zDefaults[
      card.classList.contains("card-a") ? "card-a" :
        card.classList.contains("card-b") ? "card-b" : "card-c"
    ] || 1;

    card.addEventListener("mouseenter", () => {
      card.style.zIndex = 10;
    });

    card.addEventListener("mousemove", (e) => {
      if (window.innerWidth <= 768) return;
      const rect = card.getBoundingClientRect();
      const rotateY = ((e.clientX - rect.left) / rect.width - 0.5) * maxRotate * 2;
      const rotateX = -(((e.clientY - rect.top) / rect.height) - 0.5) * maxRotate * 2;

      gsap.to(card, {
        rotateX,
        rotateY,
        scale: 1.04,
        rotate: 0,
        duration: 0.25,
        ease: "power2.out",
        transformPerspective: 1000,
        transformOrigin: "center center",
        overwrite: "auto"
      });
    });

    card.addEventListener("mouseleave", () => {
      card.style.zIndex = defaultZ;

      const origRotate =
        card.classList.contains("card-a") ? -10 :
          card.classList.contains("card-b") ? 6 : -5;

      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        rotate: origRotate,
        scale: 1,
        duration: 0.45,
        ease: "power3.out",
        overwrite: "auto"
      });
    });
  });
}

let reviewsData = [];
let currentSlide = 0;

function getVisibleCount() {
  if (window.innerWidth <= 680) return 1;
  if (window.innerWidth <= 1024) return 2;
  return 3;
}

function buildSliderHTML() {
  const section = document.querySelector(".reviews-section");
  if (!section) return;
  section.querySelector(".reviews-marquee")?.remove();
  section.querySelector(".reviews-slider-wrap")?.remove();
  section.querySelector(".reviews-nav")?.remove();

  section.insertAdjacentHTML("beforeend", `
    <div class="reviews-slider-wrap">
      <div class="reviews-grid" id="reviews-grid"></div>
    </div>
    <div class="reviews-nav">
      <button class="reviews-nav-btn" id="rev-prev">←</button>
      <div class="reviews-dots" id="reviews-dots"></div>
      <button class="reviews-nav-btn" id="rev-next">→</button>
    </div>
  `);

  document.getElementById("rev-prev").addEventListener("click", () => {
    if (currentSlide > 0) renderSlide(currentSlide - 1);
  });
  document.getElementById("rev-next").addEventListener("click", () => {
    const max = Math.ceil(reviewsData.length / getVisibleCount()) - 1;
    if (currentSlide < max) renderSlide(currentSlide + 1);
  });
}

function renderSlide(slideIndex) {
  const grid = document.getElementById("reviews-grid");
  const dotsEl = document.getElementById("reviews-dots");
  const prevBtn = document.getElementById("rev-prev");
  const nextBtn = document.getElementById("rev-next");
  if (!grid || !reviewsData.length) return;

  const visible = getVisibleCount();
  const totalSlides = Math.ceil(reviewsData.length / visible);
  currentSlide = Math.max(0, Math.min(slideIndex, totalSlides - 1));

  const slice = reviewsData.slice(currentSlide * visible, currentSlide * visible + visible);
  grid.style.gridTemplateColumns = `repeat(${Math.min(visible, slice.length)}, 1fr)`;

  grid.innerHTML = slice.map(r => `
    <article class="review-card">
      <div class="stars">${"★".repeat(r.rating || 5)}${"☆".repeat(5 - (r.rating || 5))}</div>
      <p class="review-para">"${r.comment}"</p>
      <div>
        <span class="review-author">— ${r.name || "Customer"}</span>
        ${r.product ? `<span class="review-product-tag">${r.product}</span>` : ""}
      </div>
    </article>
  `).join("");

  dotsEl.innerHTML = Array.from({ length: totalSlides }, (_, i) => `
    <button class="reviews-dot ${i === currentSlide ? "active" : ""}" data-slide="${i}"></button>
  `).join("");

  dotsEl.querySelectorAll(".reviews-dot").forEach(dot => {
    dot.addEventListener("click", () => renderSlide(Number(dot.dataset.slide)));
  });

  prevBtn.disabled = currentSlide === 0;
  nextBtn.disabled = currentSlide >= totalSlides - 1;

  gsap.from(grid.children, { y: 20, opacity: 0, duration: 0.4, stagger: 0.08, ease: "power3.out" });
}

async function loadReviews() {
  try {
    const res = await fetch(`${BASE}/api/reviews`);
    const reviews = await res.json();

    let data = [];
    if (Array.isArray(reviews) && reviews.length) {
      data = reviews;
    } else {
      // Fallback: parse static HTML reviews
      data = Array.from(document.querySelectorAll(".review-card")).map(card => ({
        rating: 5,
        comment: card.querySelector(".review-para")?.textContent?.replace(/['"]/g, "") || "",
        name: (card.querySelector("h3, span")?.textContent || "Customer").replace("- ", ""),
        product: ""
      }));
    }

    if (!data.length) return;
    reviewsData = data;
    buildSliderHTML();
    renderSlide(0);

    // Update on resize
    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => renderSlide(0), 250);
    });
  } catch (err) {
    console.error("Reviews load error:", err);
  }
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
// INIT
// ============================

loadProduct().then(async () => {
  await renderSuggestedProducts();
  initTiltEffect();
  loadReviews();
});
toggleMenu();
updateCartCount();