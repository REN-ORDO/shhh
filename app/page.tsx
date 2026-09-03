import { Dices, Lock, Ban, MessageCircleHeart, Gift } from "lucide-react";
import { CreateEventForm } from "@/components/CreateEventForm";
import { JoinByLinkForm } from "@/components/JoinByLinkForm";

const FEATURES = [
  {
    icon: Dices,
    title: "Sorteo automático",
    description:
      "Un click y listo: cada participante recibe a quién le toca regalar, sin repetidos.",
  },
  {
    icon: Lock,
    title: "Links individuales",
    description:
      "Cada persona tiene su propio link secreto para ver su resultado. Nadie más lo puede ver.",
  },
  {
    icon: Ban,
    title: "Exclusiones",
    description:
      "¿Parejas o familiares que no deben sortearse entre sí? Configúralo antes del sorteo.",
  },
  {
    icon: MessageCircleHeart,
    title: "Pistas anónimas",
    description:
      "Mándale pistas a quien te tocó, sin revelar quién eres. 100% anónimo.",
  },
];

const STEPS = [
  {
    number: 1,
    title: "Crea tu evento",
    description: "Completa el nombre del evento y tus datos como organizador/a.",
  },
  {
    number: 2,
    title: "Comparte el link",
    description: "Invita a los participantes con el link de inscripción del evento.",
  },
  {
    number: 3,
    title: "Cierra y sortea",
    description: "Cuando estén todos, cierra inscripciones y haz el sorteo con un click.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      <header className="w-full px-6 py-5 flex items-center justify-between max-w-5xl mx-auto">
        <span className="text-lg font-extrabold flex items-center gap-2">
          <Gift className="size-5" aria-hidden="true" />
          Amigo Secreto
        </span>
      </header>

      <main className="flex flex-col gap-20 px-6 pb-20">
        {/* Hero */}
        <section className="max-w-3xl mx-auto text-center flex flex-col items-center gap-6 pt-8">
          <span className="nb-pill">Amigo Secreto Virtual</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
            Organiza tu Amigo Secreto{" "}
            <span className="text-accent">sin planillas ni bolillero</span>
          </h1>
          <p className="text-muted text-lg max-w-xl">
            Crea tu evento, invita a tus amigos, familia o compañeros, y deja que
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
            Todo lo que necesitas
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="nb-card p-5 flex flex-col gap-3">
                <span className="nb-icon-circle">
                  <f.icon className="size-5" aria-hidden="true" />
                </span>
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
              Es gratis, no necesitas registrarte con contraseña y tienes el
              control total desde tu link de administrador.
            </p>
            <a
              href="#top"
              className="nb-btn nb-btn-primary px-6 py-3 flex items-center gap-2"
            >
              <Gift className="size-4" aria-hidden="true" />
              Crear mi evento
            </a>
          </div>
        </section>
      </main>

      <footer className="text-center text-sm text-muted py-8">
        Amigo Secreto Virtual — organiza tu intercambio de regalos online.
      </footer>
    </div>
  );
}
