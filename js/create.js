/* Create / edit form. */

const form = document.getElementById("portfolioForm");
const saveButton = document.getElementById("saveButton");
const message = document.getElementById("formMessage");
const badge = document.getElementById("templateBadge");

const editId = new URLSearchParams(location.search).get("id");
let template = cleanTemplate(localStorage.getItem(KEY_PENDING));

/* Groups of repeatable rows: [field key, label, multi-line?] */
const GROUPS = {
    education:  [["school", "School"], ["degree", "Degree or course"], ["years", "Years"]],
    projects:   [["title", "Project title"], ["description", "Short description", true], ["link", "Link (optional)"]],
    experience: [["role", "Role"], ["company", "Company"], ["years", "Years"], ["description", "What you did", true]],
    links:      [["label", "Label (e.g. GitHub)"], ["url", "URL"]]
};

function showMessage(text, type) {
    message.textContent = text;
    message.className = type ? "msg-" + type : "";
}

/* ---------- repeatable rows ---------- */
function addRow(group, values = {}) {
    const row = document.createElement("div");
    row.className = "row";

    const fields = document.createElement("div");
    fields.className = "row-fields";
    GROUPS[group].forEach(([key, label, multi]) => {
        const input = document.createElement(multi ? "textarea" : "input");
        if (multi) input.rows = 2;
        input.dataset.key = key;
        input.placeholder = label;
        input.setAttribute("aria-label", label);
        input.value = values[key] || "";
        if (multi) input.classList.add("wide");
        fields.append(input);
    });

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "row-remove";
    remove.textContent = "×";
    remove.setAttribute("aria-label", "Remove this entry");
    remove.addEventListener("click", () => {
        row.remove();
        const box = document.getElementById("g-" + group);
        if (!box.children.length) addRow(group);   // always keep one empty row
    });

    row.append(fields, remove);
    document.getElementById("g-" + group).append(row);
}

function fillGroup(group, items) {
    document.getElementById("g-" + group).replaceChildren();
    const list = items && items.length ? items : [{}];
    list.forEach(v => addRow(group, v));
}

function collect(group) {
    return [...document.querySelectorAll(`#g-${group} .row`)]
        .map(row => Object.fromEntries(
            [...row.querySelectorAll("[data-key]")].map(i => [i.dataset.key, i.value.trim()])))
        .filter(o => Object.values(o).some(Boolean));
}

document.querySelectorAll("[data-add]").forEach(btn =>
    btn.addEventListener("click", () => {
        addRow(btn.dataset.add);
        const rows = document.querySelectorAll(`#g-${btn.dataset.add} .row`);
        rows[rows.length - 1].querySelector("input, textarea").focus();
    }));

Object.keys(GROUPS).forEach(g => fillGroup(g, []));

/* ---------- template badge ---------- */
function renderBadge() {
    badge.hidden = !editId;   // only shown when editing a saved portfolio
    const label = template.charAt(0).toUpperCase() + template.slice(1);
    badge.querySelector("strong").textContent = label;
    badge.querySelector("a").href = editId
        ? "templates.html?id=" + encodeURIComponent(editId)
        : "templates.html";
}

// New portfolios start here: details first, then the template is chosen after saving.

/* ---------- profile photo upload ----------
   The chosen image is cropped to a square, shrunk to 400px and saved as a
   small JPEG data URL in the hidden "photo_url" field. */
const photoInput = document.getElementById("photo_file");
const photoPreview = document.getElementById("photoPreview");
const photoRemove = document.getElementById("photoRemove");
const photoHint = document.getElementById("photoHint");
const photoField = form.elements["photo_url"];
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const PHOTO_SIZE = 400;

function renderPhoto() {
    const img = safeImage(photoField.value);
    photoPreview.classList.toggle("has-image", !!img);
    photoPreview.style.backgroundImage = img ? `url("${img}")` : "";
    photoPreview.textContent = img ? "" : "Drop a photo here";
    photoRemove.hidden = !img;
}

function fileToSquareJpeg(file) {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            const side = Math.min(img.width, img.height);
            const canvas = document.createElement("canvas");
            canvas.width = canvas.height = PHOTO_SIZE;
            canvas.getContext("2d").drawImage(
                img, (img.width - side) / 2, (img.height - side) / 2, side, side,
                0, 0, PHOTO_SIZE, PHOTO_SIZE);
            URL.revokeObjectURL(url);
            resolve(canvas.toDataURL("image/jpeg", 0.86));
        };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("That file could not be read as an image.")); };
        img.src = url;
    });
}

async function handlePhoto(file) {
    if (!file) return;
    if (!/^image\/(png|jpeg|webp)$/.test(file.type)) {
        showMessage("Choose a JPG, PNG or WebP image.", "error"); return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
        showMessage("That photo is larger than 5 MB. Choose a smaller one.", "error"); return;
    }
    try {
        photoField.value = await fileToSquareJpeg(file);
        showMessage("", "");
        photoHint.textContent = file.name + " added.";
        renderPhoto();
    } catch (err) {
        showMessage(err.message, "error");
    }
}

