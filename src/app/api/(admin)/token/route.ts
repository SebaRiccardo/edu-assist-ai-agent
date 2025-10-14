import { getCurrentClaims, getCurrentUser } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const jwt = await getCurrentClaims();

  const user = await getCurrentUser();

  return NextResponse.json(
    {
      jwt: jwt?.claims,
      user,
    },
    { status: 200 }
  );
}
