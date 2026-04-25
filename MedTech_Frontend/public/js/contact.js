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

/* ── 1. HERO ENTRANCE ANIMATION ──────────────────────────── */
function initHeroAnimation() {
  const h1 = document.querySelector(".hero-h1");
  const tagline = document.querySelector(".hero-tagline");
  const body = document.querySelector(".hero-body");
  const formCard = document.querySelector(".form-card");
  const items = document.querySelectorAll(".contact-item");
  const eyebrow = document.querySelector(".eyebrow");

  // Animate eyebrow
  if (eyebrow) {
    eyebrow.style.opacity = "0";
    eyebrow.style.transform = "translateY(16px)";
    animate(eyebrow, { opacity: 1, translateY: 0 }, 0.6, 0.1);
  }

  // Headline
  if (h1) animate(h1, { opacity: 1, translateY: 0, blur: 0 }, 1.0, 0.25);

  // Tagline
  if (tagline) animate(tagline, { opacity: 1, translateY: 0 }, 0.7, 0.5);

  // Body text
  if (body) animate(body, { opacity: 1, translateY: 0 }, 0.7, 0.65);

  // Contact list items — stagger
  items.forEach((el, i) => {
    animate(el, { opacity: 1, translateX: 0 }, 0.65, 0.75 + i * 0.12);
  });

  // Form card
  if (formCard) animate(formCard, { opacity: 1, translateY: 0, blur: 0 }, 0.9, 0.35);
}

/* ── 2. SCROLL ANIMATIONS ─────────────────────────────────── */
function initScrollAnimations() {
  const mapTitle = document.querySelector(".map-title");
  const mapWrapper = document.querySelector(".map-wrapper");
  const mapEyebrow = document.querySelector(".map-section .eyebrow");

  observeReveal(mapEyebrow, 0);
  observeReveal(mapTitle, 0.1);
  observeReveal(mapWrapper, 0.2);
}

function observeReveal(el, delay = 0) {
  if (!el) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          el.style.transition = `opacity 0.75s ease, transform 0.75s cubic-bezier(0.25,1,0.5,1)`;
          el.style.opacity = "1";
          el.style.transform = "none";
        }, delay * 1000);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.15 });
  observer.observe(el);
}

/* ── 3. MICRO-UTILITY: smooth animate ────────────────────── */
function animate(el, props, duration = 0.6, delay = 0) {
  const transitions = [];
  if (props.opacity !== undefined) transitions.push(`opacity ${duration}s ease`);
  if (props.translateY !== undefined || props.translateX !== undefined) {
    transitions.push(`transform ${duration}s cubic-bezier(0.25,1,0.5,1)`);
  }
  if (props.blur !== undefined) transitions.push(`filter ${duration}s ease`);

  setTimeout(() => {
    el.style.transition = transitions.join(", ");
    el.style.opacity = props.opacity !== undefined ? props.opacity : "";
    const tx = props.translateX !== undefined ? `translateX(${props.translateX}px)` : "";
    const ty = props.translateY !== undefined ? `translateY(${props.translateY}px)` : "";
    el.style.transform = (tx + " " + ty).trim() || "none";
    if (props.blur !== undefined) {
      el.style.filter = props.blur === 0 ? "none" : `blur(${props.blur}px)`;
    }
  }, delay * 1000);
}

/* ── 4. FORM VALIDATION & SUBMISSION ─────────────────────── */
function initForm() {
  const form = document.getElementById("inquiryForm");
  const submitBtn = document.getElementById("submitBtn");
  const successEl = document.getElementById("formSuccess");

  if (!form) return;

  // Live validation — clear error on input
  form.querySelectorAll("input, textarea").forEach(el => {
    el.addEventListener("input", () => clearError(el));
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("name");
    const email = document.getElementById("email");
    const message = document.getElementById("message");

    let valid = true;

    // Validate name
    if (!name.value.trim() || name.value.trim().length < 2) {
      showError(name, "nameErr", "Please enter your full name.");
      valid = false;
    }

    // Validate email
    if (!isValidEmail(email.value)) {
      showError(email, "emailErr", "Please enter a valid email address.");
      valid = false;
    }

    // Validate message
    if (!message.value.trim() || message.value.trim().length < 10) {
      showError(message, "msgErr", "Please describe your concern (at least 10 characters).");
      valid = false;
    }

    if (!valid) return;

    // Simulate submission
    const btnText = submitBtn.querySelector(".btn-text");
    const btnArrow = submitBtn.querySelector(".btn-arrow");

    submitBtn.disabled = true;
    btnText.textContent = "Sending…";
    btnArrow.textContent = "↻";
    btnArrow.style.animation = "spin 0.8s linear infinite";

    setTimeout(() => {
      submitBtn.disabled = false;
      btnText.textContent = "Submit Inquiry";
      btnArrow.textContent = "→";
      btnArrow.style.animation = "";

      form.reset();

      successEl.textContent = "✓ Your inquiry has been sent. We'll get back to you shortly!";
      successEl.classList.add("visible");

      setTimeout(() => {
        successEl.classList.remove("visible");
        setTimeout(() => { successEl.textContent = ""; }, 400);
      }, 5000);
    }, 1400);
  });
}

function showError(input, errId, message) {
  input.classList.add("error");
  const errEl = document.getElementById(errId);
  if (errEl) errEl.textContent = message;
}

function clearError(input) {
  input.classList.remove("error");
  // Find sibling error span
  const parent = input.closest(".field-group");
  if (!parent) return;
  const errEl = parent.querySelector(".field-error");
  if (errEl) errEl.textContent = "";
}

function isValidEmail(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
}

/* ── 5. BUTTON SPIN KEYFRAME (injected) ──────────────────── */
(function injectKeyframes() {
  const style = document.createElement("style");
  style.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
  document.head.appendChild(style);
})();

/* ── INIT ─────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  initHeroAnimation();
  initScrollAnimations();
  initForm();
});


function toggleMenu() {
  // Hamburger menu
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

toggleMenu();
updateCartCount();
