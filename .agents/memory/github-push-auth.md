---
name: GitHub push auth
description: Cómo hacer push a dnx-studios/Workly.Vote desde Replit con PAT
---

El gitPush() callback de Replit devuelve `provider: null` en este proyecto — no usar para push.

**Método que funciona:**
```bash
git remote set-url origin "https://${GITHUB_PERSONAL_ACCESS_TOKEN}@github.com/dnx-studios/Workly.Vote.git"
git push origin main
git remote set-url origin "https://github.com/dnx-studios/Workly.Vote.git"  # limpiar token de la URL
```

**Scopes requeridos en el PAT:** `repo` + `workflow` (workflow es necesario porque el repo tiene .github/workflows/).

**Por qué:** El gitPush() de Replit no detecta el provider en este repl (devuelve provider: null), pero git directo con token en URL sí funciona.

**Secret:** `GITHUB_PERSONAL_ACCESS_TOKEN` en Replit secrets.
