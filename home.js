/* =========================================================
   ROUTEGUIDE HOME PAGE
   home.js
========================================================= */


/* =========================
   ELEMENTS
========================= */

const mobileMenu =
    document.getElementById("mobileMenu");

const mainNav =
    document.getElementById("mainNav");

const themeButton =
    document.getElementById("themeButton");

const loginButton =
    document.getElementById("loginButton");

const loginModal =
    document.getElementById("loginModal");

const closeLogin =
    document.getElementById("closeLogin");

const modalBackground =
    document.getElementById("modalBackground");

const loginForm =
    document.getElementById("loginForm");

const userRecoveryForm =
    document.getElementById("userRecoveryForm");

const password =
    document.getElementById("password");

const showPassword =
    document.getElementById("showPassword");

const toast =
    document.getElementById("toast");

const socialLoginButtons =
    document.querySelectorAll("[data-auth-provider]");

const ratingButtons = document.querySelectorAll("[data-rating]");
const ratingMessage = document.getElementById("ratingMessage");

function paintRating(value) {
    ratingButtons.forEach(function (button) {
        const star = button.querySelector("i");
        const active = Number(button.dataset.rating) <= value;
        star.classList.toggle("fa-solid", active);
        star.classList.toggle("fa-regular", !active);
    });
}

ratingButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        const value = Number(button.dataset.rating);
        localStorage.setItem("routeguide-rating", String(value));
        localStorage.setItem("routeguide-rating-passport", passport || "RG-GUEST");
        paintRating(value);
        if (ratingMessage) ratingMessage.textContent = "Thanks for rating RouteGuide " + value + " out of 5.";
    });
});

const savedRating = Number(localStorage.getItem("routeguide-rating"));
if (savedRating >= 1 && savedRating <= 5) paintRating(savedRating);

const commentForm = document.getElementById("commentForm");
const commentList = document.getElementById("commentList");
const anonymousPassport = document.getElementById("anonymousPassport");
const anonymousComment = document.getElementById("anonymousComment");
const publicCommentIdentity = document.getElementById("publicCommentIdentity");
const commentDisplayName = document.getElementById("commentDisplayName");
const anonymousPassportKey = "routeguide-anonymous-passport";

function getAnonymousPassport() {
    let passport = localStorage.getItem(anonymousPassportKey);
    if (!passport) {
        const token = window.crypto?.randomUUID?.() || Math.random().toString(36).slice(2) + Date.now().toString(36);
        passport = "RG-GUEST-" + token.replace(/-/g, "").slice(0, 8).toUpperCase();
        localStorage.setItem(anonymousPassportKey, passport);
    }
    return passport;
}

const passport = getAnonymousPassport();
if (anonymousPassport) anonymousPassport.textContent = passport;

function renderComments(comments) {
    if (!commentList) return;
    commentList.replaceChildren();
    if (!comments.length) {
        commentList.innerHTML = "<small>No comments yet. Be the first to share your experience.</small>";
        return;
    }
    comments.forEach(function (comment) {
        const article = document.createElement("article");
        article.className = "comment-card";
        const header = document.createElement("div");
        header.className = "comment-card-header";
        const avatar = document.createElement("span");
        avatar.className = "comment-avatar";
        avatar.setAttribute("aria-hidden", "true");
        avatar.innerHTML = '<i class="fa-regular fa-user"></i>';
        const author = document.createElement("strong");
        author.textContent = comment.is_anonymous === false ? (comment.display_name || "RouteGuide user") : (comment.passport || "RG-GUEST");
        const date = document.createElement("small");
        date.textContent = new Date(comment.created_at || comment.createdAt).toLocaleDateString();
        header.append(avatar, author, date);
        const text = document.createElement("p");
        text.textContent = comment.comment;
        article.append(header, text);
        commentList.appendChild(article);
    });
}

async function loadComments() {
    if (!commentList) return;
    if (authClient) {
        const result = await authClient.from("routeguide_comments").select("passport,display_name,is_anonymous,comment,created_at").order("created_at", { ascending: false }).limit(30);
        if (!result.error) {
            renderComments(result.data || []);
            return;
        }
    }
    renderComments(JSON.parse(localStorage.getItem("routeguide-comments") || "[]"));
}

