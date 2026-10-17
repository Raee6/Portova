/* ==========================================================
   Portova: data layer

   ONLINE MODE  - fill in the two values below (Supabase project URL and the
                  *publishable* key, never a secret key). Portfolios are then
                  saved in the online database, stay there after refreshing,
                  and every student's portfolio shows up on the Manage page.
   LOCAL MODE   - while the values are still placeholders, everything is saved
                  in this browser only so you can try the app.

   Create the table by running supabase-setup.sql in the Supabase SQL editor.
   ========================================================== */

const SUPABASE_URL = "https://ukssugynqtkcfdoxmefs.supabase.co";
const SUPABASE_KEY = "sb_publishable_bJHLrhRErVPYqq9y4UjyVA_zs4VGyzf";
const TABLE = "portfolios";

const KEY_DATA = "portova_portfolios";   // local-mode data
const KEY_IDS = "portova_my_ids";        // portfolios created in this browser (you can edit/delete these)
const KEY_PENDING = "portova_template";  // template picked before the form

const cloud =
    /^https?:\/\//.test(SUPABASE_URL) && window.supabase
        ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
        : null;

function readJSON(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
}
function writeJSON(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

function myIds() { return readJSON(KEY_IDS, []); }
function rememberId(id) { const ids = myIds(); if (!ids.includes(id)) writeJSON(KEY_IDS, [id, ...ids]); }
function forgetId(id) { writeJSON(KEY_IDS, myIds().filter(x => x !== id)); }

const VALID_TEMPLATES = ["simple", "modern", "creative"];
function cleanTemplate(t) { return VALID_TEMPLATES.includes(t) ? t : "simple"; }

function uid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return "id-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

/* Accept rows from this version and from the older text-based version. */
function normalize(r) {
    const lines = t => String(t || "").split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    const arr = (v, fromText) => Array.isArray(v) ? v : fromText;
    return {
        ...r,
        phone: r.phone ?? r.contact_number ?? "",
        about: r.about ?? r.about_me ?? "",
        photo_url: r.photo_url ?? r.profile_picture ?? "",
        skills: arr(r.skills, String(r.skills || "").split(/[,\n]/).map(s => s.trim()).filter(Boolean)),
        education: arr(r.education, lines(r.education).map(degree => ({ degree }))),
        projects: arr(r.projects, lines(r.projects).map(title => ({ title }))),
        experience: arr(r.experience ?? r.work_experience, lines(r.experience ?? r.work_experience).map(role => ({ role }))),
        links: arr(r.links, lines(r.links ?? r.social_links).map(url => ({ url }))),
        template: cleanTemplate(r.template)
    };
}

const NOT_YOURS = "You can only change portfolios you created in this browser.";

const Store = {
    mode: cloud ? "cloud" : "local",

    isMine(id) { return myIds().includes(id); },

    /* Every portfolio in the database (the student directory). */
    async list() {
        let rows;
        if (cloud) {
            const { data, error } = await cloud.from(TABLE)
                .select("id,full_name,email,template,photo_url,skills,created_at")
                .order("created_at", { ascending: false });
            if (error) throw error;
            rows = data;
        } else {
            rows = readJSON(KEY_DATA, []).sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
        }
        return rows.map(normalize);
    },

    async get(id) {
        if (cloud) {
            const { data, error } = await cloud.from(TABLE).select("*").eq("id", id).single();
            if (error) throw error;
            return normalize(data);
        }
        const row = readJSON(KEY_DATA, []).find(p => p.id === id);
        if (!row) throw new Error("Portfolio not found");
        return normalize(row);
    },

    async create(record) {
        if (cloud) {
            const { data, error } = await cloud.from(TABLE).insert(record).select().single();
            if (error) throw error;
            rememberId(data.id);
            return normalize(data);
        }
        const row = { ...record, id: uid(), created_at: new Date().toISOString() };
        writeJSON(KEY_DATA, [row, ...readJSON(KEY_DATA, [])]);
        rememberId(row.id);
        return normalize(row);
    },

    async update(id, patch) {
        if (!Store.isMine(id)) throw new Error(NOT_YOURS);
        if (cloud) {
            const { data, error } = await cloud.from(TABLE).update(patch).eq("id", id).select().single();
            if (error) throw error;
            return normalize(data);
        }
        const all = readJSON(KEY_DATA, []);
        const i = all.findIndex(p => p.id === id);
        if (i < 0) throw new Error("Portfolio not found");
        all[i] = { ...all[i], ...patch };
        writeJSON(KEY_DATA, all);
        return normalize(all[i]);
    },

    async remove(id) {
        if (!Store.isMine(id)) throw new Error(NOT_YOURS);
        if (cloud) {
            const { error } = await cloud.from(TABLE).delete().eq("id", id);
            if (error) throw error;
        } else {
            writeJSON(KEY_DATA, readJSON(KEY_DATA, []).filter(p => p.id !== id));
        }
        forgetId(id);
    }
};
