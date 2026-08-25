import { describe, expect, it } from 'vitest';

import { canAccessPortalPermission, portalNavigation } from './portal-navigation';

function visibleRoutes(access: { isAdmin: boolean; isManager: boolean }) {
  return portalNavigation
    .filter(item => canAccessPortalPermission(item.permission, access))
    .map(item => item.href);
}

describe('portal permission matrix', () => {
  it('shows only authenticated routes to residents', () => {
    expect(visibleRoutes({ isAdmin: false, isManager: false })).toEqual([
      '/portal',
      '/portal/registrations',
      '/portal/tickets',
    ]);
  });

  it('adds condominium management routes for managers', () => {
    expect(visibleRoutes({ isAdmin: false, isManager: true })).toEqual([
      '/portal',
      '/portal/registrations',
      '/portal/tickets',
      '/portal/approvals',
      '/portal/residents',
    ]);
  });

  it('shows every current route to admins', () => {
    expect(visibleRoutes({ isAdmin: true, isManager: true })).toEqual(
      portalNavigation.map(item => item.href)
    );
  });
});
