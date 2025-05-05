import { NextResponse } from 'next/server';
// import { notifyAllUsers } from '@/lib/notifications';

export async function POST(request: Request) {
  try {
    const { winnerTokenId, winnerAddress } = await request.json();

    if (!winnerTokenId || !winnerAddress) {
      return NextResponse.json(
        { error: 'Missing required fields: winnerTokenId or winnerAddress' },
        { status: 400 }
      );
    }

    // Create notification message with truncated address for privacy
    // const truncatedAddress =
    //   winnerAddress.length < 12
    //     ? winnerAddress
    //     : `${winnerAddress.slice(0, 6)}...${winnerAddress.slice(-4)}`;
    // const notificationMessage = `🎉 ${truncatedAddress} just won!`;

    // Send notifications to all users using our utility function
    // const result = await notifyAllUsers(
    //   notificationMessage,
    //   'Winning color updated. Check to see if you own it.'
    // );

    return NextResponse.json({
      // message: result.message,
      // successful: result.successful,
      // failed: result.failed,
      // total: result.total,
      success: true,
    });
  } catch (error) {
    console.error('Error in notify-winner API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
