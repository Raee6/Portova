# Portova

Portova is a portfolio builder for students. Add your details, pick one of three
layouts, and get a portfolio page you can share. Portfolios are saved in an online
database (Supabase), so they stay available after refreshing, and every student's
portfolio appears on the **Student Portfolios** page.

## Features

- Profile photo upload (cropped to a square and resized in the browser)
- "Add another" rows for education, projects, work experience and links
- Three templates with different layouts: Simple (resume), Modern (wide header + cards), Creative (colour blocks)
- Switch template at any time
- Student Portfolios page with search; Edit / Delete only on portfolios you created in this browser
- Toast messages and a "Contact me" button
- Works without a database too (local mode) while you are still setting things up

## Set up the online database (about 5 minutes)

1. Create a free project at <https://supabase.com>.
2. Open **SQL Editor**, paste the contents of `supabase-setup.sql`, and click **Run**.
3. Open **Project Settings > API** and copy the **Project URL** and the **publishable key**
   (never use the secret key in a website).
4. Paste them into `js/supabase.js`:

   ```js
   const SUPABASE_URL = "https://your-project.supabase.co";
   const SUPABASE_KEY = "sb_publishable_...";
   ```
5. Open `index.html` with the Live Server extension in VS Code (or upload the folder to Netlify).

If saving fails with "Could not find the 'about' column ... in the schema cache", an older
`portfolios` table is in your project. Run the updated `supabase-setup.sql` again; it renames the old
table to `portfolios_old` and creates the new one.

Until step 4 is done the Student Portfolios page shows a yellow notice and saves in the browser only.

## Table: `portfolios`

| Column | Type | Description |
|---|---|---|
| id | uuid (primary key) | Generated automatically |
| created_at | timestamptz | Date and time created |
| full_name | text (required) | Full name |
| email, phone, address, about | text | Contact details and About me |
| photo_url | text | Resized profile picture (image data URL) |
| skills | jsonb | `["HTML", "CSS"]` |
| education | jsonb | `[{school, degree, years}]` |
| projects | jsonb | `[{title, description, link}]` |
| experience | jsonb | `[{role, company, years, description}]` |
| links | jsonb | `[{label, url}]` |
| template | text | `simple`, `modern` or `creative` |

## Flow

Home → Enter information → Save → Choose template → Portfolio preview → Student Portfolios (view / edit / delete)

## Files

```
index.html  templates.html  create.html  preview.html  manage.html
css/style.css
js/common.js      theme, toast, safe-URL helpers
js/supabase.js    database connection and the Store (list / get / create / update / remove)
js/home.js        landing page demo        js/background.js  landing page animation
js/templates.js   template picker          js/create.js      form, rows, photo upload
js/preview.js     the three portfolio layouts   js/manage.js   student directory
supabase-setup.sql
```

## Note on permissions

The site has no login. The database policies let the public key read and write the table,
and the pages only show Edit / Delete on portfolios created in the same browser. This is fine
for a class project. For a real product, add Supabase Auth and restrict the policies to each
portfolio's owner.
