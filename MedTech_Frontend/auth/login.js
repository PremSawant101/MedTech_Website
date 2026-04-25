// ── login.js ──

const form = document.getElementById("login-form");
const message = document.getElementById("message");
const btn = document.getElementById("login-btn");
const btnText = document.getElementById("btn-text");
const btnLoader = document.getElementById("btn-loader");

// ✅ BASE URLs
const BASE = window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://med-tech-website.vercel.app";

const FRONTEND_URL = window.location.hostname === "localhost"
    ? "http://127.0.0.1:5500"
    : "https://your-frontend-url.vercel.app";

// ── Toggle Password Visibility ──
function togglePassword(inputId, toggleBtn) {
    const input = document.getElementById(inputId);
    const isHidden = input.type === "password";

    input.type = isHidden ? "text" : "password";

    toggleBtn.innerHTML = isHidden
        ? `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
        </svg>`
        : `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
        </svg>`;
}

// ── Show Message ──
function showMessage(text, type = "error") {
    message.textContent = text;
    message.className = `auth-message ${type}`;
}

// ── Loading State ──
function setLoading(loading) {
    btn.disabled = loading;
    btnText.textContent = loading ? "Logging in..." : "Login";
    btnLoader.classList.toggle("hidden", !loading);
}

// ── Form Submit ──
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
        showMessage("Please fill all fields.");
        return;
    }

    try {
        setLoading(true);
        showMessage("");

        const res = await fetch(`${BASE}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();
        console.log("LOGIN RESPONSE:", data);

        if (res.ok) {

            // ✅ Saari values localStorage me save karo
            localStorage.setItem("userEmail", data.user.email);
            localStorage.setItem("token", data.token);
            localStorage.setItem("userName", data.user.name);
            localStorage.setItem("userRole", data.user.role);

            showMessage("Login successful ✅", "success");

            setTimeout(() => {
                if (data.user.role === "admin") {
                    // ✅ URL params me token pass karo Next.js admin ko
                    const params = new URLSearchParams({
                        token: data.token,
                        role: data.user.role,
                        name: data.user.name,
                        email: data.user.email,
                    });
                    window.location.href = `${BASE}/admin?${params.toString()}`;
                } else {
                    window.location.href = `${FRONTEND_URL}/MedTech_Frontend/index.html`;
                }
            }, 500);

        } else {
            showMessage(data.message || "Invalid credentials.");
        }

    } catch (err) {
        console.error("LOGIN ERROR:", err);
        showMessage("Server error. Please try again.");
    } finally {
        setLoading(false);
    }
});

// ── Google Login ──
function googleLogin() {
    window.location.href =
        `${BASE}/api/auth/signin/google?callbackUrl=` +
        encodeURIComponent(`${ADMIN_URL}/admin`);
}