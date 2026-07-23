import { useNavigate } from 'react-router-dom';
import { AddDependentForm } from '@/features/dependents/components/AddDependentForm';

export function AddDependentPage() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-6 px-4 py-8">
      <h1 className="text-center text-2xl font-semibold text-slate-900">
        Añadir dependiente
      </h1>
      <AddDependentForm onSuccess={() => navigate('/')} />
    </div>
  );
}
