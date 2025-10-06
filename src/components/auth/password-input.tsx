'use client';

import { forwardRef, useMemo, useState } from 'react';
import { CheckIcon, EyeIcon, EyeOffIcon, XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const requirements = [
  { regex: /.{12,}/, text: 'At least 12 characters' },
  { regex: /[a-z]/, text: 'At least 1 lowercase letter' },
  { regex: /[A-Z]/, text: 'At least 1 uppercase letter' },
  { regex: /[0-9]/, text: 'At least 1 number' },
  {
    regex: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/,
    text: 'At least 1 special character',
  },
];

interface PasswordInputProps
  extends Omit<React.ComponentProps<'input'>, 'type'> {
  showStrengthIndicator?: boolean;
  showRequirements?: boolean;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      className,
      showStrengthIndicator = true,
      showRequirements = false,
      value = '',
      ...props
    },
    ref
  ) => {
    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = () => setIsVisible(prevState => !prevState);

    const strength = requirements.map(req => ({
      met: req.regex.test(String(value)),
      text: req.text,
    }));

    const strengthScore = useMemo(() => {
      return strength.filter(req => req.met).length;
    }, [strength]);

    const getColor = (score: number) => {
      if (score === 0) return 'bg-border';
      if (score <= 1) return 'bg-destructive';
      if (score <= 2) return 'bg-orange-500';
      if (score <= 3) return 'bg-amber-500';
      if (score === 4) return 'bg-yellow-400';
      return 'bg-green-500';
    };

    return (
      <div className="w-full space-y-2">
        <div className="relative">
          <Input
            ref={ref}
            type={isVisible ? 'text' : 'password'}
            className={cn('pr-10', className)}
            value={value}
            {...props}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleVisibility}
            className="text-muted-foreground focus-visible:ring-ring/50 absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent"
            tabIndex={-1}
          >
            {isVisible ? (
              <EyeOffIcon className="size-4" />
            ) : (
              <EyeIcon className="size-4" />
            )}
            <span className="sr-only">
              {isVisible ? 'Hide password' : 'Show password'}
            </span>
          </Button>
        </div>

        {showStrengthIndicator && value && (
          <div className="flex h-1 w-full gap-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <span
                key={index}
                className={cn(
                  'h-full flex-1 rounded-full transition-all duration-500 ease-out',
                  index < strengthScore ? getColor(strengthScore) : 'bg-border'
                )}
              />
            ))}
          </div>
        )}

        {showRequirements && value && (
          <ul className="space-y-1.5">
            {strength.map((req, index) => (
              <li key={index} className="flex items-center gap-2">
                {req.met ? (
                  <CheckIcon className="size-4 text-green-600 dark:text-green-400" />
                ) : (
                  <XIcon className="text-muted-foreground size-4" />
                )}
                <span
                  className={cn(
                    'text-xs',
                    req.met
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-muted-foreground'
                  )}
                >
                  {req.text}
                  <span className="sr-only">
                    {req.met ? ' - Requirement met' : ' - Requirement not met'}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