if (commentForm) commentForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    const input = document.getElementById("commentText");
    const comment = input.value.trim();
    if (!comment) return;
    const isAnonymous = anonymousComment.checked;
    const displayName = commentDisplayName.value.trim();
    if (!isAnonymous && !displayName) {
        showToast("Enter a display name or choose anonymous posting.");
        commentDisplayName.focus();
        return;
    }
    const record = {
        passport: isAnonymous ? passport : null,
        display_name: isAnonymous ? null : displayName,
        is_anonymous: isAnonymous,
        comment: comment
    };
    const submit = commentForm.querySelector("button[type=submit]");
    submit.disabled = true;
    if (authClient) {
        const result = await authClient.from("routeguide_comments").insert(record);
        if (result.error) {
            submit.disabled = false;
            showToast("Comments are not enabled yet. Run the comments SQL setup first.");
            return;
        }
    } else {
        const comments = JSON.parse(localStorage.getItem("routeguide-comments") || "[]");
        comments.unshift({ ...record, createdAt: new Date().toISOString() });
        localStorage.setItem("routeguide-comments", JSON.stringify(comments.slice(0, 30)));
    }
    input.value = "";
    commentDisplayName.value = "";
    submit.disabled = false;
    await loadComments();
});

if (anonymousComment) anonymousComment.addEventListener("change", function () {
    publicCommentIdentity.hidden = anonymousComment.checked;
    commentDisplayName.required = !anonymousComment.checked;
    commentForm.querySelector("button[type=submit]").innerHTML = anonymousComment.checked
        ? '<i class="fa-solid fa-paper-plane"></i> Post anonymously'
        : '<i class="fa-solid fa-paper-plane"></i> Post publicly';
});

loadComments();

const assistantModal = document.getElementById("assistantModal");
const assistantMessages = document.getElementById("assistantMessages");
const assistantInput = document.getElementById("assistantInput");
const routeGuideAuth = window.RouteGuideAuth || {};
const authConfig = routeGuideAuth.config || window.ROUTEGUIDE_SUPABASE || {};
const authClient = routeGuideAuth.getClient ? routeGuideAuth.getClient() : null;

async function handleGoogleIdentityCredential(response) {
    if (!authClient || !response?.credential) {
        showToast("Google login is not configured yet.");
        return;
    }
    const result = await authClient.auth.signInWithIdToken({
        provider: "google",
        token: response.credential
    });
    if (result.error) {
        showToast(result.error.message);
        return;
    }
    finishLogin(result.data.user);
}

window.handleGoogleLogin = handleGoogleIdentityCredential;
const loginSubmit = loginForm?.querySelector(".submit-login");
const loginGoogle = document.querySelector(".google-login");
const guestLoginButton = document.getElementById("guestLoginButton");
const loginLockoutLimit = 5;
const loginLockoutDuration = 15 * 60 * 1000;

function getLoginLock(identity) {
    try {
        return JSON.parse(localStorage.getItem("routeguide-login-lock:" + identity) || "null");
    } catch (error) {
        return null;
    }
}

function setLoginLock(identity, attempts) {
    localStorage.setItem("routeguide-login-lock:" + identity, JSON.stringify({
        attempts: attempts,
        lockedUntil: attempts >= loginLockoutLimit ? Date.now() + loginLockoutDuration : 0
    }));
}

function clearLoginLock(identity) {
    localStorage.removeItem("routeguide-login-lock:" + identity);
}

function getLockoutMessage(identity) {
    const lock = getLoginLock(identity);
    if (!lock) return "";
    if (lock.lockedUntil && lock.lockedUntil > Date.now()) {
        const minutes = Math.ceil((lock.lockedUntil - Date.now()) / 60000);
        return "Too many failed attempts. Try again in " + minutes + " minute" + (minutes === 1 ? "" : "s") + ".";
    }
    if (lock.lockedUntil) clearLoginLock(identity);
    return "";
}

function finishLogin(user) {
    if (!user) return;
    if (routeGuideAuth.rememberUser) routeGuideAuth.rememberUser(user);
    window.location.href = "dashboard.html";
}

function finishGuestLogin() {
    localStorage.setItem("routeguideUser", JSON.stringify({
        identity: "RouteGuide guest",
        loggedIn: true,
        guest: true,
        loginTime: new Date().toISOString()
    }));
    window.location.href = "dashboard.html";
}

guestLoginButton?.addEventListener("click", function () {
    finishGuestLogin();
});

function showUserRecovery() {
    if (!userRecoveryForm || !loginForm) return;
    openLoginModal();
    loginForm.hidden = true;
    userRecoveryForm.hidden = false;
}

