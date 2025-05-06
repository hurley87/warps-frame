'use client';

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import sdk from '@farcaster/frame-sdk';

interface LeaderboardEntry {
  username: string;
  total_points: number;
}

interface LeaderboardProps {
  username?: string;
}

export default function Leaderboard({ username }: LeaderboardProps) {
  const [open, setOpen] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch leaderboard data
  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!open) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/leaderboard');
        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard data');
        }
        const data = await response.json();
        setLeaderboardData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [open]);

  const handleShare = () => {
    if (!username) return;

    const shareText = 'Play Warps, Earn USDC!';
    const shareUrl = encodeURIComponent(`https://warps.fun?ref=${username}`);
    const warpcastUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(
      shareText
    )}&embeds[]=${shareUrl}`;

    console.log('warpcastUrl', warpcastUrl);

    sdk.actions.openUrl(warpcastUrl);
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger>
        <Button className="bg-[#7c65c1] rounded-lg text-white font-bold">
          Leaderboard
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-full">
        <div className="h-full flex flex-col bg-black">
          <VisuallyHidden.Root>
            <DrawerTitle>Leaderboard</DrawerTitle>
            <DrawerDescription>Leaderboard</DrawerDescription>
          </VisuallyHidden.Root>
          <div className="px-6 py-4 border-b">
            <div className="flex justify-between items-center">
              <div className="text-xl">Leaderboard</div>
              <DrawerClose>
                <div className="text-sm text-gray-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>
                </div>
              </DrawerClose>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pt-4">
            <div className="space-y-2 mb-4">
              <h3 className="font-bold">Each referral is worth 5 points</h3>
              <Button
                variant="outline"
                onClick={handleShare}
                className="w-full"
              >
                Cast referral
              </Button>
            </div>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-red-500 text-center py-4">{error}</div>
            ) : (
              <div className="space-y-4">
                {leaderboardData.map((entry, index) => (
                  <div
                    key={entry.username}
                    className="flex items-center justify-between py-2"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400 w-6">{index + 1}</span>
                      <span className="font-medium">{entry.username}</span>
                    </div>
                    <span className="text-[#7c65c1] font-bold">
                      {entry.total_points} pts
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
