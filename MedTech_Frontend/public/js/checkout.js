// ✅ JWT + Backend Checkout (FINAL)

const token = localStorage.getItem("token");

function formatPrice(value) {
  return `₹${value}`;
}

// ============================
// ✅ LOAD CART FROM BACKEND
// ============================

async function loadCheckout() {
  try {
    if (!token) {
      window.location.href = "auth/login.html";
      return;
    }

    const res = await fetch("http://localhost:3000/api/cart", {
      headers: {
        Authorization: token
      }
    });

    const cart = await res.json();

    const checkoutItems = document.getElementById("checkout-items");

    checkoutItems.innerHTML = cart.map((item) => `
      <div class="checkout-item">
        <span>${item.name} × ${item.quantity}</span>
        <span>${formatPrice(item.price * item.quantity)}</span>
      </div>
    `).join("");

    updateSummary(cart);

  } catch (err) {
    console.error("Checkout load error:", err);
  }
}

// ============================
// ✅ SUMMARY
// ============================

function updateSummary(cart) {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const delivery = cart.length ? 99 : 0;
  const total = subtotal + delivery;

  document.getElementById("checkout-subtotal").textContent = formatPrice(subtotal);
  document.getElementById("checkout-delivery").textContent = formatPrice(delivery);
  document.getElementById("checkout-total").textContent = formatPrice(total);
}

// ============================
// ✅ PLACE ORDER
// ============================

document.getElementById("checkout-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    // 🔥 GET CART AGAIN
    const res = await fetch("http://localhost:3000/api/cart", {
      headers: {
        Authorization: token
      }
    });

    const cart = await res.json();

    if (!cart.length) {
      alert("Cart is empty");
      return;
    }

    // 🔥 CONVERT CART → ORDER FORMAT
    const products = cart.map(item => ({
      productId: item.productId,
      quantity: item.quantity
    }));

    // 🔐 SEND ORDER
    const orderRes = await fetch("http://localhost:3000/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token
      },
      body: JSON.stringify({
        products
      })
    });

    const data = await orderRes.json();

    if (orderRes.ok) {
      alert("Order placed successfully ✅");

      // 🔥 CLEAR CART
      await fetch("http://localhost:3000/api/cart", {
        method: "DELETE",
        headers: {
          Authorization: token
        }
      });

      window.location.href = "./collection.html";
    } else {
      alert(data.message || "Order failed");
    }

  } catch (err) {
    console.error("Checkout error:", err);
    alert("Something went wrong");
  }
});

// ============================
// INIT
// ============================

loadCheckout();