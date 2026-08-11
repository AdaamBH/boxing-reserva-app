import type { ComponentType } from 'react';
import { BarsIcon, ChecklistIcon, EnvelopeIcon, RepeatIcon } from '@/components/icons';
import { Reveal } from '@/components/Reveal';

interface Feature {
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}

// La primera es el diferenciador real del proyecto (aforo controlado sin
// condiciones de carrera, ver AI/DATABASE.md) — recibe tratamiento propio
// más grande en vez de competir en igualdad con las otras tres.
const HERO_FEATURE: Feature = {
  title: 'Aforo real, sin sorpresas',
  description:
    'Ves exactamente cuántas plazas quedan en cada clase — nunca hay overbooking, nunca te quedas fuera sin saberlo.',
  icon: BarsIcon,
};

const SUPPORTING_FEATURES: Feature[] = [
  {
    title: 'Lista de espera automática',
    description:
      'Si la clase está completa, entras en la cola y te avisamos en el momento en que se libera un hueco.',
    icon: RepeatIcon,
  },
  {
    title: 'Cancela cuando quieras',
    description:
      'Hasta 1 hora antes de la clase, sin llamar ni escribir — dos toques y listo.',
    icon: ChecklistIcon,
  },
  {
    title: 'Aviso al instante',
    description:
      'Un email en cuanto confirmas tu plaza, o en cuanto entras en una clase desde la lista de espera.',
    icon: EnvelopeIcon,
  },
];

export function LandingFeatures() {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-16">
      <Reveal>
        <h2 className="text-center text-2xl font-semibold tracking-wide text-ink uppercase sm:text-3xl">
          Por qué reservar aquí
        </h2>
      </Reveal>

      <Reveal delayMs={60} className="mt-10">
        <div className="flex flex-col items-center gap-4 rounded-xl border border-line bg-canvas-raised p-6 text-center sm:flex-row sm:items-center sm:gap-6 sm:p-8 sm:text-left">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-brand-600/10 text-brand-600">
            <HERO_FEATURE.icon className="h-7 w-7" />
          </span>
          <div className="flex flex-col gap-1.5">
            <h3 className="text-lg font-semibold text-ink">{HERO_FEATURE.title}</h3>
            <p className="text-sm text-ink-muted sm:text-base">
              {HERO_FEATURE.description}
            </p>
          </div>
        </div>
      </Reveal>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {SUPPORTING_FEATURES.map((feature, index) => (
          <Reveal key={feature.title} delayMs={120 + index * 80}>
            <div className="flex h-full flex-col gap-3 rounded-xl border border-line bg-canvas-raised p-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-600/10 text-brand-600">
                <feature.icon className="h-5 w-5" />
              </span>
              <h3 className="text-base font-semibold text-ink">{feature.title}</h3>
              <p className="text-sm text-ink-muted">{feature.description}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
