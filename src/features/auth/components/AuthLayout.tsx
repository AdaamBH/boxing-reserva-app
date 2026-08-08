import type { ReactNode } from 'react';

interface AuthLayoutProps {
  title: string;
  children: ReactNode;
}

// Envoltorio compartido de las 4 pantallas de auth (login, registro,
// recuperar/actualizar contraseña) — antes cada una repetía su propio
// `min-h-dvh flex ... justify-center` sin ninguna tarjeta ni marca, texto
// suelto sobre el fondo. Es la primera pantalla que ve cualquiera; la
// misma tarjeta elevada que usa ClassSessionCard le da presencia real en
// vez de un formulario flotando en el vacío.
export function AuthLayout({ title, children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 px-4 py-8">
      <span className="font-display text-sm font-semibold tracking-[0.2em] text-ink-faint uppercase">
        Gimnasio
      </span>
      <div className="flex w-full max-w-md flex-col gap-6 rounded-xl border border-line bg-canvas-raised p-6 shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_1px_2px_-1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)] sm:p-8">
        <h1 className="text-center text-2xl font-semibold tracking-wide text-ink uppercase">
          {title}
        </h1>
        {children}
      </div>
    </div>
  );
}
