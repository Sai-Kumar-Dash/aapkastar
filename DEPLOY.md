# AapkaStar — Deployment

This repository is ready for the free-tier deployment path:

**Neon PostgreSQL → Render (Spring Boot/Docker) → Netlify (static frontend) → Cloudinary (media)**

## 1. GitHub

Create a GitHub repository and push the **contents of this folder** so that `backend/` and `frontend/` are at the repository root.

```bash
git init
git add .
git commit -m "Deploy AapkaStar"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/aapkastar.git
git push -u origin main
```

## 2. Neon

Create a PostgreSQL project and copy its connection details.

Neon gives something like:

```text
postgresql://USER:PASSWORD@HOST/DB?sslmode=require
```

For Spring Boot use:

```text
jdbc:postgresql://HOST/DB?sslmode=require
```

The username and password stay in `DB_USER` and `DB_PASSWORD`.

Flyway runs the database migrations automatically on the first backend start.

## 3. Render

The included `render.yaml` is a blueprint for the backend.

If you configure Render manually:

- New → Web Service
- Repository: your AapkaStar GitHub repository
- Root Directory: `backend`
- Runtime: Docker
- Plan: Free

Set:

| Variable | Value |
|---|---|
| `DB_URL` | Neon JDBC URL |
| `DB_USER` | Neon username |
| `DB_PASSWORD` | Neon password |
| `JWT_SECRET` | long random secret |
| `DEV_MODE` | `false` |
| `AUTO_APPROVE` | `true` for MVP |
| `CORS_ORIGINS` | Netlify URL (after step 4) |
| `GOOGLE_CLIENT_ID` | Google Web client ID, if using Google login |

Deploy.

Test:

```text
https://YOUR-RENDER-SERVICE.onrender.com/api/categories
```

You should receive JSON.

The free Render service may sleep when idle, so the first request after inactivity can be slow.

## 4. Cloudinary

For artist profile photos, cover photos, and post media:

1. Create a Cloudinary account.
2. Create an upload preset.
3. Set the preset to **Unsigned**.
4. Copy the Cloud name and preset name.

The frontend uploads directly to Cloudinary, so no Cloudinary secret belongs in the frontend.

## 5. Netlify

The frontend is plain static HTML/JavaScript.

Before uploading, edit:

`frontend/config.js`

Example:

```js
window.CFG = {
  API: "https://YOUR-RENDER-SERVICE.onrender.com",
  GOOGLE_CLIENT_ID: "YOUR_GOOGLE_WEB_CLIENT_ID",
  CLOUD_NAME: "YOUR_CLOUDINARY_CLOUD_NAME",
  UPLOAD_PRESET: "YOUR_UNSIGNED_PRESET"
};
```

Do **not** add a trailing slash to `API`.

Then:

- Netlify → Add new site
- Deploy manually → drag the `frontend` folder

Or connect the GitHub repository. The included `netlify.toml` sets the publish directory to `frontend`.

Copy the Netlify URL.

## 6. CORS

Go back to Render and set:

```text
CORS_ORIGINS=https://YOUR-SITE.netlify.app
```

If you have multiple frontend origins, separate them with commas.

Redeploy the backend.

## 7. Google Login

In Google Cloud Console, create a Web OAuth client.

Add your Netlify URL to:

**Authorized JavaScript origins**

For example:

```text
https://your-site.netlify.app
```

Then put the same client ID in:

```js
GOOGLE_CLIENT_ID: "..."
```

The backend also receives the same client ID through Render's `GOOGLE_CLIENT_ID` environment variable.

## 8. First admin

The current build has admin API endpoints but no admin UI.

After registering your own account, run in Neon SQL Editor:

```sql
UPDATE users
SET role = 'ADMIN'
WHERE email = 'your-email@example.com';
```

For an MVP, leaving:

```text
AUTO_APPROVE=true
```

means new artist profiles are approved immediately.

Set it to `false` when you want manual approval.

## 9. What is included

- Email/password registration and login
- Google sign-in
- JWT authentication
- Artist/customer roles
- Artist profiles
- Profile and cover photos
- Text/photo/video posts through Cloudinary
- Artist discovery and filters
- Favorite artists
- Saved posts
- Artist enquiries/booking requests
- Artist request management
- Admin approval API
- PostgreSQL + Flyway migrations
- Render Docker deployment
- Netlify static deployment

## 10. Important production settings

Keep:

```text
DEV_MODE=false
```

Do not commit:

- database passwords
- JWT secrets
- Google client secrets
- Cloudinary API secrets

Only the Cloudinary **unsigned upload preset** and cloud name are used by the frontend.

For a public launch, use a custom domain and review Cloudinary upload restrictions and limits.
