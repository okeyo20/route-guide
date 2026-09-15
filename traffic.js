/* =========================================
   ROUTEGUIDE TRAFFIC PAGE
========================================= */


/* =========================================
   ELEMENTS
========================================= */

const searchInput =
    document.getElementById("trafficSearch");

const searchButton =
    document.getElementById("searchButton");

const resultsGrid =
    document.getElementById("resultsGrid");

const toast =
    document.getElementById("toast");

const toastMessage =
    document.getElementById("toastMessage");

const themeButton =
    document.getElementById("themeButton");

const mobileMenu =
    document.getElementById("mobileMenu");

const mainNav =
    document.getElementById("mainNav");

const trafficForm = document.getElementById("trafficForm");
const trafficMediaForm = document.getElementById("trafficMediaForm");
const trafficMediaQuery = document.getElementById("trafficMediaQuery");
const resultStatus = document.querySelector(".result-status");
const reportImage = document.getElementById("reportImage");
const imageUploadLabel = document.getElementById("imageUploadLabel");
const communityFeed = document.getElementById("communityFeed");
const trafficAuth = window.RouteGuideAuth;
const supabaseClient = trafficAuth.getClient();
const postModal = document.getElementById("postModal");

function escapeHTML(value) {
    return String(value).replace(/[&<>'"]/g, function (character) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character];
    });
}

