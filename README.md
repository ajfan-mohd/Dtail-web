# DTAIL Portfolio

Professional React + Vite project structure with React Router and Supabase client setup.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Environment setup

Create `.env.local` in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_public_key
```

## Main routes

- `/` Home
- `/about` About
- `/category/:category` Category portfolio page
- `/dtail-admin` Admin panel

## Notes

- The design/styling was preserved.
- Routing is now handled by `react-router-dom` instead of manual `window.history` state.
- Supabase client is ready in `src/lib/supabase.ts`.
- Admin data is still using the existing local state/localStorage flow until the next phase connects CRUD to Supabase tables.
