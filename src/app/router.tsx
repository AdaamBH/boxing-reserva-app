import { Routes, Route } from 'react-router-dom';
import { RegisterPage } from '@/features/auth/components/RegisterPage';
import { LoginPage } from '@/features/auth/components/LoginPage';
import { PasswordResetRequestPage } from '@/features/auth/components/PasswordResetRequestPage';
import { UpdatePasswordPage } from '@/features/auth/components/UpdatePasswordPage';
import { AddDependentPage } from '@/features/dependents/components/AddDependentPage';
import { ProtectedRoute } from '@/app/ProtectedRoute';
import { AdminRoute } from '@/app/AdminRoute';
import { ClassSessionsPage } from '@/features/classes/components/ClassSessionsPage';
import { MyBookingsPage } from '@/features/bookings/components/MyBookingsPage';
import { SessionRosterPage } from '@/features/bookings/components/SessionRosterPage';
import { TrainersPage } from '@/features/trainers/components/TrainersPage';
import { AdminHomePage } from '@/features/admin/components/AdminHomePage';
import { ClassTemplatesPage } from '@/features/admin/components/ClassTemplatesPage';
import { AdminClassSessionsPage } from '@/features/admin/components/AdminClassSessionsPage';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePlaceholder />} />
      <Route path="/registro" element={<RegisterPage />} />
      <Route path="/iniciar-sesion" element={<LoginPage />} />
      <Route path="/recuperar-contrasena" element={<PasswordResetRequestPage />} />
      <Route path="/restablecer-contrasena" element={<UpdatePasswordPage />} />
      <Route
        path="/clases"
        element={
          <ProtectedRoute>
            <ClassSessionsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mis-reservas"
        element={
          <ProtectedRoute>
            <MyBookingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clases/:sessionId/lista"
        element={
          <ProtectedRoute>
            <SessionRosterPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/entrenadores"
        element={
          <ProtectedRoute>
            <TrainersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dependientes/nuevo"
        element={
          <ProtectedRoute>
            <AddDependentPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminHomePage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/plantillas"
        element={
          <AdminRoute>
            <ClassTemplatesPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/sesiones"
        element={
          <AdminRoute>
            <AdminClassSessionsPage />
          </AdminRoute>
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
