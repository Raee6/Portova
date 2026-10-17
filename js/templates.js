/* Template picker.
   - New portfolio:      remember the choice, then go to the form.
   - Existing (?id=...): apply the template and go straight to the preview. */

const params = new URLSearchParams(location.search);
const editingId = params.get("id");

document.querySelectorAll(".choose-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
        const template = cleanTemplate(btn.dataset.template);
        btn.disabled = true;

        try {
            if (editingId) {
                await Store.update(editingId, { template });
                location.href = "preview.html?id=" + encodeURIComponent(editingId);
            } else {
                localStorage.setItem(KEY_PENDING, template);
                location.href = "create.html";
            }
        } catch (err) {
            btn.disabled = false;
            toast("Could not apply the template: " + err.message, "error");
        }
    });
});

// Details come first now, so this page needs a saved portfolio to style.
if (!editingId) location.replace("create.html");

// When restyling, highlight the current template and adjust the intro text.
if (editingId) {
    document.querySelector(".subtitle").textContent = params.get("new")
        ? "Your details are saved. Pick a layout to see your portfolio."
        : "Pick a new look. Your information stays exactly the same.";
    Store.get(editingId).then(p => {
        const current = document.querySelector(`.choose-btn[data-template="${cleanTemplate(p.template)}"]`);
        if (current) current.closest(".template-card").classList.add("selected");
    }).catch(() => {});
}
