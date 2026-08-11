import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useSignOut } from '@/features/auth/hooks/useSignOut';
import { Button } from '@/components/Button';
import { DependentPreferenceSection } from '@/features/settings/components/DependentPreferenceSection';

export function AjustesPage() {
  const { profile, user } = useAuth();
  const { mutate: doSignOut, isPending } = useSignOut();
  const navigate = useNavigate();

  function handleSignOut() {
    doSignOut(undefined, {
      onSuccess: () => navigate('/iniciar-sesion', { replace: true }),
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-6">
      <h1 className="text-2xl font-semibold tracking-wide text-ink uppercase">Ajustes</h1>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold tracking-wide text-ink-muted uppercase">
          Cuenta
        </h2>
        <div className="flex flex-col gap-1 rounded-xl border border-line bg-canvas-raised p-4">
          <p className="font-semibold text-ink">
            {profile ? `${profile.nombre} ${profile.apellidos}` : 'Cargando…'}
          </p>
          <p className="text-sm text-ink-muted">{user?.email}</p>
        </div>
      </section>

      <DependentPreferenceSection />

      <section className="flex flex-col gap-3 border-t border-line pt-6">
        <Button
          type="button"
          variant="secondary"
          isLoading={isPending}
          onClick={handleSignOut}
        >
          Cerrar sesión
        </Button>
      </section>
    </div>
  );
}