if (authClient) {
    authClient.auth.getSession().then(function ({ data }) {
        const hasAuthCallback = window.location.hash.includes("access_token") || window.location.search.includes("code=");
        if (userRecoveryForm && window.location.hash.includes("type=recovery")) {
            showUserRecovery();
            return;
        }
        if (data.session && hasAuthCallback) {
            finishLogin(data.session.user);
        }
    });
    authClient.auth.onAuthStateChange(function (event) {
        if (event === "PASSWORD_RECOVERY") showUserRecovery();
    });
}

function openAssistant() {
    if (!assistantModal) return;
    assistantModal.classList.add("show");
    assistantModal.setAttribute("aria-hidden", "false");
    assistantInput?.focus();
}

function closeAssistant() {
    if (!assistantModal) return;
    assistantModal.classList.remove("show");
    assistantModal.setAttribute("aria-hidden", "true");
}

function assistantReply(question) {
    const text = question.toLowerCase();
    const route = question.match(/\bfrom\s+(.+?)\s+(?:to|towards)\s+(.+?)(?:[?.!,]|$)/i);
    if (route) return "For " + route[1].trim() + " to " + route[2].trim() + ", open Routes to compare the journey in Google Maps. Check current traffic, weather and road reports before departure because travel time and closures change.";
    if (text.includes("traffic") || text.includes("jam") || text.includes("congestion")) return "Tell me the Kenyan road, town or county, such as Thika Road, Kisii or Nakuru. I can prepare a Google Maps traffic search, but live conditions must be verified at departure.";
    if (text.includes("safe") || text.includes("safety")) return "Travel in daylight, prefer main highways, check hazard reports and avoid flooded or poorly lit sections. A live safety score needs community and road-condition data connected to the app.";
    if (text.includes("cost") || text.includes("fare") || text.includes("fuel")) return "Trip cost uses distance, fuel efficiency, current fuel price and tolls. Matatu fares should be confirmed locally because they change by stage and time.";
    if (text.includes("emergency") || text.includes("hospital") || text.includes("police")) return "For urgent help in Kenya call 999 or 112. Open Emergency for nearby service links, and share your location with someone you trust.";
    if (text.includes("matatu") || text.includes("stage")) return "Tell me any Kenyan town, county or destination. Matatu stages and fares vary locally, so confirm the latest details at the stage before boarding.";
    if (text.includes("weather") || text.includes("flood")) return "Tell me the town, county or road you are travelling to. Check the Weather page and Kenya Meteorological Department warnings before leaving.";
    return "I can help with routes, traffic, safety, hazards, nearby services, matatus, costs, weather and emergencies anywhere in Kenya. Tell me the place or route you are asking about.";
}

function sendAssistantMessage(message) {
    const question = message.trim();
    if (!question || !assistantMessages) return;
    [question, assistantReply(question)].forEach(function (text, index) {
        const item = document.createElement("div");
        item.className = `assistant-message ${index ? "bot" : "user"}`;
        item.textContent = text;
        assistantMessages.appendChild(item);
    });
    assistantMessages.scrollTop = assistantMessages.scrollHeight;
}

document.getElementById("openAssistant")?.addEventListener("click", openAssistant);
document.getElementById("closeAssistant")?.addEventListener("click", closeAssistant);
document.getElementById("assistantBackdrop")?.addEventListener("click", closeAssistant);
document.getElementById("assistantForm")?.addEventListener("submit", function (event) {
    event.preventDefault();
    sendAssistantMessage(assistantInput.value);
    assistantInput.value = "";
});
document.querySelectorAll("[data-prompt]").forEach(function (button) {
    button.addEventListener("click", function () { sendAssistantMessage(button.dataset.prompt); });
});
document.querySelectorAll("[data-feature]").forEach(function (button) {
    button.addEventListener("click", function () {
        if (button.dataset.feature === "uber") {
            window.open("https://m.uber.com/ul/", "_blank", "noopener,noreferrer");
            showToast("Opening the official Uber ride page.");
            return;
        }

        if (button.dataset.feature === "uber-help") {
            window.open("https://help.uber.com/", "_blank", "noopener,noreferrer");
            showToast("Opening official Uber Help.");
            return;
        }

        const prompts = {
            route: "How do I plan a route in Kenya?",
            safety: "How can I choose a safe route?",
            hazards: "Show me road hazards and closures",
            matatu: "Find a matatu stage",
            cost: "Calculate my trip cost",
            emergency: "Find emergency services",
            drive: "How does Drive Mode work?",
            offline: "How do I use an offline Kenya map?"
        };
        openAssistant();
        sendAssistantMessage(prompts[button.dataset.feature]);
    });
});


/* =========================
   MOBILE MENU
========================= */

