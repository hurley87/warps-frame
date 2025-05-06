import { NextResponse } from 'next/server';
import { getPoints } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await getPoints();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const leaderboard: Record<string, number> = {};

  data?.forEach(({ username, points }) => {
    leaderboard[username] = (leaderboard[username] || 0) + points;
  });

  const sorted = Object.entries(leaderboard)
    .map(([username, total_points]) => ({ username, total_points }))
    .sort((a, b) => b.total_points - a.total_points)
    .slice(0, 100);

  return NextResponse.json(sorted);
}
