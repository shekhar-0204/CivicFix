# CivicFix – Frontend

Civic issue reporting and complaint tracking. React + Vite, plain CSS, lucide-react. Talks to the CivicFix API (Express + MongoDB + ImageKit); complaints live in MongoDB, not in the browser.

## Run
```bash
npm install
npm run dev      # development
npm run build    # production build
npm run lint
```

## Backend connection
Authentication now uses the CivicFix API (`../backend`): bcrypt-hashed passwords and JWTs.
Copy `.env.example` to `.env` and set `VITE_API_URL` (default `http://localhost:5000/api`);
the same origin must be listed in the backend's `CLIENT_URL`.

There are no built-in accounts. Citizens register in the app; the first admin is created on the
backend with `npm run seed:admin`. The browser stores only a JWT (`localStorage` with "Remember me",
otherwise `sessionStorage`), never a password.

## Structure
```
src/
  components/   Header, Navbar, Sidebar, Footer, AppLayout, AuthLayout, FormField,
                ComplaintCard, StatusBadge, StatsCard, Loader, EmptyState, ProtectedRoute
  context/      AuthContext + AuthProvider (keeps UI in sync with auth state)
  hooks/        useAuth, useAsync (loading / error / reload for service calls)
  services/     api.js (Axios + token storage), authService.js, complaintService.js
  data/         categories.js (single category list)
  utils/        helpers.js (dates, validation), imageCompression.js (resize/compress photos before upload)
  pages/        public + citizen pages;  pages/admin/ for admin
  styles/       layout.css (design system, app shell, home);  index.css (auth screens)
```

## Migration status
- Auth (`authService.js` + `api.js` Axios client): connected to the API.
- Complaints (`complaintService.js`): connected to the API. Photos are resized/compressed in the browser before upload.
