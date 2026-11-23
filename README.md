# La Esquinita del Turia · Comandas

App de gestión para un bar de bocadillos y tapas en Valencia, construida con un equipo de 3 agentes de Claude Code.

- **Pública:** carta en vivo (`/`) y solicitud de reservas (`/reservar`).
- **Personal (login):** comandas por mesa con flujo de estados (`/panel`), gestión de carta (`/panel/carta`) y reservas (`/panel/reservas`).

**Demo:** `<URL de producción en Vercel>` · **Usuario de prueba:** `<email>` / `<contraseña>`

## Equipo de agentes

| Agente | Archivo | Rol |
|---|---|---|
| Orquestador | [`CLAUDE.md`](CLAUDE.md) (+ [`AGENTS.md`](AGENTS.md)) | Descompone peticiones, delega, gestiona el bucle y cierra tareas |
| Develop | [`.claude/agents/develop.md`](.claude/agents/develop.md) | Programa siguiendo la arquitectura y convenciones del repo |
| Testing | [`.claude/agents/testing.md`](.claude/agents/testing.md) | Audita contra [`docs/agents/DIRECTRICES.md`](docs/agents/DIRECTRICES.md) y devuelve fallos hasta `APROBADO` |

Flujo: `Orquestador → Develop → Testing → (RECHAZADO → Develop …) → APROBADO → registro`. Cada ciclo se anota en [`docs/agents/registro-ciclos.md`](docs/agents/registro-ciclos.md).

## Stack y decisiones

- **Next.js 16** (App Router, Cache Components, Server Actions, `proxy.ts`), React 19, TypeScript estricto, Tailwind 4.
- **Supabase**: Postgres + Auth + RLS. La seguridad real vive en la base de datos: `anon` solo lee productos disponibles e inserta reservas `pendiente`.
- **Atomicidad**: la comanda y sus líneas se crean en la función `create_order` (una transacción, precios congelados desde la tabla `products`, nunca desde el cliente).
- **Concurrencia**: los cambios de estado usan bloqueo optimista (`update … where status = <estado leído>`).
- **Caché**: la carta pública se sirve con `'use cache'` + `cacheTag('products')`; cualquier cambio en la carta invalida con `updateTag`.
- **Validación**: Zod en todas las entradas; dominio puro (`src/lib/domain`) con transiciones de estado y dinero en céntimos.

## Puesta en marcha

### 1. Supabase (plan gratuito)
1. Crea un proyecto en <https://supabase.com>.
2. **SQL Editor** → ejecuta `supabase/migrations/20261123000000_init.sql` y después `supabase/seed.sql`.
3. **Authentication → Users → Add user** → crea el usuario de prueba (marca *Auto Confirm User*).
4. **Authentication → Sign In / Providers** → desactiva *Allow new users to sign up* (solo el personal tiene cuenta).
5. **Project Settings → API Keys** → copia la URL y la *publishable key*.

### 2. Local
```bash
cp .env.example .env.local   # rellena las dos variables
npm install
npm run dev
```

### 3. Vercel (plan Hobby)
1. Importa el repositorio de GitHub.
2. Añade `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` en *Environment Variables*.
3. Despliega.
4. **Settings → Deployment Protection → Vercel Authentication: Disabled**, para que la URL de producción sea pública.

## Calidad

```bash
npm run verify   # lint + typecheck + tests + build
```

CI en GitHub Actions ejecuta lo mismo en cada push.
