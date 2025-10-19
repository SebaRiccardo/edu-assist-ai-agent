import { createBasicSubscriptionForNewUserAction } from '@/actions';
import { createClient } from '@/lib/supabase/server';
import { type EmailOtpType } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const _next = searchParams.get('next');
  const next = _next?.startsWith('/') ? _next : '/';

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        console.log('User is not signed in after verifyOtp');
        return redirect(`/auth/error?error=No pudismos activar tu prueba gratuita`);
      }

      const res = await createBasicSubscriptionForNewUserAction(data.user.id);

      if (!res.success) {
        return redirect(`/subscriptions/error?error=No pudismos activar tu prueba gratuita`);
      }

      console.log('Basic subscription created for new user:', data.user.id);

      // redirect user to specified redirect URL or root of app
      redirect(next);
    } else {
      // redirect the user to an error page with some instructions
      redirect(`/auth/error?error=${error?.message}`);
    }
  }

  // redirect the user to an error page with some instructions
  redirect(`/auth/error?error=No token hash or type`);
}
