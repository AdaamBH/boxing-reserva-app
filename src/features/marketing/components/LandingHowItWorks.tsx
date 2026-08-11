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
        <div className="relative mt-10">
          {/* Cuerda de rin conectando los pasos — firma visual del proyecto
              (ver .interface-design/system.md), no una línea de progreso
              genérica de wizard. Solo visible cuando los 3 pasos están en
              fila (sm:); en columna no hay nada que conectar. */}
          <div
            aria-hidden="true"
            className="absolute top-6 right-[16.6%] left-[16.6%] hidden border-t-2 border-dashed border-rope/50 sm:block"
          />
          <div className="relative grid grid-cols-1 gap-8 sm:grid-cols-3">
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
      </div>
    </section>
  );
}
