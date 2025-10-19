'use client';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import WordmarkLogo from '@/components/wordmark-logo';
import { LoginForm } from '@/components/auth/login-form';
import Link from 'next/link';
import { Mail, TrendingUp } from 'lucide-react';
import { useTranslations } from 'next-intl';

const Login = () => {
  const t = useTranslations('Auth');
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left Panel - Form */}
      <div className="hidden bg-primary lg:flex lg:flex-col lg:items-center lg:justify-center lg:p-12">
        <div className="max-w-lg space-y-8 text-center">
          {/* Main Hero Content */}
          <div className="space-y-4">
            <h2 className="text-4xl font-bold leading-tight text-primary-foreground">{t('welcomeBackTitle')}</h2>
            <p className="text-lg text-primary-foreground/90 leading-relaxed">{t('welcomeBackSubtitle')}</p>
          </div>

          {/* Feature Card */}
          <div className="rounded-2xl bg-background p-8 text-left shadow-xl space-y-6">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="text-xl font-semibold text-foreground">{t('communityTitle')}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t('communitySubtitle')}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-2xl font-bold text-foreground">85%</p>
                <p className="text-xs text-muted-foreground">Time saved</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">10K+</p>
                <p className="text-xs text-muted-foreground">Active professors</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Right Panel - Hero */}
      <div className="flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="flex justify-start">
            <WordmarkLogo className="gap-3" />
          </div>

          {/* Header */}
          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{t('welcomeBackTitle')}</h1>
            <p className="text-base text-muted-foreground">{t('welcomeBackSubtitle')}</p>
          </div>

          {/* Google Sign In */}
          <Button disabled variant="outline" className="w-full bg-background hover:bg-muted">
            <img
              src="https://cdn.shadcnstudio.com/ss-assets/brand-logo/google-icon.png?width=20&height=20&format=auto"
              alt="Google Icon"
              className="size-5"
            />
            <span>{t('loginWithGoogle')}</span>
          </Button>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <Separator className="flex-1" />
            <span className="text-sm text-muted-foreground">{t('or')}</span>
            <Separator className="flex-1" />
          </div>

          {/* Login Form */}
          <div className="space-y-6">
            <LoginForm />

            {/* Sign Up Link */}
            <div className="space-y-3 text-center">
              <p className="text-sm text-muted-foreground">
                {t('dontHaveAccount')}{' '}
                <Link href="/auth/sign-up" className="font-medium text-foreground hover:underline">
                  {t('signUp')}
                </Link>
              </p>
              <p className="text-xs text-muted-foreground/70">{t('protectedBySecurity')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
