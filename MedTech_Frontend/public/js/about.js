gsap.registerPlugin(ScrollTrigger);

const BASE = window.location.hostname === "localhost"
  ? "http://localhost:3000"
  : "https://med-tech-website.vercel.app";

// ✅ Cart Count
async function updateCartCount() {
  try {
    const userEmail = localStorage.getItem("userEmail");
    const token = localStorage.getItem("token");
    if (!userEmail || !token) return;

    const res = await fetch(`${BASE}/api/cart?email=${encodeURIComponent(userEmail)}`, {
      headers: { Authorization: token }
    });

    if (!res.ok) return;

    const data = await res.json();
    const cart = Array.isArray(data) ? data : [];
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById("cart-count");
    if (badge) badge.textContent = count;
  } catch (err) {
    console.error("Cart count error:", err);
  }
}

/* ─── UTILS ─────────────────────────────────────────────── */

const ease = {
  smooth: "power3.out",
  expo: "expo.out",
  back: "back.out(1.4)",
  circ: "circ.out",
};

/* ─── 1. HERO ANIMATION ─────────────────────────────────── */

function initHero() {
  const eyebrow = document.querySelector(".hero-eyebrow");
  const h1 = document.querySelector(".hero-h1");
  const sub = document.querySelector(".hero-sub");
  const rating = document.querySelector(".hero-rating");
  const img = document.querySelector(".hero-right > img");
  const scrollHint = document.querySelector(".hero-scroll-hint");
  const scrollLine = document.querySelector(".hero-scroll-line");
  const rings = document.querySelectorAll(".hero-bg-ring");
  const floatCards = document.querySelectorAll(".hero-float-card");

  if (!eyebrow) return;

  // Initial states
  gsap.set([eyebrow, sub, rating], { opacity: 0, y: 24, filter: "blur(4px)" });
  gsap.set(h1, { opacity: 0, y: 48, filter: "blur(8px)" });
  gsap.set(img, { opacity: 0, scale: 1.06, filter: "blur(6px)" });
  gsap.set(scrollHint, { opacity: 0, y: 10 });
  gsap.set(floatCards, { opacity: 0, scale: 0.88, y: 20 });

  const tl = gsap.timeline({ delay: 0.15 });

  // Image fades in first
  tl.to(img, {
    opacity: 1, scale: 1, filter: "blur(0px)",
    duration: 1.6, ease: ease.expo,
  });

  // Eyebrow
  tl.to(eyebrow, {
    opacity: 1, y: 0, filter: "blur(0px)",
    duration: 0.9, ease: ease.smooth,
  }, "-=1.1");

  // Heading
  tl.to(h1, {
    opacity: 1, y: 0, filter: "blur(0px)",
    duration: 1.1, ease: ease.expo,
  }, "-=0.7");

  // Subtext
  tl.to(sub, {
    opacity: 1, y: 0, filter: "blur(0px)",
    duration: 0.8, ease: ease.smooth,
  }, "-=0.6");

  // Rating badge
  tl.to(rating, {
    opacity: 1, y: 0, filter: "blur(0px)",
    duration: 0.7, ease: ease.back,
  }, "-=0.5");

  // ✅ Floating cards pop in with stagger
  tl.to(floatCards, {
    opacity: 1, scale: 1, y: 0,
    duration: 0.7, ease: ease.back,
    stagger: 0.2,
  }, "-=0.4");

  // Scroll hint
  tl.to(scrollHint, { opacity: 1, y: 0, duration: 0.6, ease: ease.smooth }, "-=0.3");
  tl.to(scrollLine, { scaleX: 1, duration: 0.7, ease: ease.expo }, "<");

  // Rings pulse
  rings.forEach((ring, i) => {
    gsap.to(ring, {
      scale: 1.06, opacity: 0.6,
      duration: 4 + i * 1.5,
      repeat: -1, yoyo: true,
      ease: "sine.inOut", delay: i * 0.8,
    });
  });

  // ✅ Subtle float animation on cards (up-down)
  floatCards.forEach((card, i) => {
    gsap.to(card, {
      y: i % 2 === 0 ? -8 : 8,
      duration: 2.5 + i * 0.5,
      repeat: -1, yoyo: true,
      ease: "sine.inOut",
      delay: i * 0.4,
    });
  });

  // Parallax on scroll
  gsap.to(".hero-right > img", {
    y: "18%", ease: "none",
    scrollTrigger: {
      trigger: ".about-hero",
      start: "top top", end: "bottom top", scrub: true,
    },
  });

  gsap.to(".hero-left", {
    y: "8%", ease: "none",
    scrollTrigger: {
      trigger: ".about-hero",
      start: "top top", end: "bottom top", scrub: true,
    },
  });
}

