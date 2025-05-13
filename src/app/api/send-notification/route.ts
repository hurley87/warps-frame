import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';

const sendNotificationRequestSchema = z.object({
  notificationId: z.string().max(128),
  title: z.string().max(32),
  body: z.string().max(128),
  targetUrl: z.string().max(256),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = sendNotificationRequestSchema.parse(body);

    // Get all notification tokens from Supabase
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('token, url')
      .not('token', 'is', null)
      .not('url', 'is', null);

    if (error) {
      throw error;
    }

    if (!notifications || notifications.length === 0) {
      return NextResponse.json({
        result: {
          successfulTokens: [],
          invalidTokens: [],
          rateLimitedTokens: [],
        },
      });
    }

    // Group notifications by URL
    const notificationsByUrl = notifications.reduce((acc, notification) => {
      if (!notification.url || !notification.token) return acc;

      if (!acc[notification.url]) {
        acc[notification.url] = [];
      }
      acc[notification.url].push(notification.token);
      return acc;
    }, {} as Record<string, string[]>);

    // Send notifications to each URL
    const results = await Promise.all(
      Object.entries(notificationsByUrl).map(async ([url, tokens]) => {
        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...validatedData,
              tokens,
            }),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          return data.result;
        } catch (error) {
          console.error('Error sending notification:', error);
          return {
            successfulTokens: [],
            invalidTokens: tokens,
            rateLimitedTokens: [],
          };
        }
      })
    );

    // Combine results
    const combinedResult = results.reduce(
      (acc, result) => ({
        successfulTokens: [...acc.successfulTokens, ...result.successfulTokens],
        invalidTokens: [...acc.invalidTokens, ...result.invalidTokens],
        rateLimitedTokens: [
          ...acc.rateLimitedTokens,
          ...result.rateLimitedTokens,
        ],
      }),
      {
        successfulTokens: [] as string[],
        invalidTokens: [] as string[],
        rateLimitedTokens: [] as string[],
      }
    );

    return NextResponse.json({ result: combinedResult });
  } catch (error) {
    console.error('Error in send-notification route:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}
