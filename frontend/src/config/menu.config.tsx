import { Dashboard as DashboardIcon, Business as BusinessIcon, People as PeopleIcon } from '@mui/icons-material';
import { ROUTES, ROUTE_PERMISSIONS } from './routes.config';
import { UserType } from '../types/user';

type MenuItem = {
  title: string;
  path: string;
  icon: JSX.Element;
  roles: readonly UserType[];
};

export const MENU_ITEMS: readonly MenuItem[] = [
  {
    title: 'menu.dashboard',
    path: ROUTES.DASHBOARD_APP,
    icon: <DashboardIcon />,
    roles: ROUTE_PERMISSIONS[ROUTES.DASHBOARD_APP],
  },
  {
    title: 'menu.organizations',
    path: ROUTES.ORGANIZATIONS,
    icon: <BusinessIcon />,
    roles: ROUTE_PERMISSIONS[ROUTES.ORGANIZATIONS],
  },
  {
    title: 'menu.members',
    path: ROUTES.MEMBERS,
    icon: <PeopleIcon />,
    roles: ROUTE_PERMISSIONS[ROUTES.MEMBERS],
  },
]; 