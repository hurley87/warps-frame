'use client';

import dynamic from 'next/dynamic';
import { Desktop } from '@/components/desktop';
import { useDevice } from '@/hooks/use-device';

const Game = dynamic(() => import('@/components/game'), {
  ssr: false,
});

export default function App() {
  const { isMobile } = useDevice();

  return isMobile ? <Game /> : <Desktop />;
}
