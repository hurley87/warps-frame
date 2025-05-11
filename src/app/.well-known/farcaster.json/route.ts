export async function GET() {
  const config = {
    accountAssociation: {
      header:
        'eyJmaWQiOjc5ODgsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHg1MUQ0NDZFOTNhMTcxZGQxMkY4NGI3NWE4RDFCNjgyNTVGN2MxRjgyIn0',
      payload: 'eyJkb21haW4iOiJ3YXJwcy5mdW4ifQ',
      signature:
        'MHg5Y2I0NTdiN2EyOTQyY2Q4ZTE0NDNiZTYyZjhmYmVlNGM3YmYzNzRiMDM3NzRiYzJkYmVjODE3NTcyYTNiM2M2MWUzNzY0ZWUzODRmMTZmNjkwNGRiYTI2OTc1ZTY1MTY2NTFhMTFiNDMzZWZhOTMwYzYyZWY4ZmQ2YTBkYTcxMzFi',
    },
    frame: {
      version: '1',
      name: 'Warps',
      iconUrl: 'https://warps.fun/splash.jpg',
      homeUrl: 'https://warps.fun',
      imageUrl: 'https://warps.fun/splash.jpg',
      buttonTitle: 'Launch Warps',
      splashImageUrl: 'https://warps.fun/splash.jpg',
      splashBackgroundColor: '#000000',
      webhookUrl: 'https://warps.fun/api/webhook',
      subtitle: 'Play Warps on Farcaster',
      description: 'The first viral game on Farcaster',
      primaryCategory: 'games',
      tags: ['game', 'fun', 'social'],
      tagline: 'The first viral game on Farcaster',
    },
  };

  return Response.json(config);
}
