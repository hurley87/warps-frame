import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import { readContract } from '@wagmi/core';
import { createConfig, http } from 'wagmi';
import { chain } from '@/lib/chain';
import { ARROWS_CONTRACT } from '@/lib/contracts';
import { type Transport } from 'viem';
import { base } from 'wagmi/chains';

const rpc =
  chain.id === base.id
    ? process.env.NEXT_PUBLIC_BASE_RPC!
    : process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC!;

const config = createConfig({
  chains: [chain],
  transports: {
    [chain.id]: http(rpc),
  } as Record<number, Transport>,
});

const decodeBase64URI = (uri: string) => {
  const json = Buffer.from(uri.substring(29), 'base64').toString();
  return JSON.parse(json);
};

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tokenId = searchParams.get('tokenId');

    if (!tokenId) {
      return new Response('Missing tokenId parameter', { status: 400 });
    }

    // Fetch token metadata
    const tokenMetadata = await readContract(config, {
      address: ARROWS_CONTRACT.address,
      abi: ARROWS_CONTRACT.abi,
      functionName: 'tokenURI',
      args: [BigInt(tokenId)],
    });

    if (!tokenMetadata || tokenMetadata === '0x') {
      return new Response('Token not found', { status: 404 });
    }

    const metadata = decodeBase64URI(tokenMetadata);

    // Verify the image URL is properly formatted
    if (!metadata.image || typeof metadata.image !== 'string') {
      return new Response('Invalid image URL in metadata', { status: 400 });
    }

    // Ensure the image URL is absolute
    const imageUrl = metadata.image.startsWith('http')
      ? metadata.image
      : `https://${metadata.image}`;

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            background: '#000000',
            position: 'relative',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src={imageUrl}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              filter: 'drop-shadow(0 0 12px rgba(1, 138, 8, 0.7))',
            }}
            alt="NFT"
          />
        </div>
      ),
      {
        width: 630,
        height: 630,
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      }
    );
  } catch (error) {
    console.error('Error generating OG image:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
