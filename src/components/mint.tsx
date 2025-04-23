'use client';

import { Abi } from 'viem';
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { parseUnits } from 'viem';
import { Button } from './ui/button';
import { useState, useEffect, useRef } from 'react';
import { WARPS_CONTRACT, PAYMENT_TOKEN_CONTRACT } from '@/lib/contracts';
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
  CheckCircle2,
  Lock,
  Gift,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { chain } from '@/lib/chain';
import posthog from 'posthog-js';

// Minimal ERC20 ABI for approve, allowance, decimals
const erc20Abi = [
  {
    constant: true,
    inputs: [
      { name: '_owner', type: 'address' },
      { name: '_spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { name: '_spender', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
] as const satisfies Abi;

// Define the amount to approve and deposit
export const DEPOSIT_AMOUNT_TOKENS = 1000;

export function Mint() {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const buttonRef = useRef<HTMLButtonElement>(null);

  // State for UI feedback
  const [isHovered, setIsHovered] = useState(false);
  const [showParticles, setShowParticles] = useState(false);

  const [paymentTokenSymbol, setPaymentTokenSymbol] = useState<
    string | undefined
  >();
  const [allowance, setAllowance] = useState<bigint | undefined>();
  const [depositAmountWei, setDepositAmountWei] = useState<
    bigint | undefined
  >();
  const [tokenBalance, setTokenBalance] = useState<bigint | undefined>();
  const [hasInsufficientBalance, setHasInsufficientBalance] = useState(false);

  // Add state for free mint
  const [hasUsedFreeMint, setHasUsedFreeMint] = useState<boolean>(false);
  const [isFreeMinting, setIsFreeMinting] = useState(false);
  const [isFreeMintTxMining, setIsFreeMintTxMining] = useState(false);
  const [freeMintTxHash, setFreeMintTxHash] = useState<
    `0x${string}` | undefined
  >();
  const [isFreeMintSuccess, setIsFreeMintSuccess] = useState(false);

  // State for transaction flow
  const [isApproving, setIsApproving] = useState(false);
  const [isApprovalTxMining, setIsApprovalTxMining] = useState(false);
  const [approvalTxHash, setApprovalTxHash] = useState<
    `0x${string}` | undefined
  >();
  const [isApproved, setIsApproved] = useState(false);

  const [isDepositing, setIsDepositing] = useState(false);
  const [isDepositTxMining, setIsDepositTxMining] = useState(false);
  const [depositTxHash, setDepositTxHash] = useState<
    `0x${string}` | undefined
  >();
  const [isDepositSuccess, setIsDepositSuccess] = useState(false);

  const [hasError, setHasError] = useState(false);
  const [currentError, setCurrentError] = useState<string | null>(null); // Store specific error messages

  // --- Fetch Contract Data ---

  // Check if the user has used their free mint
  const { data: fetchedHasUsedFreeMint, isLoading: isLoadingHasUsedFreeMint } =
    useReadContract({
      ...WARPS_CONTRACT,
      functionName: 'hasUsedFreeMint',
      args: [address!],
      chainId: chain.id,
      query: {
        enabled: !!address,
        refetchInterval: 5000,
      },
    });

  useEffect(() => {
    if (fetchedHasUsedFreeMint !== undefined) {
      setHasUsedFreeMint(fetchedHasUsedFreeMint);
    }
  }, [fetchedHasUsedFreeMint]);

  const { data: fetchedDecimals, isLoading: isLoadingDecimals } =
    useReadContract({
      address: PAYMENT_TOKEN_CONTRACT.address,
      abi: erc20Abi,
      functionName: 'decimals',
      chainId: chain.id,
      query: {
        enabled: !!address,
      },
    });

  const { data: fetchedSymbol, isLoading: isLoadingSymbol } = useReadContract({
    address: PAYMENT_TOKEN_CONTRACT.address,
    abi: erc20Abi,
    functionName: 'symbol',
    chainId: chain.id,
    query: {
      enabled: !!address,
    },
  });

  useEffect(() => {
    if (fetchedDecimals !== undefined) {
      const amountInWei = parseUnits(
        String(DEPOSIT_AMOUNT_TOKENS),
        fetchedDecimals
      );
      setDepositAmountWei(amountInWei);
    }
    if (fetchedSymbol) {
      setPaymentTokenSymbol(fetchedSymbol);
    }
  }, [fetchedDecimals, fetchedSymbol]);

  const { data: fetchedAllowance, isLoading: isLoadingAllowance } =
    useReadContract({
      address: PAYMENT_TOKEN_CONTRACT.address,
      abi: erc20Abi,
      functionName: 'allowance',
      args: [address!, WARPS_CONTRACT.address],
      chainId: chain.id,
      query: {
        enabled: !!address && !!depositAmountWei,
        refetchInterval: 5000,
      },
    });

  useEffect(() => {
    if (fetchedAllowance !== undefined && depositAmountWei !== undefined) {
      setAllowance(fetchedAllowance);
      setIsApproved(fetchedAllowance >= depositAmountWei);
    }
  }, [fetchedAllowance, depositAmountWei]);

  const { data: fetchedBalance, isLoading: isLoadingBalance } = useReadContract(
    {
      address: PAYMENT_TOKEN_CONTRACT.address,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [address!],
      chainId: chain.id,
      query: {
        enabled: !!address && !!depositAmountWei,
        refetchInterval: 5000,
      },
    }
  );

  useEffect(() => {
    if (fetchedBalance !== undefined && depositAmountWei !== undefined) {
      setTokenBalance(fetchedBalance);
      setHasInsufficientBalance(fetchedBalance < depositAmountWei);
    }
  }, [fetchedBalance, depositAmountWei]);

  // --- Approval Transaction ---

  const {
    writeContract: approveWriteContract,
    isPending: isApproveWritePending,
  } = useWriteContract({
    mutation: {
      onMutate: () => {
        setIsApproving(true);
        setHasError(false);
        setCurrentError(null);
      },
      onSuccess: (hash) => {
        setApprovalTxHash(hash);
        setIsApprovalTxMining(true);
        toast.info('Approval transaction submitted...', {
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
        });
      },
      onError: (error: Error) => {
        console.error('Approval error:', error);
        setHasError(true);
        setCurrentError(
          error.message.includes('rejected')
            ? 'Transaction rejected.'
            : 'Approval failed. Please try again.'
        );
        setIsApproving(false);
        setIsApprovalTxMining(false);
      },
    },
  });

  const { isSuccess: isApprovalSuccess } = useWaitForTransactionReceipt({
    hash: approvalTxHash,
    chainId: chain.id,
    query: {
      enabled: !!approvalTxHash,
    },
  });

  useEffect(() => {
    if (isApprovalSuccess) {
      setIsApproving(false);
      setIsApprovalTxMining(false);
      setIsApproved(true);
      setHasError(false);
      setCurrentError(null);
      queryClient.invalidateQueries({
        queryKey: ['readContract', PAYMENT_TOKEN_CONTRACT.address, 'allowance'],
      });
      toast.success('Approval successful!', {
        icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
      });
    }
  }, [isApprovalSuccess, queryClient]);

  // --- Deposit Transaction ---

  const {
    writeContract: depositWriteContract,
    isPending: isDepositWritePending,
  } = useWriteContract({
    mutation: {
      onMutate: () => {
        setIsDepositing(true);
        setHasError(false);
        setCurrentError(null);
      },
      onSuccess: (hash) => {
        setDepositTxHash(hash);
        setIsDepositTxMining(true);
        toast.info('Deposit transaction submitted...', {
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
        });
        posthog.capture('deposit_tokens', {
          address,
          amount: DEPOSIT_AMOUNT_TOKENS,
          token: paymentTokenSymbol ?? PAYMENT_TOKEN_CONTRACT.address,
        });
      },
      onError: (error: Error) => {
        console.error('Deposit error:', error);
        setHasError(true);
        setCurrentError(
          error.message.includes('rejected')
            ? 'Transaction rejected.'
            : 'Deposit failed. Please try again.'
        );
        setIsDepositing(false);
        setIsDepositTxMining(false);
        playErrorFeedback();
      },
    },
  });

  const { isSuccess: isTxDepositSuccess } = useWaitForTransactionReceipt({
    hash: depositTxHash,
    chainId: chain.id,
    query: {
      enabled: !!depositTxHash,
    },
  });

  // State reset needed after success animation
  const successHandled = useRef(false);

  useEffect(() => {
    const handleDepositSuccess = async () => {
      if (isTxDepositSuccess && !successHandled.current) {
        successHandled.current = true;
        setIsDepositing(false);
        setIsDepositTxMining(false);
        setIsDepositSuccess(true);
        setHasError(false);
        setCurrentError(null);

        playSuccessSound();
        setShowParticles(true);
        triggerScreenShake();

        queryClient.invalidateQueries({ queryKey: ['tokens-balance'] });
        queryClient.invalidateQueries({ queryKey: ['getTotalDeposited'] });
        queryClient.invalidateQueries({
          queryKey: ['readContract', WARPS_CONTRACT.address, 'prizePool'],
        });

        toast.success(
          `Successfully deposited ${DEPOSIT_AMOUNT_TOKENS} ${
            paymentTokenSymbol || 'tokens'
          }!`,
          {
            icon: <Sparkles className="h-4 w-4 text-yellow-400" />,
            className: 'bg-gradient-to-r from-primary/30 to-primary/10',
          }
        );

        setTimeout(() => {
          setShowParticles(false);
          setIsDepositSuccess(false);
        }, 4000);
      }
    };

    handleDepositSuccess();
  }, [isTxDepositSuccess, queryClient, paymentTokenSymbol]);

  // --- Free Mint Transaction ---

  const {
    writeContract: freeMintWriteContract,
    isPending: isFreeMintWritePending,
  } = useWriteContract({
    mutation: {
      onMutate: () => {
        setIsFreeMinting(true);
        setHasError(false);
        setCurrentError(null);
      },
      onSuccess: (hash) => {
        setFreeMintTxHash(hash);
        setIsFreeMintTxMining(true);
        toast.info('Free mint transaction submitted...', {
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
        });
        posthog.capture('free_mint', {
          address,
        });
      },
      onError: (error: Error) => {
        console.error('Free mint error:', error);
        setHasError(true);
        setCurrentError(
          error.message.includes('rejected')
            ? 'Transaction rejected.'
            : 'Free mint failed. Please try again.'
        );
        setIsFreeMinting(false);
        setIsFreeMintTxMining(false);
        playErrorFeedback();
      },
    },
  });

  const { isSuccess: freeMintTxSuccess } = useWaitForTransactionReceipt({
    hash: freeMintTxHash,
    chainId: chain.id,
    query: {
      enabled: !!freeMintTxHash,
    },
  });

  useEffect(() => {
    const handleFreeMintSuccess = async () => {
      if (freeMintTxSuccess && !successHandled.current) {
        successHandled.current = true;
        setIsFreeMinting(false);
        setIsFreeMintTxMining(false);
        setIsFreeMintSuccess(true);
        setHasUsedFreeMint(true);
        setHasError(false);
        setCurrentError(null);

        playSuccessSound();
        setShowParticles(true);
        triggerScreenShake();

        queryClient.invalidateQueries({ queryKey: ['tokens-balance'] });
        queryClient.invalidateQueries({
          queryKey: ['readContract', WARPS_CONTRACT.address, 'hasUsedFreeMint'],
        });

        toast.success('Successfully claimed free mint!', {
          icon: <Sparkles className="h-4 w-4 text-yellow-400" />,
          className: 'bg-gradient-to-r from-primary/30 to-primary/10',
        });

        setTimeout(() => {
          setShowParticles(false);
          setIsFreeMintSuccess(false);
        }, 4000);
      }
    };

    handleFreeMintSuccess();
  }, [freeMintTxSuccess, queryClient]);

  // --- Handlers ---

  const handleApprove = async () => {
    if (!address || depositAmountWei === undefined) return;

    playClickSound();
    pulseButton();

    try {
      await approveWriteContract({
        address: PAYMENT_TOKEN_CONTRACT.address,
        abi: erc20Abi,
        functionName: 'approve',
        args: [WARPS_CONTRACT.address, depositAmountWei],
        chainId: chain.id,
      });
    } catch (error) {
      console.error('Handle approve triggered catch:', error);
    }
  };

  const handleDeposit = async () => {
    if (!address || !isApproved || depositAmountWei === undefined) return;

    playClickSound();
    pulseButton();

    successHandled.current = false;

    try {
      await depositWriteContract({
        ...WARPS_CONTRACT,
        functionName: 'mint',
        args: [address as `0x${string}`],
        chainId: chain.id,
        gas: BigInt(1000000),
      });
    } catch (error) {
      console.error('Handle deposit triggered catch:', error);
    }
  };

  // Add function to handle free mint
  const handleFreeMint = async () => {
    if (!address || hasUsedFreeMint) return;

    playClickSound();
    pulseButton();

    successHandled.current = false;

    try {
      await freeMintWriteContract({
        ...WARPS_CONTRACT,
        functionName: 'freeMint',
        args: [address as `0x${string}`],
        chainId: chain.id,
      });
    } catch (error) {
      console.error('Handle free mint triggered catch:', error);
    }
  };

  // Update combined handler for the button
  const handleButtonClick = async () => {
    if (!address) return;

    if (!hasUsedFreeMint) {
      await handleFreeMint();
    } else if (!isApproved) {
      await handleApprove();
    } else {
      await handleDeposit();
    }
  };

  // --- UI Helpers ---

  const playClickSound = () => {
    const audio = new Audio('/sounds/composite-start.wav');
    audio.volume = 0.4;
    audio.play().catch(() => {});
  };

  const playSuccessSound = () => {
    const successSound = new Audio('/sounds/composite-success.wav');
    successSound.volume = 0.4;
    successSound.play().catch(() => {});
  };

  const playErrorFeedback = () => {
    const errorSound = new Audio('/sounds/composite-error.mp3');
    errorSound.volume = 0.3;
    errorSound.play().catch(() => {});
    triggerScreenShake();
  };

  const triggerScreenShake = () => {
    document.documentElement.classList.add('screen-shake');
    setTimeout(() => {
      document.documentElement.classList.remove('screen-shake');
    }, 500);
  };

  const pulseButton = () => {
    if (buttonRef.current) {
      buttonRef.current.classList.add('button-pulse');
      setTimeout(() => {
        if (buttonRef.current)
          buttonRef.current.classList.remove('button-pulse');
      }, 500);
    }
  };

  const isLoading =
    isLoadingHasUsedFreeMint ||
    isLoadingDecimals ||
    isLoadingSymbol ||
    isLoadingAllowance ||
    isLoadingBalance ||
    isApproving ||
    isApprovalTxMining ||
    isDepositing ||
    isDepositTxMining ||
    isFreeMinting ||
    isFreeMintTxMining ||
    isApproveWritePending ||
    isDepositWritePending ||
    isFreeMintWritePending;

  console.log('allowance', allowance);
  console.log('tokenBalance', tokenBalance);

  const showFreeMintButton = !hasUsedFreeMint && !isFreeMintSuccess;
  const showApproveButton = hasUsedFreeMint && !isApproved;
  const showDepositButton = hasUsedFreeMint && isApproved && !isDepositSuccess;

  // --- Floating Warps (Kept from original Mint) ---
  const [floatingWarps, setFloatingWarps] = useState<
    Array<{
      id: number;
      x: number;
      y: number;
      rotation: number;
      type: string;
      color: string;
    }>
  >([]);

  useEffect(() => {
    if (isLoading) {
      const warpTypes = ['up', 'down', 'left', 'right'];
      const warpColors = [
        '#FF5A5F',
        '#3490DE',
        '#FFB400',
        '#8A2BE2',
        '#50C878',
      ];
      const warps = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        rotation: Math.floor(Math.random() * 360),
        type: warpTypes[Math.floor(Math.random() * warpTypes.length)],
        color: warpColors[Math.floor(Math.random() * warpColors.length)],
      }));
      setFloatingWarps(warps);
    }
  }, [isLoading]);

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

  // --- Particles (Kept from original Mint) ---
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
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: (Math.random() - 0.5) * 400,
              y: (Math.random() - 0.5) * 400,
              opacity: 0,
              scale: Math.random() * 4 + 1,
              rotate: Math.random() * 360,
            }}
            transition={{ duration: 1.5 + Math.random(), ease: 'easeOut' }}
          />
        ))}
      </div>
    );
  };

  // Get button content based on current state
  const getButtonContent = () => {
    if (
      isLoadingHasUsedFreeMint ||
      isLoadingDecimals ||
      isLoadingSymbol ||
      isLoadingAllowance ||
      isLoadingBalance
    ) {
      return (
        <motion.div
          className="flex items-center gap-2"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading...</span>
        </motion.div>
      );
    }

    if (!address) {
      return <span>Connect Wallet</span>;
    }

    if (hasError) {
      return (
        <motion.div
          className="flex items-center gap-1 text-red-200"
          initial={{ x: 10 }}
          animate={{ x: 0 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <RefreshCw className="h-4 w-4" />
          <span>Retry</span>
        </motion.div>
      );
    }

    if (hasInsufficientBalance && hasUsedFreeMint) {
      return (
        <motion.div
          className="flex items-center gap-1 text-red-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <span>
            Need {DEPOSIT_AMOUNT_TOKENS} {paymentTokenSymbol || 'tokens'}
          </span>
        </motion.div>
      );
    }

    if (showFreeMintButton) {
      if (isFreeMinting || isFreeMintTxMining) {
        return (
          <motion.div
            className="flex items-center justify-center gap-2"
            whileTap={{ scale: 0.95 }}
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{isFreeMintTxMining ? 'Minting...' : 'Check Wallet'}</span>
          </motion.div>
        );
      }
      return (
        <motion.div
          className="flex items-center justify-center gap-2"
          whileTap={{ scale: 0.95 }}
        >
          <Gift className="h-4 w-4" />
          <span>Claim Free Warps</span>
        </motion.div>
      );
    }

    if (showApproveButton) {
      if (isApproving || isApprovalTxMining) {
        return (
          <motion.div
            className="flex items-center justify-center gap-2"
            whileTap={{ scale: 0.95 }}
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{isApprovalTxMining ? 'Approving...' : 'Check Wallet'}</span>
          </motion.div>
        );
      }
      return (
        <motion.div
          className="flex items-center justify-center gap-2"
          whileTap={{ scale: 0.95 }}
        >
          <span>
            Deposit {DEPOSIT_AMOUNT_TOKENS} {paymentTokenSymbol || 'Tokens'}
          </span>
        </motion.div>
      );
    }

    if (showDepositButton) {
      if (isDepositing || isDepositTxMining) {
        return (
          <motion.div
            className="flex items-center justify-center gap-2"
            whileTap={{ scale: 0.95 }}
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>{isDepositTxMining ? 'Depositing...' : 'Check Wallet'}</span>
          </motion.div>
        );
      }
      return (
        <motion.div
          className="flex items-center justify-center gap-1"
          whileTap={{ scale: 0.95 }}
        >
          <span>Mint</span>
        </motion.div>
      );
    }

    return <span>Mint Warps</span>;
  };

  return (
    <motion.div
      className="relative"
      whileHover={{ scale: isDepositSuccess || isFreeMintSuccess ? 1 : 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <AnimatePresence>
          {(isLoadingHasUsedFreeMint ||
            isLoadingDecimals ||
            isLoadingSymbol ||
            isLoadingAllowance ||
            isLoadingBalance ||
            isApproving ||
            isDepositing ||
            isFreeMinting) &&
            floatingWarps.map((warp) => (
              <motion.div
                key={warp.id}
                className="absolute"
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: 0.6,
                  scale: 1,
                  x: [0, Math.random() * 15 - 7.5],
                  y: [0, Math.random() * 15 - 7.5],
                  rotate: `${warp.rotation}deg`,
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{
                  duration: 1.5 + Math.random(),
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: 'easeInOut',
                  delay: warp.id * 0.1,
                }}
                style={{
                  left: `${warp.x}%`,
                  top: `${warp.y}%`,
                  filter: `drop-shadow(0 0 4px ${warp.color}50)`,
                }}
              >
                {renderArrowIcon(warp.type, warp.color)}
              </motion.div>
            ))}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        {isDepositSuccess || isFreeMintSuccess ? (
          <motion.div
            className="relative flex items-center justify-center px-3 py-2 min-h-[40px] bg-green-950 bg-opacity-50 rounded-md border border-green-500/60 shadow-lg"
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
              <CheckCircle2 className="h-5 w-5" />
              <span>Mint Successful!</span>
            </motion.div>
            <AnimatePresence>{showParticles && <Particles />}</AnimatePresence>
          </motion.div>
        ) : (
          <Button
            ref={buttonRef}
            onClick={handleButtonClick}
            disabled={
              isLoadingHasUsedFreeMint ||
              isLoadingDecimals ||
              isLoadingSymbol ||
              isLoadingAllowance ||
              isLoadingBalance ||
              !address ||
              isApproving ||
              isApprovalTxMining ||
              isDepositing ||
              isDepositTxMining ||
              isFreeMinting ||
              isFreeMintTxMining ||
              (hasInsufficientBalance && hasUsedFreeMint)
            }
            className={`relative group overflow-hidden transition-all duration-300 w-full ${
              isHovered
                ? 'bg-[#7c65c1] shadow-lg shadow-primary/20'
                : 'bg-[#7c65c1]/80 hover:bg-[#7c65c1]/90'
            } ${
              isLoadingHasUsedFreeMint ||
              isLoadingDecimals ||
              isLoadingSymbol ||
              isLoadingAllowance ||
              isLoadingBalance ||
              !address ||
              isApproving ||
              isApprovalTxMining ||
              isDepositing ||
              isDepositTxMining ||
              isFreeMinting ||
              isFreeMintTxMining ||
              (hasInsufficientBalance && hasUsedFreeMint)
                ? 'opacity-60 cursor-not-allowed'
                : ''
            }`}
          >
            <div className="absolute inset-0 rounded-md blur-lg transition-all duration-300 bg-primary/15 group-hover:bg-primary/25" />
            <AnimatePresence>
              {isHovered &&
                !(
                  isLoadingHasUsedFreeMint ||
                  isLoadingDecimals ||
                  isLoadingSymbol ||
                  isLoadingAllowance ||
                  isLoadingBalance ||
                  !address ||
                  isApproving ||
                  isApprovalTxMining ||
                  isDepositing ||
                  isDepositTxMining ||
                  isFreeMinting ||
                  isFreeMintTxMining ||
                  (hasInsufficientBalance && hasUsedFreeMint)
                ) && (
                  <motion.span
                    className="absolute inset-0 bg-white/5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
            </AnimatePresence>
            <div className="relative flex items-center justify-center gap-2 z-10 min-h-[20px] font-bold cursor-pointer">
              {getButtonContent()}
            </div>

            {/* Subtle animation effect */}
            {isHovered &&
              !(
                isLoadingHasUsedFreeMint ||
                isLoadingDecimals ||
                isLoadingSymbol ||
                isLoadingAllowance ||
                isLoadingBalance ||
                !address ||
                isApproving ||
                isApprovalTxMining ||
                isDepositing ||
                isDepositTxMining ||
                isFreeMinting ||
                isFreeMintTxMining ||
                (hasInsufficientBalance && hasUsedFreeMint)
              ) && (
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

            {/* Display error message below button if there is one */}
            {hasError && currentError && (
              <div className="absolute -bottom-6 left-0 right-0 text-red-400 text-xs text-center mt-1">
                {currentError}
              </div>
            )}

            {/* Display balance info if insufficient */}
            {hasInsufficientBalance && hasUsedFreeMint && !hasError && (
              <div className="absolute -bottom-6 left-0 right-0 text-red-400 text-xs text-center mt-1">
                Need {DEPOSIT_AMOUNT_TOKENS} {paymentTokenSymbol || 'tokens'},
                have{' '}
                {tokenBalance !== undefined && fetchedDecimals !== undefined
                  ? Number(tokenBalance) / 10 ** Number(fetchedDecimals)
                  : '0'}{' '}
                {paymentTokenSymbol || 'tokens'}
              </div>
            )}
          </Button>
        )}
      </AnimatePresence>

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
