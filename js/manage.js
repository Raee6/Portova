/* Student directory: everyone's portfolios, searchable.
   Edit / change template / delete are shown only on portfolios created in this browser. */

const listEl = document.getElementById("portfolioList");
const msgEl = document.getElementById("message");
const searchEl = document.getElementById("search");
const bannerEl = document.getElementById("modeBanner");

let all = [];

function el(tag, props = {}, ...children) {
    const node = document.createElement(tag);
    Object.assign(node, props);
    node.append(...children);
    return node;
}
function link(text, href, cls) { return el("a", { textContent: text, href, className: cls }); }

function avatar(p) {
    const img = safeImage(p.photo_url);
    if (img) return el("img", { className: "avatar", src: img, alt: "" });
    return el("div", { className: "avatar avatar-initial", textContent: (p.full_name || "?").charAt(0).toUpperCase() });
}

function renderItem(p) {
    const q = encodeURIComponent(p.id);
    const mine = Store.isMine(p.id);

    const title = el("h3", {}, p.full_name);
    title.append(el("span", { className: "pill pill-" + p.template, textContent: p.template }));
    if (mine) title.append(el("span", { className: "pill pill-own", textContent: "Yours" }));

    const date = p.created_at ? new Date(p.created_at).toLocaleDateString(undefined, { dateStyle: "medium" }) : "";
    const sub = [p.email, date && "Added " + date].filter(Boolean).join(" · ");
    const info = el("div", { className: "grow" }, title, el("p", { textContent: sub }));

    const actions = el("div", { className: "actions" }, link("View", "preview.html?id=" + q, "primary-button"));

    if (mine) {
        actions.append(
            link("Edit", "create.html?id=" + q, "secondary-button"),
            link("Change template", "templates.html?id=" + q, "secondary-button"));

        const del = el("button", { type: "button", className: "danger-button", textContent: "Delete" });
        del.addEventListener("click", async () => {
            if (!confirm(`Delete the portfolio for "${p.full_name}"? This cannot be undone.`)) return;
            del.disabled = true;
            try {
                await Store.remove(p.id);
                all = all.filter(x => x.id !== p.id);
                toast("Portfolio deleted");
                renderList();
            } catch (err) {
                del.disabled = false;
                toast("Could not delete: " + err.message, "error");
            }
        });
        actions.append(del);
    }

    return el("article", { className: "item" }, avatar(p), info, actions);
}

function showEmpty(searching) {
    msgEl.textContent = "";
    listEl.replaceChildren(el("div", { className: "empty" },
        el("p", { textContent: searching ? "No portfolios match your search." : "No student portfolios yet. Add the first one." }),
        searching ? "" : link("Add student portfolio", "create.html", "primary-button")));
}

function renderList() {
    const q = searchEl.value.trim().toLowerCase();
    const rows = all.filter(p => !q ||
        [p.full_name, p.email, (p.skills || []).join(" ")].join(" ").toLowerCase().includes(q));

    if (!rows.length) { showEmpty(!!q); return; }
    msgEl.textContent = rows.length + (rows.length === 1 ? " portfolio" : " portfolios");
    listEl.replaceChildren(...rows.map(renderItem));
}

searchEl.addEventListener("input", renderList);

if (Store.mode === "local") {
    bannerEl.hidden = false;
    bannerEl.textContent =
        "Not connected to an online database yet, so portfolios are saved in this browser only. " +
        "Add your Supabase URL and key in js/supabase.js to keep them online for everyone.";
}

(async () => {
    try {
        all = await Store.list();
        renderList();
    } catch (err) {
        msgEl.textContent = "Could not load portfolios. Check your Supabase URL, key and table.";
        toast("Could not load portfolios.", "error");
    }
})();
