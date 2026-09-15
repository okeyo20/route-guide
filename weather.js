const weatherForm = document.getElementById("weatherForm");
const weatherLocation = document.getElementById("weatherLocation");

function weatherQuery() {
    return `${weatherLocation.value.trim() || "Nairobi, Kenya"} weather`;
}

function openWeatherSearch(source) {
    const query = weatherQuery();
    const encoded = encodeURIComponent(query);
    const urls = {
        google: `https://www.google.com/search?q=${encoded}`,
        maps: `https://www.google.com/maps/search/${encodeURIComponent(query + " weather map")}`,
        youtube: `https://www.youtube.com/results?search_query=${encoded}`,
        x: `https://x.com/search?q=${encoded}&src=typed_query`,
        news: `https://news.google.com/search?q=${encoded}`
    };

    window.open(urls[source] || urls.google, "_blank", "noopener,noreferrer");
}

if (weatherForm) {
    weatherForm.addEventListener("submit", function (event) {
        event.preventDefault();
        openWeatherSearch("google");
    });
}

document.querySelectorAll("[data-weather-source]").forEach(function (button) {
    button.addEventListener("click", function () {
        openWeatherSearch(button.dataset.weatherSource);
    });
});
