'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { verifyBetaCode } from '@/actions/beta-access';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function BetaAccessPage() {
  const t = useTranslations('BetaAccess');
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (code.length !== 6) {
      setError(t('errorInvalidLength'));
      return;
    }

    startTransition(async () => {
      try {
        const result = await verifyBetaCode(code);

        if (result.success) {
          // Redirect to dashboard or home
          router.push('/dashboard');
          router.refresh();
        } else {
          setError(result.message);
          setCode('');
        }
      } catch (error) {
        setError(t('errorGeneric'));
        setCode('');
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">{t('title')}</CardTitle>
          <CardDescription className="text-base">
            {t('description')}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 p-6">
            <div className="flex flex-col items-center space-y-4">
              <InputOTP
                maxLength={6}
                value={code}
                onChange={value => {
                  setCode(value);
                  setError(null);
                }}
                disabled={isPending}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>

              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={isPending || code.length !== 6}
            >
              {isPending ? t('verifying') : t('submit')}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
