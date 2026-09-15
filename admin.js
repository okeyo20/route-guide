const adminLogin = document.getElementById("adminLogin");
const adminConsole = document.getElementById("adminConsole");
const adminToast = document.getElementById("adminToast");
const adminLoginForm = document.getElementById("adminLoginForm");
const adminLoginButton = adminLoginForm.querySelector('button[type="submit"]');
const adminRecoveryForm = document.getElementById("adminRecoveryForm");
const adminChangePasswordForm = document.getElementById("adminChangePasswordForm");
const today = new Date().toISOString().slice(0, 10);
const routeGuideAuth = window.RouteGuideAuth;
const adminEmailAddress = "okeyomaxwel53@gmail.com";
const supabaseClient = routeGuideAuth.getClient();

const defaultFares = [
    { route: "Nairobi CBD - Thika", fare: 150, source: "Matatu stage check", date: today },
    { route: "Nairobi CBD - JKIA", fare: 200, source: "Airport route check", date: today },
    { route: "Nairobi - Nakuru", fare: 700, source: "Operator confirmation", date: today },
    { route: "Nairobi - Kisumu", fare: 1200, source: "Operator confirmation", date: today },
    { route: "Mombasa - Malindi", fare: 300, source: "Coastal route check", date: today }
];

function showAdminToast(message) {
    adminToast.textContent = message;
    adminToast.classList.add("show");
    clearTimeout(showAdminToast.timeout);
    showAdminToast.timeout = setTimeout(function () { adminToast.classList.remove("show"); }, 2500);
}

function showConsole() {
    adminLogin.classList.add("hidden");
    adminConsole.classList.remove("hidden");
    loadFuel();
    renderFares();
    renderAdminPosts();
}

function isApprovedAdmin(user) {
    return routeGuideAuth.isAdmin(user);
}

async function getAdminPosts() {
    if (supabaseClient) {
        const result = await supabaseClient.from("traffic_reports").select("id,road,type,note,created_at").order("created_at", { ascending: false }).limit(50);
        if (!result.error) return result.data;
    }
    return JSON.parse(localStorage.getItem("routeguide-traffic-reports") || "[]");
}

async function renderAdminPosts() {
    const posts = await getAdminPosts();
    const container = document.getElementById("adminPosts");
    if (!posts.length) {
        container.innerHTML = '<small class="security-note">No community posts to moderate.</small>';
        return;
    }
    container.innerHTML = posts.map(function (post) {
        return `<div class="admin-post-row"><div><strong>${post.type} · ${post.road}</strong><small>${new Date(post.created_at || post.createdAt).toLocaleString()}${post.note ? ` · ${post.note.slice(0, 90)}` : ""}</small></div><button class="delete-post" type="button" data-post-id="${post.id}"><i class="fa-solid fa-trash"></i> Delete</button></div>`;
    }).join("");
    container.querySelectorAll(".delete-post").forEach(function (button) {
        button.addEventListener("click", function () { deletePost(button.dataset.postId); });
    });
}

async function deletePost(id) {
    if (supabaseClient) {
        const result = await supabaseClient.from("traffic_reports").delete().eq("id", id);
        if (result.error) { showAdminToast("Post could not be deleted."); return; }
    } else {
        const posts = JSON.parse(localStorage.getItem("routeguide-traffic-reports") || "[]").filter(function (post) { return String(post.id) !== String(id); });
        localStorage.setItem("routeguide-traffic-reports", JSON.stringify(posts));
    }
    await renderAdminPosts();
    showAdminToast("Community post deleted.");
}

function renderFares() {
    const fares = JSON.parse(localStorage.getItem("routeguide-fares") || JSON.stringify(defaultFares));
    document.getElementById("fareRows").innerHTML = fares.map(function (item, index) {
        return `<tr><td><strong>${item.route}</strong></td><td><input data-fare-index="${index}" data-fare-field="fare" type="number" min="0" value="${item.fare}"></td><td><input data-fare-index="${index}" data-fare-field="source" type="text" value="${item.source}"></td><td><input data-fare-index="${index}" data-fare-field="date" type="date" value="${item.date}"></td></tr>`;
    }).join("");
}

function loadFuel() {
    const fuel = JSON.parse(localStorage.getItem("routeguide-fuel") || "null") || { petrol: 193.8, diesel: 179.3, date: today };
    document.getElementById("petrolPrice").value = fuel.petrol;
    document.getElementById("dieselPrice").value = fuel.diesel;
    document.getElementById("fuelDate").value = fuel.date;
}

adminLoginForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    const email = document.getElementById("adminEmail").value.trim();
    const password = document.getElementById("adminPassword").value;
    if (!email || password.length < 6) {
        showAdminToast("Use an email and a password with at least 6 characters.");
        return;
    }
    if (!supabaseClient) {
        showAdminToast("Admin login is disabled until Supabase is configured.");
        return;
    }

    if (email.toLowerCase() !== adminEmailAddress) {
        showAdminToast("This account is not approved for admin access.");
        return;
    }

    adminLoginButton.disabled = true;
    adminLoginButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Checking account';
    const result = await supabaseClient.auth.signInWithPassword({ email: email, password: password });
    adminLoginButton.disabled = false;
    adminLoginButton.innerHTML = '<i class="fa-solid fa-lock"></i> Open console';
    if (result.error) {
        showAdminToast("Incorrect admin email or password.");
        return;
    }
    if (!isApprovedAdmin(result.data.user)) {
        await supabaseClient.auth.signOut();
        showAdminToast("This account is not approved for admin access.");
        return;
    }
    showConsole();
});

