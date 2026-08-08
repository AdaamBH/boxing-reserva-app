import { Navigate, Routes, Route } from 'react-router-dom';
import { RegisterPage } from '@/features/auth/components/RegisterPage';
import { LoginPage } from '@/features/auth/components/LoginPage';
import { PasswordResetRequestPage } from '@/features/auth/components/PasswordResetRequestPage';
import { UpdatePasswordPage } from '@/features/auth/components/UpdatePasswordPage';
import { AddDependentPage } from '@/features/dependents/components/AddDependentPage';
import { ProtectedRoute } from '@/app/ProtectedRoute';
import { AdminRoute } from '@/app/AdminRoute';
import { AppShell } from '@/app/AppShell';
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
      <Route path="/" element={<Navigate to="/clases" replace />} />
      <Route path="/registro" element={<RegisterPage />} />
      <Route path="/iniciar-sesion" element={<LoginPage />} />
      <Route path="/recuperar-contrasena" element={<PasswordResetRequestPage />} />
      <Route path="/restablecer-contrasena" element={<UpdatePasswordPage />} />

      {/* Todo lo autenticado comparte la cabecera/nav de AppShell — ver
          AppShell.tsx. ProtectedRoute se aplica una vez aquí arriba, no
          por página; AdminRoute se añade solo en las páginas de admin. */}
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/clases" element={<ClassSessionsPage />} />
        <Route path="/clases/:sessionId/lista" element={<SessionRosterPage />} />
        <Route path="/mis-reservas" element={<MyBookingsPage />} />
        <Route path="/entrenadores" element={<TrainersPage />} />
        <Route path="/dependientes/nuevo" element={<AddDependentPage />} />
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
      </Route>
    </Routes>
  );
}
