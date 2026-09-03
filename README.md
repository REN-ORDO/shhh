This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Amigo Secreto Virtual

App para organizar un intercambio de regalos ("Amigo Secreto") online: sorteo
automático (derangement con exclusiones opcionales), links individuales por
participante, y pistas anónimas entre amigo secreto y su destinatario.

### 1. Crear el proyecto en Supabase

Creá un proyecto en [supabase.com](https://supabase.com) (o usá uno existente).

### 2. Correr la migración

Copiá el contenido de `supabase/migrations/0001_init.sql` y ejecutalo en el
**SQL Editor** de tu proyecto Supabase (Database → SQL Editor → New query →
pegar → Run). Esto crea las tablas `events`, `participants`, `assignments`,
`exclusions`, `clues`, con RLS habilitado (deny-all por defecto; el acceso
real de la app pasa por la service role key en Server Actions).

Después, corré también `supabase/migrations/0002_auth.sql` (mismo proceso:
pegar en el SQL Editor y ejecutar). Esta migración agrega la columna
`owner_id` a `events` y una policy de RLS para que cada organizador pueda
leer sus propios eventos con su sesión — necesaria para el login del
organizador (ver más abajo).

Alternativamente, si usás la Supabase CLI localmente:

```bash
supabase db push
```

> **Nota sobre confirmación de email**: por default, Supabase Auth exige que
> el usuario confirme su email antes de poder iniciar sesión. Para pruebas
> rápidas o un uso simple sin verificación de correo, podés desactivarlo en
> **Authentication → Providers → Email → Confirm email** (OFF). Si lo dejás
> activado, el organizador va a necesitar confirmar su cuenta desde el email
> que le llega antes de poder loguearse.

### 3. Configurar variables de entorno

Copiá `.env.local.example` a `.env.local` y completá los valores desde
**Project Settings → API** de tu proyecto Supabase:

```bash
cp .env.local.example .env.local
```

- `NEXT_PUBLIC_SUPABASE_URL`: URL del proyecto.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: la clave `anon`/`public`.
- `SUPABASE_SERVICE_ROLE_KEY`: la clave `service_role` (¡secreta! nunca la
  expongas en el cliente — este proyecto solo la usa server-side, en
  `lib/supabase/admin.ts`).

### 4. Correr en desarrollo

```bash
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

### Flujo de la app

1. **Cuenta del organizador**: el organizador crea una cuenta en `/signup`
   (email + contraseña, vía Supabase Auth) o inicia sesión en `/login` si ya
   tiene una.
2. **Landing (`/`)**: crea un evento, que queda asociado a su cuenta
   (`owner_id`), y llega a su panel admin (`/admin/{admin_token}`).
3. **Inscripción (`/join/{eventId}`)**: cada participante se registra y recibe
   su link personal (`/reveal/{access_token}`). Los participantes **no**
   tienen cuenta ni login, solo su link.
4. **Sorteo**: desde el panel admin, el organizador cierra inscripciones y
   sortea (con exclusiones opcionales configuradas por participante).
5. **Revelar (`/reveal/{access_token}`)**: cada participante ve a quién le
   toca regalar, y puede mandar/recibir pistas 100% anónimas.

### Acceso del organizador: link directo o cuenta

El panel de un evento sigue siendo accesible directamente por
`/admin/{admin_token}` (el link que se muestra al crear el evento) — no hace
falta estar logueado para usarlo, es la vía rápida de siempre.

La cuenta (`/login` → `/admin`) es la vía de **recuperación**: si el
organizador pierde ese link, puede loguearse y ver la lista de todos los
eventos que creó, cada uno con su link al panel correspondiente
(`/admin/{admin_token}`).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
