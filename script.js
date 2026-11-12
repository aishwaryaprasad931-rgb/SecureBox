
const form = document.getElementById("passwordForm");
const website = document.getElementById("website");
const username = document.getElementById("username");
const password = document.getElementById("password");
const accountList = document.getElementById("accountList");
const totalCount = document.getElementById("totalCount");
const search = document.getElementById("search");

let accounts = JSON.parse(
    localStorage.getItem("securebox_accounts") || "[]"
);

function saveData() {
    localStorage.setItem(
        "securebox_accounts",
        JSON.stringify(accounts)
    );
}

function displayAccounts(filter = "") {
    accountList.innerHTML = "";

    const filtered = accounts.filter(account =>
        account.website.toLowerCase().includes(filter.toLowerCase()) ||
        account.username.toLowerCase().includes(filter.toLowerCase())
    );

    totalCount.textContent = accounts.length;

    if (filtered.length === 0) {
        accountList.innerHTML =
            '<p style="text-align:center;color:#94a3b8;padding:20px;">No matching accounts found.</p>';
        return;
    }

    filtered.forEach(account => {
        const card = document.createElement("div");
        card.className = "account-card";

        const title = document.createElement("h3");
        title.textContent = "🌐 " + account.website;

        const user = document.createElement("p");
        user.textContent = "Username: " + account.username;

        const pass = document.createElement("p");
        pass.textContent = "Password: " + "•".repeat(account.password.length);

        const actions = document.createElement("div");
        actions.className = "actions";

        const showBtn = document.createElement("button");
        showBtn.className = "show-btn";
        showBtn.textContent = "Show";
        showBtn.addEventListener("click", () => {
            const hidden = pass.textContent.startsWith("Password: •");

            pass.textContent = hidden
                ? "Password: " + account.password
                : "Password: " + "•".repeat(account.password.length);

            showBtn.textContent = hidden ? "Hide" : "Show";
        });

        const copyBtn = document.createElement("button");
        copyBtn.className = "copy-btn";
        copyBtn.textContent = "Copy";
        copyBtn.addEventListener("click", async () => {
            try {
                await navigator.clipboard.writeText(account.password);
                copyBtn.textContent = "Copied!";
                setTimeout(() => copyBtn.textContent = "Copy", 1500);
            } catch {
                alert("Clipboard access failed. Try localhost or HTTPS.");
            }
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.textContent = "Delete";
        deleteBtn.addEventListener("click", () => {
            if (confirm("Delete this account?")) {
                accounts = accounts.filter(a => a.id !== account.id);
                saveData();
                displayAccounts(search.value);
            }
        });

        actions.append(showBtn, copyBtn, deleteBtn);
        card.append(title, user, pass, actions);
        accountList.appendChild(card);
    });
}

form.addEventListener("submit", event => {
    event.preventDefault();

    const newAccount = {
        id: crypto.randomUUID(),
        website: website.value.trim(),
        username: username.value.trim(),
        password: password.value
    };

    accounts.push(newAccount);
    saveData();

    form.reset();
    updateStrength();
    displayAccounts(search.value);

    alert("Account saved successfully!");
});

document.getElementById("toggleInput").addEventListener("click", () => {
    const hidden = password.type === "password";
    password.type = hidden ? "text" : "password";
    document.getElementById("toggleInput").textContent =
        hidden ? "Hide" : "Show";
});

document.getElementById("generateBtn").addEventListener("click", () => {
    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

    const randomValues = crypto.getRandomValues(new Uint32Array(16));

    password.value = Array.from(randomValues, value =>
        chars[value % chars.length]
    ).join("");

    updateStrength();
});

function updateStrength() {
    const value = password.value;
    const bar = document.getElementById("strengthBar");
    const text = document.getElementById("strengthText");

    let score = 0;

    if (value.length >= 8) score++;
    if (value.length >= 12) score++;
    if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++;
    if (/[0-9]/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;

    const levels = [
        ["", "0%", "#46516d"],
        ["Weak", "20%", "#ef4444"],
        ["Fair", "40%", "#f97316"],
        ["Good", "60%", "#eab308"],
        ["Strong", "80%", "#22c55e"],
        ["Very Strong", "100%", "#10b981"]
    ];

    const level = levels[score];

    bar.style.width = level[1];
    bar.style.background = level[2];
    text.textContent = value ? "Strength: " + level[0] : "Password strength";
}

password.addEventListener("input", updateStrength);

search.addEventListener("input", () => {
    displayAccounts(search.value);
});

displayAccounts();
updateStrength();
