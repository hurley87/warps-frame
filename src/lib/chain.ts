import { base, baseSepolia } from 'wagmi/chains';
import { http } from 'wagmi';
import { type Transport } from 'viem';

const isDevelopment = process.env.NODE_ENV === 'development';

export const chain = isDevelopment ? baseSepolia : base;

type ChainId = typeof base.id | typeof baseSepolia.id;
type TransportMap = Record<ChainId, Transport>;

export const transport: TransportMap = {
  [base.id]: http(process.env.NEXT_PUBLIC_BASE_RPC!),
  [baseSepolia.id]: http(process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC!),
};
