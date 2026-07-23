import { Routes, Route } from 'react-router-dom';
import { RegisterPage } from '@/features/auth/components/RegisterPage';
import { LoginPage } from '@/features/auth/components/LoginPage';
import { PasswordResetRequestPage } from '@/features/auth/components/PasswordResetRequestPage';
import { UpdatePasswordPage } from '@/features/auth/components/UpdatePasswordPage';
import { AddDependentPage } from '@/features/dependents/components/AddDependentPage';
import { ProtectedRoute } from '@/app/ProtectedRoute';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePlaceholder />} />
      <Route path="/registro" element={<RegisterPage />} />
      <Route path="/iniciar-sesion" element={<LoginPage />} />
      <Route path="/recuperar-contrasena" element={<PasswordResetRequestPage />} />
      <Route path="/restablecer-contrasena" element={<UpdatePasswordPage />} />
      <Route
        path="/dependientes/nuevo"
        element={
          <ProtectedRoute>
            <AddDependentPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function HomePlaceholder() {
  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <p className="text-sm text-slate-500">
        Fase 0 completada: el andamiaje del proyecto funciona correctamente.
      </p>
    </main>
  );
}
