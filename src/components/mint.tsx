'use client';

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { Button } from './ui/button';
import { useAccount } from 'wagmi';
import { useState, useEffect, useRef } from 'react';
import { ARROWS_CONTRACT } from '@/lib/contracts';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Loader2,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Coins,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { chain } from '@/lib/chain';
import posthog from 'posthog-js';

export function Mint() {
  const { address } = useAccount();
  const [isPending, setIsPending] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const successHandled = useRef(false);
  const timeoutHandled = useRef(false);
  const queryClient = useQueryClient();
  const [floatingArrows, setFloatingArrows] = useState<
    Array<{
      id: number;
      x: number;
      y: number;
      rotation: number;
      type: string;
      color: string;
    }>
  >([]);

  const {
    data: hash,
    writeContract,
    isPending: isWritePending,
  } = useWriteContract({
    mutation: {
      onError: (error: Error) => {
        console.error('Mint error in mutation handler:', error);
        // Reset loading state in the onError callback as well
        setIsPending(false);
        setHasError(true);
        setShowParticles(false);
        setIsSuccess(false);
      },
    },
  });

  const { isLoading: isConfirming, isSuccess: isTxSuccess } =
    useWaitForTransactionReceipt({
      hash: hash as `0x${string}`,
    });

  // Handle transaction confirmation errors
  useEffect(() => {
    if (hash && !isConfirming && !isTxSuccess && isPending) {
      console.error('Transaction may have failed at confirmation stage');
      // Reset states if transaction confirmation is no longer active without success
      setIsPending(false);
      setHasError(true);
      setShowParticles(false);
      setIsSuccess(false);

      toast.error(
        'Transaction failed to confirm. Please check your wallet or try again.',
        {
          duration: 5000,
        }
      );
    }
  }, [hash, isConfirming, isTxSuccess, isPending]);

  // Add an effect to reset loading state when isWritePending becomes false
  useEffect(() => {
    // If writeContract pending state is false but our component still thinks it's pending
    // This catches cases where the error might not be caught by the try/catch
    if (!isWritePending && isPending && !hash) {
      console.log(
        'Detected stalled transaction state, resetting loading state'
      );
      setIsPending(false);
      setHasError(true);
      setShowParticles(false);
      setIsSuccess(false);
    }
  }, [isWritePending, isPending, hash]);

  // Determine if any loading state is active
  const isLoading = isPending || isWritePending || isConfirming;

  // Generate random floating arrows for the loading animation
  useEffect(() => {
    if (isLoading) {
      const arrowTypes = ['up', 'down', 'left', 'right'];
      const arrowColors = [
        '#FF5A5F',
        '#3490DE',
        '#FFB400',
        '#8A2BE2',
        '#50C878',
      ];

      const arrows = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        rotation: Math.floor(Math.random() * 360),
        type: arrowTypes[Math.floor(Math.random() * arrowTypes.length)],
        color: arrowColors[Math.floor(Math.random() * arrowColors.length)],
      }));

      setFloatingArrows(arrows);
    }
  }, [isLoading]);

  useEffect(() => {
    const handleSuccess = async () => {
      if (isTxSuccess && !successHandled.current) {
        successHandled.current = true;

        // Play success sound
        const successSound = new Audio('/sounds/composite-success.wav');
        successSound.volume = 0.4;
        try {
          successSound.play();
        } catch {
          // Silent fail if audio can't play
        }

        // Show success particles animation
        setShowParticles(true);
        setIsSuccess(true);

        // Shake the screen slightly for feedback
        document.documentElement.classList.add('screen-shake');
        setTimeout(() => {
          document.documentElement.classList.remove('screen-shake');
        }, 500);

        // Invalidate token queries with the correct query keys
        queryClient.invalidateQueries({ queryKey: ['tokens-balance'] });
        queryClient.invalidateQueries({ queryKey: ['tokens-metadata'] });

        setHasError(false);

        // Trigger confetti animation
        const duration = 4000;
        const animationEnd = Date.now() + duration;
        const defaults = {
          startVelocity: 30,
          spread: 360,
          ticks: 60,
          zIndex: 0,
        };

        function randomInRange(min: number, max: number) {
          return Math.random() * (max - min) + min;
        }

        const interval: NodeJS.Timeout = setInterval(function () {
          const timeLeft = animationEnd - Date.now();

          if (timeLeft <= 0) {
            return clearInterval(interval);
          }

          const particleCount = 50 * (timeLeft / duration);

          confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          });
          confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          });
        }, 250);

        toast.success('Successfully minted 8 Arrows!', {
          icon: <Sparkles className="h-4 w-4 text-yellow-400" />,
          className: 'bg-gradient-to-r from-primary/30 to-primary/10',
        });

        // Reset states after animation finishes
        setTimeout(() => {
          // Second round of invalidation to ensure UI is updated
          queryClient.invalidateQueries({ queryKey: ['tokens-balance'] });
          queryClient.invalidateQueries({ queryKey: ['tokens-metadata'] });

          setShowParticles(false);
          setIsSuccess(false);
          setIsPending(false);
        }, 4000);
      }
    };

    handleSuccess();
  }, [isTxSuccess, queryClient]);

  const handleMint = async () => {
    if (!address) return;

    // check if

    // Play click sound if available
    const audio = new Audio('/sounds/composite-start.wav');
    audio.volume = 0.4;
    try {
      await audio.play();
    } catch {
      // Silent fail if audio can't play
    }

    // Apply button pulse animation
    if (buttonRef.current) {
      buttonRef.current.classList.add('button-pulse');
      setTimeout(() => {
        if (buttonRef.current)
          buttonRef.current.classList.remove('button-pulse');
      }, 500);
    }

    successHandled.current = false;
    timeoutHandled.current = false;
    setIsPending(true);
    setHasError(false);
    setIsSuccess(false);

    // Global failsafe timeout - reset loading state after 15 seconds no matter what
    const globalFailsafeTimeout = setTimeout(() => {
      if (isPending && !timeoutHandled.current) {
        console.warn(
          'Global failsafe timeout triggered - resetting mint state'
        );
        timeoutHandled.current = true;
        setIsPending(false);
        setHasError(true);
        toast.error('Transaction took too long, please try again', {
          duration: 3000,
        });
      }
    }, 5000);

    try {
      // Specify a lower value for testing to ensure it doesn't run into fee protection
      const mintValue = parseEther('0.004'); // 0.001 ETH * 10 tokens

      await writeContract({
        ...ARROWS_CONTRACT,
        functionName: 'mint',
        args: [address],
        value: mintValue,
        gas: BigInt(3000000),
        chainId: chain.id,
        // Don't specify gas, let the wallet estimate it (fixes fee protection errors)
      });

      posthog.capture('mint', {
        address,
      });

      // Clear the timeout since we got past the writeContract
      clearTimeout(globalFailsafeTimeout);
    } catch (error) {
      // Clear the timeout since we got an error response
      clearTimeout(globalFailsafeTimeout);
      timeoutHandled.current = true;

      console.error('Unexpected mint error:', error);

      // Play error sound
      const errorSound = new Audio('/sounds/composite-error.mp3');
      errorSound.volume = 0.3;
      try {
        errorSound.play();
      } catch {
        // Silent fail if audio can't play
      }

      // Add screen shake
      document.documentElement.classList.add('screen-shake');
      setTimeout(() => {
        document.documentElement.classList.remove('screen-shake');
      }, 500);

      setIsPending(false);
      setHasError(true);
      setShowParticles(false);
      setIsSuccess(false);
    }
  };

  // Helper function to render the appropriate arrow icon
  const renderArrowIcon = (type: string, color: string) => {
    const style = { color: color, filter: `drop-shadow(0 0 3px ${color}40)` };

    switch (type) {
      case 'up':
        return <ArrowUp style={style} />;
      case 'down':
        return <ArrowDown style={style} />;
      case 'left':
        return <ArrowLeft style={style} />;
      case 'right':
        return <ArrowRight style={style} />;
      default:
        return <ArrowRight style={style} />;
    }
  };

  // Particle system for success animation
  const Particles = () => {
    return (
      <div className="particles-container">
        {[...Array(40)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-full ${
              i % 3 === 0
                ? 'bg-primary'
                : i % 3 === 1
                ? 'bg-yellow-400'
                : 'bg-blue-400'
            }`}
            style={{
              width: `${Math.random() * 10 + 2}px`,
              height: `${Math.random() * 10 + 2}px`,
            }}
            initial={{
              x: 0,
              y: 0,
              opacity: 1,
              scale: 1,
            }}
            animate={{
              x: (Math.random() - 0.5) * 400,
              y: (Math.random() - 0.5) * 400,
              opacity: 0,
              scale: Math.random() * 4 + 1,
              rotate: Math.random() * 360,
            }}
            transition={{
              duration: 1.5 + Math.random(),
              ease: 'easeOut',
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <motion.div
      className="relative"
      whileHover={{ scale: isSuccess ? 1 : 1.05 }}
      transition={{ type: 'spring', stiffness: 400, damping: 10 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Floating arrows animation */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <AnimatePresence>
          {isLoading &&
            floatingArrows.map((arrow) => (
              <motion.div
                key={arrow.id}
                className="absolute"
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: 0.6,
                  scale: 1,
                  x: [0, Math.random() * 20 - 10],
                  y: [0, Math.random() * 20 - 10],
                  rotate: `${arrow.rotation}deg`,
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{
                  duration: 1 + Math.random(),
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: 'easeInOut',
                  delay: arrow.id * 0.1,
                }}
                style={{
                  left: `${arrow.x}%`,
                  top: `${arrow.y}%`,
                  filter: `drop-shadow(0 0 5px ${arrow.color}60)`,
                }}
              >
                {renderArrowIcon(arrow.type, arrow.color)}
              </motion.div>
            ))}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        {isSuccess ? (
          <motion.div
            className="relative flex items-center justify-center p-3 min-h-[40px] bg-green-950 bg-opacity-40 rounded-md border border-green-500/50 shadow-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="flex items-center gap-2 text-green-400 font-medium z-10"
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Sparkles className="h-5 w-5 text-yellow-400" />
              <span className="text-green-300">Mint Successful!</span>
            </motion.div>
          </motion.div>
        ) : (
          <Button
            ref={buttonRef}
            onClick={handleMint}
            disabled={isLoading}
            className={`relative group overflow-hidden border transition-all duration-300 ${
              hasError
                ? 'bg-red-500/20 hover:bg-red-500/30'
                : isHovered
                ? 'bg-gradient-to-r from-primary/30 to-primary/20 shadow-lg shadow-primary/20'
                : 'bg-gradient-to-r from-primary/20 to-primary/10 hover:from-primary/30 hover:to-primary/20'
            }`}
          >
            <div
              className={`absolute inset-0 rounded-md blur-xl transition-all duration-300 ${
                hasError
                  ? 'bg-red-500/20 group-hover:bg-red-500/30'
                  : 'bg-primary/20 group-hover:bg-primary/30'
              }`}
            />

            {/* Pulsing background for active state */}
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  className="absolute inset-0 bg-primary/10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-primary/30"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.7, 0.3, 0.7],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Hover effect */}
            <AnimatePresence>
              {isHovered && !isLoading && !hasError && (
                <motion.span
                  className="absolute inset-0 bg-white/10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.3 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </AnimatePresence>

            {/* Success particles */}
            <AnimatePresence>{showParticles && <Particles />}</AnimatePresence>

            <div className="relative flex items-center gap-2 z-10">
              {isLoading ? (
                <motion.div
                  className="flex items-center gap-2"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Minting...</span>
                </motion.div>
              ) : hasError ? (
                <motion.div
                  className="flex items-center gap-2"
                  initial={{ x: 10 }}
                  animate={{ x: 0 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Try Again</span>
                </motion.div>
              ) : (
                <motion.div
                  className="flex items-center gap-2"
                  whileTap={{ scale: 0.95 }}
                  animate={
                    isHovered
                      ? {
                          y: [0, -2, 0],
                          scale: [1, 1.05, 1],
                        }
                      : {}
                  }
                  transition={
                    isHovered
                      ? {
                          duration: 1.5,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }
                      : {}
                  }
                >
                  <Coins
                    className={`h-4 w-4 ${isHovered ? 'text-yellow-400' : ''}`}
                  />
                  <span>Mint 8 Arrows</span>

                  {/* Flash effect when hovered */}
                  {isHovered && (
                    <motion.span
                      className="absolute inset-0 bg-white/20"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 0.3, 0] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        repeatDelay: 1,
                      }}
                    />
                  )}
                </motion.div>
              )}
            </div>
          </Button>
        )}
      </AnimatePresence>

      {/* Global styles for animations */}
      <style jsx global>{`
        @keyframes screenShake {
          0% {
            transform: translate(0, 0) rotate(0deg);
          }
          25% {
            transform: translate(5px, 5px) rotate(1deg);
          }
          50% {
            transform: translate(0, -5px) rotate(0deg);
          }
          75% {
            transform: translate(-5px, 5px) rotate(-1deg);
          }
          100% {
            transform: translate(0, 0) rotate(0deg);
          }
        }

        .screen-shake {
          animation: screenShake 0.5s ease-in-out;
        }

        .button-pulse {
          animation: buttonPulse 0.5s ease-in-out;
        }

        @keyframes buttonPulse {
          0% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(124, 58, 237, 0.7);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 0 0 10px rgba(124, 58, 237, 0);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(124, 58, 237, 0);
          }
        }

        .particles-container {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          z-index: 50;
          pointer-events: none;
        }
      `}</style>
    </motion.div>
  );
}
