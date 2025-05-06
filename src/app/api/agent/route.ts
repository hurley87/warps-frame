import { publishCast } from '@/lib/neynar';
import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { getActionPrompt, getSystemPrompt } from '@/lib/prompts';

const baseSchema = z.object({
  shouldMint: z.boolean(),
  shouldReply: z.boolean(),
  reply: z.string(),
});

// Types
interface RequestData {
  text: string;
  thread_hash: string;
  hash: string;
  author?: {
    fid?: number;
    username?: string;
    pfp_url?: string;
    verified_accounts?: {
      platform: string;
      username: string;
    }[];
    verified_addresses?: {
      eth_addresses?: string[];
      primary?: {
        eth_address?: string;
      };
    };
    experimental?: {
      neynar_user_score?: number;
      profile?: {
        bio?: {
          text?: string;
        };
      };
      verified_addresses?: {
        eth_addresses?: string[];
        primary?: string;
      };
    };
    score?: number;
  };
  embeds?: Array<{
    url?: string;
  }>;
}
interface Request {
  data: RequestData;
}

// --- API Route Handler ---

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // --- Request Parsing and Validation ---
    const req: Request = await request.json();
    const { data } = req;
    const { author, thread_hash, text } = data;
    const fid = author?.fid;

    console.log('data', data);

    if (!fid) {
      console.warn('Request received without FID.');
      // Consider returning a more specific error response if FID is mandatory
      return NextResponse.json({
        success: false,
        message: 'User FID is missing.',
      });
    }
    const score = author?.score || 0;
    const verifiedAddress = author?.verified_addresses?.primary?.eth_address;
    console.log('score', score);

    if (!verifiedAddress) {
      console.warn('Request received without verified address.');
      // Consider returning a more specific error response if FID is mandatory
      await publishCast(
        'You need a Warpcast wallet to play Warps',
        thread_hash,
        'https://warps.fun'
      );
      return NextResponse.json({
        success: false,
        message: 'User FID is missing.',
      });
    }

    if (score < 0.2) {
      console.warn('Request received with score below 0.2.');
      // Consider returning a more specific error response if FID is mandatory
      await publishCast(
        'you have a low neynar score, needs to be above 0.2 to get free Warpss',
        thread_hash,
        'https://warps.fun'
      );
      return NextResponse.json({
        success: false,
        message: 'User score is below 0.2.',
      });
    }

    console.log('verified_address', verifiedAddress);

    const baseUrl = process.env.BASE_URL || 'https://warps.fun';

    const { object: agentResponse } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: baseSchema,
      mode: 'json',
      system: getSystemPrompt(),
      prompt: getActionPrompt(text),
    });

    console.log('agentResponse', agentResponse);
    console.log('baseUrl', baseUrl);

    if (agentResponse.shouldMint) {
      void fetch(`${baseUrl}/api/free-mint.background`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.API_KEY!,
        },
        body: JSON.stringify({
          verifiedAddress,
          threadHash: thread_hash,
        }),
      }).catch((error) => {
        console.error('Error in Jestr API route:', error);
      });

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    if (agentResponse.shouldReply) {
      await publishCast(agentResponse.reply, thread_hash, baseUrl);
    }

    // --- Respond ---
    // The response indicates the process was queued for background processing
    return NextResponse.json({
      status: 'PROCESSING_QUEUED',
      message: 'OpenAI interaction queued for background processing',
    });
  } catch (error) {
    console.error('Error in Jestr API route:', error);

    return NextResponse.json(
      {
        success: false,
        message: `Failed to process request: ${error}`,
        error: String(error), // Avoid sending full Error object in response
      },
      { status: 200 }
    );
  }
}
