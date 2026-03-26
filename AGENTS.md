# Mana Nexus — Agent Coding Rules

> These rules govern **all** AI-assisted code contributions to this project.  
> Read this file completely before making any changes.

---

## 1. Project Overview

**Mana Nexus** is a full-stack Magic: The Gathering card database & deck-building application.

| Layer | Stack |
|---|---|
| **Frontend** | React 18, Vite 5, TypeScript, TailwindCSS v3, React Router v6 |
| **Backend** | Express 5, TypeScript (ESM), `tsx` runner |
| **Card Data (SQL)** | PostgreSQL via Sequelize 6 (ORM) |
| **User/Deck Data (NoSQL)** | MongoDB via Mongoose 9 |
| **Auth** | JWT (Bearer tokens), bcrypt password hashing |

### Directory Layout

```
mana base/
├── frontend/          # React SPA (Vite)
│   └── src/
│       ├── components/   # Reusable UI components (Navbar, ProtectedRoute, etc.)
│       ├── context/      # React contexts (ThemeContext)
│       ├── data/         # Static data / constants
│       ├── pages/        # Page-level components (one per route)
│       ├── App.tsx       # Router & providers
│       ├── main.tsx      # Entry point
│       └── index.css     # Global styles / Tailwind directives
├── server/            # Express API
│   └── src/
│       ├── config/       # DB connection configs (mongo.ts)
│       ├── controllers/  # Route handler logic
│       ├── db/           # SQL enhancement scripts
│       ├── middleware/    # Express middleware (auth)
│       ├── models/       # Sequelize models (mtg.ts) & Mongoose schemas (user.ts, deck.ts)
│       ├── routes/       # Express route definitions
│       ├── types/        # Custom type declarations
│       ├── utils/        # Seeders, scripts, helpers
│       └── index.ts      # Server entry point
├── public/            # Static assets (card images, icons) — served by Express
└── Icons/             # Additional icon assets
```

---

## 2. TypeScript & Module Rules

- **All code is TypeScript** — no plain `.js` files in `src/`.
- **ES Modules** — both `frontend/` and `server/` use `"type": "module"`.
- **Server imports MUST use `.js` extensions** — even for `.ts` files. This is required by NodeNext module resolution.
  ```ts
  // ✅ Correct
  import sequelize from './models/index.js';
  import User from '../models/user.js';

  // ❌ Wrong
  import sequelize from './models/index';
  import User from '../models/user.ts';
  ```
- **Frontend imports use `.tsx` extensions** for local files:
  ```tsx
  import Login from './pages/Login.tsx';
  ```
- **Use `import type` for type-only imports**:
  ```ts
  import type { Request, Response } from 'express';
  ```
- **Strict mode is ON** — `tsconfig.json` has `"strict": true` in both packages.

---

## 3. Backend Architecture (Server)

### 3.1 MVC Pattern

All server features follow **Model → Controller → Route**:

1. **Model** (`server/src/models/`) — define the data shape
2. **Controller** (`server/src/controllers/`) — business logic & DB queries
3. **Route** (`server/src/routes/`) — wire HTTP methods to controllers
4. **Register** route in `server/src/index.ts` under `/api/{resource}`

### 3.2 Dual Database Convention

| Database | ORM | Used For | Collection/Table Prefix |
|---|---|---|---|
| **PostgreSQL** | Sequelize 6 | Card data, sets, editions, types, legalities | lowercase snake_case table names |
| **MongoDB** | Mongoose 9 | Users, decks, user-generated content | `MANA` prefix (e.g., `MANAusers`, `MANAdecks`) |

- **Never mix** — card/game data stays in PostgreSQL, user/account data stays in MongoDB.
- Sequelize models extend `Model` and use `Model.init()` syntax.
- Mongoose schemas use `new mongoose.Schema()` syntax.
- Mongoose models specify the explicit collection name as the third argument:
  ```ts
  const User = mongoose.model('User', userSchema, 'MANAusers');
  ```

### 3.3 Controller Pattern

