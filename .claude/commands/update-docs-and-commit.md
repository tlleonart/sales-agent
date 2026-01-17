# Update Docs and Commit

Actualiza la documentación del proyecto y crea un commit con los cambios.

## Instrucciones

1. **Analiza los cambios actuales** en el código usando `git diff` y `git status`

2. **Actualiza la documentación** según corresponda:
   - `docs/changelog.md` - Agrega los cambios bajo la sección [Unreleased]
   - `docs/project_status.md` - Actualiza el progreso de las fases y checkboxes completados
   - `docs/architecture.md` - Si hay cambios arquitecturales significativos

3. **Actualiza la fecha** en `docs/project_status.md` (Last Updated)

4. **Crea el commit** con un mensaje descriptivo que incluya:
   - Resumen de los cambios de código
   - Mención de que la documentación fue actualizada

5. **Formato del commit:**
   ```
   <tipo>: <descripción corta>

   - Detalle de cambio 1
   - Detalle de cambio 2
   - Docs actualizados

   Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
   ```

   Tipos: feat, fix, docs, refactor, test, chore

## Ejemplo de uso

Después de implementar una nueva feature:
```
/update-docs-and-commit
```

Claude analizará los cambios, actualizará changelog y project_status, y creará un commit apropiado.

