# 🤫 Shhh — Amigo Secreto Virtual

**Organiza tu intercambio de regalos online — sin planillas, sin bolillero, sin drama.**

Creas un evento, invitas a tus amigos, familia o compañeros, y la app se encarga del sorteo y las pistas anónimas. Simple, rápido y gratis.

---

## ✨ Qué incluye

| Feature | Descripción |
| --- | --- |
| **🎲 Sorteo automático** | Un click y listo: cada participante recibe a quién le toca regalar, sin repetidos. Soporta exclusiones (parejas, familiares, etc.) |
| **🔗 Link secreto por participante** | Nadie más puede ver tu resultado. Cada persona tiene su propio link personal. |
| **💬 Pistas 100% anónimas** | Manda pistas a quien te tocó sin revelar quién eres. Puedes enviar **texto, fotos, imágenes, tarjetas, adivinanzas** — lo que se te ocurra. |
| **🖼️ Adjuntos multimedia** | Las pistas no son solo texto: sube imágenes (JPG, PNG, GIF, WebP), crea tarjetas, manda memes. Creatividad sin límites. |
| **👤 Cuenta del organizador** | Crea tu cuenta para tener control total de tus eventos. Si pierdes el link, te logueas y lo recuperas. |
| **🛡️ Privacidad por diseño** | La app nunca almacena quién mandó qué pista. Anonimato real, no una promesa. |

---

## 🚀 Cómo funciona

```
  1. CREA TU EVENTO          2. INVITA GENTE           3. SORTEEN Y DIVIERTANSE
  ─────────────────          ──────────────────        ────────────────────────
  Completa el nombre     →   Comparte el link de    →  Cada persona ve a quién
  y tus datos como           inscripción. Tus            le toca regalar y
  organizador/a.             amigos se anotan con       empieza a mandar pistas
                             su nombre y email.         anónimas (¡con fotos!).
```

1. **Crea tu evento** desde la landing — te da un link de admin y un link de inscripción.
2. **Comparte el link de inscripción** con los participantes.
3. **Cuando estén todos**, cierra inscripciones y haz el sorteo desde tu panel.
4. **Cada participante** recibe su link secreto y puede mandar/recibir pistas.

---

## 🛠️ Para levantar el proyecto

### Requisitos

- [Node.js](https://nodejs.org/) 18+
- Una cuenta en [Supabase](https://supabase.com) (gratis)

### Paso 1 — Crear el proyecto en Supabase

Crea un proyecto nuevo en [supabase.com](https://supabase.com) (o usa uno existente).

### Paso 2 — Correr las migraciones

Ve a **Database → SQL Editor** en tu panel de Supabase y ejecuta estos archivos en orden:

1. `supabase/migrations/0001_init.sql` — crea las tablas principales
2. `supabase/migrations/0002_auth.sql` — agrega login del organizador
3. `supabase/migrations/0003_join_code.sql` — código corto de evento
4. `supabase/migrations/0004_clue_attachments.sql` — adjuntos de imagen en pistas

Copia el contenido de cada archivo, pégalo en un query nuevo y dale **Run**.

> **Tip**: Si usas la Supabase CLI localmente, puedes hacer `supabase db push` para correr todas las migraciones de una.

### Paso 3 — Variables de entorno

Copia el archivo de ejemplo y complétalo con los datos de tu proyecto:

```bash
cp .env.local.example .env.local
```

Necesitas tres valores que encuentras en **Project Settings → API** de Supabase:

| Variable | Qué es |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL de tu proyecto |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | La clave pública |
| `SUPABASE_SERVICE_ROLE_KEY` | La clave secreta (solo server-side) |

### Paso 4 — ¡Listo!

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) y crea tu primer evento 🎉

---

## 📱 Flujo completo

### Para el organizador

| Paso | Qué hace | Dónde |
| --- | --- | --- |
| Crear cuenta | Email + contraseña | `/signup` |
| Crear evento | Nombre del evento | Landing `/` |
| Gestionar | Ver participantes, cerrar inscripciones, sortear | `/admin/{token}` |
| Recuperar acceso | Si perdió el link, se loguea y ve sus eventos | `/login` → `/admin` |

### Para los participantes

| Paso | Qué hace | Dónde |
| --- | --- | --- |
| Inscribirse | Nombre + email | `/join/{eventId}` |
| Ver resultado | A quién le toca regalar | `/reveal/{token}` |
| Mandar pistas | Texto + imágenes, 100% anónimo | `/reveal/{token}` |

> **Los participantes no necesitan cuenta ni contraseña.** Solo tienen su link secreto.

---

## 🔒 Sobre la privacidad

La privacidad no es un feature — es la base de todo:

- **Las pistas no tienen remitente.** La base de datos nunca almacena quién mandó qué.
- **Las rutas de archivos tampoco.** Las imágenes se suben con UUIDs, sin ningún dato identificatorio del remitente.
- **RLS deny-all.** Todas las tablas tienen Row Level Security activado con política de denegación total. El acceso real pasa por Server Actions con service role.
- **Links únicos.** Cada participante tiene un token único e intransferible.

---

## 🏗️ Stack

- **Frontend**: [Next.js](https://nextjs.org) 16 + React 19 + Tailwind CSS 4
- **Backend**: Next.js Server Actions
- **Base de datos**: [Supabase](https://supabase.com) (PostgreSQL)
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage (bucket privado para imágenes de pistas)
- **Estilo**: Neobrutalismo suave (bordes gruesos, sombras offset, colores cálidos)

---

## 📂 Estructura del proyecto

```
shhh/
├── app/                    # Páginas (Next.js App Router)
│   ├── admin/              # Panel del organizador
│   ├── join/               # Inscripción de participantes
│   ├── login/              # Login del organizador
│   ├── reveal/             # Página secreta de cada participante
│   └── signup/             # Registro del organizador
├── components/             # Componentes React
├── lib/                    # Lógica de negocio
│   ├── actions/            # Server Actions (enviar pistas, sortear, etc.)
│   └── supabase/           # Clientes de Supabase
├── public/                 # Assets estáticos
└── supabase/migrations/    # Migraciones SQL
```

---

## 🚀 Deploy

La forma más fácil: [Vercel](https://vercel.com). Conecta tu repo y configura las variables de entorno en el dashboard. Listo.

Para más detalles, revisa la [documentación de deploy de Next.js](https://nextjs.org/docs/app/building-your-application/deploying).
