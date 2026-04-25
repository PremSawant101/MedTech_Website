// ── account.js ──

const BASE = "http://localhost:3000";
const token = localStorage.getItem("token");

let allOrders = [];

// ── HELPERS ──

function formatPrice(val) {
  return `₹${Number(val).toLocaleString("en-IN")}`;
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function getStatusClass(status) {
  const map = {
    pending: "status-pending",
    processing: "status-processing",
    approved: "status-processing",
    shipped: "status-shipped",
    delivered: "status-delivered",
    cancelled: "status-cancelled",
    waiting_for_prescription: "status-waiting",
  };
  return map[status] || "status-pending";
}

function getStatusLabel(status) {
  const map = {
    pending: "Pending",
    processing: "Processing",
    approved: "Approved",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
    waiting_for_prescription: "Prescription Required",
  };
  return map[status] || status;
}

function getStatusIcon(status) {
  const map = {
    pending: "⏳",
    processing: "⚙️",
    approved: "✅",
    shipped: "🚚",
    delivered: "📦",
    cancelled: "❌",
    waiting_for_prescription: "📋",
  };
  return map[status] || "⏳";
}

// ── HAMBURGER ──

function toggleMenu() {
  const hamburger = document.getElementById("hamburger");
  const navItems = document.getElementById("nav-items");
  if (hamburger && navItems) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("open");
      navItems.classList.toggle("open");
    });
    navItems.querySelectorAll(".nav-item").forEach((link) => {
      link.addEventListener("click", () => {
        hamburger.classList.remove("open");
        navItems.classList.remove("open");
      });
    });
  }
}

// ── LOGIN PROMPT ──

function showLoginPrompt() {
  document.querySelector(".account-layout").innerHTML = `
        <div class="login-prompt">
            <div class="login-prompt-icon">
                <svg width="64" height="64" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                </svg>
            </div>
            <h2>Please Login First</h2>
            <p>Login to view your orders and manage your account</p>
            <div class="login-prompt-btns">
                <a href="./auth/login.html" class="btn-primary">Login</a>
                <a href="./auth/signup.html" class="btn-secondary">Sign Up</a>
            </div>
        </div>
    `;
}

// ── USER PROFILE ──

function renderUser(name, email, role) {
  document.getElementById("user-name").textContent = name || "User";
  document.getElementById("user-email").textContent = email || "";

  const initial = (name || "U").charAt(0).toUpperCase();
  document.getElementById("user-avatar").textContent = initial;

  // ✅ Admin button
  if (role === "admin") {
    const sidebar = document.querySelector(".user-sidebar");
    const adminBtn = document.createElement("a");
    adminBtn.href = `${BASE}/admin`;
    adminBtn.className = "admin-btn";
    adminBtn.innerHTML = `
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            Admin Panel
        `;
    const logoutBtn = document.getElementById("logout-btn");
    sidebar.insertBefore(adminBtn, logoutBtn);
  }
}

// ── UPDATE STATS ──

function updateStats(orders) {
  const total = orders.length;
  const spent = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const delivered = orders.filter(o => o.status === "delivered").length;

  document.getElementById("stat-orders").textContent = total;
  document.getElementById("stat-spent").textContent = `₹${(spent / 1000).toFixed(1)}k`;
  document.getElementById("stat-delivered").textContent = delivered;
}

// ── RENDER ORDERS ──

function renderOrders(orders) {
  const container = document.getElementById("orders-container");

  if (!Array.isArray(orders) || !orders.length) {
    container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🛒</div>
                <h3>No Orders Yet</h3>
                <p>Start shopping to see your orders here</p>
                <a href="./collection.html" class="btn-primary">Shop Now</a>
            </div>
        `;
    return;
  }

  container.innerHTML = `
        <div class="orders-list">
            ${orders.map((order, i) => `
                <div class="order-card" style="animation-delay: ${i * 0.07}s">
                    <div class="order-header">
                        <div class="order-id-wrap">
                            <p class="order-id">Order #${order._id.slice(-6).toUpperCase()}</p>
                            <p class="order-date">${formatDate(order.createdAt)}</p>
                        </div>
                        <span class="status-badge ${getStatusClass(order.status)}">
                            ${getStatusIcon(order.status)} ${getStatusLabel(order.status)}
                        </span>
                    </div>

                    <div class="order-products">
                        ${order.products.map(p => `
                            <div class="order-product-row">
                                <div class="order-product-left">
                                    ${p.image ? `<img src="${p.image}" alt="${p.name}" class="order-product-img" onerror="this.style.display='none'">` : ""}
                                    <span class="order-product-name">${p.name || "Product"}</span>
                                </div>
                                <div class="order-product-right">
                                    <span class="order-qty">× ${p.quantity}</span>
                                    <span class="order-product-price">${formatPrice((p.price || 0) * (p.quantity || 1))}</span>
                                </div>
                            </div>
                        `).join("")}
                    </div>

                    <div class="order-footer">
                        <div class="order-items-count">${order.products.length} item${order.products.length > 1 ? "s" : ""}</div>
                        <div class="order-total-wrap">
                            <span class="order-total-label">Total</span>
                            <strong class="order-total">${formatPrice(order.totalAmount)}</strong>
                        </div>
                    </div>
                </div>
            `).join("")}
        </div>
    `;
}

// ── FILTER TABS ──

function initFilters() {
  document.querySelectorAll(".filter-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".filter-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      const filter = tab.dataset.filter;
      const filtered = filter === "all"
        ? allOrders
        : allOrders.filter(o => o.status === filter);

      renderOrders(filtered);
    });
  });
}

// ── LOADING ──

function showLoading() {
  document.getElementById("orders-container").innerHTML = `
        <div class="loading-state">
            <div class="spinner"></div>
            <p>Fetching your orders…</p>
        </div>
    `;
}

// ── ERROR ──

function renderError(msg) {
  document.getElementById("orders-container").innerHTML = `
        <div class="error-state">
            <div class="error-icon">⚠️</div>
            <p>${msg}</p>
            <button onclick="init()" class="btn-primary" style="margin-top:1rem">Retry</button>
        </div>
    `;
}

// ── LOGOUT ──

document.getElementById("logout-btn").addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "./auth/login.html";
});

// ── CART COUNT ──

async function updateCartCount() {
  try {
    const userEmail = localStorage.getItem("userEmail");
    const token = localStorage.getItem("token");
    if (!userEmail || !token) return;

    const res = await fetch(`${BASE}/api/cart?email=${userEmail}`, {
      headers: { Authorization: token }  // ✅ auth header add kiya
    });

    if (!res.ok) return; // ✅ 401/error pe crash nahi karega

    const cart = await res.json();

    if (!Array.isArray(cart)) return; // ✅ array nahi to crash nahi

    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById("cart-count");
    if (badge) badge.textContent = count;
  } catch (err) {
    console.error("Cart count error:", err);
  }
}

// ── INIT ──

async function init() {
  const userName = localStorage.getItem("userName");
  const userEmail = localStorage.getItem("userEmail");
  const userRole = localStorage.getItem("userRole");

  if (!token) {
    showLoginPrompt();
    return;
  }

  renderUser(userName, userEmail, userRole);
  initFilters();
  showLoading();

  try {
    const res = await fetch(`${BASE}/api/orders?mine=true`, {
      headers: { Authorization: token }
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Unauthorized");

    allOrders = Array.isArray(data) ? data : [];

    updateStats(allOrders);
    renderOrders(allOrders);

  } catch (err) {
    console.error("Orders error:", err);
    renderError("Failed to load orders. Please try again.");
  }
}

toggleMenu();
updateCartCount();
init();