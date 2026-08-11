import { CapacityTally } from '@/features/bookings/components/CapacityTally';
import { Reveal } from '@/components/Reveal';
import { LandingCtaButton } from '@/features/marketing/components/LandingCtaButton';

// Aforo de ejemplo, marcado como tal — no son datos reales, solo hacen
// tangible "control de aforo en tiempo real" con el mismo componente que
// ya usa la app de verdad (ver AI/DECISIONS.md, firma visual del proyecto).
const EXAMPLE_AFORO_MAXIMO = 10;
const EXAMPLE_OCUPADAS = 7;

export function LandingHero() {
  return (
    <section className="bg-canvas-texture">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-8 px-4 py-16 text-center sm:py-24">
        <Reveal className="flex flex-col items-center gap-8">
          <h1 className="max-w-3xl text-4xl leading-[1.05] font-semibold tracking-tight text-ink uppercase sm:text-6xl">
            Reserva tu clase de boxeo en segundos
          </h1>
          <p className="max-w-xl text-lg text-ink-muted">
            Sin llamadas, sin WhatsApp, sin líos. Consulta las plazas libres al momento y
            entra en lista de espera automáticamente si la clase está completa.
          </p>
          <div className="flex flex-col items-center gap-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <LandingCtaButton to="/registro">Reservar ahora</LandingCtaButton>
              <LandingCtaButton to="/iniciar-sesion" variant="secondary">
                Ya tengo cuenta
              </LandingCtaButton>
            </div>
            <p className="text-xs text-ink-faint">
              Sin permanencia · cancela hasta 1 hora antes · sin apps que instalar
            </p>
          </div>
        </Reveal>

        <Reveal delayMs={150}>
          <div className="flex flex-col items-center gap-2 rounded-xl border border-line bg-canvas-raised px-6 py-4 shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_1px_2px_-1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)]">
            <p className="text-sm font-medium text-ink-muted">
              Boxeo técnico · Hoy 18:00
            </p>
            <CapacityTally
              aforoMaximo={EXAMPLE_AFORO_MAXIMO}
              ocupadas={EXAMPLE_OCUPADAS}
            />
            <p className="text-xs text-ink-faint">
              {EXAMPLE_AFORO_MAXIMO - EXAMPLE_OCUPADAS} plazas libres · ejemplo
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
