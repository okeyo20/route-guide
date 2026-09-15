const cities = {
    "Nairobi CBD": { x: 50, y: 57, label: "Nairobi" },
    "JKIA": { x: 46, y: 58, label: "JKIA" },
    "Westlands": { x: 48, y: 52, label: "Westlands" },
    "Thika": { x: 54, y: 53, label: "Thika" },
    "Ruiru": { x: 51, y: 50, label: "Ruiru" },
    "Machakos": { x: 57, y: 68, label: "Machakos" },
    "Nakuru": { x: 40, y: 28, label: "Nakuru" },
    "Naivasha": { x: 38, y: 35, label: "Naivasha" },
    "Kisumu": { x: 25, y: 18, label: "Kisumu" },
    "Mombasa": { x: 76, y: 82, label: "Mombasa" },
    "Malindi": { x: 68, y: 72, label: "Malindi" },
    "Eldoret": { x: 30, y: 22, label: "Eldoret" },
    "Kitale": { x: 25, y: 16, label: "Kitale" },
    "Kakamega": { x: 19, y: 24, label: "Kakamega" },
    "Nanyuki": { x: 58, y: 45, label: "Nanyuki" },
    "Meru": { x: 62, y: 41, label: "Meru" },
    "Embu": { x: 61, y: 57, label: "Embu" },
    "Nyeri": { x: 53, y: 43, label: "Nyeri" },
    "Garissa": { x: 72, y: 48, label: "Garissa" },
    "Mandera": { x: 88, y: 20, label: "Mandera" },
    "Wajir": { x: 81, y: 36, label: "Wajir" },
    "Lamu": { x: 82, y: 78, label: "Lamu" },
    "Kiambu": { x: 46, y: 52, label: "Kiambu" },
    "Murang'a": { x: 52, y: 49, label: "Murang'a" },
    "Busia": { x: 10, y: 12, label: "Busia" },
    "Homabay": { x: 22, y: 12, label: "Homabay" },
    "Migori": { x: 12, y: 8, label: "Migori" },
    "Nyahururu": { x: 42, y: 30, label: "Nyahururu" }
};

const routeRates = {
    "Nairobi CBD|Thika": { distance: 42.3, time: 65, traffic: "Light" },
    "Nairobi CBD|JKIA": { distance: 15.8, time: 28, traffic: "Moderate" },
    "Nairobi CBD|Westlands": { distance: 8.4, time: 18, traffic: "Light" },
    "Nairobi CBD|Kisumu": { distance: 356.7, time: 420, traffic: "Heavy" },
    "Nairobi CBD|Mombasa": { distance: 483.1, time: 520, traffic: "Moderate" },
    "Nairobi CBD|Nakuru": { distance: 157.4, time: 195, traffic: "Moderate" },
    "Nairobi CBD|Eldoret": { distance: 296.6, time: 340, traffic: "Moderate" },
    "Nairobi CBD|Malindi": { distance: 418.2, time: 470, traffic: "Moderate" },
    "Nairobi CBD|Meru": { distance: 199.3, time: 230, traffic: "Light" },
    "Nairobi CBD|Garissa": { distance: 415.8, time: 460, traffic: "Moderate" },
    "Thika|JKIA": { distance: 29.1, time: 44, traffic: "Moderate" },
    "Westlands|Mombasa": { distance: 476.8, time: 510, traffic: "Moderate" },
    "Nakuru|Naivasha": { distance: 57.5, time: 75, traffic: "Light" },
    "Ruiru|Thika": { distance: 26.7, time: 35, traffic: "Light" },
    "Nairobi CBD|Nanyuki": { distance: 176.8, time: 210, traffic: "Light" },
    "Nakuru|Eldoret": { distance: 138.7, time: 170, traffic: "Moderate" },
    "Kisumu|Kakamega": { distance: 64.9, time: 85, traffic: "Light" },
    "Mombasa|Malindi": { distance: 202.8, time: 225, traffic: "Moderate" },
    "Nairobi CBD|Mandera": { distance: 960.5, time: 1060, traffic: "Heavy" },
    "Nairobi CBD|Busia": { distance: 476.2, time: 540, traffic: "Moderate" },
    "Nairobi CBD|Nyeri": { distance: 151.4, time: 180, traffic: "Light" },
    "Nairobi CBD|Embu": { distance: 132.3, time: 165, traffic: "Light" },
    "Nairobi CBD|Wajir": { distance: 734.9, time: 820, traffic: "Heavy" }
};

const defaults = {
    from: "Nairobi CBD",
    to: "Thika"
};

const elements = {
    fromLocation: document.getElementById("fromLocation"),
    toLocation: document.getElementById("toLocation"),
    findRoute: document.getElementById("findRoute"),
    swapButton: document.getElementById("swapButton"),
    toast: document.getElementById("toast"),
    toastMessage: document.getElementById("toastMessage"),
    distance: document.getElementById("distance"),
    time: document.getElementById("time"),
    traffic: document.getElementById("traffic"),
    googleMap: document.getElementById("googleMap"),
    mobileMenu: document.getElementById("mobileMenu"),
    mainNav: document.getElementById("mainNav"),
    themeButton: document.getElementById("themeButton"),
    profileButton: document.getElementById("profileButton")
};

