// in app/page.tsx

"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // This will immediately redirect anyone visiting the homepage to the correct dashboard.
    router.push('/dashboard');
  }, [router]);

  // Render a simple loading message while redirecting.
  return <p>Loading dashboard...</p>;
}