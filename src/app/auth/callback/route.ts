import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { createBasicSubscriptionForNewUserAction } from '@/actions/subscriptions';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Check if user already has a subscription
      const { data: existingSubscription } = await supabase
        .from('user_subscriptions')
        .select('id')
        .eq('user_id', data.user.id)
        .single();

      // Create basic subscription with free trial if user doesn't have one
      if (!existingSubscription) {
        try {
          await createBasicSubscriptionForNewUserAction(data.user.id);
          console.log('Basic subscription created for new user:', data.user.id);
        } catch (err) {
          console.error('Failed to create basic subscription:', err);
          // Don't block auth flow if subscription creation fails
        }
      }

      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  // Return the user to an error page with some instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
