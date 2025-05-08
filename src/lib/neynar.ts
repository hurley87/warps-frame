import { NeynarAPIClient } from '@neynar/nodejs-sdk';
import { UserResponse } from '@neynar/nodejs-sdk/build/api/models/user-response';

// Initialize client
const neynarClient = new NeynarAPIClient({
  apiKey: process.env.NEYNAR_API_KEY as string,
});

/**
 * Publishes a cast to Farcaster via Neynar API
 *
 * @param text The text content of the cast
 * @param parent The parent cast hash to reply to
 * @param url Optional URL to embed in the cast
 * @returns The response from the Neynar API
 */
export const publishCast = async (
  text: string,
  parent: string,
  url?: string
) => {
  console.log('publishing cast', { text, parent, url });
  const signerUuid = process.env.SIGNER_UUID as string;
  const response = await neynarClient.publishCast({
    signerUuid,
    text,
    parent,
    embeds: url ? [{ url }] : undefined,
  });
  return response;
};

export const getUserByUsername = async (
  username: string
): Promise<UserResponse> => {
  const response = await neynarClient.lookupUserByUsername({
    username,
  });
  return response;
};
