// ── blog.js ──

const BASE = "http://localhost:3000";

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
// ✅ Cart Count
async function updateCartCount() {
  try {
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) return;

    const res = await fetch(`http://localhost:3000/api/cart?email=${encodeURIComponent(userEmail)}`);
    const data = await res.json();
    const cart = Array.isArray(data) ? data : [];

    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById("cart-count");
    if (badge) badge.textContent = count;
  } catch (err) {
    console.error("Cart count error:", err);
  }
}
// ✅ Hamburger Menu
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

function getExcerpt(content, maxLength = 140) {
  if (!content) return "";
  return content.length > maxLength
    ? content.slice(0, maxLength).trim() + "…"
    : content;
}

async function loadBlogs() {
  const container = document.getElementById("blogs-container");

  try {
    const res = await fetch(`${BASE}/api/blogs`);
    const blogs = await res.json();

    if (!blogs.length) {
      container.innerHTML = `
        <div class="empty-state">
          <p>No articles published yet. Check back soon!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = blogs.map((blog, i) => `
      <a class="blog-card" href="./blog-detail.html?id=${blog._id}"
         style="animation-delay: ${i * 0.08}s">

        ${blog.image
        ? `<img class="blog-card-img" src="${blog.image}" alt="${blog.title}" loading="lazy">`
        : `<div class="blog-card-img-placeholder">
               <svg width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                 <rect x="3" y="3" width="18" height="18" rx="2"/>
                 <circle cx="8.5" cy="8.5" r="1.5"/>
                 <polyline points="21 15 16 10 5 21"/>
               </svg>
             </div>`
      }

        <div class="blog-card-body">
          <p class="blog-card-date">${formatDate(blog.createdAt)}</p>
          <h2 class="blog-card-title">${blog.title}</h2>
          <p class="blog-card-excerpt">${getExcerpt(blog.content)}</p>
          <div class="blog-card-footer">
            <span class="read-more">
              Read Article
              <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </span>
          </div>
        </div>
      </a>
    `).join("");

  } catch (err) {
    console.error("Blog fetch error:", err);
    container.innerHTML = `
      <div class="empty-state error-state">
        <p>⚠️ Could not load articles. Please try again.</p>
      </div>
    `;
  }
}

loadBlogs();
toggleMenu();
updateCartCount();
