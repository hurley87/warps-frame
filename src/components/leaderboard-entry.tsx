'use client';

import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { getUserByUsername } from '@/lib/neynar';
import sdk from '@farcaster/frame-sdk';

interface LeaderboardEntryProps {
  username: string;
  totalPoints: number;
  rank: number;
}

export function LeaderboardEntry({
  username,
  totalPoints,
  rank,
}: LeaderboardEntryProps) {
  const [fid, setFid] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserFid = async () => {
      try {
        const response = await getUserByUsername(username);
        console.log('response', response);
        setFid(response.user.fid);
      } catch (err) {
        setError('Failed to fetch user FID');
        console.error('Error fetching user FID:', err);
      }
    };

    fetchUserFid();
  }, [username]);

  const handleViewProfile = async () => {
    if (!fid) return;

    try {
      setIsLoading(true);
      await sdk.actions.viewProfile({ fid });
    } catch (err) {
      setError('Failed to view profile');
      console.error('Error viewing profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  console.log('error', error);

  if (error) {
    return null;
  }

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3">
        <span className="text-gray-400 w-6">{rank}</span>
        <span className="font-medium">{username}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-[#7c65c1] font-bold">{totalPoints} pts</span>
        {fid && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleViewProfile}
            disabled={isLoading}
            className="text-[#7c65c1] hover:text-[#7c65c1]/80"
          >
            {isLoading ? 'Loading...' : 'View Profile'}
          </Button>
        )}
      </div>
    </div>
  );
}
