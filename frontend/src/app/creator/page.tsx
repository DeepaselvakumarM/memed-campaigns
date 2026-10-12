import type { Metadata } from 'next';
import { AppHeader } from '@/features/auth/AppHeader';
import { RoleGate } from '@/features/auth/RoleGate';
import { CreatorDashboard } from '@/features/creator/CreatorDashboard';

export const metadata: Metadata = { title: "Creator dashboard · Meme'd" };

export default function CreatorPage() {
  return (
    <RoleGate role="creator">
      <AppHeader />
      <CreatorDashboard />
    </RoleGate>
  );
}
