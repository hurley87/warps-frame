import { type Token as TokenType } from '@/hooks/use-tokens';
import { useState } from 'react';

interface TokenProps {
  token: TokenType;
  onSelect?: (tokenId: number) => void;
  onDrop?: (sourceId: number, targetId: number) => void;
}

export function Token({ token, onSelect, onDrop }: TokenProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('text/plain', token.id.toString());
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isDragging) {
      e.currentTarget.classList.add('drag-over');
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    const sourceId = parseInt(e.dataTransfer.getData('text/plain'));
    if (sourceId !== token.id) {
      onDrop?.(sourceId, token.id);
    }
  };

  return (
    <>
      <div
        className={`relative aspect-square group cursor-pointer transition-all duration-200 ${
          isDragging ? 'opacity-50' : ''
        }`}
        onClick={() => onSelect?.(token.id)}
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDragEnd={handleDragEnd}
        onDrop={handleDrop}
      >
        <div className="absolute inset-0 overflow-hidden rounded-lg">
          <div
            className="absolute inset-[-20%] w-[140%] h-[140%] transition-transform duration-300 group-hover:scale-110 svg-container"
            style={{
              filter: 'drop-shadow(0 0 8px rgba(1, 138, 8, 0.5))',
            }}
            dangerouslySetInnerHTML={{
              __html: token.image?.startsWith('data:image/svg+xml;base64,')
                ? atob(token.image.split(',')[1])
                : '',
            }}
          />
        </div>
        {!isDragging && (
          <div className="absolute inset-0 bg-green-500/0 group-hover:bg-green-500/5 transition-all duration-300 rounded-lg group-hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] group-hover:scale-105" />
        )}
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
          animation: pulseSlow 1s ease-in-out infinite;
        }

        .svg-container g path[fill='#018A08'] {
          transform-origin: center;
          animation: pathPulse 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          transform-box: fill-box;
        }

        @keyframes greenGlowPulse {
          0%,
          100% {
            box-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
          }
          50% {
            box-shadow: 0 0 30px rgba(34, 197, 94, 0.5);
          }
        }

        @keyframes redGlowPulse {
          0%,
          100% {
            box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
          }
          50% {
            box-shadow: 0 0 30px rgba(239, 68, 68, 0.5);
          }
        }

        @keyframes dragGlow {
          0%,
          100% {
            box-shadow: 0 0 15px rgba(34, 197, 94, 0.3);
          }
          50% {
            box-shadow: 0 0 25px rgba(34, 197, 94, 0.5);
          }
        }

        .drag-over {
          animation: dragGlow 1.5s ease-in-out infinite !important;
        }

        .source-arrow-container .group {
          animation: greenGlowPulse 2s ease-in-out infinite;
          box-shadow: 0 0 30px rgba(34, 197, 94, 0.4);
        }

        .target-arrow-container .group {
          animation: redGlowPulse 2s ease-in-out infinite;
          box-shadow: 0 0 30px rgba(239, 68, 68, 0.4);
        }

        .target-arrow-container .group:hover {
          box-shadow: 0 0 30px rgba(239, 68, 68, 0.4) !important;
        }

        .target-arrow-container .group .absolute {
          background-color: rgba(239, 68, 68, 0.05) !important;
        }
      `}</style>
    </>
  );
}
