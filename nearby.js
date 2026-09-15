const nearbyForm = document.getElementById("nearbyForm");
const nearbyQuery = document.getElementById("nearbyQuery");

function getNearbyQuery() {
    return nearbyQuery.value.trim() || "places near Nairobi";
}

function openNearbySearch(source, queryOverride) {
    const query = queryOverride || getNearbyQuery();
    const encoded = encodeURIComponent(query);
    const urls = {
        maps: `https://www.google.com/maps/search/${encoded}`,
        google: `https://www.google.com/search?q=${encoded}`,
        youtube: `https://www.youtube.com/results?search_query=${encoded}`,
        facebook: `https://www.facebook.com/search/top?q=${encoded}`,
        instagram: `https://www.instagram.com/explore/tags/${query.toLowerCase().replace(/[^a-z0-9]+/g, "")}/`,
        tiktok: `https://www.tiktok.com/search?q=${encoded}`,
        x: `https://x.com/search?q=${encoded}&src=typed_query`
    };

    window.open(urls[source] || urls.maps, "_blank", "noopener,noreferrer");
}

if (nearbyForm) {
    nearbyForm.addEventListener("submit", function (event) {
        event.preventDefault();
        openNearbySearch("maps");
    });
}

document.querySelectorAll("[data-nearby]").forEach(function (button) {
    button.addEventListener("click", function () {
        nearbyQuery.value = button.dataset.nearby;
        openNearbySearch("maps", button.dataset.nearby);
    });
});

document.querySelectorAll("[data-nearby-source]").forEach(function (button) {
    button.addEventListener("click", function () {
        openNearbySearch(button.dataset.nearbySource);
    });
});
