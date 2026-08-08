import { useNavigate } from 'react-router-dom';
import { AddDependentForm } from '@/features/dependents/components/AddDependentForm';

export function AddDependentPage() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-6">
      <h1 className="text-center text-2xl font-semibold tracking-wide text-ink uppercase">
        Añadir dependiente
      </h1>
      <div className="rounded-xl border border-line bg-canvas-raised p-6 shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_1px_2px_-1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)]">
        <AddDependentForm onSuccess={() => navigate('/clases')} />
      </div>
    </div>
  );
}
