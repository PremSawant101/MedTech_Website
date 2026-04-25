// ── signup.js ──

const form = document.getElementById("signup-form");
const message = document.getElementById("message");
const btn = document.getElementById("signup-btn");
const btnText = document.getElementById("btn-text");
const btnLoader = document.getElementById("btn-loader");

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

// ── Set Loading ──
function setLoading(loading) {
    btn.disabled = loading;
    btnText.textContent = loading ? "Creating..." : "Create Account";
    btnLoader.classList.toggle("hidden", !loading);
}

// ── Form Submit ──
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    // Validation
    if (!name || !email || !password) {
        showMessage("Please fill all fields.");
        return;
    }

    if (password.length < 6) {
        showMessage("Password must be at least 6 characters.");
        return;
    }

    try {
        setLoading(true);
        showMessage("");

        const res = await fetch("http://localhost:3000/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();

        if (res.ok) {
            showMessage("Account created! Redirecting to login... 🎉", "success");
            setTimeout(() => {
                window.location.href = "./login.html";
            }, 1500);
        } else {
            showMessage(data.message || "Signup failed. Please try again.");
        }

    } catch (err) {
        console.error("SIGNUP ERROR:", err);
        showMessage("Connection error. Please try again.");
    } finally {
        setLoading(false);
    }
});

// ── Google Signup (NextAuth) ──
function googleLogin() {
    window.location.href =
        "http://localhost:3000/api/auth/signin/google?callbackUrl=" +
        encodeURIComponent("http://localhost:3000/admin");
}