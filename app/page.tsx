// in app/page.tsx

"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // This will immediately redirect anyone visiting the homepage to the correct dashboard.
    router.push('/sign-in');
  }, [router]);
  window.location.href = '/sign-in';

    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin size-23 text-blue-500" />
      </div>
    );
  

 
  
}