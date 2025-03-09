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
      name: 'Example Frame',
      iconUrl: 'https://www.arrows.art/icon.png',
      homeUrl: 'https://www.arrows.art',
      imageUrl: 'https://www.arrows.art/image.png',
      buttonTitle: 'Check this out',
      splashImageUrl: 'https://www.arrows.art/splash.png',
      splashBackgroundColor: '#eeccff',
      webhookUrl: 'https://www.arrows.art/api/webhook',
    },
  };

  return Response.json(config);
}