Every controller function must follow this exact pattern:

```ts
// @desc    Description of what this endpoint does
// @route   HTTP_METHOD /api/resource/path
// @access  Public | Private
export const handlerName = async (req: Request, res: Response) => {
    try {
        // ... logic ...
        res.status(200).json(data);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
```

**Rules:**
- Always use `async/await`, never raw Promises.
- Wrap handler body in `try/catch`.
- Error responses always return `{ message: string }`.
- Use `res.status(XXX).json(...)` then `return;` — do NOT use `return res.status(...)`.
- For auth-required endpoints use `AuthRequest` type instead of `Request`.

### 3.4 Route Pattern

```ts
import express from 'express';
import { handler1, handler2 } from '../controllers/fooController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes (no middleware)
router.get('/public-endpoint', handler1);

// Protected routes  
router.get('/private-endpoint', protect as any, handler2);

export default router;
```

- Routes are registered in `server/src/index.ts` as:
  ```ts
  app.use('/api/{resource}', fooRoutes);
  ```
- Group route methods using `router.route('/')` when a single path has multiple HTTP methods.

### 3.5 Middleware

- Auth middleware lives in `server/src/middleware/authMiddleware.ts`.
- `protect` — verifies JWT Bearer token, attaches `req.user`.
- `adminOnly` — checks `req.user.role === 'admin'`.
- When applying `protect` to routes, cast as `protect as any` (Express 5 type workaround).

### 3.6 Environment Variables

| Variable | Purpose |
|---|---|
| `PORT` | Server port (default `3000`) |
| `DB_HOST` | PostgreSQL host |
| `DB_PORT` | PostgreSQL port (default `5432`) |
| `DB_NAME` | PostgreSQL database name (`MTGupdated`) |
| `DB_USER` | PostgreSQL user |
| `DB_PASSWORD` | PostgreSQL password |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | **Required** — server will exit without it |

- `.env` lives in `server/.env`.
- **Never hardcode secrets.** Always use `process.env`.
- Reference `.env.example` for required variables.

---

## 4. Frontend Architecture

### 4.1 Component Structure

- **Pages** (`frontend/src/pages/`) — one `.tsx` file per route. Large, self-contained components.
- **Components** (`frontend/src/components/`) — reusable, shared UI pieces.
- **Context** (`frontend/src/context/`) — React Context providers with a matching `useXxx` hook.
- **All components are functional** — use hooks, no class components.

### 4.2 Naming Conventions

| Item | Convention | Example |
|---|---|---|
| Page components | PascalCase, descriptive | `DeckEditor.tsx`, `AdminDashboard.tsx` |
| Shared components | PascalCase | `Navbar.tsx`, `ProtectedRoute.tsx` |
| Context files | PascalCase with `Context` suffix | `ThemeContext.tsx` |
| Custom hooks | `use` prefix, camelCase | `useTheme` |

### 4.3 Styling Rules — TailwindCSS v3

- **TailwindCSS v3** is the primary styling system — use utility classes.
- Dark mode uses the **`class` strategy** (`darkMode: 'class'` in `tailwind.config.js`).
- Always provide **both light and dark variants**:
  ```tsx
  className="bg-light-bg dark:bg-background-dark text-light-text dark:text-gray-200"
  ```
