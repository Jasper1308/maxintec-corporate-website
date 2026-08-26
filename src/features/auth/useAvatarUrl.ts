'use client';

import { useEffect, useState } from 'react';

import { getOwnAvatarUrl } from './avatar';

export function useAvatarUrl(path: string | null | undefined): string | null {
  const [resolved, setResolved] = useState<{ path: string; url: string } | null>(null);
  useEffect(() => {
    let active = true;
    if (!path) return () => { active = false; };
    void getOwnAvatarUrl(path)
      .then(value => { if (active) setResolved({ path, url: value }); })
      .catch(error => console.error('Failed to load profile image:', error));
    return () => { active = false; };
  }, [path]);
  return resolved && resolved.path === path ? resolved.url : null;
}
