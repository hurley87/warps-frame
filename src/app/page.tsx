import { Metadata } from 'next';
import App from './app';

const appUrl = 'https://warps.fun';

const frame = {
  version: 'next',
  imageUrl: `${appUrl}/splash.jpg`,
  button: {
    title: 'Play Warps',
    action: {
      type: 'launch_frame',
      name: 'Warps',
      url: appUrl,
      splashImageUrl: `${appUrl}/splash.jpg`,
      splashBackgroundColor: '#000000',
    },
  },
};

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Warps',
    openGraph: {
      title: 'Warps',
      description: 'Viral mini game on Base.',
    },
    other: {
      'fc:frame': JSON.stringify(frame),
    },
  };
}

export default function Home() {
  return <App />;
}
