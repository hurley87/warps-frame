'use client';

import dynamic from 'next/dynamic';

const Game = dynamic(() => import('@/components/game'), {
  ssr: false,
});

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col p-4">
      <Game />
    </main>
  );
}