if (mobileMenu && mainNav) {
    mobileMenu.addEventListener("click", function () {

        mainNav.classList.toggle("open");


        if (mainNav.classList.contains("open")) {

            mobileMenu.innerHTML =
                '<i class="fa-solid fa-xmark"></i>';

        } else {

            mobileMenu.innerHTML =
                '<i class="fa-solid fa-bars"></i>';

        }

    });
}


/* Close mobile menu after clicking */

if (mainNav && mobileMenu) {
    document
        .querySelectorAll("#mainNav a")
        .forEach(function (link) {

            link.addEventListener("click", function () {

                mainNav.classList.remove("open");

                mobileMenu.innerHTML =
                    '<i class="fa-solid fa-bars"></i>';

            });

        });
}


/* =========================
   LOGIN MODAL
========================= */

function openLoginModal() {

    loginModal.classList.add("show");

    document.body.style.overflow = "hidden";

}


function closeLoginModal() {

    loginModal.classList.remove("show");

    document.body.style.overflow = "";

}


if (loginButton) {
    loginButton.addEventListener(
        "click",
        openLoginModal
    );
}


if (closeLogin) {
    closeLogin.addEventListener(
        "click",
        closeLoginModal
    );
}


if (modalBackground) {
    modalBackground.addEventListener(
        "click",
        closeLoginModal
    );
}

if (window.location.hash === "#login" && loginModal) openLoginModal();


/* ESC KEY */

document.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Escape") {

            closeLoginModal();

        }

    }
);


/* =========================
   SHOW PASSWORD
========================= */

if (showPassword && password) {
    showPassword.addEventListener(
        "click",
        function () {

            const icon =
                showPassword.querySelector("i");


            if (password.type === "password") {

                password.type = "text";

                icon.classList.remove(
                    "fa-eye"
                );

                icon.classList.add(
                    "fa-eye-slash"
                );

            } else {

                password.type = "password";

                icon.classList.remove(
                    "fa-eye-slash"
                );

                icon.classList.add(
                    "fa-eye"
                );

            }

        }
    );
}


/* =========================
   TOAST
========================= */

function showToast(message) {

    if (!toast) return;

    toast.textContent = message;

    toast.classList.add("show");


    setTimeout(function () {

        toast.classList.remove("show");

    }, 2800);

}


/* =========================
   POPULAR DESTINATIONS
========================= */

const popularButtons =
    document.querySelectorAll(
        ".popular button"
    );


if (popularButtons.length) {
    popularButtons.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                const place =
                    button.getAttribute(
                        "data-place"
                    );

                const destination = document.getElementById("destination");

                if (!destination) return;

                destination.value = place;
                destination.focus();

            }
        );

    });
}


/* =========================
   FIND ROUTE
========================= */

const routeButton = document.getElementById("findRoute");

function openGoogleDirections(start, destination) {
    const origin = start || "Kenya";
    const url =
        "https://www.google.com/maps/dir/?api=1" +
        "&origin=" + encodeURIComponent(origin) +
        "&destination=" + encodeURIComponent(destination) +
        "&travelmode=driving";

    window.open(url, "_blank", "noopener,noreferrer");
}

if (routeButton) {
    routeButton.addEventListener(
        "click",
        function () {


            const start =
                document
                    .getElementById(
                        "startPoint"
                    )
                    .value
                    .trim();


            const destination =
                document
                    .getElementById(
                        "destination"
                    )
                    .value
                    .trim();


            if (!destination) {

                showToast(
                    "Please enter your destination."
                );

                return;

            }


            openGoogleDirections(start, destination);

            showToast(
                "Opening directions in Google Maps."
            );

        }
    );
}


/* =========================
   LOGIN FORM
========================= */

if (loginForm) loginForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const identityField = document.getElementById("loginIdentity");
        const identity = identityField ? identityField.value.trim() : "";


        if (!identity) {

            showToast(
                "Please enter your email or phone number."
            );

            return;

        }

        if (!password || password.value.length < 6) {
            showToast("Password must be at least 6 characters.");
            return;
        }

        const lockoutMessage = getLockoutMessage(identity.toLowerCase());
        if (lockoutMessage) {
            showToast(lockoutMessage);
            return;
        }

        if (!authClient) {
            showToast("Supabase is not configured. Login is unavailable.");
            return;
        }

        if (!identity.includes("@")) {
            showToast("Use the email address connected to your account.");
            return;
        }

        loginSubmit.disabled = true;
        const result = await authClient.auth.signInWithPassword({ email: identity, password: password.value });
        loginSubmit.disabled = false;
        if (result.error) {
            const key = identity.toLowerCase();
            const lock = getLoginLock(key) || { attempts: 0 };
            const attempts = lock.attempts + 1;
            setLoginLock(key, attempts);
            if (attempts >= loginLockoutLimit) {
                showToast("Too many failed attempts. Login is blocked for 15 minutes.");
            } else {
                showToast("Incorrect email or password. " + (loginLockoutLimit - attempts) + " attempts remaining.");
            }
            return;
        }
        clearLoginLock(identity.toLowerCase());
        closeLoginModal();
        showToast("Login successful. Opening your dashboard...");
        setTimeout(function () { finishLogin(result.data.user); }, 400);

    }
);


