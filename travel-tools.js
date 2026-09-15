(function () {
    const storageKey = "routeguide-saved-trips";
    const tools = document.createElement("aside");
    tools.className = "routeguide-tools";
    tools.setAttribute("aria-label", "Travel tools");
    tools.innerHTML = '<button class="routeguide-tools-toggle" type="button" aria-expanded="false"><i class="fa-solid fa-toolbox"></i><span>Travel tools</span></button>' +
        '<div class="routeguide-tools-panel"><h2>Travel tools</h2><div class="routeguide-tools-grid"><button type="button" data-tool="save"><i class="fa-solid fa-bookmark"></i>Save trip</button><button type="button" data-tool="cost"><i class="fa-solid fa-coins"></i>Trip cost</button><button type="button" data-tool="location"><i class="fa-solid fa-location-crosshairs"></i>Use location</button><button type="button" data-tool="language"><i class="fa-solid fa-language"></i>English / Kiswahili</button><button type="button" data-tool="notify"><i class="fa-regular fa-bell"></i>Notifications</button><button type="button" data-tool="offline"><i class="fa-solid fa-download"></i>Offline prep</button></div><form class="routeguide-cost-form"><label>Distance (km)<input name="distance" type="number" min="0" step="0.1" placeholder="100"></label><label>Vehicle efficiency (km/L)<input name="efficiency" type="number" min="1" step="0.1" value="12"></label><label>Fuel price (KSh/L)<input name="price" type="number" min="0" step="0.01" value="193.8"></label><button type="submit">Calculate estimate</button></form><p class="routeguide-tools-status" aria-live="polite"></p></div>';
    document.body.appendChild(tools);

    const panel = tools.querySelector(".routeguide-tools-panel");
    const status = tools.querySelector(".routeguide-tools-status");
    const costForm = tools.querySelector(".routeguide-cost-form");
    const setStatus = function (message) { status.textContent = message; };
    const getRoute = function () {
        const from = document.getElementById("fromLocation")?.value || new URLSearchParams(window.location.search).get("from") || "Current location";
        const to = document.getElementById("toLocation")?.value || new URLSearchParams(window.location.search).get("to") || "Destination not set";
        return { from: from.trim(), to: to.trim(), savedAt: new Date().toISOString() };
    };

    tools.querySelector(".routeguide-tools-toggle").addEventListener("click", function () {
        const open = panel.classList.toggle("open");
        this.setAttribute("aria-expanded", String(open));
    });
    document.addEventListener("click", function (event) {
        if (!tools.contains(event.target)) panel.classList.remove("open");
    });
    tools.querySelectorAll("[data-tool]").forEach(function (button) {
        button.addEventListener("click", function () {
            const tool = button.dataset.tool;
            if (tool === "save") {
                const trips = JSON.parse(localStorage.getItem(storageKey) || "[]");
                trips.unshift(getRoute());
                localStorage.setItem(storageKey, JSON.stringify(trips.slice(0, 20)));
                setStatus("Trip saved on this device. You can reopen it from this page's route link.");
            }
            if (tool === "cost") {
                costForm.classList.toggle("open");
                setStatus("Enter distance and fuel details for a local estimate.");
            }
            if (tool === "location") {
                if (!navigator.geolocation) { setStatus("Location is not supported by this browser."); return; }
                setStatus("Requesting your location...");
                navigator.geolocation.getCurrentPosition(function (position) {
                    const location = position.coords.latitude.toFixed(5) + ", " + position.coords.longitude.toFixed(5);
                    localStorage.setItem("routeguide-last-location", JSON.stringify({ location: location, savedAt: new Date().toISOString() }));
                    setStatus("Location saved for this session: " + location);
                }, function () { setStatus("Location permission was not granted."); });
            }
            if (tool === "language") {
                const kiswahili = document.body.dataset.language !== "sw";
                document.body.dataset.language = kiswahili ? "sw" : "en";
                localStorage.setItem("routeguide-language", kiswahili ? "sw" : "en");
                setStatus(kiswahili ? "Kiswahili mode selected. Detailed content remains in English until translations are added." : "English mode selected.");
            }
            if (tool === "notify") {
                if (!("Notification" in window)) { setStatus("Notifications are not supported by this browser."); return; }
                Notification.requestPermission().then(function (permission) { setStatus(permission === "granted" ? "Travel notifications enabled on this device." : "Notifications remain disabled."); });
            }
            if (tool === "offline") {
                localStorage.setItem("routeguide-offline-prepared", new Date().toISOString());
                setStatus("Core preferences saved locally. Live maps, traffic and weather still need internet access.");
            }
        });
    });
    costForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const data = new FormData(costForm);
        const distance = Number(data.get("distance"));
        const efficiency = Number(data.get("efficiency"));
        const price = Number(data.get("price"));
        if (!distance || !efficiency || price < 0) { setStatus("Enter valid distance, efficiency and fuel price values."); return; }
        setStatus("Estimated fuel cost: KSh " + Math.round(distance / efficiency * price).toLocaleString() + ". Add tolls or fares separately.");
    });
    document.body.dataset.language = localStorage.getItem("routeguide-language") || "en";
}());
