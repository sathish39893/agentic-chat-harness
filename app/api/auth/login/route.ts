import { NextResponse } from 'next/server';
import { getAppPassword, createSessionToken, AUTH_COOKIE_NAME } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { password } = await req.json();

    const expectedPassword = getAppPassword();

    if (!password || password.trim() !== expectedPassword.trim()) {
      return NextResponse.json({ error: 'Invalid access password.' }, { status: 401 });
    }

    const token = await createSessionToken();

    const response = NextResponse.json({ success: true });
    
    // Set secure HTTP-only cookie
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Login failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
