interface AwardPointsParams {
  username: string;
  points: number;
  type: string;
}

export async function awardPoints({
  username,
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
        username,
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
