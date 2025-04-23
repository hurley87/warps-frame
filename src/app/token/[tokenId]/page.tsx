import { Metadata } from 'next';
import TokenPageClient from './token-page-client';
import { readContract } from '@wagmi/core';
import { createConfig, http } from 'wagmi';
import { chain } from '@/lib/chain';
import { WARPS_CONTRACT } from '@/lib/contracts';
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

interface TokenPageProps {
  params: Promise<{
    tokenId: string;
  }>;
}

const appUrl = 'https://warps.fun';

async function getTokenMetadata(tokenId: string) {
  try {
    const tokenMetadata = await readContract(config, {
      address: WARPS_CONTRACT.address,
      abi: WARPS_CONTRACT.abi,
      functionName: 'tokenURI',
      args: [BigInt(tokenId)],
    });

    if (!tokenMetadata || tokenMetadata === '0x') {
      throw new Error('Token does not exist or has been burned');
    }

    return decodeBase64URI(tokenMetadata);
  } catch (error) {
    console.error('Error fetching token metadata:', error);
    throw new Error('Token does not exist or has been burned');
  }
}

export async function generateMetadata({
  params,
}: TokenPageProps): Promise<Metadata> {
  const { tokenId } = await params;

  try {
    const metadata = await getTokenMetadata(tokenId);

    const imageUrl = `${appUrl}/api/og?image=${encodeURIComponent(
      metadata.image
    )}`;

    const frame = {
      version: 'next',
      imageUrl: `${appUrl}/api/og?tokenId=${tokenId}`,
      button: {
        title: 'Play Warps',
        action: {
          type: 'launch_frame',
          name: `Warps Token #${tokenId}`,
          url: `${appUrl}`,
          splashImageUrl: `${appUrl}/splash.jpg`,
          splashBackgroundColor: '#000000',
        },
      },
    };

    return {
      title: `Warps Token #${tokenId}`,
      openGraph: {
        title: `Warps Token #${tokenId}`,
        description: 'View your Warps token details.',
      },
      other: {
        'fc:frame': JSON.stringify(frame),
      },
    };
  } catch (error) {
    // Return a default frame for non-existent tokens
    console.error('Error fetching token metadata:', error);
    const frame = {
      version: 'next',
      imageUrl: `${appUrl}/splash.jpg`,
      button: {
        title: 'View Token',
        action: {
          type: 'launch_frame',
          name: 'Token Not Found',
          url: `${appUrl}/token/${tokenId}`,
          splashImageUrl: `${appUrl}/splash.jpg`,
          splashBackgroundColor: '#000000',
        },
      },
    };

    return {
      title: `Token #${tokenId} Not Found`,
      openGraph: {
        title: `Token #${tokenId} Not Found`,
        description: 'This token does not exist or has been burned.',
      },
      other: {
        'fc:frame': JSON.stringify(frame),
      },
    };
  }
}

export default async function TokenPage({ params }: TokenPageProps) {
  const { tokenId } = await params;
  return <TokenPageClient params={{ tokenId }} />;
}
