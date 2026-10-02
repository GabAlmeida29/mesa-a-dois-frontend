import { BarChart3, Plus, UserCog, Users, type LucideIcon } from 'lucide-react';
import { NAV } from '@/constants/texts';
import { useAuth } from '@/contexts/AuthContext';
import type { Permission } from '@/lib/types';

interface MenuLink {
  href: string;
  label: string;
  icon: LucideIcon;
  permission?: Permission;
  adminOnly?: boolean;
}

const MENU_LINKS: MenuLink[] = [
  { href: '/restaurantes/novo', label: NAV.newRestaurant, icon: Plus, permission: 'restaurants:create' },
  { href: '/admin/acessos', label: NAV.analytics, icon: BarChart3, permission: 'analytics:view' },
  { href: '/admin/usuarios', label: NAV.users, icon: Users, adminOnly: true },
  { href: '/conta', label: NAV.account, icon: UserCog },
];

export function useMenuLinks() {
  const { isAdmin, can } = useAuth();
  return MENU_LINKS.filter(
    (link) => (!link.adminOnly || isAdmin) && (!link.permission || can(link.permission)),
  );
}
