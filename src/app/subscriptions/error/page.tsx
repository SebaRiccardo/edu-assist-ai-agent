'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

export default function Page() {
  const params = useSearchParams();
  const error = params.get('error');
  const t = useTranslations('Auth');
  const router = useRouter();
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 ">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                {t('errorGenericTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              {error ? (
                <p className="text-sm text-muted-foreground">{error}</p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {t('unspecifiedError')}
                </p>
              )}
            </CardContent>
            <Button onClick={() => router.push('/subscriptions')}>
              Continuar
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
