'use client';

import { useState, useEffect, useRef } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Button } from './ui/button';
import { useAccount } from 'wagmi';
import { WARPS_CONTRACT } from '@/lib/contracts';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { chain } from '@/lib/chain';
import posthog from 'posthog-js';
import { awardPoints } from '@/lib/points';

interface CompositeProps {
  selectedTokens: number[];
  onCompositeComplete: (evolvedTokenId?: number) => void;
  onMergeStart?: () => boolean;
}

export function Composite({
  selectedTokens,
  onCompositeComplete,
  onMergeStart,
}: CompositeProps) {
  const { address } = useAccount();
  const [isPending, setIsPending] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [showReadyEffect, setShowReadyEffect] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showFusionEffect, setShowFusionEffect] = useState(false);
  const [fusionProgress, setFusionProgress] = useState(0);
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

        toast.error('Failed to evolve warps. Please try again.');
        setIsPending(false);
        setHasError(true);
        setShowParticles(false);
        setIsSuccess(false);
        setShowFusionEffect(false);
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

        // Set success and particles states
        setIsPending(false);
        setIsSuccess(true);
        setShowParticles(true);

        // Hide the fusion effect
        setShowFusionEffect(false);

        // Shake the screen slightly for feedback
        document.documentElement.classList.add('screen-shake');
        setTimeout(() => {
          document.documentElement.classList.remove('screen-shake');
        }, 500);

        // Notify parent component right away so the dialog can close immediately
        onCompositeComplete(evolvedTokenId);

        // Trigger query refresh in background (don't block UI)
        Promise.all([
          queryClient.refetchQueries({ queryKey: ['tokens-balance'] }),
          queryClient.refetchQueries({ queryKey: ['tokens-metadata'] }),
        ]);

        // Show success toast
        toast.success('Successfully evolved warps!', {
          icon: <Sparkles className="h-4 w-4 text-yellow-400" />,
          className: 'bg-gradient-to-r from-primary/30 to-primary/10',
        });

        // Save the composite to the database
        try {
          await awardPoints({
            address: address!,
            points: 1,
            type: 'composite',
          });
        } catch (error) {
          console.error('Failed to award points:', error);
        }

        // Clean up particle effect after a short delay
        setTimeout(() => {
          setShowParticles(false);
        }, 1000);
      }
    };

    handleSuccess();
  }, [isTxSuccess, receipt, queryClient, onCompositeComplete, selectedTokens]);

  const handleComposite = async () => {
    // Call onMergeStart if provided, and return early if it returns false
    if (onMergeStart && !onMergeStart()) {
      return;
    }

    if (!address || selectedTokens.length !== 2) return;

    // Reset progress tracking and start fusion animation
    setFusionProgress(0);
    setShowFusionEffect(true);

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

    // Start progress animation
    const progressInterval = setInterval(() => {
      setFusionProgress((prev) => {
        const newProgress = prev + 1;

        // Mid-progress visual effect
        if (prev >= 50 && prev < 52) {
          // Add visual intensity here
          if (buttonRef.current) {
            buttonRef.current.classList.add('button-pulse');
            setTimeout(() => {
              if (buttonRef.current)
                buttonRef.current.classList.remove('button-pulse');
            }, 300);
          }
        }

        if (newProgress >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return newProgress;
      });
    }, 50);

    try {
      // Remove the setTimeout and directly execute the transaction
      await writeContract({
        ...WARPS_CONTRACT,
        functionName: 'composite',
        args: [BigInt(selectedTokens[0]), BigInt(selectedTokens[1])],
        gas: BigInt(2000000),
        chainId: chain.id,
      });

      posthog.capture('composite', {
        address,
        token1: selectedTokens[0],
        token2: selectedTokens[1],
      });
    } catch (error) {
      console.error('Composite transaction error:', error);
      clearInterval(progressInterval);
      setShowFusionEffect(false);
      setHasError(true);
      setIsPending(false);

      // Show specific error message based on the error type
      if (error instanceof Error) {
        if (error.message.includes('user rejected')) {
          toast.error('Transaction was rejected. Please try again.');
        } else if (error.message.includes('insufficient funds')) {
          toast.error(
            'Insufficient funds for gas. Please add more ETH to your wallet.'
          );
        } else {
          toast.error('Failed to execute transaction. Please try again.');
        }
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
    }
  };

  const isLoading = isConfirming || isPending || isWritePending;

  // Particle system for success animation
  const Particles = () => {
    return (
      <div className="particles-container">
        {/* Explosion particles */}
        {[...Array(40)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-full ${
              i % 5 === 0
                ? 'bg-primary'
                : i % 5 === 1
                ? 'bg-yellow-400'
                : i % 5 === 2
                ? 'bg-blue-400'
                : i % 5 === 3
                ? 'bg-green-400'
                : 'bg-purple-400'
            }`}
            style={{
              width: `${Math.random() * 12 + 2}px`,
              height: `${Math.random() * 12 + 2}px`,
              boxShadow: '0 0 8px 2px rgba(255,255,255,0.3)',
            }}
            initial={{
              x: 0,
              y: 0,
              opacity: 1,
              scale: 1,
            }}
            animate={{
              x: (Math.random() - 0.5) * 500,
              y: (Math.random() - 0.5) * 500,
              opacity: 0,
              scale: Math.random() * 6 + 1,
              rotate: Math.random() * 360,
            }}
            transition={{
              duration: 1.5 + Math.random(),
              ease: 'easeOut',
            }}
          />
        ))}

        {/* Central success flash */}
        <motion.div
          className="absolute rounded-full bg-white"
          style={{
            width: '50px',
            height: '50px',
            boxShadow: '0 0 30px 15px rgba(255,255,255,0.8)',
          }}
          initial={{
            scale: 0.1,
            opacity: 1,
          }}
          animate={{
            scale: [0.1, 4, 0.5],
            opacity: [1, 0.8, 0],
          }}
          transition={{
            duration: 0.7,
            ease: 'easeOut',
          }}
        />

        {/* Success stars */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute text-yellow-400"
            style={{
              fontSize: `${Math.random() * 14 + 10}px`,
            }}
            initial={{
              x: 0,
              y: 0,
              opacity: 0,
              rotate: Math.random() * 180,
            }}
            animate={{
              x: (Math.random() - 0.5) * 300,
              y: (Math.random() - 0.5) * 300,
              opacity: [0, 1, 0],
              rotate: [0, Math.random() * 360],
              scale: [0.2, 1.5, 0.2],
            }}
            transition={{
              duration: 2,
              delay: 0.1 + Math.random() * 0.3,
              ease: 'easeOut',
            }}
          >
            ✦
          </motion.div>
        ))}
      </div>
    );
  };

  // Fusion effect animation
  const FusionEffect = () => {
    return (
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden z-10">
        <div className="relative">
          {/* Background glow effect */}
          <motion.div
            className="absolute -inset-10 opacity-50 bg-gradient-to-r from-blue-500/30 via-primary/30 to-yellow-400/30 blur-xl rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
              rotate: [0, 180],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />

          {/* Outer energy ring */}
          <motion.div
            className="absolute -inset-4 rounded-full bg-gradient-to-r from-primary via-yellow-400 to-primary"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: [0, 0.8, 0.4, 0.8],
              scale: [0.8, 1.2, 1, 1.2],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />

          {/* Secondary ring */}
          <motion.div
            className="absolute -inset-6 rounded-full border-2 border-yellow-400/30"
            animate={{
              scale: [0.8, 1.1, 0.8],
              opacity: [0.2, 0.5, 0.2],
              rotate: [0, -180],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />

          {/* Inner energy core */}
          <motion.div
            className="absolute inset-0 rounded-full bg-white"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0.5, 1, 0.5],
              scale: [0.8, 1.1, 0.8],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
            }}
          />

          {/* Energy particles */}
          {[...Array(18)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-1 h-3 ${
                i % 3 === 0
                  ? 'bg-primary'
                  : i % 3 === 1
                  ? 'bg-yellow-400'
                  : 'bg-blue-400'
              } rounded-full`}
              style={{
                top: '50%',
                left: '50%',
                transformOrigin: '0 0',
                filter: 'blur(0.5px)',
              }}
              initial={{
                x: 0,
                y: 0,
                rotate: i * 20,
                scale: 0.5,
                opacity: 0.3,
              }}
              animate={{
                x: [0, Math.cos((i * 20 * Math.PI) / 180) * 40],
                y: [0, Math.sin((i * 20 * Math.PI) / 180) * 40],
                scale: [0.5, 1.5, 0.5],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: 'reverse',
                delay: i * 0.05,
              }}
            />
          ))}

          {/* Additional floating energy orbs */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`orb-${i}`}
              className="absolute w-2 h-2 bg-white rounded-full"
              style={{
                top: '50%',
                left: '50%',
                boxShadow: '0 0 10px 2px rgba(255,255,255,0.8)',
              }}
              initial={{
                x: 0,
                y: 0,
                opacity: 0,
              }}
              animate={{
                x: [0, Math.cos((i * 45 * Math.PI) / 180) * 30 * Math.random()],
                y: [0, Math.sin((i * 45 * Math.PI) / 180) * 30 * Math.random()],
                opacity: [0, 0.8, 0],
                scale: [0.2, 1, 0.2],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </div>
    );
  };

  // Ready effect animation when two tokens are selected
  const ReadyEffect = () => {
    return (
      <>
        <motion.div
          className="absolute -inset-1 rounded-lg bg-gradient-to-r from-primary/20 via-purple-500/10 to-primary/20"
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Subtle corner highlights */}
        {[0, 1, 2, 3].map((corner) => (
          <motion.div
            key={`corner-${corner}`}
            className="absolute w-3 h-3 bg-primary/30 rounded-full blur-sm"
            style={{
              top: corner < 2 ? '-5px' : 'auto',
              bottom: corner >= 2 ? '-5px' : 'auto',
              left: corner % 2 === 0 ? '-5px' : 'auto',
              right: corner % 2 === 1 ? '-5px' : 'auto',
            }}
            animate={{
              opacity: [0.3, 0.8, 0.3],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: corner * 0.2,
            }}
          />
        ))}
      </>
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
            className="relative flex items-center justify-center p-3 min-h-[40px] bg-gradient-to-r from-purple-900/50 via-primary/50 to-purple-900/50 rounded-md border border-green-500/60 shadow-lg"
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
              <Sparkles className="h-4 w-4 text-yellow-400" />
              <span className="text-gradient">Complete!</span>
            </motion.div>

            {/* Background success glow */}
            <motion.div
              className="absolute inset-0 bg-green-500/20 rounded-md blur-md"
              animate={{
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            />

            <AnimatePresence>{showParticles && <Particles />}</AnimatePresence>
          </motion.div>
        ) : (
          <Button
            ref={buttonRef}
            onClick={handleComposite}
            disabled={isLoading || selectedTokens.length !== 2}
            className={`relative group overflow-hidden transition-all duration-300 py-10 text-2xl w-full ${
              isHovered && selectedTokens.length === 2
                ? 'bg-[#7c65c1] shadow-lg shadow-primary/20'
                : 'bg-[#7c65c1]/80 hover:bg-[#7c65c1]/90'
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

            {/* Fusion effect when processing */}
            <AnimatePresence>
              {showFusionEffect && <FusionEffect />}
            </AnimatePresence>

            {/* Fusion progress bar */}
            {showFusionEffect && (
              <motion.div
                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-500 via-primary to-yellow-400 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${fusionProgress}%` }}
                transition={{ duration: 0.1 }}
              />
            )}

            <div className="relative flex items-center justify-center gap-2 font-bold">
              {isLoading ? (
                <motion.div
                  className="flex items-center gap-2"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>
                    {showFusionEffect ? 'Fusing DNA...' : 'Evolving...'}
                  </span>
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
                <div className="flex items-center justify-center gap-2 font-bold">
                  <span>Combine Warps</span>
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

        .text-gradient {
          background: linear-gradient(to right, #4ade80, #22d3ee);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          color: transparent;
        }
      `}</style>
    </motion.div>
  );
}
