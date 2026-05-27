'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardIndex() {
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('pos_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.role === 'OWNER') {
          router.replace('/dashboard/analytics');
        } else if (user.role === 'KITCHEN') {
          router.replace('/dashboard/kitchen');
        } else if (user.role === 'BAR') {
          router.replace('/dashboard/bar');
        } else {
          router.replace('/dashboard/cashier');
        }
      } catch (e) {
        router.replace('/login');
      }
    } else {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-earth-olive"></div>
    </div>
  );
}
