'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';

export default function ThanksPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#17101f] flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-md">
        <div className="space-y-4">
          <Sparkles className="w-16 h-16 text-yellow-400 mx-auto animate-pulse" />
          <h1 className="text-4xl font-bold text-white">Thank You!</h1>
          <p className="text-lg text-gray-300">
            Your Warps have been successfully minted. You can now view and
            combine them.
          </p>
        </div>

        <Button
          onClick={() => router.push('/')}
          className="bg-[#7c65c1] hover:bg-[#7c65c1]/90 text-white px-8 py-6 text-lg font-semibold shadow-lg shadow-primary/20"
        >
          View My Tokens
        </Button>
      </div>
    </div>
  );
}
