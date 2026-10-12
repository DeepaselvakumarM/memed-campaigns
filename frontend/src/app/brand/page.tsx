import type { Metadata } from 'next';
import { AppHeader } from '@/features/auth/AppHeader';
import { RoleGate } from '@/features/auth/RoleGate';
import { BrandDashboard } from '@/features/brand/BrandDashboard';

export const metadata: Metadata = { title: "Brand dashboard · Meme'd" };

export default function BrandPage() {
  return (
    <RoleGate role="brand">
      <AppHeader />
      <BrandDashboard />
    </RoleGate>
  );
}
