let stompClient = null;
const token = localStorage.getItem("token");
const username = localStorage.getItem("username");

if (!token || !username) {
    window.location.href = "/index.html";
}

const chatMessages = document.getElementById("chatMessages");
const activeUsersEl = document.getElementById("activeUsers");
const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");
const currentUserLabel = document.getElementById("currentUserLabel");
const logoutBtn = document.getElementById("logoutBtn");

if (currentUserLabel) {
    currentUserLabel.textContent = `Logged in as ${username}`;
}

function formatTime(iso) {
    if (!iso) return "";
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function appendSystemMessage(text) {
    const div = document.createElement("div");
    div.className = "system-message";
    div.textContent = text;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function appendChatMessage(message) {
    const messageDiv = document.createElement("div");
    const isMe = message.sender === username;
    messageDiv.className = `chat-message ${isMe ? "me" : "other"}`;
    messageDiv.innerHTML = `
        <div class="fw-semibold">${message.sender}</div>
        <div>${message.content}</div>
        <div class="meta mt-1">${formatTime(message.timestamp)}</div>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function renderActiveUsers(users) {
    activeUsersEl.innerHTML = "";
    users.forEach((user) => {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex align-items-center";
        li.innerHTML = `<span class="badge bg-success rounded-pill me-2">&nbsp;</span>${user}`;
        activeUsersEl.appendChild(li);
    });
}

async function loadActiveUsers() {
    try {
        const response = await fetch("/api/chat/active-users", {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (response.status === 401 || response.status === 403) {
            localStorage.clear();
            window.location.href = "/index.html";
            return;
        }
        const users = await response.json();
        renderActiveUsers(users);
    } catch (e) {
        appendSystemMessage("Could not load active users");
    }
}

function connectWebSocket() {
    const socket = new SockJS("/ws");
    stompClient = Stomp.over(socket);
    stompClient.connect(
        { Authorization: `Bearer ${token}` },
        () => {
            stompClient.subscribe("/topic/public", (payload) => {
                const message = JSON.parse(payload.body);
                if (message.type === "JOIN" || message.type === "LEAVE") {
                    appendSystemMessage(message.content);
                } else {
                    appendChatMessage(message);
                }
            });

            stompClient.subscribe("/topic/users", (payload) => {
                const body = JSON.parse(payload.body);
                renderActiveUsers(body.users || []);
            });
        },
        () => {
            appendSystemMessage("WebSocket connection failed. Please login again.");
            localStorage.clear();
            setTimeout(() => window.location.href = "/index.html", 1000);
        }
    );
}

if (messageForm) {
    messageForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const content = messageInput.value.trim();
        if (!content || !stompClient) return;

        stompClient.send("/app/chat.send", {}, JSON.stringify({ content }));
        messageInput.value = "";
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        localStorage.clear();
        if (stompClient) {
            stompClient.disconnect(() => {
                window.location.href = "/index.html";
            });
        } else {
            window.location.href = "/index.html";
        }
    });
}

loadActiveUsers();
connectWebSocket();
