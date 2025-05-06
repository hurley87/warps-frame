import { NextResponse } from 'next/server';
import { supabase, awardPoints } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { username } = await request.json();

    if (!username) {
      return NextResponse.json({ error: 'Missing username' }, { status: 400 });
    }

    const { data: referral } = await supabase
      .from('referrals')
      .select('referrer')
      .eq('referred_user', username)
      .single();

    console.log('referral', referral);

    if (referral?.referrer) {
      await awardPoints(referral.referrer, 5, 'referral');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error checking referral:', error);
    return NextResponse.json(
      { error: 'Failed to check referral' },
      { status: 500 }
    );
  }
}
