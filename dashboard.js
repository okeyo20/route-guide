const dashboardToast = document.getElementById("dashboardToast");
const sidebar = document.getElementById("sidebar");
const themeButton = document.getElementById("themeButton");
const userName = document.getElementById("userName");
const welcomeName = document.getElementById("welcomeName");
const userAvatar = document.getElementById("userAvatar");
const adminConsoleLink = document.getElementById("adminConsoleLink");
const routeGuideAuth = window.RouteGuideAuth;
const dashboardAuthClient = routeGuideAuth.getClient();

function renderSavedTrips() {
    const list = document.getElementById("savedTripsList");
    if (!list) return;
    const trips = JSON.parse(localStorage.getItem("routeguide-saved-trips") || "[]");
    if (!trips.length) return;
    list.innerHTML = trips.slice(0, 8).map(function (trip) {
        return '<div class="activity-item"><span class="activity-icon blue"><i class="fa-solid fa-route"></i></span><div><strong>' + trip.from + ' to ' + trip.to + '</strong><small>Saved ' + new Date(trip.savedAt).toLocaleDateString() + '</small></div><a class="outline-action" href="routes.html?from=' + encodeURIComponent(trip.from) + '&to=' + encodeURIComponent(trip.to) + '">Open</a></div>';
    }).join("");
}

renderSavedTrips();

if (dashboardAuthClient) {
    dashboardAuthClient.auth.getSession().then(function ({ data }) {
        const user = data.session?.user;
        if (!user) {
            let storedGuest = null;
            try {
                storedGuest = JSON.parse(localStorage.getItem("routeguideUser") || "null");
            } catch (error) {
                routeGuideAuth.clearUser();
            }
            if (!storedGuest?.guest) {
                routeGuideAuth.clearUser();
                window.location.href = "index.html";
            }
            return;
        }
        routeGuideAuth.rememberUser(user);
        if (adminConsoleLink && routeGuideAuth.isAdmin(user)) adminConsoleLink.hidden = false;
    });
}

function showDashboardToast(message) {
    dashboardToast.textContent = message;
    dashboardToast.classList.add("show");
    clearTimeout(showDashboardToast.timeout);
    showDashboardToast.timeout = setTimeout(function () {
        dashboardToast.classList.remove("show");
    }, 2600);
}

function setTheme(theme) {
    document.body.classList.toggle("dark-mode", theme === "dark");
    localStorage.setItem("routeguide-dashboard-theme-v2", theme);
    const icon = themeButton.querySelector("i");
    icon.classList.toggle("fa-moon", theme !== "dark");
    icon.classList.toggle("fa-sun", theme === "dark");
}

const savedTheme = localStorage.getItem("routeguide-dashboard-theme-v2");
setTheme(savedTheme === "light" ? "light" : "dark");

themeButton.addEventListener("click", function () {
    setTheme(document.body.classList.contains("dark-mode") ? "light" : "dark");
});

document.getElementById("sidebarToggle").addEventListener("click", function () {
    sidebar.classList.toggle("open");
});

document.querySelectorAll(".side-nav a").forEach(function (link) {
    link.addEventListener("click", function () {
        sidebar.classList.remove("open");
    });
});

document.getElementById("shareTripButton").addEventListener("click", async function () {
    const tripUrl = `${window.location.origin}${window.location.pathname}?from=Nairobi%20CBD&to=Thika`;
    try {
        await navigator.clipboard.writeText(tripUrl);
        showDashboardToast("Trip link copied to your clipboard.");
    } catch (error) {
        showDashboardToast("Trip link ready: Nairobi CBD to Thika.");
    }
});

document.getElementById("driveModeButton").addEventListener("click", function () {
    if (!navigator.geolocation) {
        showDashboardToast("GPS is not available in this browser.");
        return;
    }

    showDashboardToast("Drive Mode is checking your location...");
    navigator.geolocation.getCurrentPosition(
        function () {
            showDashboardToast("Drive Mode ready. Open your route to begin navigation.");
        },
        function () {
            showDashboardToast("Allow location access to start Drive Mode.");
        }
    );
});

document.getElementById("logoutButton").addEventListener("click", function () {
    routeGuideAuth.clearUser();
    const logout = dashboardAuthClient ? dashboardAuthClient.auth.signOut() : Promise.resolve();
    logout.finally(function () { window.location.href = "index.html"; });
});

const storedUser = localStorage.getItem("routeguideUser");
if (storedUser) {
    try {
        const identity = JSON.parse(storedUser).identity || "RouteGuide user";
        const isPhoneNumber = /^[+\d\s()-]+$/.test(identity);
        const firstName = isPhoneNumber ? "there" : identity.split(/[ @]/)[0];
        const displayName = isPhoneNumber ? "RouteGuide user" : firstName.charAt(0).toUpperCase() + firstName.slice(1);
        userName.textContent = displayName;
        welcomeName.textContent = firstName.charAt(0).toUpperCase() + firstName.slice(1);
        userAvatar.textContent = isPhoneNumber ? "RG" : displayName.slice(0, 2).toUpperCase();
    } catch (error) {
        // Keep the default dashboard identity when stored login data is invalid.
    }
}

const currentDate = document.getElementById("currentDate");
currentDate.textContent = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric"
}).format(new Date()).toUpperCase();
