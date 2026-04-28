# Flujo de trabajo con GitHub en SmartStudIA

## La idea general

Este proyecto usa un flujo de **ramas por tarea**. Cada vez que se implementa una mejora o corrección, el trabajo se hace en una rama separada (nunca directamente en `main`). Esto protege el código que está funcionando en producción.

```
main (producción en Vercel)
  └── claude/nombre-de-rama  ← aquí se hace el trabajo
```

---

## Qué hace Claude (automático)

1. **Trabaja en una rama separada** — nunca toca `main` directamente. El nombre de la rama lo genera automáticamente, por ejemplo `claude/practical-mclean-d784db`.

2. **Hace commit** — cuando termina los cambios, agrupa todos los archivos modificados en un commit con un mensaje descriptivo. Ejemplo:
   ```
   feat(sec-04): implement server-side rate limiting via Firebase Admin SDK
   ```

3. **Sube la rama a GitHub** (`git push`) — los cambios pasan de tu ordenador al repositorio remoto en GitHub.

4. **Te da el enlace al Pull Request** — para que tú lo revises y apruebes.

---

## Qué haces tú (manual)

### Paso 1 — Abrir el Pull Request

Cuando Claude sube una rama, GitHub muestra un banner amarillo con el botón **"Compare & pull request"**. Haz clic ahí, o usa el enlace que te da Claude directamente.

En la pantalla del PR:
- **Title**: ya viene rellenado — puedes dejarlo o cambiarlo
- **Description**: explica qué se cambió y por qué
- Haz clic en **"Create pull request"**

### Paso 2 — Revisar los cambios (opcional pero recomendado)

En la pestaña **"Files changed"** del PR puedes ver exactamente qué líneas se añadieron (verde) y cuáles se eliminaron (rojo). No hace falta que entiendas todo el código, pero es buena práctica echar un vistazo.

### Paso 3 — Mergear el Pull Request

Si todo se ve bien, haz clic en **"Merge pull request"** → **"Confirm merge"**.

Esto integra los cambios en `main`. Vercel detecta el merge automáticamente y despliega la nueva versión en producción en 1-2 minutos.

### Paso 4 — Borrar la rama (opcional)

Después del merge, GitHub muestra el botón **"Delete branch"**. Puedes borrarlo — ya no hace falta, los cambios están en `main`.

---

## Esquema visual del flujo

```
Claude trabaja        Tú revisas y apruebas      Vercel despliega
──────────────        ──────────────────────      ────────────────
  Edita código    →   Abres el Pull Request   →   Merge a main
  git commit      →   Revisas "Files changed" →   Vercel detecta el merge
  git push        →   "Merge pull request"    →   Nueva versión en producción
  (te da el link)
```

---

## Tipos de mensajes de commit

Claude usa prefijos estándar para que sea fácil entender qué tipo de cambio es:

| Prefijo | Significa |
|---------|-----------|
| `feat:` | Nueva funcionalidad |
| `fix:` | Corrección de bug |
| `sec:` | Mejora de seguridad |
| `perf:` | Mejora de rendimiento |
| `docs:` | Solo documentación |
| `refactor:` | Reorganización de código sin cambiar comportamiento |

---

## Ramas activas en este proyecto

| Rama | Descripción |
|------|-------------|
| `main` | Producción — lo que está desplegado en Vercel |
| `claude/practical-mclean-d784db` | SEC-04: rate limiting en servidor (pendiente de merge) |

---

## Preguntas frecuentes

**¿Puedo mergear sin revisar?**
Sí, especialmente al principio. Con el tiempo conviene revisar "Files changed" para entender qué está cambiando en tu proyecto.

**¿Qué pasa si hay conflicto?**
GitHub te avisa. Normalmente no ocurre si solo trabaja Claude en las ramas — los conflictos aparecen cuando dos personas editan el mismo archivo a la vez.

**¿Tengo que hacer algo en mi ordenador después del merge?**
Si quieres tener `main` actualizado localmente: abre una terminal en la carpeta del proyecto y ejecuta `git pull`. No es obligatorio si trabajas solo con Claude.

**¿Claude puede mergear él solo?**
No. Siempre te deja el último paso a ti — tú decides qué entra en producción.
