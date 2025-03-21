'use client';

import sdk, { type Context } from '@farcaster/frame-sdk';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';
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

  if (!isSDKLoaded) {
    return <div>Loading...</div>;
  }

  const handleAddToWaitlist = async () => {
    await sdk.actions.addFrame();
  };

  return (
    <div>
      <p>
        {`Join the waitlist to be one of the first to play the game. Launching
        soon.`}
      </p>
      {!context?.client?.added && (
        <Button onClick={handleAddToWaitlist}>Add to waitlist</Button>
      )}
      {context?.client?.added && (
        <Button disabled onClick={handleAddToWaitlist}>
          Added
        </Button>
      )}
    </div>
  );
}
