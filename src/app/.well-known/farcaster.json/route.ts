export async function GET() {
  const config = {
    accountAssociation: {
      header:
        'eyJmaWQiOjc5ODgsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHg1MUQ0NDZFOTNhMTcxZGQxMkY4NGI3NWE4RDFCNjgyNTVGN2MxRjgyIn0',
      payload: 'eyJkb21haW4iOiJ3d3cuYXJyb3dzLmFydCJ9',
      signature:
        'MHhjOGQ3ZThjNjIzNTkzZjM2ZWM1N2UyYjgwMmI2MTY3NDlhNzRhNzM3ODk5ZTljMDgzYmM3YmNkOGM0ZjRkZGI3M2M4NjIyODhhOWQzYzExN2JlYjNmYjZjZjUwYTM2MzlkZTg4NjI2ZDQxMTBkMGQ4MjkwOWVkOGJiMDMwNWM0YjFi',
    },
    frame: {
      version: '1',
      name: 'Arrows',
      iconUrl: 'https://arrows.art/splash.jpg',
      homeUrl: 'https://arrows.art',
      imageUrl: 'https://arrows.art/splash.jpg',
      buttonTitle: 'Launch Arrows',
      splashImageUrl: 'https://arrows.art/splash.jpg',
      splashBackgroundColor: '#000000',
      webhookUrl:
        'https://api.neynar.com/f/app/b5a0dc7b-a36b-4fd9-8110-ff3f79f91cb9/event',
    },
  };

  return Response.json(config);
}
