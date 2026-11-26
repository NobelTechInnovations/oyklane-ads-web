'use client';

import { useSession } from './session';

/** The ad account being worked on. Phase 1 has one per organisation. */
export function useAccount() {
  const { memberships } = useSession();
  const membership = memberships[0]!;
  return {
    accountId: membership.adAccountIds[0]!,
    organisationName: membership.organisationName,
    canEdit: membership.role !== 'analyst',
  };
}
