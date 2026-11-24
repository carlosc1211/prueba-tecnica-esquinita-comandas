# Registro de ciclos Develop ↔ Testing

El orquestador añade una fila al cerrar cada tarea con `APROBADO`.

| Fecha | Tarea | Iteraciones | Fallos detectados (ids) | Veredicto |
|---|---|---|---|---|
| 2026-11-23 | T-01 Filtro por categoría en la carta pública (`/`): botones Todas/Bocadillos/Tapas/Bebidas/Postres con estado en cliente | 1 | Ninguno (sugerencias no bloqueantes: `isMenuFilter` sin uso en producción; región `role="status"` mejor persistente) | APROBADO |
| 2026-11-23 | T-02 Migración `20261123000100_grants.sql`: privilegios de tabla mínimos para `anon`/`authenticated` (error real `42501 permission denied` en Supabase) | 1 | Ninguno (sugerencias no bloqueantes: re-conceder `select` de `order_summaries` a `authenticated` en la propia migración; documentar que cada tabla nueva requiere GRANT explícitos) | APROBADO |
| 2026-11-23 | T-03 Error "Blocking Route: Date.now() while prerendering" en `/panel`: `await io()` en `createSupabaseServerClient` | 1 | Ninguno (sugerencia: confirmar `/panel` con sesión real en `next dev`, no verificable sin credenciales) | APROBADO |
| 2026-11-23 | T-04 Número de productos por categoría en los botones del filtro de la carta (`countByMenuFilter`, `formatProductCount`, `isProductCategory`) | 2 | D-20 ×2 (iter. 1): sin casos inválidos en `formatProductCount` (negativos/decimales/NaN) ni en `countByMenuFilter` (categoría desconocida generaba `NaN` y sumaba a `todas`) | APROBADO |
| 2026-11-24 | T-05 `formatEuros`: `RangeError` si no recibe céntimos enteros ≥ 0 (D-16) y tests de válidos, límites e inválidos (D-20) | 1 | Ninguno (sugerencia no bloqueante: `calculateTotalCents` tampoco valida sus entradas) | APROBADO |
| 2026-11-24 | T-06 `calculateTotalCents`: `RangeError` si cantidad o precio no son enteros seguros ≥ 0 o si el total desborda; tests de válidos, límites e inválidos (D-16, D-20) | 1 | Ninguno (sugerencia no bloqueante: comprobar también el texto de los mensajes de error en los tests) | APROBADO |
