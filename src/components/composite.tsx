'use client';

import { useState, useEffect, useRef } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Button } from './ui/button';
import { useAccount } from 'wagmi';
import { WARPS_CONTRACT } from '@/lib/contracts';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, RefreshCw, Zap, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { chain } from '@/lib/chain';
import posthog from 'posthog-js';

interface CompositeProps {
  selectedTokens: number[];
  onCompositeComplete: (evolvedTokenId?: number) => void;
}

export function Composite({
  selectedTokens,
  onCompositeComplete,
}: CompositeProps) {
  const { address } = useAccount();
  const [isPending, setIsPending] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [showReadyEffect, setShowReadyEffect] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const queryClient = useQueryClient();
  const successHandled = useRef(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Show ready effect when two tokens are selected
  useEffect(() => {
    if (selectedTokens.length === 2 && !isPending && !isSuccess) {
      setShowReadyEffect(true);
    } else {
      setShowReadyEffect(false);
    }
  }, [selectedTokens, isPending, isSuccess]);

  // Reset state when selected tokens change
  useEffect(() => {
    // If no tokens are selected after a successful operation, keep success state
    // Otherwise reset to allow new operations
    if (selectedTokens.length === 0 && isSuccess) {
      return;
    }

    // If new tokens are selected after success, reset the success state
    if (selectedTokens.length > 0 && isSuccess) {
      setIsSuccess(false);
    }
  }, [selectedTokens, isSuccess]);

  const {
    data: hash,
    writeContract,
    isPending: isWritePending,
  } = useWriteContract({
    mutation: {
      onError: (error: Error) => {
        console.error('Composite error:', error);

        // Play error sound
        const errorSound = new Audio('/sounds/composite-error.mp3');
        errorSound.volume = 0.3;
        try {
          errorSound.play();
        } catch {
          // Silent fail if audio can't play
        }

        toast.error('Failed to evolve warps. Please try again.');
        setIsPending(false);
        setHasError(true);
        setShowParticles(false);
        setIsSuccess(false);
      },
    },
  });

  const {
    isLoading: isConfirming,
    isSuccess: isTxSuccess,
    data: receipt,
  } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    const handleSuccess = async () => {
      if (isTxSuccess && !successHandled.current && receipt) {
        successHandled.current = true;

        // Get the evolved token ID (which is the first token in the selectedTokens array)
        const evolvedTokenId = selectedTokens[0];

        // Play success sound
        const successSound = new Audio('/sounds/composite-success.wav');
        successSound.volume = 0.4;
        try {
          successSound.play();
        } catch {
          // Silent fail if audio can't play
        }

        // Show brief success feedback
        setShowParticles(true);
        setIsSuccess(true);
        setIsPending(false);
        setHasError(false);

        // Shake the screen slightly for feedback
        document.documentElement.classList.add('screen-shake');
        setTimeout(() => {
          document.documentElement.classList.remove('screen-shake');
        }, 500);

        // Immediately invalidate queries to refresh data
        await queryClient.invalidateQueries({
          queryKey: ['tokens-balance'],
        });
        await queryClient.invalidateQueries({
          queryKey: ['tokens-metadata'],
        });

        // Notify parent component immediately
        onCompositeComplete(evolvedTokenId);

        // Show success toast
        toast.success('Successfully evolved warps!', {
          icon: <Sparkles className="h-4 w-4 text-yellow-400" />,
          className: 'bg-gradient-to-r from-primary/30 to-primary/10',
        });

        // Clean up particle effect after a short delay
        setTimeout(() => {
          setShowParticles(false);
        }, 1000);
      }
    };

    handleSuccess();
  }, [isTxSuccess, receipt, queryClient, onCompositeComplete, selectedTokens]);

  const handleComposite = async () => {
    if (!address || selectedTokens.length !== 2) return;

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
    setIsPending(true);
    setHasError(false);
    setIsSuccess(false);
    try {
      await writeContract({
        ...WARPS_CONTRACT,
        functionName: 'composite',
        args: [BigInt(selectedTokens[0]), BigInt(selectedTokens[1])],
        gas: undefined,
        chainId: chain.id,
      });

      posthog.capture('composite', {
        address,
        token1: selectedTokens[0],
        token2: selectedTokens[1],
      });
    } catch (error) {
      console.error('Unexpected composite error:', error);
    }
  };

  const isLoading = isConfirming || isPending || isWritePending;

  // Particle system for success animation
  const Particles = () => {
    return (
      <div className="particles-container">
        {[...Array(30)].map((_, i) => (
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

  // Ready effect animation when two tokens are selected
  const ReadyEffect = () => {
    return (
      <motion.div
        className="absolute -inset-1 rounded-lg"
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    );
  };

  return (
    <motion.div
      className="relative"
      whileHover={{ scale: isSuccess ? 1 : 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Ready to combine effect */}
      <AnimatePresence>
        {showReadyEffect && !isLoading && !hasError && <ReadyEffect />}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {isSuccess ? (
          <motion.div
            className="relative flex items-center justify-center p-3 min-h-[40px] bg-[#7c65c1] bg-opacity-50 rounded-md border border-green-500/60 shadow-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="flex items-center gap-2 text-green-300 font-medium z-10"
              animate={{ scale: [1, 1.03, 1] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <span>Success!</span>
            </motion.div>
            <AnimatePresence>{showParticles && <Particles />}</AnimatePresence>
          </motion.div>
        ) : (
          <Button
            ref={buttonRef}
            onClick={handleComposite}
            disabled={isLoading || selectedTokens.length !== 2}
            className={`relative bg-black group overflow-hidden transition-all duration-300 w-full cursor-pointer ${
              isHovered && selectedTokens.length === 2
                ? 'bg-primary/20 shadow-lg shadow-primary/20 border-primary/50'
                : 'bg-primary/10 hover:bg-primary/20 border-primary/30'
            } ${
              isLoading || selectedTokens.length !== 2
                ? 'opacity-60 cursor-not-allowed'
                : ''
            }`}
          >
            <div className="absolute inset-0 rounded-md blur-lg transition-all duration-300 bg-primary/15 group-hover:bg-primary/25" />
            <AnimatePresence>
              {isHovered && selectedTokens.length === 2 && !isLoading && (
                <motion.span
                  className="absolute inset-0 bg-white/5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </AnimatePresence>
            <div className="relative flex items-center justify-center gap-2 z-10 min-h-[20px]">
              {isLoading ? (
                <motion.div
                  className="flex items-center gap-2"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Evolving...</span>
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
                <div className="flex items-center justify-center gap-2">
                  <Zap
                    className={`h-4 w-4 ${
                      selectedTokens.length === 2 ? '' : ''
                    }`}
                  />
                  <span>Evolve</span>
                </div>
              )}
            </div>
            {isHovered && selectedTokens.length === 2 && !isLoading && (
              <motion.span
                className="absolute inset-0 bg-white/10 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.1, 0] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  repeatDelay: 0.5,
                }}
              />
            )}
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
            transform: translate(3px, 3px) rotate(0.5deg);
          }
          50% {
            transform: translate(0, -3px) rotate(0deg);
          }
          75% {
            transform: translate(-3px, 3px) rotate(-0.5deg);
          }
          100% {
            transform: translate(0, 0) rotate(0deg);
          }
        }
        .screen-shake {
          animation: screenShake 0.4s ease-in-out;
        }

        .button-pulse {
          animation: buttonPulse 0.5s ease-in-out;
        }
        @keyframes buttonPulse {
          0% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(124, 58, 237, 0.5);
          }
          50% {
            transform: scale(1.03);
            box-shadow: 0 0 0 8px rgba(124, 58, 237, 0);
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
