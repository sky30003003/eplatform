import { Navigate, useRoutes, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Layouts
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';

// Pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import OrganizationsPage from '../pages/organizations/OrganizationsPage';
import MembersPage from '../pages/members/MembersPage';
import NotFoundPage from '../pages/NotFoundPage';
import { UserType } from '../types/user';
import { 
  ROUTES, 
  ROUTE_PERMISSIONS, 
  DEFAULT_AUTHENTICATED_ROUTE, 
  DEFAULT_GUEST_ROUTE,
  getRelativePath 
} from '../config/routes.config';

// Guards
const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isInitialized } = useAuth();
  
  if (!isInitialized) {
    return null;
  }
  
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} />;
  }

  return <>{children}</>;
};

const GuestGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isInitialized, lastLocation } = useAuth();
  
  if (!isInitialized) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to={lastLocation || DEFAULT_AUTHENTICATED_ROUTE} />;
  }

  return <>{children}</>;
};

const RoleGuard = ({ children, roles }: { children: React.ReactNode; roles: readonly UserType[] }) => {
  const { user, isInitialized } = useAuth();
  
  if (!isInitialized) {
    return null;
  }

  if (!user || !roles.includes(user.userType)) {
    return <Navigate to={DEFAULT_AUTHENTICATED_ROUTE} />;
  }

  return <>{children}</>;
};

const InitialRedirect = () => {
  const { isAuthenticated, lastLocation } = useAuth();
  return isAuthenticated ? (
    <Navigate to={lastLocation || DEFAULT_AUTHENTICATED_ROUTE} replace />
  ) : (
    <Navigate to={DEFAULT_GUEST_ROUTE} replace />
  );
};

const DashboardRoutes = () => {
  return (
    <AuthGuard>
      <DashboardLayout />
    </AuthGuard>
  );
};

export default function Router() {
  const routes = [
    {
      path: '/',
      element: <InitialRedirect />,
    },
    {
      path: ROUTES.LOGIN,
      element: (
        <GuestGuard>
          <AuthLayout>
            <LoginPage />
          </AuthLayout>
        </GuestGuard>
      ),
    },
    {
      path: ROUTES.REGISTER,
      element: (
        <GuestGuard>
          <AuthLayout>
            <RegisterPage />
          </AuthLayout>
        </GuestGuard>
      ),
    },
    {
      path: ROUTES.DASHBOARD,
      element: <DashboardRoutes />,
      children: [
        { 
          index: true,
          element: <Navigate to={getRelativePath(DEFAULT_AUTHENTICATED_ROUTE)} replace /> 
        },
        { 
          path: getRelativePath(ROUTES.DASHBOARD_APP), 
          element: <DashboardPage /> 
        },
        {
          path: getRelativePath(ROUTES.ORGANIZATIONS),
          element: (
            <RoleGuard roles={ROUTE_PERMISSIONS[ROUTES.ORGANIZATIONS]}>
              <OrganizationsPage />
            </RoleGuard>
          ),
        },
        {
          path: getRelativePath(ROUTES.MEMBERS),
          element: (
            <RoleGuard roles={ROUTE_PERMISSIONS[ROUTES.MEMBERS]}>
              <MembersPage />
            </RoleGuard>
          ),
        },
      ],
    },
    {
      path: '*',
      element: <NotFoundPage />,
    },
  ];

  return useRoutes(routes);
} 