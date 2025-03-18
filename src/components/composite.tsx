'use client';

import { useState, useEffect, useRef } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Button } from './ui/button';
import { useAccount } from 'wagmi';
import { ARROWS_CONTRACT } from '@/lib/contracts';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Loader2,
  AlertCircle,
  RefreshCw,
  Zap,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
        } catch (e) {
          // Silent fail if audio can't play
        }

        toast.error('Failed to evolve arrows. Please try again.');
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
        } catch (e) {
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

        // Invalidate the tokens query to refresh the data
        await queryClient.invalidateQueries({ queryKey: ['tokens'] });

        // Pass the evolved token ID back to the parent component after animation
        setTimeout(() => {
          onCompositeComplete(evolvedTokenId);
          toast.success('Successfully evolved arrows!', {
            icon: <Sparkles className="h-4 w-4 text-yellow-400" />,
            className: 'bg-gradient-to-r from-primary/30 to-primary/10',
          });
          setShowParticles(false);
        }, 2000);

        setIsPending(false);
        setHasError(false);
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
    } catch (e) {
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
        ...ARROWS_CONTRACT,
        functionName: 'composite',
        args: [BigInt(selectedTokens[0]), BigInt(selectedTokens[1])],
        gas: undefined,
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
        className="absolute -inset-1 rounded-lg bg-gradient-to-r from-primary/30 to-blue-500/30 z-0"
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
      whileHover={{ scale: isSuccess ? 1 : 1.05 }}
      transition={{ type: 'spring', stiffness: 400, damping: 10 }}
    >
      {/* Ready to combine effect */}
      <AnimatePresence>
        {showReadyEffect && !isLoading && !hasError && <ReadyEffect />}
      </AnimatePresence>

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
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-green-300">Evolution Complete!</span>
            </motion.div>
          </motion.div>
        ) : (
          <Button
            ref={buttonRef}
            onClick={handleComposite}
            disabled={isLoading || selectedTokens.length !== 2}
            className={`relative group overflow-hidden border transition-all duration-300 ${
              hasError
                ? 'bg-red-500/20 hover:bg-red-500/30'
                : selectedTokens.length === 2 && !isLoading
                ? 'bg-gradient-to-r from-primary/30 to-blue-500/20 hover:from-primary/40 hover:to-blue-500/30 shadow-lg shadow-primary/20'
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
                <motion.div
                  className="flex items-center gap-2"
                  whileTap={{ scale: 0.95 }}
                  animate={
                    selectedTokens.length === 2
                      ? {
                          y: [0, -2, 0],
                          scale: [1, 1.05, 1],
                        }
                      : {}
                  }
                  transition={
                    selectedTokens.length === 2
                      ? {
                          duration: 1.5,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }
                      : {}
                  }
                >
                  <Zap
                    className={`h-4 w-4 ${
                      selectedTokens.length === 2 ? 'text-yellow-400' : ''
                    }`}
                  />
                  <span>Evolve</span>

                  {/* Flash effect when ready */}
                  {selectedTokens.length === 2 && (
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
