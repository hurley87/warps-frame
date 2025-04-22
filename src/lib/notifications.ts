import { supabase } from './supabase';
import {
  SendNotificationRequest,
  sendNotificationResponseSchema,
} from '@farcaster/frame-sdk';

const targetUrl = 'https://www.warps.fun';

export interface Notification {
  fid: number;
  url: string;
  token: string;
}

export async function insertNotification(notification: Notification) {
  const { data, error } = await supabase
    .from('notifications')
    .insert(notification)
    .select();

  if (error) {
    console.error('Error inserting notification:', error);
    throw error;
  }

  return data?.[0];
}

type SendFrameNotificationResult =
  | {
      state: 'error';
      error: unknown;
    }
  | { state: 'no_token' }
  | { state: 'rate_limit' }
  | { state: 'success' };

/**
 * Sends a notification to a single user
 * @param fid - User FID to notify
 * @param title - The notification title
 * @param body - The notification body text
 * @returns Result of the notification attempt
 */
export async function sendFrameNotification({
  notification,
  title,
  body,
}: {
  notification: Notification;
  title: string;
  body: string;
}): Promise<SendFrameNotificationResult> {
  if (!notification.url) {
    return { state: 'no_token' };
  }

  const response = await fetch(notification.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      notificationId: crypto.randomUUID(),
      title,
      body,
      targetUrl,
      tokens: [notification.token],
    } satisfies SendNotificationRequest),
  });

  const responseJson = await response.json();

  if (response.status === 200) {
    const responseBody = sendNotificationResponseSchema.safeParse(responseJson);
    if (responseBody.success === false) {
      // Malformed response
      return { state: 'error', error: responseBody.error.errors };
    }

    if (responseBody.data.result.rateLimitedTokens.length) {
      // Rate limited
      return { state: 'rate_limit' };
    }

    return { state: 'success' };
  } else {
    // Error response
    return { state: 'error', error: responseJson };
  }
}

/**
 * Sends the same notification to a batch of users
 * @param notifications - Array of notifications to notify
 * @param title - The notification title
 * @param body - The notification body text
 * @param batchSize - Optional batch size for processing (default: 50)
 * @returns Summary of notification results
 */
export async function sendBatchNotifications(
  notifications: Notification[],
  title: string,
  body: string,
  batchSize = 50
) {
  // Initialize counters
  let successful = 0;
  let failed = 0;
  let rateLimited = 0;
  let noToken = 0;

  // Process in batches to avoid overwhelming resources
  for (let i = 0; i < notifications.length; i += batchSize) {
    const batch = notifications.slice(i, i + batchSize);

    // Create notifications for this batch
    const notificationPromises = batch.map(async (notification) => {
      const result = await sendFrameNotification({
        notification,
        title,
        body,
      });

      switch (result.state) {
        case 'success':
          successful++;
          break;
        case 'rate_limit':
          rateLimited++;
          break;
        case 'no_token':
          noToken++;
          break;
        case 'error':
          console.error(
            `Error sending notification to FID ${notification.fid}:`,
            result.error
          );
          failed++;
          break;
      }

      return result;
    });

    // Wait for this batch to complete before processing the next
    await Promise.all(notificationPromises);
  }

  return {
    successful,
    failed,
    rateLimited,
    noToken,
    total: notifications.length,
  };
}

/**
 * Fetches all user IDs from the database
 * @returns Array of user FIDs
 */
export async function getAllNotifications(): Promise<Notification[]> {
  const { data, error } = await supabase.from('notifications').select('*');

  if (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }

  return data || [];
}

/**
 * Sends a notification to all users in the system
 * @param title - The notification title
 * @param body - The notification body text
 * @returns Summary of notification results
 */
export async function notifyAllUsers(title: string, body: string) {
  const notifications = await getAllNotifications();

  if (notifications.length === 0) {
    return {
      successful: 0,
      failed: 0,
      rateLimited: 0,
      noToken: 0,
      total: 0,
      message: 'No notifications found to notify',
    };
  }

  const result = await sendBatchNotifications(notifications, title, body);

  return {
    ...result,
    message: `Sent notifications to ${result.successful} of ${result.total} notifications (${result.failed} failed, ${result.rateLimited} rate limited, ${result.noToken} without tokens)`,
  };
}
