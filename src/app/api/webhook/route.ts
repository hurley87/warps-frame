import { NextResponse } from 'next/server';
import {
  parseWebhookEvent,
  verifyAppKeyWithNeynar,
  ParseWebhookEventResult,
} from '@farcaster/frame-node';
import { awardPoints, insertNotification, supabase } from '@/lib/supabase';
import { NeynarAPIClient, Configuration } from '@neynar/nodejs-sdk';

const config = new Configuration({
  apiKey: process.env.NEYNAR_API_KEY || '',
});

const client = new NeynarAPIClient(config);

function isFrameEvent(
  data: ParseWebhookEventResult
): data is ParseWebhookEventResult & { event: string } {
  return 'event' in data;
}

export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = await parseWebhookEvent(body, verifyAppKeyWithNeynar);
    const event = data.event.event;

    if (!isFrameEvent(data)) {
      throw new Error('Invalid event data');
    }

    // Handle different event types
    switch (event) {
      case 'frame_added':
        if ('notificationDetails' in data.event) {
          const fid = data.fid;
          const url = data.event.notificationDetails?.url;
          const token = data.event.notificationDetails?.token;
          const notification = {
            fid,
            url,
            token,
          };

          const fids = [fid];

          const { users } = await client.fetchBulkUsers({ fids });
          console.log('User :', users[0]);
          const user = users[0];
          const username = user.username;

          try {
            await insertNotification(notification);

            console.log('Notification stored in Supabase:', notification);

            const { data: referral } = await supabase
              .from('referrals')
              .select('referrer')
              .eq('referred_user', username)
              .single();

            console.log('referral', referral);

            if (referral?.referrer) {
              await awardPoints(referral.referrer, 5, 'referral');
            }
          } catch (error) {
            console.error('Failed to store notification:', error);
            return NextResponse.json(
              { error: 'Failed to store notification' },
              { status: 500 }
            );
          }
        }
        break;
      case 'frame_removed':
        console.log('Frame removed');
        break;
      case 'notifications_enabled':
        if ('notificationDetails' in data) {
          console.log('Notifications enabled:', data.notificationDetails);
        }
        break;
      case 'notifications_disabled':
        console.log('Notifications disabled');
        break;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Invalid webhook event' },
      { status: 400 }
    );
  }
}
