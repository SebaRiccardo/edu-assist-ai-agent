'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { PasswordInput } from '@/components/auth/password-input';
import { signUpWithEmailAndPassword } from '@/auth/service';
import { signUpSchema, type SignUpFormData } from '@/auth/schemas';
import { useTranslations } from 'next-intl';

export default function RegisterForm() {
  const t = useTranslations('Auth');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignedUp, setIsSignedUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Initialize form with React Hook Form and Zod validation
  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
    },
  });

  // Handle form submission
  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signUpWithEmailAndPassword({
        email: data.email,
        password: data.password,
        displayName: data.displayName,
      });

      if (result.success) {
        setIsSignedUp(true);
        router.push('/auth/sign-up-success');
      } else {
        setError(result.error || 'Failed to sign up. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Sign up error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSignedUp) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">{t('accountCreated')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('redirectingGetStarted')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, err => {
          console.log(err);
        })}
        className="space-y-4"
      >
        {/* Username Field */}
        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('name')}
                <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={t('enterName')}
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email Field */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('emailAddress')}
                <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder={t('enterEmail')}
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Password Field */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('password')}
                <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder={t('aSecurePassword')}
                  showStrengthIndicator={false}
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('confirmPassword', { default: 'Confirm password' })}
                <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder={t('aSecurePasswordAgain')}
                  showStrengthIndicator={false}
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Terms and Conditions Checkbox */}
        <FormField
          control={form.control}
          name="agreeToTerms"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                  className="mt-0.5"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-sm font-normal text-muted-foreground">
                  {t('agreeToTerms')}
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        {/* Global Error Message */}
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full mt-6"
          size="lg"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('creatingAccount')}
            </>
          ) : (
            `🎓 ${t('startFreeTrial')}`
          )}
        </Button>
      </form>
    </Form>
  );
}
