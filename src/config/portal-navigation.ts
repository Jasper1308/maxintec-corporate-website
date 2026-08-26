export type PortalPermission =
  | 'authenticated'
  | 'resident'
  | 'manager'
  | 'admin';

export interface PortalNavigationItem {
  label: string;
  href: string;
  permission: PortalPermission;
}

export interface PortalAccessContext {
  isAdmin: boolean;
  isManager: boolean;
}

export function canAccessPortalPermission(
  permission: PortalPermission,
  access: PortalAccessContext
): boolean {
  if (permission === 'authenticated') {
    return true;
  }

  if (permission === 'admin') {
    return access.isAdmin;
  }

  if (permission === 'manager') {
    return access.isManager;
  }

  if (permission === 'resident') {
    return !access.isAdmin;
  }

  return false;
}

export const portalNavigation:
  PortalNavigationItem[] = [
  {
    label: 'Visão geral',
    href: '/portal',
    permission: 'authenticated',
  },
  {
    label: 'Meu cadastro',
    href: '/portal/registrations',
    permission: 'authenticated',
  },
  {
    label: 'Chamados',
    href: '/portal/tickets',
    permission: 'authenticated',
  },
  {
    label: 'Meu perfil',
    href: '/portal/profile',
    permission: 'authenticated',
  },
  {
    label: 'Aprovações',
    href: '/portal/approvals',
    permission: 'manager',
  },
  {
    label: 'Moradores',
    href: '/portal/residents',
    permission: 'manager',
  },
  {
    label: 'Condomínios',
    href: '/portal/condominiums',
    permission: 'admin',
  },
  {
    label: 'Auditoria',
    href: '/portal/audit',
    permission: 'admin',
  },
];
