interface AwardPointsParams {
  address: string;
  points: number;
  type: string;
}

export async function awardPoints({
  address,
  points,
  type,
}: AwardPointsParams) {
  try {
    const response = await fetch('/api/points', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address,
        points,
        type,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to award points');
    }

    return await response.json();
  } catch (error) {
    console.error('Error awarding points:', error);
    throw error;
  }
}
