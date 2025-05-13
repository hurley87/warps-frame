import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { username, reason, startDate, endDate } = await request.json();

    if (!username || !reason || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('points')
      .select('*')
      .eq('username', username)
      .eq('reason', reason)
      .gte('created_at', startDate)
      .lt('created_at', endDate);

    if (error) {
      console.error('Error checking points:', error);
      return NextResponse.json(
        { error: 'Failed to check points' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      hasPoints: data && data.length > 0,
      points: data || [],
    });
  } catch (error) {
    console.error('Error in check points endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