/* =========================
   FORGOT PASSWORD
========================= */

const forgotPassword = document.getElementById("forgotPassword");

if (forgotPassword) forgotPassword.addEventListener(
        "click",
        async function (event) {

            event.preventDefault();
            const identityField = document.getElementById("loginIdentity");
            const email = identityField ? identityField.value.trim().toLowerCase() : "";
            if (!authClient) {
                showToast("Supabase is not configured. Password recovery is unavailable.");
                return;
            }
            if (!email || !email.includes("@")) {
                showToast("Enter your account email first.");
                identityField?.focus();
                return;
            }
            const result = await authClient.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin + window.location.pathname
            });
            showToast(result.error ? result.error.message : "Recovery email sent. Check your inbox and spam folder.");

        }
    );

if (userRecoveryForm) userRecoveryForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    const newPassword = document.getElementById("newUserPassword").value;
    const confirmPassword = document.getElementById("confirmUserPassword").value;
    if (newPassword.length < 6) {
        showToast("Use at least 6 characters.");
        return;
    }
    if (newPassword !== confirmPassword) {
        showToast("The passwords do not match.");
        return;
    }
    const result = await authClient.auth.updateUser({ password: newPassword });
    if (result.error) {
        showToast(result.error.message);
        return;
    }
    await authClient.auth.signOut();
    userRecoveryForm.hidden = true;
    loginForm.hidden = false;
    window.history.replaceState({}, document.title, window.location.pathname);
    showToast("Password updated. You can now log in.");
});

document.getElementById("cancelUserRecovery")?.addEventListener("click", function () {
    userRecoveryForm.hidden = true;
    loginForm.hidden = false;
    window.history.replaceState({}, document.title, window.location.pathname);
});


/* =========================
   SOCIAL LOGIN
========================= */

socialLoginButtons.forEach(function (button) {
    button.addEventListener("click", async function () {
        const provider = button.dataset.authProvider;
        if (!authClient) {
            showToast("Supabase is not configured. Social login is unavailable.");
            return;
        }
        socialLoginButtons.forEach(function (item) { item.disabled = true; });
        const googleClientId = authConfig.googleClientId || "";
        if (provider === "google" && window.google?.accounts?.id && googleClientId && !googleClientId.includes("YOUR_GOOGLE_CLIENT_ID")) {
            window.google.accounts.id.initialize({
                client_id: googleClientId,
                callback: handleGoogleIdentityCredential,
                auto_select: false,
                cancel_on_tap_outside: true
            });
            window.google.accounts.id.prompt();
            socialLoginButtons.forEach(function (item) { item.disabled = false; });
            return;
        }
        const result = await authClient.auth.signInWithOAuth({
            provider: provider,
            options: { redirectTo: window.location.origin + window.location.pathname }
        });
        socialLoginButtons.forEach(function (item) { item.disabled = false; });
        if (result.error) showToast(result.error.message + " Enable this provider in Supabase Authentication settings.");
    });
});


/* =========================
   THEME BUTTON
========================= */

function updateThemeButton() {
    if (!themeButton) return;

    const icon = themeButton.querySelector("i");
    const text = themeButton.querySelector("span");
    const lightMode = document.body.classList.contains("light-mode");

    icon?.classList.toggle("fa-moon", !lightMode);
    icon?.classList.toggle("fa-sun", lightMode);
    if (text) text.textContent = lightMode ? "Light Mode" : "Dark Mode";
}

if (localStorage.getItem("routeguide-theme") === "light") {
    document.body.classList.add("light-mode");
}
updateThemeButton();

if (themeButton) themeButton.addEventListener(
    "click",
    function () {

        document.body.classList.toggle(
            "light-mode"
        );

        localStorage.setItem(
            "routeguide-theme",
            document.body.classList.contains("light-mode") ? "light" : "dark"
        );
        updateThemeButton();

    }
);
