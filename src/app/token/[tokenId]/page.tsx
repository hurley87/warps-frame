import { Metadata } from 'next';
import TokenPageClient from './token-page-client';

interface TokenPageProps {
  params: Promise<{
    tokenId: string;
  }>;
}

const appUrl = 'https://warps.fun';

export async function generateMetadata({
  params,
}: TokenPageProps): Promise<Metadata> {
  const { tokenId } = await params;

  try {
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
