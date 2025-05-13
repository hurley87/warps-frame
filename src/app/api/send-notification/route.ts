import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';

const sendNotificationRequestSchema = z.object({
  notificationId: z.string().max(128),
  title: z.string().max(32),
  body: z.string().max(128),
  targetUrl: z.string().max(256),
});

type SendNotificationRequest = z.infer<typeof sendNotificationRequestSchema>;

const BATCH_SIZE = 100; // Number of tokens to send in each batch
const RATE_LIMIT_DELAY = 1000; // Delay in ms between batches

async function sendBatch(
  url: string,
  tokens: string[],
  payload: SendNotificationRequest
) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...payload,
        tokens,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        url,
      });

      // Check if rate limited
      if (response.status === 429) {
        return {
          successfulTokens: [],
          invalidTokens: [],
          rateLimitedTokens: tokens,
        };
      }

      throw new Error(
        `HTTP error! status: ${response.status}, body: ${errorText}`
      );
    }

    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error('Error sending notification batch:', error);
    return {
      successfulTokens: [],
      invalidTokens: tokens,
      rateLimitedTokens: [],
    };
  }
}

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

    // Process each URL's notifications in batches
    const results = await Promise.all(
      Object.entries(notificationsByUrl).map(async ([url, tokens]) => {
        const batches = [];
        for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
          const batchTokens = tokens.slice(i, i + BATCH_SIZE);
          batches.push(batchTokens);
        }

        const batchResults = [];
        for (const batchTokens of batches) {
          const result = await sendBatch(url, batchTokens, validatedData);
          batchResults.push(result);

          // Add delay between batches to avoid rate limiting
          if (batches.length > 1) {
            await new Promise((resolve) =>
              setTimeout(resolve, RATE_LIMIT_DELAY)
            );
          }
        }

        // Combine results from all batches
        return batchResults.reduce(
          (acc, result) => ({
            successfulTokens: [
              ...acc.successfulTokens,
              ...result.successfulTokens,
            ],
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
      })
    );

    // Combine results from all URLs
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