- Use the project's **custom color palette** defined in `tailwind.config.js`:
  - Primary: `primary` (gold #d4af35), `primary-dark`
  - Light mode: `light-bg`, `light-text`, `light-primary`, `light-secondary`
  - Accent: `mana-purple`, `mana-teal`, `mana-indigo`
  - Dark backgrounds: `background-dark` (#050505)
- Use the project's **custom fonts**:
  - `font-display` (Inter) for UI text
  - `font-serif` (Cinzel) for display/heading text
- **Do NOT add new Tailwind plugins or override the config** without explicit approval.

### 4.4 Routing

- React Router v6 (`react-router-dom`).
- Routes defined in `App.tsx` inside `<Routes>`.
- Protected routes wrap children in `<ProtectedRoute>`.
- Admin routes use `<ProtectedRoute adminOnly={true}>`.

### 4.5 API Communication

- Use **axios** for all HTTP requests.
- Backend base URL: `http://localhost:3000`.
- Frontend dev server: `http://localhost:5173`.
- Auth token stored in `localStorage` under key `token`.
- Attach token as `Authorization: Bearer <token>` header.
- Error responses from the API always have shape `{ message: string }`.

### 4.6 State & Auth Management

- Auth state is managed via `localStorage` keys:
  - `token` — JWT token string
  - `userRole` — `'user'` or `'admin'`
  - `username` — current username
  - `displayName` — current display name
- Theme state is managed via `ThemeContext` with localStorage persistence.
- On logout: clear all localStorage keys and reload the page.

---

## 5. Error Handling

### Backend
- All controllers use `try/catch`.
- Catch blocks: `catch (error: any)` → `res.status(500).json({ message: error.message })`.
- Validation errors: `res.status(400).json({ message: '...' })`.
- Not found: `res.status(404).json({ message: '...' })`.
- Unauthorized: `res.status(401).json({ message: '...' })`.
- Forbidden: `res.status(403).json({ message: '...' })`.

### Frontend
- Wrap API calls in `try/catch`.
- Display error messages from `error.response?.data?.message`.

---

## 6. Static Assets

- Card images and MTG icons are in the `public/` directory at project root.
- Served by Express at `/assets` and `/icons` paths.
- Vite config sets `publicDir: '../public'` so the frontend can also reference these assets.
- Reference assets via URL paths like `/assets/MTG icons/...`.

---

## 7. Development Workflow

### Running the project
```bash
# Terminal 1 — Backend
cd server
npm run dev          # uses tsx watch

# Terminal 2 — Frontend
cd frontend
npm run dev          # Vite dev server on :5173
```

### Adding a NEW feature (full-stack)
1. **Model** — add Sequelize model in `server/src/models/mtg.ts` (for card data) or create a new Mongoose schema in `server/src/models/` (for user data).
2. **Controller** — create `server/src/controllers/{feature}Controller.ts`.
3. **Route** — create `server/src/routes/{feature}Routes.ts`.
4. **Register** — import and mount in `server/src/index.ts`.
5. **Frontend page** — create `frontend/src/pages/{Feature}.tsx`.
6. **Route** — add `<Route>` in `frontend/src/App.tsx`.
7. **Nav link** — add navigation link in `frontend/src/components/Navbar.tsx` if needed.

---

## 8. Code Style & Conventions

- **Indentation**: 4 spaces (both frontend and server).
- **Semicolons**: used in server code; inconsistent in frontend — prefer using them.
- **Quotes**: single quotes for imports and strings.
- **Trailing commas**: yes, in multi-line structures.
- **No default exports for controllers** — use named exports (`export const handlerName`).
- **Default exports for**: models, routes, React components, configs.
- **Comment style**: use `// @desc`, `// @route`, `// @access` JSDoc-like comments above every controller function.
- **File naming**: camelCase for server files (`authController.ts`), PascalCase for React components (`DeckEditor.tsx`).

---

## 9. Critical Do-Nots

> [!CAUTION]
> Violating these rules will break the application.

1. **Do NOT remove `.js` extensions** from server-side imports.
2. **Do NOT use CommonJS** (`require`, `module.exports`) anywhere.
3. **Do NOT put user data in PostgreSQL** or card data in MongoDB.
4. **Do NOT introduce new CSS frameworks** — use TailwindCSS.
5. **Do NOT modify `tailwind.config.js`** colors or fonts without approval.
6. **Do NOT commit `.env` files** — they are gitignored.
7. **Do NOT use `return res.status()...`** — use `res.status(); return;` pattern.
8. **Do NOT create class components** in React — functional only.
9. **Do NOT change the Mongoose collection naming convention** (`MANA` prefix).
10. **Do NOT modify Sequelize model `tableName` values** — they must match the existing PostgreSQL schema.
