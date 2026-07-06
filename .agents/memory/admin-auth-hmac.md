---
name: Admin auth HMAC
description: Cómo funciona la autenticación de admin en Workly Game Core
---

Admin auth usa HMAC en lugar de username string simple (que era bypasseable).

**Flujo:**
1. Frontend (Home.tsx) llama `POST /api/admin/session` con `{ username: 'Dinox' }`
2. Servidor verifica `username === ADMIN_USERNAME` (env var, default 'Dinox')
3. Servidor devuelve `{ token: HMAC(SESSION_SECRET, 'admin:Dinox') }`
4. Frontend guarda el token en estado React y lo pasa a AdminPanel y CommentSection como prop
5. Todas las rutas admin verifican el header `x-admin-token` contra el HMAC esperado

**Por qué:** El sistema anterior solo comparaba el username enviado por el cliente — cualquiera podía enviar `{ adminUsername: 'Dinox' }` y acceder.

**Secret requerido:** `SESSION_SECRET` en Replit (ya configurado).

**Toggles atómicos:** star/heart usan `SET has_star = NOT has_star` para evitar race conditions de read-then-write.
