# AapkaStar backend (Spring Boot 3, Java 21, PostgreSQL)

Phase 1 foundation: phone-OTP auth with JWT, roles, artist profiles, public search, admin approval.

## Run with PostgreSQL
```bash
docker compose up -d          # PostgreSQL on :5432
mvn spring-boot:run           # API on http://localhost:8080 (Flyway creates the tables)
```

## Try it
```bash
# 1. request a code (dev mode returns it in the response and logs it)
curl -s localhost:8080/api/auth/otp/send -H 'Content-Type: application/json' -d '{"phone":"9876543210"}'
# 2. sign up as an artist, using the devOtp from step 1
curl -s localhost:8080/api/auth/otp/verify -H 'Content-Type: application/json' \
  -d '{"phone":"9876543210","code":"<devOtp>","name":"Manish K","role":"ARTIST"}'
# 3. create profile (use the token from step 2)
curl -s -X PUT localhost:8080/api/me/artist-profile -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"stageName":"Manish K","categorySlug":"singer","city":"Bengaluru","bio":"Acoustic singer","languages":["Hindi","English"],"experienceYears":6,"startingPrice":6000}'
# 4. public search
curl -s 'localhost:8080/api/artists?category=singer&city=Bengaluru&maxPrice=8000'
```
Make an admin: sign up normally, then `update users set role='ADMIN' where phone='...';` and log in again.

## Connect the UI
Run the HTML from a local server (`python3 -m http.server 5500`) and set `const API='http://localhost:8080'` in the HTML. A page published on claude.ai cannot reach localhost.

## Before production
Set `DEV_MODE=false` and wire an SMS provider in `AuthService.sendOtp`, use a strong `JWT_SECRET`, set `AUTO_APPROVE=false`, restrict `CORS_ORIGINS`.

## Phase 2 (included): booking requests
`POST /api/artists/{id}/enquiries` (customer), `GET /api/me/enquiries` (customer or artist), `POST /api/me/enquiries/{id}/ACCEPTED|DECLINED` (artist).

## Next
Email/SMS notifications, admin UI, then Razorpay payments.

Deploy: see ../DEPLOY.md
