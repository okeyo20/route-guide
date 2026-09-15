(function () {
    const pages = [
        ["index.html", "Home", "fa-house"],
        ["dashboard.html", "Dashboard", "fa-grid-2"],
        ["routes.html", "Routes", "fa-route"],
        ["traffic.html", "Traffic", "fa-car"],
        ["nearby.html", "Nearby", "fa-location-crosshairs"],
        ["weather.html", "Weather", "fa-cloud-sun"],
        ["emergency.html", "Emergency", "fa-truck-medical"],
        ["about.html", "About", "fa-circle-info"],
        ["admin.html", "Admin console", "fa-sliders"],
        ["register.html", "Create account", "fa-user-plus"]
    ];
    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    const nav = document.createElement("nav");
    nav.className = "routeguide-quick-nav";
    nav.setAttribute("aria-label", "Quick navigation");
    nav.innerHTML = '<button class="routeguide-quick-toggle" type="button" aria-expanded="false"><i class="fa-solid fa-compass"></i><span>Quick links</span></button><div class="routeguide-quick-menu"></div>';
    const menu = nav.querySelector(".routeguide-quick-menu");
    pages.forEach(function (page) {
        const link = document.createElement("a");
        link.href = page[0];
        link.innerHTML = '<i class="fa-solid ' + page[2] + '"></i><span>' + page[1] + "</span>";
        if (currentPage === page[0]) link.setAttribute("aria-current", "page");
        menu.appendChild(link);
    });
    document.body.appendChild(nav);
    const toggle = nav.querySelector(".routeguide-quick-toggle");
    toggle.addEventListener("click", function () {
        const isOpen = menu.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(isOpen));
    });
    document.addEventListener("click", function (event) {
        if (!nav.contains(event.target)) {
            menu.classList.remove("open");
            toggle.setAttribute("aria-expanded", "false");
        }
    });
}());
