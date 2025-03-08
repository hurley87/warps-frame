import { Metadata } from 'next';
import App from './app';

const appUrl = 'https://www.arrows.art';

const frame = {
  version: 'next',
  imageUrl: `${appUrl}/splash.jpg`,
  button: {
    title: 'Join Arrows',
    action: {
      type: 'launch_frame',
      name: 'Arrows',
      url: appUrl,
      splashImageUrl: `${appUrl}/splash.jpg`,
      splashBackgroundColor: '#000000',
    },
  },
};

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Arrows',
    openGraph: {
      title: 'Arrows',
      description: 'Up and to the right.',
    },
    other: {
      'fc:frame': JSON.stringify(frame),
    },
  };
}

export default function Home() {
  return <App />;
}