photoInput.addEventListener("change", () => { handlePhoto(photoInput.files[0]); photoInput.value = ""; });
photoPreview.addEventListener("click", () => photoInput.click());
photoPreview.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); photoInput.click(); } });
photoRemove.addEventListener("click", () => { photoField.value = ""; photoHint.textContent = "Photo removed."; renderPhoto(); });
["dragenter", "dragover"].forEach(t => photoPreview.addEventListener(t, e => { e.preventDefault(); photoPreview.classList.add("drag"); }));
["dragleave", "drop"].forEach(t => photoPreview.addEventListener(t, e => { e.preventDefault(); photoPreview.classList.remove("drag"); }));
photoPreview.addEventListener("drop", e => handlePhoto(e.dataTransfer.files[0]));

/* ---------- About me counter ---------- */
const about = document.getElementById("about");
const counter = document.getElementById("aboutCounter");
const ABOUT_MAX = 600;
about.maxLength = ABOUT_MAX;
function updateCounter() { counter.textContent = about.value.length + " / " + ABOUT_MAX; }
about.addEventListener("input", updateCounter);

/* ---------- live skill chips ---------- */
const skillsInput = document.getElementById("skills");
const skillChips = document.getElementById("skillChips");
function updateChips() {
    skillChips.replaceChildren();
    skillsInput.value.split(",").map(s => s.trim()).filter(Boolean).slice(0, 24).forEach(s => {
        const chip = document.createElement("span");
        chip.textContent = s;
        skillChips.append(chip);
    });
}
skillsInput.addEventListener("input", updateChips);

/* ---------- side menu follows the section you are in ---------- */
const stepLinks = [...document.querySelectorAll(".steps a")];
if ("IntersectionObserver" in window) {
    const seen = new IntersectionObserver(entries => {
        entries.forEach(en => {
            if (!en.isIntersecting) return;
            stepLinks.forEach(a => a.classList.toggle("on", a.getAttribute("href") === "#" + en.target.id));
        });
    }, { rootMargin: "-25% 0px -65% 0px" });
    document.querySelectorAll(".builder-main .card").forEach(c => seen.observe(c));
}

/* ---------- edit mode ---------- */
if (editId) {
    document.getElementById("pageTitle").textContent = "Edit Your Portfolio";
    document.getElementById("stepNote").textContent = "Editing a saved portfolio";
    saveButton.textContent = "Save Changes";

    if (!Store.isMine(editId)) {
        toast("You can only edit portfolios you created in this browser.", "error");
        setTimeout(() => { location.replace("preview.html?id=" + encodeURIComponent(editId)); }, 1200);
    } else {
        Store.get(editId).then(p => {
            ["full_name", "email", "phone", "address", "about"].forEach(k => { form.elements[k].value = p[k] || ""; });
            form.elements["skills"].value = (p.skills || []).join(", ");
            photoField.value = p.photo_url || "";
            Object.keys(GROUPS).forEach(g => fillGroup(g, p[g]));
            template = p.template;
            renderBadge();
            renderPhoto();
            updateCounter();
            updateChips();
        }).catch(err => showMessage("Could not load this portfolio: " + err.message, "error"));
    }
}
renderBadge();
updateCounter();

/* ---------- save ---------- */
form.addEventListener("submit", async e => {
    e.preventDefault();

    const record = {
        full_name: form.elements["full_name"].value.trim(),
        email: form.elements["email"].value.trim(),
        phone: form.elements["phone"].value.trim(),
        address: form.elements["address"].value.trim(),
        about: form.elements["about"].value.trim(),
        photo_url: photoField.value,
        skills: form.elements["skills"].value.split(",").map(s => s.trim()).filter(Boolean),
        education: collect("education"),
        projects: collect("projects"),
        experience: collect("experience"),
        links: collect("links"),
        template
    };

    if (!record.full_name) { showMessage("Please enter your full name.", "error"); return; }

    saveButton.disabled = true;
    showMessage("Saving…", "");

    try {
        const saved = editId
            ? await Store.update(editId, record)
            : await Store.create(record);

        // Clear the chosen template so the next new portfolio starts fresh.
        localStorage.removeItem(KEY_PENDING);

        toast("Portfolio saved");
        setTimeout(() => {
            location.href = editId
                ? "preview.html?id=" + encodeURIComponent(saved.id)
                : "templates.html?id=" + encodeURIComponent(saved.id) + "&new=1";   // next: choose a template
        }, 500);
    } catch (err) {
        saveButton.disabled = false;
        const outdated = /schema cache|column/i.test(err.message || "");
        showMessage(outdated
            ? "Your Supabase table is out of date. Run supabase-setup.sql in the Supabase SQL Editor, wait 30 seconds, then try again. (" + err.message + ")"
            : "Could not save: " + err.message, "error");
        toast("Could not save your portfolio.", "error");
    }
});
