'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Admin() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/admin/events');
  }, [router]);
  
  return null;
}