import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { username, points, reason } = await request.json();

    if (!username || !points || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('points')
      .insert([
        {
          username,
          points,
          reason,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.error('Error awarding points:', error);
      return NextResponse.json(
        { error: 'Failed to award points' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error in award points endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
