import { Reveal } from '@/components/Reveal';
import { LandingCtaButton } from '@/features/marketing/components/LandingCtaButton';

export function LandingCta() {
  return (
    <section className="bg-canvas-texture">
      <div className="mx-auto w-full max-w-5xl px-4 py-16 text-center">
        <Reveal className="flex flex-col items-center gap-4">
          <h2 className="text-2xl font-semibold tracking-wide text-ink uppercase sm:text-3xl">
            ¿Listo para tu próxima clase?
          </h2>
          <p className="max-w-md text-base text-ink-muted">
            Crea tu cuenta y reserva tu primera plaza en menos de dos minutos.
          </p>
          <LandingCtaButton to="/registro">Reservar ahora</LandingCtaButton>
        </Reveal>
      </div>
    </section>
  );
}
