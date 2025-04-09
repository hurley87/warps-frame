import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('image');

    if (!imageUrl) {
      return new Response('Missing image parameter', { status: 400 });
    }

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
          {imageUrl.startsWith('data:image/svg+xml;base64,') ? (
            <div
              style={{
                position: 'absolute',
                width: '800px',
                height: '800px',
                filter: 'drop-shadow(0 0 12px rgba(1, 138, 8, 0.7))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              dangerouslySetInnerHTML={{
                __html: atob(imageUrl.split(',')[1]),
              }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                backgroundImage: `url(${imageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          )}
        </div>
      ),
      {
        width: 630,
        height: 630,
      }
    );
  } catch (error) {
    console.error('Error generating OG image:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
