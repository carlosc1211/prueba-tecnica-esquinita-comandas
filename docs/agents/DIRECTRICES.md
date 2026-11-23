# DIRECTRICES — contrato de calidad que `develop` debe cumplir

`testing` audita cada tarea contra esta lista. Un solo incumplimiento ⇒ **RECHAZADO**.

## Build y verificación
- **D-01** `npm run lint`, `npm run typecheck`, `npm test` y `npm run build` terminan sin errores ni warnings de TypeScript.
- **D-02** No se suben artefactos (`.next/`, `node_modules/`, `.env*` salvo `.env.example`).

## Seguridad
- **D-03** Ninguna clave, token o contraseña en el código ni en el historial. Solo variables `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` pueden ser públicas; está prohibido usar la `service_role` key en la app.
- **D-04** Toda tabla nueva tiene **RLS activado** y políticas explícitas por operación. El rol `anon` solo puede: leer productos disponibles e insertar reservas en estado `pendiente`.
- **D-05** Toda Server Action del panel llama a `requireUser()` antes de leer o mutar datos.
- **D-06** Toda entrada de usuario (FormData, params, searchParams) se valida con un esquema Zod de `src/lib/validation` mediante `safeParse` antes de usarse.
- **D-07** Los errores de Supabase no se muestran crudos al usuario: se registran en servidor y se devuelve un mensaje genérico.

## Arquitectura
- **D-08** `src/app` y `src/components` no importan `@supabase/*` ni `src/lib/supabase` directamente (excepto `login`/`logout` vía `src/lib/actions`).
- **D-09** `src/lib/domain` no tiene I/O ni importa nada fuera de sí mismo.
- **D-10** Server Components por defecto; `'use client'` solo en componentes con estado o eventos.
- **D-11** Rutas que leen cookies/sesión renderizan su contenido dinámico dentro de `<Suspense>` (Cache Components).

## Datos y rendimiento
- **D-12** Prohibido `select('*')`: columnas explícitas.
- **D-13** Filtrado, ordenación y límites en la base de datos, no en JavaScript.
- **D-14** Operaciones que escriben en varias tablas se hacen en una función RPC de Postgres (transacción única).
- **D-15** Columnas usadas en `where`/`order by` frecuentes tienen índice en una migración.
- **D-16** Importes en céntimos enteros; el precio de una línea de comanda se congela (`unit_price_cents`) al crearla.
- **D-17** La carta pública usa `'use cache'` + `cacheTag('products')`, y toda mutación de productos invalida con `updateTag('products')`.

## Calidad de código
- **D-18** TypeScript estricto: sin `any`, `@ts-ignore`, `@ts-expect-error` ni `as unknown as`.
- **D-19** Sin `console.log`; solo `console.error` en manejo de errores de servidor.
- **D-20** Toda función de `src/lib/domain` y `src/lib/validation` tiene tests con casos válidos, límites e inválidos.
- **D-21** Las transiciones de estado de comandas y reservas pasan por `canTransition*` del dominio, tanto en UI como en la Server Action.

## UX y accesibilidad
- **D-22** Cada input tiene `<label>` asociado; los formularios muestran errores por campo y estado de envío (botón deshabilitado mientras `pending`).
- **D-23** Textos de interfaz en español; importes formateados con `formatEuros` (es-ES, EUR).
- **D-24** La app es usable a 360 px de ancho (sin scroll horizontal).
