# Registro de ciclos Develop ↔ Testing

El orquestador añade una fila al cerrar cada tarea con `APROBADO`.

| Fecha | Tarea | Iteraciones | Fallos detectados (ids) | Veredicto |
|---|---|---|---|---|
| 2026-11-23 | T-01 Filtro por categoría en la carta pública (`/`): botones Todas/Bocadillos/Tapas/Bebidas/Postres con estado en cliente | 1 | Ninguno (sugerencias no bloqueantes: `isMenuFilter` sin uso en producción; región `role="status"` mejor persistente) | APROBADO |
| 2026-11-23 | T-02 Migración `20261123000100_grants.sql`: privilegios de tabla mínimos para `anon`/`authenticated` (error real `42501 permission denied` en Supabase) | 1 | Ninguno (sugerencias no bloqueantes: re-conceder `select` de `order_summaries` a `authenticated` en la propia migración; documentar que cada tabla nueva requiere GRANT explícitos) | APROBADO |
| 2026-11-23 | T-03 Error "Blocking Route: Date.now() while prerendering" en `/panel`: `await io()` en `createSupabaseServerClient` | 1 | Ninguno (sugerencia: confirmar `/panel` con sesión real en `next dev`, no verificable sin credenciales) | APROBADO |
