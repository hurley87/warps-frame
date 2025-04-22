import { NextResponse } from 'next/server';
import {
  parseWebhookEvent,
  verifyAppKeyWithNeynar,
  ParseWebhookEventResult,
} from '@farcaster/frame-node';
import { insertNotification } from '@/lib/supabase';

function isFrameEvent(
  data: ParseWebhookEventResult
): data is ParseWebhookEventResult & { event: string } {
  return 'event' in data;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = await parseWebhookEvent(body, verifyAppKeyWithNeynar);
    console.log('data', data);
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
          console.log('notification', notification);

          try {
            await insertNotification(notification);
            console.log('Notification stored in Supabase:', notification);
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
