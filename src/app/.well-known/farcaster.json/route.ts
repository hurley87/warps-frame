export async function GET() {
  const config = {
    accountAssociation: {
      header:
        'eyJmaWQiOjc5ODgsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHg1MUQ0NDZFOTNhMTcxZGQxMkY4NGI3NWE4RDFCNjgyNTVGN2MxRjgyIn0',
      payload: 'eyJkb21haW4iOiJhcnJvd3MuYXJ0In0',
      signature:
        'MHg4NWQ2YmZiYWQzZDdlY2EwM2IxZDllMTZmMTBmYmExZjZjOGRjNjdhODQyNmI0NTc3ZWE5OTQ5YTA2NzY5NjAxMmIwZmNmY2EzZDZmYmRjMmMyNTM5ZWJiNTU1YmM2NmI5YTlkNDllMmM1ZjA5YzQ5NzI5Njc5MzgwMzhiMjcxMjFj',
    },
    frame: {
      version: '1',
      name: 'Example Frame',
      iconUrl: 'https://arrows.art/icon.png',
      homeUrl: 'https://arrows.art',
      imageUrl: 'https://arrows.art/image.png',
      buttonTitle: 'Check this out',
      splashImageUrl: 'https://arrows.art/splash.png',
      splashBackgroundColor: '#eeccff',
      webhookUrl: 'https://arrows.art/api/webhook',
    },
  };

  return Response.json(config);
}
