import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '@/app/ProtectedRoute';
import { AdminRoute } from '@/app/AdminRoute';
import { AppShell } from '@/app/AppShell';
import { PageFallback } from '@/components/PageFallback';

// Cada página es su propio chunk — nadie descarga el panel de admin para
// entrar a ver las clases, ni el formulario de dependientes si nunca lo
// abre. `.then(m => ({ default: m.X }))` porque estos componentes usan
// exportaciones con nombre (CODE_STYLE.md), no por defecto — React.lazy
// exige un default, esto no cambia cómo se exportan en ningún otro sitio.
const LandingPage = lazy(() =>
  import('@/features/marketing/components/LandingPage').then((m) => ({
    default: m.LandingPage,
  })),
);
const RegisterPage = lazy(() =>
  import('@/features/auth/components/RegisterPage').then((m) => ({
    default: m.RegisterPage,
  })),
);
const LoginPage = lazy(() =>
  import('@/features/auth/components/LoginPage').then((m) => ({ default: m.LoginPage })),
);
const PasswordResetRequestPage = lazy(() =>
  import('@/features/auth/components/PasswordResetRequestPage').then((m) => ({
    default: m.PasswordResetRequestPage,
  })),
);
const UpdatePasswordPage = lazy(() =>
  import('@/features/auth/components/UpdatePasswordPage').then((m) => ({
    default: m.UpdatePasswordPage,
  })),
);
const AddDependentPage = lazy(() =>
  import('@/features/dependents/components/AddDependentPage').then((m) => ({
    default: m.AddDependentPage,
  })),
);
const ReservasPage = lazy(() =>
  import('@/features/classes/components/ReservasPage').then((m) => ({
    default: m.ReservasPage,
  })),
);
const MyBookingsPage = lazy(() =>
  import('@/features/bookings/components/MyBookingsPage').then((m) => ({
    default: m.MyBookingsPage,
  })),
);
const SessionRosterPage = lazy(() =>
  import('@/features/bookings/components/SessionRosterPage').then((m) => ({
    default: m.SessionRosterPage,
  })),
);
const TrainersPage = lazy(() =>
  import('@/features/trainers/components/TrainersPage').then((m) => ({
    default: m.TrainersPage,
  })),
);
const AjustesPage = lazy(() =>
  import('@/features/settings/components/AjustesPage').then((m) => ({
    default: m.AjustesPage,
  })),
);
const AdminHomePage = lazy(() =>
  import('@/features/admin/components/AdminHomePage').then((m) => ({
    default: m.AdminHomePage,
  })),
);
const ClassTemplatesPage = lazy(() =>
  import('@/features/admin/components/ClassTemplatesPage').then((m) => ({
    default: m.ClassTemplatesPage,
  })),
);
const AdminClassSessionsPage = lazy(() =>
  import('@/features/admin/components/AdminClassSessionsPage').then((m) => ({
    default: m.AdminClassSessionsPage,
  })),
);

export function AppRouter() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="/iniciar-sesion" element={<LoginPage />} />
        <Route path="/recuperar-contrasena" element={<PasswordResetRequestPage />} />
        <Route path="/restablecer-contrasena" element={<UpdatePasswordPage />} />

        {/* Todo lo autenticado comparte la cabecera/nav de AppShell — ver
            AppShell.tsx (tiene su propio Suspense alrededor del Outlet,
            así la nav no desaparece al cambiar de página). ProtectedRoute
            se aplica una vez aquí arriba, no por página; AdminRoute se
            añade solo en las páginas de admin. */}
        <Route
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route path="/clases" element={<ReservasPage />} />
          <Route path="/clases/:sessionId/lista" element={<SessionRosterPage />} />
          <Route path="/mis-reservas" element={<MyBookingsPage />} />
          <Route path="/entrenadores" element={<TrainersPage />} />
          <Route path="/dependientes/nuevo" element={<AddDependentPage />} />
          <Route path="/ajustes" element={<AjustesPage />} />
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
    </Suspense>
  );
}
