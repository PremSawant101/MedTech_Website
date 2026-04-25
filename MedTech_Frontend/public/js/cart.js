// ✅ Email based cart (localStorage auth)

const BASE = "http://localhost:3000";
const userEmail = localStorage.getItem("userEmail");

function formatPrice(value) {
  return `₹${value}`;
}

// ============================
// ✅ RENDER CART
// ============================
async function renderCart() {
  try {
    // ✅ Not logged in → redirect
    if (!userEmail) {
      window.location.href = "./auth/login.html";
      return;
    }

    // ✅ Email query param se cart fetch karo
    const res = await fetch(`${BASE}/api/cart?email=${encodeURIComponent(userEmail)}`);
    const data = await res.json();

    // ✅ Array check — agar error object aaya toh empty treat karo
    const cart = Array.isArray(data) ? data : [];

    const cartItems = document.getElementById("cart-items");
    const emptyState = document.getElementById("empty-state");
    const checkoutBtn = document.getElementById("checkout-btn");

    if (!cart.length) {
      cartItems.innerHTML = "";
      emptyState.style.display = "block";
      checkoutBtn.style.pointerEvents = "none";
      checkoutBtn.style.opacity = "0.5";
      updateSummary([]);
      return;
    }

    emptyState.style.display = "none";
    checkoutBtn.style.pointerEvents = "auto";
    checkoutBtn.style.opacity = "1";

    cartItems.innerHTML = cart.map((item) => `
      <article class="cart-item">
        <img src="${item.image}" alt="${item.name}" />
        <div class="cart-info">
          <h3>${item.name}</h3>
          <p><strong>${formatPrice(item.price)}</strong></p>

          <div class="qty-controls">
            <button class="qty-btn" data-action="decrease" data-id="${item.productId}">-</button>
            <span>${item.quantity}</span>
            <button class="qty-btn" data-action="increase" data-id="${item.productId}">+</button>
          </div>

          <button class="remove-btn" data-action="remove" data-id="${item.productId}">Remove</button>
        </div>
        <div class="cart-price">${formatPrice(item.price * item.quantity)}</div>
      </article>
    `).join("");

    updateSummary(cart);
    attachHandlers();

  } catch (err) {
    console.error("Cart error:", err);
  }
}

// ============================
// ✅ ACTION HANDLERS
// ============================
function attachHandlers() {
  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", async () => {
      const action = button.dataset.action;
      const productId = button.dataset.id;

      if (action === "remove") {
        // ✅ cart/remove — email + productId
        await fetch(`${BASE}/api/cart/remove`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail, productId })
        });

      } else if (action === "increase") {
        // ✅ cart/update — increase
        await fetch(`${BASE}/api/cart/update`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail, productId, action: "increase" })
        });

      } else if (action === "decrease") {
        // ✅ cart/update — decrease
        await fetch(`${BASE}/api/cart/update`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail, productId, action: "decrease" })
        });
      }

      renderCart();
    });
  });
}

// ============================
// ✅ SUMMARY
// ============================
function updateSummary(cart) {
  const items = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const delivery = cart.length ? 99 : 0;
  const total = subtotal + delivery;

  document.getElementById("summary-items").textContent = items;
  document.getElementById("summary-subtotal").textContent = formatPrice(subtotal);
  document.getElementById("summary-delivery").textContent = formatPrice(delivery);
  document.getElementById("summary-total").textContent = formatPrice(total);
}

// ============================
// ✅ INIT
// ============================
renderCart();