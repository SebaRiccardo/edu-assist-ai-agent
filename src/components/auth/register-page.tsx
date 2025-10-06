'use client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import WordmarkLogo from '@/components/wordmark-logo';
import AuthBackgroundShape from '@/assets/svg/auth-background-shape';
import RegisterForm from '@/components/auth/register-form';
import Link from 'next/link';

const Register = () => {
  return (
    <div className="relative flex h-auto min-h-screen items-center justify-center overflow-x-hidden px-4 py-10 sm:px-6 lg:px-8">
      <div className="absolute">
        <AuthBackgroundShape />
      </div>

      <Card className="z-1 w-full border-none shadow-md sm:max-w-lg">
        <CardHeader className="gap-6">
          <WordmarkLogo className="gap-3" />

          <div>
            <CardTitle className="mb-1.5 text-2xl">
              Sign Up to EduAssist
            </CardTitle>
            <CardDescription className="text-base">
              Start your free trial. No credit card required.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {/* Register Form */}
          <div className="space-y-4">
            <RegisterForm />

            <p className="text-muted-foreground text-center">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-card-foreground font-medium hover:underline"
              >
                Sign in instead
              </Link>
            </p>

            <div className="flex items-center gap-4">
              <Separator className="flex-1" />
              <p>or</p>
              <Separator className="flex-1" />
            </div>

            <Button
              variant="outline"
              className="w-full shadow-none bg-muted border-none cursor-pointer"
            >
              <img
                src="https://cdn.shadcnstudio.com/ss-assets/brand-logo/google-icon.png?width=20&height=20&format=auto"
                alt="Google Icon"
                className="size-5"
              />
              <span className="flex justify-center">Continue with Google</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
