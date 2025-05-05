import { Context } from '@farcaster/frame-sdk';

export type GameFrameContext = Context.FrameContext & {
  location?: {
    embed?: string;
  };
};

declare module '@farcaster/frame-sdk' {
  interface FrameContext extends GameFrameContext {}
}
