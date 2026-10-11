# YourFavStar — deploy guide

Stack: Spring Boot (Render) + Neon Postgres + static frontend (Netlify).

## 1. Database (Neon)
Create a project, copy the connection details. Flyway creates all tables on first start.

## 2. Google login (needed before the frontend works)
Google Cloud Console → APIs & Services → Credentials → Create **OAuth client ID** → *Web application*.
- Authorized JavaScript origins: your Netlify URL (e.g. `https://yourfavstar.netlify.app`) and `http://localhost:8000` for testing.
- Copy the **Client ID** (no secret is needed).

## 3. Backend (Render → New Web Service → Docker, root dir `backend`)
Environment variables (keep your existing Neon vars from `render.yaml`) plus:
- `GOOGLE_CLIENT_ID` = the client ID from step 2
- `CORS_ORIGINS` = your Netlify URL (no trailing slash)
- `DEV_MODE=false`
- `AUTO_APPROVE=true`  (creator profiles go live instantly — needed for your test)
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` (only for paid membership; optional for now)

## 4. Frontend (Netlify → drag & drop the `frontend` folder)
Edit `frontend/config.js` first:
```js
window.CFG={API:"https://YOUR-RENDER-SERVICE.onrender.com",GOOGLE_CLIENT_ID:"xxxx.apps.googleusercontent.com"};
```
Photos are stored in your own Neon database (no Cloudinary needed). They are shrunk in the browser to ~1400px first.

## Changing the home banners
Edit `frontend/banners.js` (image, title, link). Put your own images in `frontend/banners/` or use any image URL, then re-upload the folder to Netlify.

## 5. Test with two accounts
Use two different Google accounts (or one normal + one incognito window).
1. **Creator:** Sign Up → Creator → Next → Google → mobile + password twice → Create account. A starter profile is created automatically. Tap the red **+** (bottom bar on mobile, **+ Post** on desktop) to post text or a photo.
2. **Fan:** Sign Up → Follower → Next → Google → mobile + password. On Home tap **▲** to upvote and **Follow** on the creator's post.
3. Log in later with Google, or mobile number → Next → password.

Render free tier sleeps; the first request after idle can take ~50 s.
