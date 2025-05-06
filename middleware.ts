import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Only check the token endpoint
  if (!request.nextUrl.pathname.startsWith('/api/free-mint/')) {
    return NextResponse.next();
  }

  const apiKey = request.headers.get('x-api-key');

  if (!apiKey) {
    return NextResponse.json({ error: 'API key is required' }, { status: 401 });
  }

  if (apiKey !== process.env.API_KEY) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: '/api/free-mint/:path*',
};
