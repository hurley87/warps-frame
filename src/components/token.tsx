import { type Token as TokenType } from '@/hooks/use-tokens';

interface TokenProps {
  token: TokenType;
}

export function Token({ token }: TokenProps) {
  return (
    <>
      <div className="relative aspect-square group">
        <div
          className="w-full h-full transition-transform duration-300 hover:scale-110 relative svg-container"
          // style={{
          //   filter: 'drop-shadow(0 0 8px rgba(1, 138, 8, 0.5))',
          // }}
          dangerouslySetInnerHTML={{
            __html: token.image?.startsWith('data:image/svg+xml;base64,')
              ? atob(token.image.split(',')[1])
              : '',
          }}
        />
        {/* <div
          className="absolute inset-0 bg-[#018A08] opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-lg"
          style={{
            filter: 'blur(15px)',
          }}
        /> */}
      </div>
      <style jsx global>{`
        @keyframes pathPulse {
          0%,
          100% {
            transform: scale(1);
            fill: #018a08;
          }
          25% {
            transform: scale(1.15);
            fill: #02bd0b;
          }
          50% {
            transform: scale(1.2);
            fill: #02bd0b;
          }
          75% {
            transform: scale(1.15);
            fill: #02bd0b;
          }
        }

        .animate-pulse-subtle {
          animation: pulseSlow 3s ease-in-out infinite;
        }

        .svg-container g path[fill='#018A08'] {
          transform-origin: center;
          animation: pathPulse 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          transform-box: fill-box;
        }
      `}</style>
    </>
  );
}
