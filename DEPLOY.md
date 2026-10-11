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
window.CFG={API:"https://YOUR-RENDER-SERVICE.onrender.com",GOOGLE_CLIENT_ID:"xxxx.apps.googleusercontent.com",CLOUD_NAME:"",UPLOAD_PRESET:""};
```
(Cloudinary values are only needed for photo uploads; text posts work without them.)

## 5. Test with two accounts
Use two different Google accounts (or one normal + one incognito window).
1. **Creator:** Sign Up → "A creator" → Continue with Google → fill the Studio profile → write a post.
2. **Fan:** Sign Up → "A fan" → Google → on Home tap **▲** to upvote and **Follow** on the creator's post.
3. Optional: Profile → "Add mobile & password" so the account can also log in with phone + password.

Render free tier sleeps; the first request after idle can take ~50 s.
