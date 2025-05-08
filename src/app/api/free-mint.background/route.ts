import { chain } from '@/lib/chain';
import { WARPS_CONTRACT } from '@/lib/contracts';
import { publishCast } from '@/lib/neynar';
import { NextResponse } from 'next/server';
import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { z } from 'zod';

const publicClient = createPublicClient({
  chain: chain,
  transport: http(process.env.NEXT_PUBLIC_BASE_RPC!),
});

const walletClient = createWalletClient({
  chain: chain,
  transport: http(process.env.NEXT_PUBLIC_BASE_RPC!),
});

// Schema for request validation
const requestSchema = z.object({
  verifiedAddress: z
    .string()
    .min(42)
    .max(42)
    .regex(/^0x[a-fA-F0-9]{40}$/, {
      message: 'Invalid Ethereum address format',
    }),
  threadHash: z.string(),
});

export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = requestSchema.parse(body);
    const { threadHash } = validatedData;
    const privateKey = process.env.SERVER_PRIVATE_KEY;
    console.log('threadHash', threadHash);

    if (!privateKey) {
      return new Response(
        JSON.stringify({ error: 'Server private key not configured' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const account = privateKeyToAccount(privateKey as `0x${string}`);
    const userAddress = validatedData.verifiedAddress as `0x${string}`;

    try {
      // Get the current nonce for the account
      const nonce = await publicClient.getTransactionCount({
        address: account.address,
      });

      const { request: txRequest } = await publicClient.simulateContract({
        ...WARPS_CONTRACT,
        functionName: 'ownerMint',
        args: [userAddress],
        account,
        gas: BigInt(5000000),
        nonce,
      });

      const hash = await walletClient.writeContract({
        ...txRequest,
        nonce,
      });

      const receipt = await publicClient.waitForTransactionReceipt({
        hash,
      });

      console.log(receipt);

      await publishCast(
        `Sent some Warps to ${userAddress}, DM me if you have any questions about the game.`,
        threadHash,
        'https://warps.fun'
      );

      return NextResponse.json({
        success: true,
        message: 'Free mint request received',
      });
    } catch (error) {
      console.error('Free mint error:', error);
      await publishCast(
        'Error minting your Warps. Most of time time this is because I already sent some warps. DM me if you have any questions.',
        threadHash
      );
      return NextResponse.json({
        success: false,
        message: 'Internal server error',
      });
    }
  } catch (error) {
    console.error('Free mint error:', error);

    return NextResponse.json({
      success: false,
      message: 'Internal server error',
    });
  }
}
