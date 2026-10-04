# CivicFix API

Express + MongoDB (Mongoose) + JWT + Cloudinary.

```bash
npm install
cp .env.example .env      # fill in MONGO_URI, JWT_SECRET (see comments inside)
npm run seed:admin        # creates the first admin from ADMIN_EMAIL / ADMIN_PASSWORD
npm run dev               # or: npm start
```

Health check: `GET http://localhost:5000/api/health`

| Area | Endpoints |
|------|-----------|
| Auth | `POST /api/auth/register`, `/login`, `/admin/login`; `GET /api/auth/me` |
| Citizen profile | `GET/PUT /api/users/me`, `PUT /api/users/me/password` |
| Citizen complaints | `POST/GET /api/complaints` (POST is multipart: category, description, location, requestId, optional `photo` JPG/PNG/WebP up to 5 MB), `GET /api/complaints/stats`, `GET /api/complaints/:id` |
| Admin | `GET /api/admin/dashboard`, `GET /api/admin/complaints`, `GET /api/admin/complaints/:id`, `PATCH /api/admin/complaints/:id/status`, `GET/PUT /api/admin/profile`, `PUT /api/admin/profile/password` |

Send `Authorization: Bearer <token>` on every route except register/login/health.
Errors always look like `{ "success": false, "message": "...", "errors": { field: "..." } }`.
