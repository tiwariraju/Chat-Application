const API_BASE = "/api/auth";

function showError(message) {
    const box = document.getElementById("errorBox");
    if (!box) return;
    box.textContent = message;
    box.classList.remove("d-none");
}

async function apiRequest(endpoint, payload) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.error || "Authentication failed");
    }
    return data;
}

const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        try {
            const username = document.getElementById("username").value.trim();
            const password = document.getElementById("password").value;
            const data = await apiRequest("/login", { username, password });
            localStorage.setItem("token", data.token);
            localStorage.setItem("username", data.username);
            window.location.href = "/chat.html";
        } catch (error) {
            showError(error.message);
        }
    });
}

const signupForm = document.getElementById("signupForm");
if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        try {
            const username = document.getElementById("username").value.trim();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value;
            const data = await apiRequest("/signup", { username, email, password });
            localStorage.setItem("token", data.token);
            localStorage.setItem("username", data.username);
            window.location.href = "/chat.html";
        } catch (error) {
            showError(error.message);
        }
    });
}