function renderCommunityPosts(reports) {
    if (!reports.length) {
        communityFeed.innerHTML = '<div class="community-empty"><i class="fa-solid fa-comments"></i><br>There are no community posts yet. Be the first to share a road update.</div>';
        return;
    }
    communityFeed.innerHTML = reports.map(function (report) {
        const date = new Date(report.createdAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
        return `<article class="community-post" data-post-id="${escapeHTML(report.id || "")}">${report.image ? `<img class="community-post-image" src="${report.image}" alt="Road report from ${escapeHTML(report.road)}">` : '<div class="community-post-image"></div>'}<div class="community-post-body"><div class="community-post-meta"><span class="community-post-type">${escapeHTML(report.type)}</span><span>${escapeHTML(date)}</span></div><h3>${escapeHTML(report.road)}</h3><p>${escapeHTML(report.note || "No description provided.")}</p><button class="read-post-button" type="button">Read full post <i class="fa-solid fa-arrow-right"></i></button></div></article>`;
    }).join("");
    communityFeed.querySelectorAll(".read-post-button").forEach(function (button) {
        button.addEventListener("click", function () {
            const card = button.closest(".community-post");
            const report = reports.find(function (item) { return String(item.id || "") === card.dataset.postId; }) || reports[Array.from(communityFeed.querySelectorAll(".community-post")).indexOf(card)];
            document.getElementById("postModalType").textContent = report.type;
            document.getElementById("postModalDate").textContent = new Date(report.createdAt).toLocaleString();
            document.getElementById("postModalTitle").textContent = report.road;
            document.getElementById("postModalText").textContent = report.note || "No description provided.";
            const image = document.getElementById("postModalImage");
            image.src = report.image || "";
            image.hidden = !report.image;
            postModal.classList.add("show");
            postModal.setAttribute("aria-hidden", "false");
        });
    });
}

async function renderCommunityFeed() {
    if (supabaseClient) {
        const result = await supabaseClient.from("traffic_reports").select("id,road,type,note,image_url,created_at,expires_at").or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`).order("created_at", { ascending: false }).limit(25);
        if (!result.error) {
            renderCommunityPosts(result.data.map(function (report) {
                return { id: report.id, road: report.road, type: report.type, note: report.note, image: report.image_url, createdAt: report.created_at };
            }));
            return;
        }
    }
    const now = Date.now();
    const reports = JSON.parse(localStorage.getItem("routeguide-traffic-reports") || "[]").filter(function (report) { return !report.expiresAt || new Date(report.expiresAt).getTime() > now; });
    localStorage.setItem("routeguide-traffic-reports", JSON.stringify(reports));
    renderCommunityPosts(reports);
}


/* =========================================
   MOBILE MENU
========================================= */

mobileMenu.addEventListener("click", () => {

    mainNav.classList.toggle("show");

    const icon =
        mobileMenu.querySelector("i");

    if (mainNav.classList.contains("show")) {

        icon.classList.remove("fa-bars");

        icon.classList.add("fa-xmark");

    } else {

        icon.classList.remove("fa-xmark");

        icon.classList.add("fa-bars");
    }

});


/* =========================================
   THEME
========================================= */

themeButton.addEventListener("click", () => {

    document.body.classList.toggle("light-mode");

    const icon =
        themeButton.querySelector("i");

    if (
        document.body.classList.contains(
            "light-mode"
        )
    ) {

        icon.classList.remove("fa-moon");

        icon.classList.add("fa-sun");

    } else {

        icon.classList.remove("fa-sun");

        icon.classList.add("fa-moon");

    }

});


/* =========================================
   SEARCH QUERY
========================================= */

function getSearchQuery() {

    let query =
        searchInput.value.trim();

    if (!query) {

        query = "Nairobi traffic Kenya";

    }

    return query;

}


/* =========================================
   SEARCH GOOGLE
========================================= */

function searchGoogle(query) {

    const url =
        "https://www.google.com/search?q=" +
        encodeURIComponent(
            query + " Kenya traffic"
        );

    window.open(
        url,
        "_blank",
        "noopener,noreferrer"
    );

}


/* =========================================
   GOOGLE IMAGES
========================================= */

function searchGoogleImages(query) {

    const url =
        "https://www.google.com/search?tbm=isch&q=" +
        encodeURIComponent(
            query + " Kenya traffic"
        );

    window.open(
        url,
        "_blank",
        "noopener,noreferrer"
    );

}


/* =========================================
   YOUTUBE
========================================= */

function searchYouTube(query) {

    const url =
        "https://www.youtube.com/results?search_query=" +
        encodeURIComponent(
            query + " Kenya traffic"
        );

    window.open(
        url,
        "_blank",
        "noopener,noreferrer"
    );

}


/* =========================================
   TIKTOK
========================================= */

function searchTikTok(query) {

    const url =
        "https://www.tiktok.com/search?q=" +
        encodeURIComponent(
            query + " Kenya traffic"
        );

    window.open(
        url,
        "_blank",
        "noopener,noreferrer"
    );

}


/* =========================================
   FACEBOOK
========================================= */

function searchFacebook(query) {

    const url =
        "https://www.facebook.com/search/top?q=" +
        encodeURIComponent(
            query + " traffic"
        );

    window.open(
        url,
        "_blank",
        "noopener,noreferrer"
    );

}


/* =========================================
   INSTAGRAM
========================================= */

function searchInstagram(query) {

    const cleanQuery =
        query
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "");

    const url =
        "https://www.instagram.com/explore/tags/" +
        cleanQuery +
        "/";

    window.open(
        url,
        "_blank",
        "noopener,noreferrer"
    );

}


/* =========================================
   X
========================================= */

function searchX(query) {

    const url =
        "https://x.com/search?q=" +
        encodeURIComponent(
            query + " traffic Kenya"
        ) +
        "&src=typed_query";

    window.open(
        url,
        "_blank",
        "noopener,noreferrer"
    );

}


/* =========================================
   GOOGLE NEWS
========================================= */

function searchNews(query) {

    const url =
        "https://news.google.com/search?q=" +
        encodeURIComponent(
            query + " Kenya traffic"
        );

    window.open(
        url,
        "_blank",
        "noopener,noreferrer"
    );

}


/* =========================================
   SOURCE BUTTONS
========================================= */

document
    .querySelectorAll(".source-button")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const source =
                    button.dataset.source;

                const query =
                    getSearchQuery();


                switch (source) {

                    case "google":

                        searchGoogle(query);

                        break;


                    case "images":

                        searchGoogleImages(query);

                        break;


                    case "youtube":

                        searchYouTube(query);

                        break;


                    case "tiktok":

                        searchTikTok(query);

                        break;


                    case "facebook":

                        searchFacebook(query);

                        break;


                    case "instagram":

                        searchInstagram(query);

                        break;


                    case "x":

                        searchX(query);

                        break;


                    case "news":

                        searchNews(query);

                        break;

                }


                showToast(
                    "Searching " +
                    source +
                    " for " +
                    query
                );

            }

        );

    });


/* =========================================
   MAIN SEARCH
========================================= */

trafficForm.addEventListener(
    "submit",
    event => {
        event.preventDefault();
        performSearch();
    }
);

trafficMediaForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const query = trafficMediaQuery.value.trim() || getSearchQuery();
    trafficMediaQuery.value = query;
    searchInput.value = query;
    createSearchResults(query);
    if (resultStatus) resultStatus.innerHTML = '<i class="fa-solid fa-circle"></i> Results ready for ' + escapeHTML(query);
    showToast("Traffic media results loaded");
});


searchInput.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {

            performSearch();

        }

    }
);


function performSearch() {

    const query =
        getSearchQuery();


    createSearchResults(query);

    if (resultStatus) {
        resultStatus.innerHTML = '<i class="fa-solid fa-circle"></i> Results ready for ' + escapeHTML(query);
    }

    document.getElementById("lastChecked").textContent = "Just now";


    showToast(
        "Traffic sources loaded"
    );

}

const reportForm = document.getElementById("reportForm");

reportForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const report = {
        road: document.getElementById("reportRoad").value.trim(),
        type: document.getElementById("reportType").value,
        note: document.getElementById("reportNote").value.trim(),
        createdAt: new Date().toISOString(),
        id: `local-${Date.now()}`
    };
    const finishReport = async function () {
        if (supabaseClient) {
            let imageUrl = null;
            if (report.imageFile) {
                const fileName = `${Date.now()}-${report.imageFile.name.replace(/[^a-z0-9.]+/gi, "-")}`;
                const upload = await supabaseClient.storage.from("community-images").upload(fileName, report.imageFile, { contentType: report.imageFile.type, upsert: false });
                if (upload.error) {
                    showToast("Image upload failed. Check the community-images bucket.");
                    return;
                }
                imageUrl = supabaseClient.storage.from("community-images").getPublicUrl(fileName).data.publicUrl;
            }
            const insert = await supabaseClient.from("traffic_reports").insert({ road: report.road, type: report.type, note: report.note, image_url: imageUrl });
            if (insert.error) {
                showToast("Report could not be published to the shared feed.");
                return;
            }
            reportForm.reset();
            imageUploadLabel.textContent = "Add road image";
            await renderCommunityFeed();
            showToast(`${report.type} report published for ${report.road}.`);
            return;
        }

        const reports = JSON.parse(localStorage.getItem("routeguide-traffic-reports") || "[]");
        reports.unshift(report);
        localStorage.setItem("routeguide-traffic-reports", JSON.stringify(reports.slice(0, 25)));
        reportForm.reset();
        imageUploadLabel.textContent = "Add road image";
        renderCommunityFeed();
        showToast(`${report.type} report published for ${report.road}.`);
    };

    if (reportImage.files[0]) {
        if (reportImage.files[0].size > 1600000) {
            showToast("Please choose an image smaller than 1.6 MB.");
            return;
        }
        const reader = new FileReader();
        report.imageFile = reportImage.files[0];
        reader.onload = function () { report.image = reader.result; finishReport(); };
        reader.readAsDataURL(reportImage.files[0]);
    } else {
        finishReport();
    }
});

reportImage.addEventListener("change", function () {
    imageUploadLabel.textContent = reportImage.files[0] ? reportImage.files[0].name : "Add road image";
});

document.getElementById("closePostModal").addEventListener("click", function () { postModal.classList.remove("show"); postModal.setAttribute("aria-hidden", "true"); });
document.getElementById("postModalBackdrop").addEventListener("click", function () { postModal.classList.remove("show"); postModal.setAttribute("aria-hidden", "true"); });

renderCommunityFeed();


/* =========================================
   CREATE RESULT CARDS
========================================= */

function createSearchResults(query) {

    const encoded =
        encodeURIComponent(query);
    const safeQuery = escapeHTML(query);


    resultsGrid.innerHTML = `

        <div class="result-card">

            <div class="result-image">

                <i class="fa-brands fa-youtube"></i>

            </div>

            <div class="result-content">

                <h3>
                    ${safeQuery} Videos
                </h3>

                <p>
                    Find traffic videos,
                    road reports and
                    driving footage.
                </p>

                <a
                    class="result-link"
                    href="https://www.youtube.com/results?search_query=${encoded}"
                    target="_blank"
                    rel="noopener noreferrer">

                    Watch Videos

                    <i class="fa-solid fa-arrow-up-right-from-square"></i>

                </a>

            </div>

        </div>



        <div class="result-card">

            <div class="result-image">

                <i class="fa-solid fa-image"></i>

            </div>

            <div class="result-content">

                <h3>
                    ${safeQuery} Photos
                </h3>

                <p>
                    Search traffic images,
                    road conditions and
                    incidents.
                </p>

                <a
                    class="result-link"
                    href="https://www.google.com/search?tbm=isch&q=${encoded}"
                    target="_blank"
                    rel="noopener noreferrer">

                    View Images

                    <i class="fa-solid fa-arrow-up-right-from-square"></i>

                </a>

            </div>

        </div>



        <div class="result-card">

            <div class="result-image">

                <i class="fa-solid fa-newspaper"></i>

            </div>

            <div class="result-content">

                <h3>
                    ${safeQuery} News
                </h3>

                <p>
                    Search recent news,
                    incidents and traffic
                    reports.
                </p>

                <a
                    class="result-link"
                    href="https://news.google.com/search?q=${encoded}"
                    target="_blank"
                    rel="noopener noreferrer">

                    Read News

                    <i class="fa-solid fa-arrow-up-right-from-square"></i>

                </a>

            </div>

        </div>



        <div class="result-card">

            <div class="result-image">

                <i class="fa-brands fa-tiktok"></i>

            </div>

            <div class="result-content">

                <h3>
                    ${safeQuery} on TikTok
                </h3>

                <p>
                    Find recent short videos
                    and public traffic posts.
                </p>

                <a
                    class="result-link"
                    href="https://www.tiktok.com/search?q=${encoded}"
                    target="_blank"
                    rel="noopener noreferrer">

                    Find Videos

                    <i class="fa-solid fa-arrow-up-right-from-square"></i>

                </a>

            </div>

        </div>



        <div class="result-card">

            <div class="result-image">

                <i class="fa-brands fa-x-twitter"></i>

            </div>

            <div class="result-content">

                <h3>
                    ${safeQuery} on X
                </h3>

                <p>
                    Search public traffic
                    alerts and road updates.
                </p>

                <a
                    class="result-link"
                    href="https://x.com/search?q=${encoded}"
                    target="_blank"
                    rel="noopener noreferrer">

                    View Posts

                    <i class="fa-solid fa-arrow-up-right-from-square"></i>

                </a>

            </div>

        </div>



        <div class="result-card">

            <div class="result-image">

                <i class="fa-brands fa-facebook"></i>

            </div>

            <div class="result-content">

                <h3>
                    ${safeQuery} on Facebook
                </h3>

                <p>
                    Find public community
                    traffic reports.
                </p>

                <a
                    class="result-link"
                    href="https://www.facebook.com/search/top?q=${encoded}"
                    target="_blank"
                    rel="noopener noreferrer">

                    View Reports

                    <i class="fa-solid fa-arrow-up-right-from-square"></i>

                </a>

            </div>

        </div>

    `;

}


/* =========================================
   QUICK SEARCH
========================================= */

document
    .querySelectorAll(".quick-search button")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const query =
                    button.dataset.search;

                searchInput.value =
                    query;

                performSearch();

            }
        );

    });


/* =========================================
   TOAST
========================================= */

let toastTimer;


function showToast(message) {

    toastMessage.textContent =
        message;

    toast.classList.add("show");


    clearTimeout(toastTimer);


    toastTimer =
        setTimeout(() => {

            toast.classList.remove("show");

        }, 3000);

}


/* =========================================
   LOGIN
========================================= */

const loginButton =
    document.getElementById(
        "loginButton"
    );

const loginModal =
    document.getElementById(
        "loginModal"
    );

const closeLogin =
    document.getElementById(
        "closeLogin"
    );


loginButton.addEventListener(
    "click",
    () => {

        loginModal.classList.add(
            "show"
        );

    }
);


closeLogin.addEventListener(
    "click",
    () => {

        loginModal.classList.remove(
            "show"
        );

    }
);


loginModal.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            loginModal
        ) {

            loginModal.classList.remove(
                "show"
            );

        }

    }
);


/* =========================================
   LOGIN FORM
========================================= */

document
    .getElementById("loginForm")
    .addEventListener(
        "submit",
        async event => {

            event.preventDefault();

            if (!supabaseClient) {
                showToast("Supabase is not configured. Login is unavailable.");
                return;
            }
            const result = await supabaseClient.auth.signInWithPassword({
                email: document.getElementById("email").value.trim(),
                password: document.getElementById("password").value
            });
            if (result.error) {
                showToast(result.error.message);
                return;
            }
            trafficAuth.rememberUser(result.data.user);
            loginModal.classList.remove("show");
            showToast("Login successful");
            window.location.href = "dashboard.html";

        }
    );