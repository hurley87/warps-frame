import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export interface Notification {
  id: string;
  fid: number;
  url?: string;
  token?: string;
  created_at: string;
}

export const insertNotification = async (
  notification: Omit<Notification, 'id' | 'created_at'>
) => {
  const { data, error } = await supabase
    .from('notifications')
    .insert([notification])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

// Called when a new user signs in or plays the game
export async function saveReferral(ref: string | null, referredUser: string) {
  if (!ref || ref === referredUser) return; // prevent self-referral

  const { data, error } = await supabase
    .from('referrals')
    .insert([{ referrer: ref, referred_user: referredUser }])
    .select();

  if (error) {
    if (error.code === '23505') {
      console.log('User already referred');
    } else {
      console.error('Error saving referral:', error.message);
    }
  } else {
    console.log('Referral saved:', data);
  }
}

export async function awardPoints(
  username: string,
  points: number,
  reason: string
) {
  const { error } = await supabase
    .from('points')
    .insert([{ username, points, reason }]);

  if (error)
    console.error(`Failed to award points for ${reason}:`, error.message);
}