/* ─── 2. SCROLL REVEALS ─────────────────────────────────── */

function initScrollReveals() {
  gsap.utils.toArray(".reveal").forEach((el, i) => {
    gsap.fromTo(el,
      { opacity: 0, y: 44, filter: "blur(6px)" },
      {
        opacity: 1, y: 0, filter: "blur(0px)",
        duration: 0.95, ease: ease.smooth,
        scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" },
        delay: i * 0.07,
      }
    );
  });

  gsap.utils.toArray(".reveal-left").forEach((el) => {
    gsap.fromTo(el,
      { opacity: 0, x: -52, filter: "blur(5px)" },
      {
        opacity: 1, x: 0, filter: "blur(0px)",
        duration: 1.05, ease: ease.expo,
        scrollTrigger: { trigger: el, start: "top 86%", toggleActions: "play none none none" },
      }
    );
  });

  gsap.utils.toArray(".reveal-right").forEach((el) => {
    gsap.fromTo(el,
      { opacity: 0, x: 52, filter: "blur(5px)" },
      {
        opacity: 1, x: 0, filter: "blur(0px)",
        duration: 1.05, ease: ease.expo,
        scrollTrigger: { trigger: el, start: "top 86%", toggleActions: "play none none none" },
      }
    );
  });
}

/* ─── 3. CARDS ───────────────────────────────────────────── */

function initCards() {
  const cards = document.querySelectorAll(".card");
  if (!cards.length) return;

  gsap.fromTo(cards,
    { opacity: 0, y: 50, filter: "blur(5px)" },
    {
      opacity: 1, y: 0, filter: "blur(0px)",
      duration: 0.9, ease: ease.smooth, stagger: 0.18,
      scrollTrigger: { trigger: ".about-cards", start: "top 82%", toggleActions: "play none none none" },
    }
  );
}

/* ─── 4. ABOUT MAIN ─────────────────────────────────────── */

function initAboutMain() {
  const textEls = document.querySelectorAll(".about-text > *");
  if (!textEls.length) return;

  gsap.fromTo(textEls,
    { opacity: 0, y: 28 },
    {
      opacity: 1, y: 0,
      duration: 0.75, ease: ease.smooth, stagger: 0.1,
      scrollTrigger: { trigger: ".about-main", start: "top 78%", toggleActions: "play none none none" },
    }
  );

  const badge = document.querySelector(".about-image-badge");
  if (badge) {
    gsap.fromTo(badge,
      { opacity: 0, scale: 0.6, y: 20 },
      {
        opacity: 1, scale: 1, y: 0,
        duration: 0.7, ease: ease.back,
        scrollTrigger: { trigger: ".about-image", start: "top 75%", toggleActions: "play none none none" },
        delay: 0.4,
      }
    );
  }
}

/* ─── 5. TEAM ────────────────────────────────────────────── */

function initTeam() {
  const teamCards = document.querySelectorAll(".team-card");
  if (!teamCards.length) return;

  teamCards.forEach((card, i) => {
    gsap.fromTo(card,
      { opacity: 0, y: 60, rotateY: i % 2 === 0 ? -6 : 6 },
      {
        opacity: 1, y: 0, rotateY: 0,
        duration: 1, ease: ease.expo,
        scrollTrigger: { trigger: ".team", start: "top 80%", toggleActions: "play none none none" },
        delay: i * 0.2,
      }
    );
  });
}

/* ─── 6. FOOTER ──────────────────────────────────────────── */

function initFooter() {
  const cols = document.querySelectorAll(".footer-col");
  if (!cols.length) return;

  gsap.fromTo(cols,
    { opacity: 0, y: 24 },
    {
      opacity: 1, y: 0,
      duration: 0.8, ease: ease.smooth, stagger: 0.1,
      scrollTrigger: { trigger: ".footer", start: "top 92%", toggleActions: "play none none none" },
    }
  );
}

/* ─── 7. CARD HOVERS ─────────────────────────────────────── */

function initCardHovers() {
  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("mouseenter", () => {
      gsap.to(card.querySelector(".card-number"), { y: -6, opacity: 0.4, duration: 0.4, ease: ease.smooth });
    });
    card.addEventListener("mouseleave", () => {
      gsap.to(card.querySelector(".card-number"), { y: 0, opacity: 1, duration: 0.5, ease: ease.smooth });
    });
  });
}

/* ─── HAMBURGER ──────────────────────────────────────────── */

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

/* ─── INIT ALL ───────────────────────────────────────────── */

window.addEventListener("DOMContentLoaded", () => {
  initHero();
  initScrollReveals();
  initCards();
  initAboutMain();
  initTeam();
  initFooter();
  initCardHovers();
});

toggleMenu();
updateCartCount();