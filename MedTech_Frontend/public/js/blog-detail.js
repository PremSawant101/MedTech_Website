const BASE = "http://localhost:3000";

// FORMAT DATE
function formatDate(dateStr) {
  if (!dateStr) return "";

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


//  LOAD BLOG DETAIL
async function loadBlogDetail() {
  const container = document.getElementById("blog-detail");

  if (!container) {
    console.error("Container not found ❌");
    return;
  }

  // LOADER
  container.innerHTML = `<p style="text-align:center;">Loading blog...</p>`;

  //  GET ID FROM URL (SAFE)
  const params = new URLSearchParams(window.location.search);

  const id =
    params.get("id") ||
    params.get("_id") ||
    params.get("blogId");

  console.log("BLOG ID:", id);

  // NO ID
  if (!id) {
    container.innerHTML = `
      <a href="./blog.html" class="back-btn">⬅ Back to Blog</a>
      <div class="error-state">
        <p>⚠️ Blog not found.</p>
      </div>
    `;
    return;
  }

  try {
    const url = `${BASE}/api/blogs/${id}`;
    console.log("FETCH URL:", url);

    const res = await fetch(url);

    if (!res.ok) throw new Error("Blog not found");

    const blog = await res.json();

    console.log("BLOG DATA:", blog);
    console.log(blog._id)

    //INVALID DATA
    if (!blog || !blog.title) {
      throw new Error("Invalid blog data");
    }

    //PAGE TITLE
    document.title = `${blog.title} – MedTech`;

    //RENDER BLOG
    container.innerHTML = `
      <a href="./blog.html" class="back-btn">
        ⬅ Back to Blog
      </a>

      <article class="blog-detail-content">

        <div class="blog-detail-meta">
          <p class="eyebrow">Health & Wellness</p>
          <p class="blog-detail-date">${formatDate(blog.createdAt)}</p>
          <h1 class="blog-detail-title">${blog.title}</h1>
        </div>

        ${blog.image
        ? `<img class="blog-detail-img" src="${blog.image}" alt="${blog.title}">`
        : ""
      }

        <div class="blog-detail-body">
          ${blog.content || ""}
        </div>

      </article>
    `;
  } catch (err) {
    console.error("BLOG DETAIL ERROR:", err);

    container.innerHTML = `
      <a href="./blog.html" class="back-btn">
        ⬅ Back to Blog
      </a>

      <div class="error-state">
        <p>⚠️ Could not load this article.</p>
      </div>
    `;
  }
}

// 🚀 RUN
loadBlogDetail();
toggleMenu();
updateCartCount();