const routeParams = new URLSearchParams(window.location.search);
if (routeParams.get("from")) elements.fromLocation.value = routeParams.get("from");
if (routeParams.get("to")) elements.toLocation.value = routeParams.get("to");

function parseLocationKey(from, to) {
    const first = (from || "").trim();
    const second = (to || "").trim();
    return `${first}|${second}`;
}

function formatRouteSummary(distance, time) {
    const hours = Math.floor(time / 60);
    const minutes = time % 60;

    if (hours > 0 && minutes > 0) {
        return `${hours} hr ${minutes} min`;
    }

    if (hours > 0) {
        return `${hours} hr`;
    }

    return `${minutes} min`;
}

function getRouteData(from, to) {
    const key = parseLocationKey(from, to);
    const reverseKey = parseLocationKey(to, from);
    const fallback = routeRates[key] || routeRates[reverseKey];

    if (fallback) {
        return fallback;
    }

    const a = cities[from] || cities[defaults.from];
    const b = cities[to] || cities[defaults.to];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const roughDistance = Math.sqrt(dx * dx + dy * dy) * 3.4;
    const estimateMinutes = Math.max(18, Math.round(roughDistance * 1.4));

    return {
        distance: Number(roughDistance.toFixed(1)),
        time: estimateMinutes,
        traffic: dx < 20 ? "Light" : "Moderate"
    };
}

function updateRouteSummary(from, to) {
    const data = getRouteData(from, to);
    elements.distance.textContent = `${data.distance.toFixed(1)} km`;
    elements.time.textContent = formatRouteSummary(data.distance, data.time);
    elements.traffic.textContent = data.traffic;
}

function updateGoogleMap(from, to) {
    const mapQuery = encodeURIComponent(`${from}, Kenya to ${to}, Kenya`);
    elements.googleMap.src = `https://www.google.com/maps?q=${mapQuery}&output=embed`;
}

function showToast(message) {
    elements.toastMessage.textContent = message;
    elements.toast.classList.add("show");

    clearTimeout(showToast.timeoutId);
    showToast.timeoutId = setTimeout(function () {
        elements.toast.classList.remove("show");
    }, 2400);
}

function updateRouteFromInputs() {
    const from = elements.fromLocation.value.trim() || defaults.from;
    const to = elements.toLocation.value.trim() || defaults.to;
    updateRouteSummary(from, to);
    updateGoogleMap(from, to);
}

function findRoute() {
    const from = elements.fromLocation.value.trim() || defaults.from;
    const to = elements.toLocation.value.trim() || defaults.to;

    if (!from || !to) {
        showToast("Please enter both start and destination.");
        return;
    }

    if (!cities[from] || !cities[to]) {
        showToast("That destination is not on the current map.");
        return;
    }

    updateRouteSummary(from, to);
    updateGoogleMap(from, to);

    const googleMapsUrl =
        "https://www.google.com/maps/dir/?api=1" +
        "&origin=" + encodeURIComponent(from) +
        "&destination=" + encodeURIComponent(to) +
        "&travelmode=driving";

    window.open(googleMapsUrl, "_blank", "noopener,noreferrer");
    showToast("Opening directions in Google Maps.");
}

function swapLocations() {
    const fromValue = elements.fromLocation.value;
    const toValue = elements.toLocation.value;

    elements.fromLocation.value = toValue;
    elements.toLocation.value = fromValue;

    updateRouteFromInputs();
    showToast("Route points swapped.");
}

function initializePopularButtons() {
    document.querySelectorAll(".destination-buttons button").forEach(function (button) {
        button.addEventListener("click", function () {
            const place = button.getAttribute("data-place");
            const currentTo = elements.toLocation.value.trim();

            if (currentTo && currentTo !== defaults.to && currentTo !== "") {
                elements.fromLocation.value = currentTo;
            }

            elements.toLocation.value = place;
            updateRouteFromInputs();
            showToast(`${place} selected as destination.`);
        });
    });
}

function initThemeToggle() {
    elements.themeButton.addEventListener("click", function () {
        document.body.classList.toggle("light-mode");
        const icon = elements.themeButton.querySelector("i");
        icon.classList.toggle("fa-moon");
        icon.classList.toggle("fa-sun");
    });
}

function initMobileMenu() {
    elements.mobileMenu.addEventListener("click", function () {
        elements.mainNav.classList.toggle("open");
        const icon = elements.mobileMenu.querySelector("i");
        icon.classList.toggle("fa-bars");
        icon.classList.toggle("fa-xmark");
    });
}

function initQueryParams() {
    const params = new URLSearchParams(window.location.search);
    const from = params.get("from");
    const to = params.get("to");

    if (from && cities[from]) {
        elements.fromLocation.value = from;
    }

    if (to && cities[to]) {
        elements.toLocation.value = to;
    }

    updateRouteFromInputs();
}

function attachInputEvents() {
    elements.fromLocation.addEventListener("input", updateRouteFromInputs);
    elements.toLocation.addEventListener("input", updateRouteFromInputs);
    elements.findRoute.addEventListener("click", findRoute);
    elements.swapButton.addEventListener("click", swapLocations);
}

function initPage() {
    initQueryParams();
    initializePopularButtons();
    attachInputEvents();
    initMobileMenu();
    initThemeToggle();
    updateRouteSummary(elements.fromLocation.value.trim() || defaults.from, elements.toLocation.value.trim() || defaults.to);
}

initPage();
