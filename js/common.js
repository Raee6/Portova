/* Shared helpers for every Portova page: toast messages and URL safety. */

(() => {
    // Portova is light-only now; clear any theme saved by an older version.
    try { localStorage.removeItem("portova-theme"); } catch { /* storage blocked */ }
    delete document.documentElement.dataset.theme;
})();

/* ---------- toast ---------- */
let toastTimer;
function toast(message, type) {
    let t = document.getElementById("toast");
    if (!t) {
        t = document.createElement("div");
        t.id = "toast";
        t.setAttribute("role", "status");
        t.setAttribute("aria-live", "polite");
        document.body.append(t);
    }
    t.textContent = message;
    t.className = "show" + (type === "error" ? " toast-error" : "");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.className = ""; }, 3200);
}

/* ---------- URL helpers (only http/https links and image data URLs are ever used) ---------- */
function toUrl(u) {
    u = (u || "").trim();
    return !u ? "" : /^https?:\/\//i.test(u) ? u : "https://" + u;
}
function safeUrl(u) {
    try { const x = new URL(u); return /^https?:$/.test(x.protocol) ? x.href : null; }
    catch { return null; }
}
function safeImage(u) {
    if (/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(u || "")) return u;
    return safeUrl(u || "");
}
