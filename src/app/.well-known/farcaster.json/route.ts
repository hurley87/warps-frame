export async function GET() {
  const config = {
    accountAssociation: {
      header:
        'eyJmaWQiOjc5ODgsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHg1MUQ0NDZFOTNhMTcxZGQxMkY4NGI3NWE4RDFCNjgyNTVGN2MxRjgyIn0',
      payload: 'eyJkb21haW4iOiJ3YXJwcy5mdW5kcyJ9',
      signature:
        'MHg4NWQ2YmZiYWQzZDdlY2EwM2IxZDllMTZmMTBmYmExZjZjOGRjNjdhODQyNmI0NTc3ZWE5OTQ5YTA2NzY5NjAxMmIwZmNmY2EzZDZmYmRjMmMyNTM5ZWJiNTU1YmM2NmI5YTlkNDllMmM1ZjA5YzQ5NzI5Njc5MzgwMzhiMjcxMjFj',
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
      webhookUrl:
        'https://api.neynar.com/f/app/b5a0dc7b-a36b-4fd9-8110-ff3f79f91cb9/event',
    },
  };

  return Response.json(config);
}