document.getElementById("resetPassword").addEventListener("click", async function () {
    const email = document.getElementById("adminEmail").value.trim();
    if (!supabaseClient) {
        showAdminToast("Configure Supabase before using password recovery.");
        return;
    }
    if (email.toLowerCase() !== adminEmailAddress) {
        showAdminToast("Enter the approved admin email: " + adminEmailAddress);
        return;
    }
    const result = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}${window.location.pathname}`
    });
    showAdminToast(result.error ? result.error.message : "Recovery email sent. Check your inbox and spam folder.");
});

adminRecoveryForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    const newPassword = document.getElementById("newAdminPassword").value;
    const confirmPassword = document.getElementById("confirmAdminPassword").value;
    if (newPassword.length < 6) {
        showAdminToast("Use at least 6 characters.");
        return;
    }
    if (newPassword !== confirmPassword) {
        showAdminToast("The passwords do not match.");
        return;
    }
    if (!supabaseClient) {
        showAdminToast("Supabase is not configured.");
        return;
    }
    const result = await supabaseClient.auth.updateUser({ password: newPassword });
    if (result.error) {
        showAdminToast(result.error.message);
        return;
    }
    await supabaseClient.auth.signOut();
    window.history.replaceState({}, document.title, window.location.pathname);
    adminRecoveryForm.classList.add("hidden");
    adminLoginForm.classList.remove("hidden");
    showAdminToast("Password updated. You can now log in.");
});

document.getElementById("cancelRecovery").addEventListener("click", function () {
    adminRecoveryForm.classList.add("hidden");
    adminLoginForm.classList.remove("hidden");
    window.history.replaceState({}, document.title, window.location.pathname);
});

adminChangePasswordForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    const newPassword = document.getElementById("adminNewPassword").value;
    const confirmPassword = document.getElementById("adminConfirmPassword").value;
    if (newPassword.length < 8) {
        showAdminToast("Use at least 8 characters for the new password.");
        return;
    }
    if (newPassword !== confirmPassword) {
        showAdminToast("The passwords do not match.");
        return;
    }
    if (!supabaseClient) {
        showAdminToast("Supabase is not configured.");
        return;
    }
    const session = await supabaseClient.auth.getSession();
    if (!session.data.session || !isApprovedAdmin(session.data.session.user)) {
        showAdminToast("Sign in again before changing the admin password.");
        return;
    }
    const result = await supabaseClient.auth.updateUser({ password: newPassword });
    if (result.error) {
        showAdminToast(result.error.message);
        return;
    }
    adminChangePasswordForm.reset();
    showAdminToast("Admin password changed successfully.");
});

document.getElementById("saveFuel").addEventListener("click", function () {
    const fuel = {
        petrol: Number(document.getElementById("petrolPrice").value),
        diesel: Number(document.getElementById("dieselPrice").value),
        date: document.getElementById("fuelDate").value
    };
    localStorage.setItem("routeguide-fuel", JSON.stringify(fuel));
    showAdminToast("Fuel reference prices saved locally.");
});

document.getElementById("saveFares").addEventListener("click", function () {
    const fares = JSON.parse(localStorage.getItem("routeguide-fares") || JSON.stringify(defaultFares));
    document.querySelectorAll("[data-fare-index]").forEach(function (input) {
        const index = Number(input.dataset.fareIndex);
        const field = input.dataset.fareField;
        fares[index][field] = field === "fare" ? Number(input.value) : input.value;
    });
    localStorage.setItem("routeguide-fares", JSON.stringify(fares));
    showAdminToast("Fare updates saved locally.");
});

document.getElementById("deleteExpired").addEventListener("click", async function () {
    const days = Math.max(1, Number(document.getElementById("expiryDays").value));
    const cutoff = new Date(Date.now() - days * 86400000).toISOString();
    if (supabaseClient) {
        const result = await supabaseClient.from("traffic_reports").delete().lt("created_at", cutoff);
        if (result.error) { showAdminToast("Old posts could not be deleted."); return; }
    } else {
        const posts = JSON.parse(localStorage.getItem("routeguide-traffic-reports") || "[]").filter(function (post) { return new Date(post.createdAt).toISOString() >= cutoff; });
        localStorage.setItem("routeguide-traffic-reports", JSON.stringify(posts));
    }
    await renderAdminPosts();
    showAdminToast(`Posts older than ${days} days deleted.`);
});

document.getElementById("fuelSearch").href = `https://www.google.com/search?q=${encodeURIComponent("Kenya EPRA fuel prices " + new Date().getFullYear())}`;
document.getElementById("fareSearch").href = `https://www.google.com/search?q=${encodeURIComponent("Kenya matatu fares route update")}`;
document.getElementById("adminLogout").addEventListener("click", function () {
    sessionStorage.removeItem("routeguide-admin-session");
    if (supabaseClient) supabaseClient.auth.signOut();
    adminConsole.classList.add("hidden");
    adminLogin.classList.remove("hidden");
});

if (supabaseClient) {
    supabaseClient.auth.getSession().then(function (result) {
        if (window.location.hash.includes("type=recovery")) {
            adminLoginForm.classList.add("hidden");
            adminRecoveryForm.classList.remove("hidden");
            return;
        }
        if (result.data.session && isApprovedAdmin(result.data.session.user)) {
            showConsole();
        } else if (result.data.session) {
            supabaseClient.auth.signOut();
        }
    });
    supabaseClient.auth.onAuthStateChange(function (_event, session) {
        if (session && isApprovedAdmin(session.user)) {
            showConsole();
        }
    });
} else {
    sessionStorage.removeItem("routeguide-admin-session");
}
