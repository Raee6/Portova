/* Portfolio preview: renders safely (textContent only) and lets the owner
   switch template. */

const id = new URLSearchParams(location.search).get("id");
const statusEl = document.getElementById("statusMessage");
const content = document.getElementById("portfolioContent");
let current = null;

function $(sel) { return document.getElementById(sel); }

function span(cls, text) {
    const n = document.createElement("span");
    n.className = cls;
    n.textContent = text;
    return n;
}
function anchor(href, label) {
    const a = document.createElement("a");
    a.href = href; a.target = "_blank"; a.rel = "noopener noreferrer"; a.textContent = label;
    return a;
}

function fillList(listId, items, build) {
    const ul = $(listId);
    ul.replaceChildren();
    items.forEach(item => {
        const li = document.createElement("li");
        build(li, item);
        ul.append(li);
    });
    ul.closest(".section").hidden = items.length === 0;
}

const BUILD = {
    education(li, e) {
        li.append(span("i-title", e.degree || e.school || ""));
        if (e.degree && e.school) li.append(span("i-sub", e.school));
        if (e.years) li.append(span("i-meta", e.years));
    },
    experience(li, x) {
        li.append(span("i-title", x.role || x.company || ""));
        if (x.role && x.company) li.append(span("i-sub", x.company));
        if (x.years) li.append(span("i-meta", x.years));
        if (x.description) li.append(span("i-desc", x.description));
    },
    projects(li, p) {
        li.append(span("i-title", p.title || "Untitled project"));
        if (p.description) li.append(span("i-desc", p.description));
        const href = safeUrl(toUrl(p.link));
        if (href) { const a = anchor(href, "View project"); a.className = "i-link"; li.append(a); }
    },
    skills(li, s) { li.textContent = s; },
    links(li, l) {
        const href = safeUrl(toUrl(l.url));
        if (href) li.append(anchor(href, l.label || l.url));
        else li.textContent = l.label || l.url || "";
    }
};

function setTemplate(t) {
    t = cleanTemplate(t);
    document.body.className = "portfolio-page " + t;
    document.querySelectorAll(".switch").forEach(b => b.classList.toggle("on", b.dataset.template === t));
}

function render(p) {
    document.title = p.full_name + " | Portova";
    $("fullName").textContent = p.full_name;

    const img = $("profilePicture"), initial = $("initialAvatar");
    const pic = safeImage(p.photo_url);
    const showInitial = () => { img.hidden = true; initial.hidden = false; initial.textContent = p.full_name.charAt(0).toUpperCase(); };
    if (pic) { img.hidden = false; initial.hidden = true; img.src = pic; img.onerror = showInitial; }
    else showInitial();

    $("email").textContent = p.email ? "✉ " + p.email : "";
    $("contactNumber").textContent = p.phone ? "☎ " + p.phone : "";
    $("address").textContent = p.address ? "⌖ " + p.address : "";

    const mail = $("contactBtn");
    mail.hidden = !p.email;
    if (p.email) mail.href = "mailto:" + encodeURIComponent(p.email).replace(/%40/g, "@");

    $("aboutMe").textContent = p.about || "";
    $("aboutMe").closest(".section").hidden = !p.about;

    fillList("education", p.education, BUILD.education);
    fillList("skills", p.skills, BUILD.skills);
    fillList("projects", p.projects, BUILD.projects);
    fillList("workExperience", p.experience, BUILD.experience);
    fillList("socialLinks", p.links.filter(l => l.url || l.label), BUILD.links);

    setTemplate(p.template);
}

async function load() {
    if (!id) { location.replace("manage.html"); return; }
    try {
        current = await Store.get(id);
        statusEl.hidden = true;
        content.hidden = false;
        render(current);
        if (Store.isMine(id)) {
            $("editLink").hidden = false;
            $("editLink").href = "create.html?id=" + encodeURIComponent(id);
        }
    } catch (err) {
        statusEl.textContent = "We couldn't find that portfolio. It may have been deleted.";
        toast("Could not load this portfolio.", "error");
    }
}

document.querySelectorAll(".switch").forEach(btn => {
    btn.addEventListener("click", async () => {
        if (!current) return;
        const t = cleanTemplate(btn.dataset.template);
        setTemplate(t);
        if (!Store.isMine(id)) {
            toast("Preview only. You can save a template on your own portfolios.");
            return;
        }
        try { current = await Store.update(id, { template: t }); toast("Template saved"); }
        catch (err) { toast("Could not save the template.", "error"); }
    });
});

setTemplate("simple");
load();
