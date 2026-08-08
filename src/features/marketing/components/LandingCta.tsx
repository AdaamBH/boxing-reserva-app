import { Link } from 'react-router-dom';
import { Reveal } from '@/components/Reveal';

export function LandingCta() {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-16 text-center">
      <Reveal className="flex flex-col items-center gap-4">
        <h2 className="text-2xl font-semibold tracking-wide text-ink uppercase sm:text-3xl">
          ¿Listo para tu próxima clase?
        </h2>
        <p className="max-w-md text-base text-ink-muted">
          Crea tu cuenta y reserva tu primera plaza en menos de dos minutos.
        </p>
        <Link
          to="/registro"
          className="inline-flex min-h-12 items-center justify-center rounded-lg bg-brand-600 px-8 text-base font-medium text-white transition-all duration-150 ease-out hover:bg-brand-700 active:scale-[0.97]"
        >
          Reservar ahora
        </Link>
      </Reveal>
    </section>
  );
}
