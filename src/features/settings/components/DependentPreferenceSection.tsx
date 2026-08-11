import { Link } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useDependents } from '@/features/dependents/hooks/useDependents';
import { useUpdateDefaultDependent } from '@/features/settings/hooks/useUpdateDefaultDependent';
import { ToggleSwitch } from '@/components/ToggleSwitch';
import { SelectField } from '@/components/SelectField';

/**
 * Quién es "para quién reservo" es una preferencia de cuenta, no algo que
 * se elige en cada reserva — ver BookClassSessionButton (ya no tiene
 * selector) y AI/DECISIONS.md. Activar el ajuste con un único dependiente
 * lo selecciona directamente; con varios, aparece un desplegable.
 */
export function DependentPreferenceSection() {
  const { profile } = useAuth();
  const { data: dependents, isLoading } = useDependents();
  const { mutate: setDefaultDependent, isPending } = useUpdateDefaultDependent();

  const defaultDependentId = profile?.default_dependent_id ?? null;
  const enabled = defaultDependentId !== null;

  function handleToggle(checked: boolean) {
    if (!dependents || dependents.length === 0) return;
    setDefaultDependent(checked ? (dependents[0]?.id ?? null) : null);
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-semibold tracking-wide text-ink-muted uppercase">
        Dependientes
      </h2>

      {isLoading && <p className="text-sm text-ink-faint">Cargando…</p>}

      {!isLoading && dependents && dependents.length > 0 && (
        <div className="flex flex-col gap-3 rounded-xl border border-line bg-canvas-raised p-4">
          <ToggleSwitch
            checked={enabled}
            disabled={isPending}
            onChange={handleToggle}
            label="Reservar siempre para un dependiente"
          />

          {enabled && dependents.length > 1 && (
            <SelectField
              id="default-dependent"
              label="¿Para quién?"
              placeholder="Selecciona"
              value={defaultDependentId ?? ''}
              disabled={isPending}
              onChange={(event) => setDefaultDependent(event.target.value)}
              options={dependents.map((dependent) => ({
                value: dependent.id,
                label: `${dependent.nombre} ${dependent.apellidos}`,
              }))}
            />
          )}

          {enabled && dependents.length === 1 && dependents[0] && (
            <p className="text-sm text-ink-muted">
              Reservando siempre para {dependents[0].nombre} {dependents[0].apellidos}.
            </p>
          )}
        </div>
      )}

      {!isLoading && (!dependents || dependents.length === 0) && (
        <p className="text-sm text-ink-faint">
          Todavía no tienes ningún dependiente registrado.
        </p>
      )}

      <Link
        to="/dependientes/nuevo"
        className="self-start text-sm font-medium text-brand-600 underline-offset-2 hover:underline"
      >
        {dependents && dependents.length > 0
          ? 'Añadir otro dependiente'
          : '¿Reservas para un menor a tu cargo? Añade un dependiente'}
      </Link>
    </section>
  );
}
