import { Reveal } from '@/components/Reveal';

interface Step {
  title: string;
  description: string;
}

const STEPS: Step[] = [
  { title: 'Regístrate', description: 'Crea tu cuenta en menos de un minuto.' },
  {
    title: 'Elige tu clase',
    description: 'Consulta el horario y las plazas libres en tiempo real.',
  },
  {
    title: 'Reserva y listo',
    description: 'Confirmación al instante, o lista de espera si está completa.',
  },
];

export function LandingHowItWorks() {
  return (
    <section className="bg-chalk py-16">
      <div className="mx-auto w-full max-w-5xl px-4">
        <Reveal>
          <h2 className="text-center text-2xl font-semibold tracking-wide text-ink uppercase sm:text-3xl">
            Cómo funciona
          </h2>
        </Reveal>
        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <Reveal key={step.title} delayMs={index * 100}>
              <div className="flex flex-col items-center gap-2 text-center">
                <span className="font-display flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-lg font-semibold text-white">
                  {index + 1}
                </span>
                <h3 className="text-base font-semibold text-ink">{step.title}</h3>
                <p className="text-sm text-ink-muted">{step.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
