'use client';

import dynamic from 'next/dynamic';

const Waitlist = dynamic(() => import('@/components/waitlist'), {
  ssr: false,
});

export default function App() {
  return <Waitlist />;
}
