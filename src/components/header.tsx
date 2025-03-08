'use client';

import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';
import Info from '@/components/info';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const isHomePage = pathname === '/';

  return (
    <header className="border-b sticky top-0 bg-background z-10">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {!isHomePage && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 mr-2"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <span className="font-bold">Arrows</span>
        </div>
        <div className="flex items-center gap-2">
          <Info />
        </div>
      </div>
    </header>
  );
}
