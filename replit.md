# Workly Game Core

Página web de presentación del proyecto Workly Craft v1.0, con sistema de votación por IP (cada hora), sección de comentarios, autenticación por cookies y nombre de usuario persistente.

## Run & Operate

- `pnpm --filter @workspace/workly-game-core run dev` — frontend (puerto asignado por workflow)
- `pnpm --filter @workspace/api-server run dev` — API backend (puerto 8080)
- `pnpm run typecheck` — typecheck completo de todos los paquetes
- `pnpm run build` — typecheck + build de todos los paquetes
- `pnpm --filter @workspace/api-spec run codegen` — regenerar hooks React Query y schemas Zod desde el spec OpenAPI
- `pnpm --filter @workspace/db run push` — aplicar cambios de schema a la DB (solo dev)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS + Framer Motion
- API: Express 5 + Drizzle ORM + PostgreSQL
- Validación: Zod (zod/v4), drizzle-zod
- Codegen API: Orval (desde OpenAPI spec)

## Where things live

- `artifacts/workly-game-core/src/` — frontend React
  - `pages/Home.tsx` — página principal, control de flujo cookie/username/contenido
  - `components/CookieModal.tsx` — modal de aceptación de cookies (obligatorio)
  - `components/UsernameModal.tsx` — modal de nombre de usuario (permanente)
  - `components/VoteSection.tsx` — sistema de votación con countdown
  - `components/CommentSection.tsx` — sección de comentarios
  - `components/ProjectCard.tsx` — tarjeta de vidrio con info del proyecto
- `artifacts/api-server/src/routes/` — rutas del backend
  - `users.ts` — crear/obtener usuario por nombre
  - `votes.ts` — votar, stats y cooldown por IP
  - `comments.ts` — listar y publicar comentarios
- `lib/db/src/schema/` — schema de base de datos (Drizzle)
- `lib/api-spec/openapi.yaml` — contrato OpenAPI (fuente de verdad)

## Architecture decisions

- IP detection usa `req.ip` con `trust proxy: 1` en Express — nunca confía en el header x-forwarded-for directamente (previene bypass de cooldown).
- Nombre de usuario se guarda en `localStorage['workly_username']` de forma permanente; el backend lo almacena en la tabla `users` para persistencia global.
- Consentimiento de cookies en `localStorage['workly_cookies_accepted']`; si se rechaza, la página reemplaza su contenido con una pantalla de rechazo (window.close() como intento primario, fallback garantizado).
- Cooldown de 1 hora por IP se verifica en el backend contra la DB.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Siempre correr `pnpm run typecheck:libs` después de cambiar `lib/db/src/schema/` para que los artifacts vean las declaraciones actualizadas.
- El sistema de votación es por IP — en desarrollo local todos comparten IP, lo cual puede dificultar las pruebas. Usar distintos navegadores/incógnito o esperar el cooldown de 1h.

## Pointers

- Ver `pnpm-workspace` skill para estructura del monorepo y configuración TypeScript.
