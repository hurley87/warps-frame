import { base, baseSepolia } from 'wagmi/chains';
import { http } from 'wagmi';
import { type Transport } from 'viem';

const isDevelopment = process.env.NODE_ENV === 'development';

export const chain = isDevelopment ? baseSepolia : base;

type ChainId = typeof base.id | typeof baseSepolia.id;
type TransportMap = Record<ChainId, Transport>;

export const transport: TransportMap = {
  [base.id]: http(),
  [baseSepolia.id]: http(),
};
