import { NeynarAPIClient, Configuration } from '@neynar/nodejs-sdk';
import { supabase } from './supabase';

// Configuration
const BATCH_SIZE = 50; // Increased batch size for better throughput
const RATE_LIMIT_DELAY = 1000; // Base delay in ms
const MAX_RETRIES = 3; // Maximum number of retries
const MAX_CONCURRENT_REQUESTS = 5; // Maximum number of concurrent requests

// Initialize Neynar client
const config = new Configuration({
  apiKey: process.env.NEYNAR_API_KEY || '',
});
const client = new NeynarAPIClient(config);

// Helper function to calculate exponential backoff delay
const getBackoffDelay = (retryCount: number) => {
  return Math.min(RATE_LIMIT_DELAY * Math.pow(2, retryCount), 30000); // Max 30s delay
};

// Helper function to delay execution
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetches user information in batches with rate limiting and retry logic
 * @param fids - Array of Farcaster IDs to fetch
 * @returns Array of user information
 */
export async function fetchBulkUsers(fids: number[]) {
  const results: any[] = [];
  const errors: { fid: number; error: any }[] = [];

  // Process in batches
  for (let i = 0; i < fids.length; i += BATCH_SIZE) {
    const batch = fids.slice(i, i + BATCH_SIZE);
    const batchPromises = [];

    // Create concurrent requests within the batch
    for (let j = 0; j < batch.length; j += MAX_CONCURRENT_REQUESTS) {
      const concurrentBatch = batch.slice(j, j + MAX_CONCURRENT_REQUESTS);
      const promises = concurrentBatch.map(async (fid) => {
        let retryCount = 0;
        while (retryCount <= MAX_RETRIES) {
          try {
            const { users } = await client.fetchBulkUsers({ fids: [fid] });
            if (users && users.length > 0) {
              return users[0];
            }
            return null;
          } catch (error: any) {
            if (error.status === 429 && retryCount < MAX_RETRIES) {
              const backoffDelay = getBackoffDelay(retryCount);
              await delay(backoffDelay);
              retryCount++;
              continue;
            }
            errors.push({ fid, error });
            return null;
          }
        }
        return null;
      });
      batchPromises.push(...promises);
    }

    // Wait for all concurrent requests in the batch to complete
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults.filter(Boolean));

    // Add a small delay between batches to avoid rate limits
    if (i + BATCH_SIZE < fids.length) {
      await delay(100);
    }
  }

  return {
    users: results,
    errors,
  };
}

/**
 * Updates user information in the database in batches
 * @param users - Array of user information to update
 * @returns Summary of update results
 */
export async function updateBulkUsers(users: any[]) {
  const results = {
    successful: 0,
    failed: 0,
    errors: [] as any[],
  };

  // Process in batches
  for (let i = 0; i < users.length; i += BATCH_SIZE) {
    const batch = users.slice(i, i + BATCH_SIZE);

    try {
      const { error } = await supabase.from('users').upsert(
        batch.map((user) => ({
          fid: user.fid,
          username: user.username,
          display_name: user.display_name,
          pfp_url: user.pfp_url,
          updated_at: new Date().toISOString(),
        })),
        { onConflict: 'fid' }
      );

      if (error) {
        throw error;
      }

      results.successful += batch.length;
    } catch (error) {
      results.failed += batch.length;
      results.errors.push(error);
    }

    // Add a small delay between batches
    if (i + BATCH_SIZE < users.length) {
      await delay(100);
    }
  }

  return results;
}

/**
 * Fetches and updates user information in bulk
 * @param fids - Array of Farcaster IDs to process
 * @returns Summary of the bulk operation
 */
export async function processBulkUsers(fids: number[]) {
  const { users, errors: fetchErrors } = await fetchBulkUsers(fids);

  if (users.length === 0) {
    return {
      success: false,
      message: 'No users found to process',
      errors: fetchErrors,
    };
  }

  const updateResults = await updateBulkUsers(users);

  return {
    success: true,
    message: `Processed ${users.length} users (${updateResults.successful} updated, ${updateResults.failed} failed)`,
    errors: [...fetchErrors, ...updateResults.errors],
  };
}
