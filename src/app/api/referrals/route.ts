import { NextResponse } from 'next/server';
import { saveReferral } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { ref, username } = await request.json();

    console.log('ref', ref);
    console.log('username', username);

    if (!ref || !username) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await saveReferral(ref, username);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving referral:', error);
    return NextResponse.json(
      { error: 'Failed to save referral' },
      { status: 500 }
    );
  }
}
