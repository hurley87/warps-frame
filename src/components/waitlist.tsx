'use client';

import sdk, { type Context } from '@farcaster/frame-sdk';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { motion } from 'framer-motion';
import { Loader2, Smartphone } from 'lucide-react';

export default function Waitlist() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<Context.FrameContext>();

  useEffect(() => {
    const load = async () => {
      const context = await sdk.context;
      setContext(context);
      sdk.actions.ready();
    };
    if (sdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      load();
    }
  }, [isSDKLoaded]);

  const handleAddToWaitlist = async () => {
    await sdk.actions.addFrame();
  };

  // Desktop message component - same as in game component
  const DesktopMessage = () => (
    <div className="hidden sm:flex flex-col items-center justify-center h-screen p-8 text-center">
      <div className="bg-black/50 backdrop-blur-md rounded-xl p-8 border-2 border-primary/50 shadow-lg max-w-md">
        <Smartphone className="h-12 w-12 mx-auto mb-4 text-primary" />
        <h2 className="text-2xl font-bold mb-2">Frame Only Experience</h2>
        <p className="text-muted-foreground mb-4">Find it on Farcaster.</p>
      </div>
    </div>
  );

  if (!isSDKLoaded) {
    return (
      <div className="sm:hidden flex flex-col items-center justify-center min-h-[200px] p-8">
        <Loader2 className="h-8 w-8 animate-spin text-foreground mb-2" />
        <p className="text-foreground/70 text-sm">Initializing game...</p>
      </div>
    );
  }

  const WaitlistContent = () => (
    <div className="flex items-center justify-center min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-xl p-6 border border-zinc-800/30 shadow-lg max-w-md mx-auto backdrop-blur-sm"
        style={{
          background:
            'linear-gradient(145deg, rgba(10,10,10,0.95), rgba(20,20,20,0.98))',
        }}
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <motion.div
              className="w-full flex justify-center mb-4"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                repeatType: 'reverse',
                repeatDelay: 3,
              }}
            >
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg blur opacity-60 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                <div
                  className="relative px-5 py-2 rounded-lg"
                  style={{ background: 'rgba(10,10,10,0.9)' }}
                >
                  <h2
                    className="text-xl font-bold text-transparent bg-clip-text"
                    style={{
                      backgroundImage:
                        'linear-gradient(to right, #c084fc, #818cf8, #60a5fa)',
                    }}
                  >
                    Arrows
                  </h2>
                </div>
              </div>
            </motion.div>

            <p className="text-foreground/90 text-center leading-relaxed text-xl">
              Join the waitlist to be one of the first to play the game.
              <span className="font-bold text-foreground block mt-1">
                Launching soon!
              </span>
            </p>
          </div>

          <motion.div
            className="pt-2 flex justify-center"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {!context?.client?.added ? (
              <Button
                onClick={handleAddToWaitlist}
                size="lg"
                className="w-full font-medium py-2 px-8 rounded-md transition-all duration-200 border-0 shadow-md"
                style={{
                  background: 'linear-gradient(to right, #8b5cf6, #6366f1)',
                  boxShadow: '0 4px 14px rgba(99, 102, 241, 0.2)',
                }}
              >
                Add to waitlist
              </Button>
            ) : (
              <Button
                disabled
                size="lg"
                className="w-full font-medium py-2 px-8 rounded-md border-0 opacity-90"
                style={{
                  background: 'linear-gradient(to right, #10b981, #059669)',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.2)',
                }}
              >
                <span className="mr-2">✅</span>
                Added to waitlist
              </Button>
            )}
          </motion.div>

          <p className="text-foreground/40 text-xs text-center pt-4">
            {`You'll be notified when the game is ready to play`}
          </p>
        </div>
      </motion.div>
    </div>
  );

  return (
    <>
      {/* Mobile view - only visible on small screens (below sm breakpoint) */}
      <div className="sm:hidden">
        <WaitlistContent />
      </div>

      {/* Desktop message - only visible on sm screens and above */}
      <DesktopMessage />
    </>
  );
}
