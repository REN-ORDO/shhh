import { CreateEventForm } from "@/components/CreateEventForm";
import { JoinByLinkForm } from "@/components/JoinByLinkForm";

const FEATURES = [
  {
    icon: "🎲",
    title: "Sorteo automático",
    description:
      "Un click y listo: cada participante recibe a quién le toca regalar, sin repetidos.",
  },
  {
    icon: "🔒",
    title: "Links individuales",
    description:
      "Cada persona tiene su propio link secreto para ver su resultado. Nadie más lo puede ver.",
  },
  {
    icon: "🚫",
    title: "Exclusiones",
    description:
      "¿Parejas o familiares que no deben sortearse entre sí? Configuralo antes del sorteo.",
  },
  {
    icon: "💌",
    title: "Pistas anónimas",
    description:
      "Mandale pistas a quien te tocó, sin revelar quién sos. 100% anónimo.",
  },
];

const STEPS = [
  {
    number: 1,
    title: "Creá tu evento",
    description: "Completá el nombre del evento y tus datos como organizador/a.",
  },
  {
    number: 2,
    title: "Compartí el link",
    description: "Invitá a los participantes con el link de inscripción del evento.",
  },
  {
    number: 3,
    title: "Cerrá y sorteá",
    description: "Cuando estén todos, cerrá inscripciones y hacé el sorteo con un click.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      <header className="w-full px-6 py-5 flex items-center justify-between max-w-5xl mx-auto">
        <span className="text-lg font-extrabold">🎁 Amigo Secreto</span>
      </header>

      <main className="flex flex-col gap-20 px-6 pb-20">
        {/* Hero */}
        <section className="max-w-3xl mx-auto text-center flex flex-col items-center gap-6 pt-8">
          <span className="nb-pill">Amigo Secreto Virtual</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
            Organizá tu Amigo Secreto{" "}
            <span className="text-accent">sin planillas ni bolillero</span>
          </h1>
          <p className="text-muted text-lg max-w-xl">
            Creá tu evento, invitá a tus amigos, familia o compañeros, y dejá que
            el sorteo y las pistas anónimas hagan el resto.
          </p>
        </section>

        {/* CTAs */}
        <section className="max-w-4xl mx-auto grid sm:grid-cols-2 gap-6 w-full">
          <CreateEventForm />
          <JoinByLinkForm />
        </section>

        {/* Features */}
        <section className="max-w-5xl mx-auto w-full">
          <h2 className="text-2xl font-extrabold text-center mb-8">
            Todo lo que necesitás
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="nb-card p-5 flex flex-col gap-3">
                <span className="nb-icon-circle">{f.icon}</span>
                <h3 className="font-extrabold">{f.title}</h3>
                <p className="text-sm text-muted">{f.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Cómo funciona */}
        <section className="max-w-4xl mx-auto w-full">
          <h2 className="text-2xl font-extrabold text-center mb-8">
            Cómo funciona
          </h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {STEPS.map((s) => (
              <div key={s.number} className="nb-card p-5 relative flex flex-col gap-2">
                <span className="nb-badge-number absolute -top-4 -right-3">
                  {s.number}
                </span>
                <h3 className="font-extrabold">{s.title}</h3>
                <p className="text-sm text-muted">{s.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA final */}
        <section className="max-w-4xl mx-auto w-full">
          <div
            className="nb-card p-10 text-center flex flex-col items-center gap-4"
            style={{
              background:
                "linear-gradient(135deg, var(--accent-light), var(--background))",
            }}
          >
            <h2 className="text-2xl font-extrabold">
              ¿Listo para armar tu Amigo Secreto?
            </h2>
            <p className="text-muted max-w-md">
              Es gratis, no necesitás registrarte con contraseña y tenés el
              control total desde tu link de administrador.
            </p>
            <a href="#top" className="nb-btn nb-btn-primary px-6 py-3">
              Crear mi evento 🎁
            </a>
          </div>
        </section>
      </main>

      <footer className="text-center text-sm text-muted py-8">
        Amigo Secreto Virtual — organizá tu intercambio de regalos online.
      </footer>
    </div>
  );
}
