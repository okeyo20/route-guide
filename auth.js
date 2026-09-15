(function () {
    const config = window.ROUTEGUIDE_SUPABASE || {};
    const configured = Boolean(window.supabase && config.url && config.anonKey &&
        !config.url.includes("YOUR_PROJECT_REF") && !config.anonKey.includes("YOUR_SUPABASE"));

    function getClient() {
        return configured ? window.supabase.createClient(config.url, config.anonKey) : null;
    }

    function rememberUser(user) {
        if (!user) return;
        localStorage.setItem("routeguideUser", JSON.stringify({
            identity: user.email || user.user_metadata?.full_name || "RouteGuide user",
            loggedIn: true,
            loginTime: new Date().toISOString()
        }));
    }

    function clearUser() {
        localStorage.removeItem("routeguideUser");
        sessionStorage.removeItem("routeguide-admin-session");
    }

    function isAdmin(user) {
        return user?.email?.toLowerCase() === "okeyomaxwel53@gmail.com";
    }

    function redirectUrl(path) {
        return new URL(path, window.location.href).href;
    }

    window.RouteGuideAuth = {
        config: config,
        configured: configured,
        getClient: getClient,
        rememberUser: rememberUser,
        clearUser: clearUser,
        isAdmin: isAdmin,
        redirectUrl: redirectUrl
    };
}());
