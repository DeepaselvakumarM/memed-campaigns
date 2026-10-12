'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { homePathFor, useSession } from '@/features/auth/useSession';

/** Entry point: sends users to their dashboard, or to login. */
export default function HomePage() {
  const session = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session !== undefined) router.replace(homePathFor(session));
  }, [session, router]);

  return null;
}
