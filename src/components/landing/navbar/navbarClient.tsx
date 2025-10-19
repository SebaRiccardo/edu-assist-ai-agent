'use client';

import { Button } from '@/components/ui/button';
import { NavigationSheet } from './navigation-sheet';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useUserDisplayName, useUserInitials } from '@/hooks/use-current-user';
import { signOut } from '@/auth/service';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LayoutDashboard, LogOut, Settings, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';
import LanguageSwitcher from '../../language-switcher';

export default function NavbarClient({ user }: { user: User | null }) {
  const t = useTranslations('Nav');
  const router = useRouter();
  const initials = useUserInitials(user);
  const displayName = useUserDisplayName(user);

  const handleLogout = async () => {
    const result = await signOut();
    if (result.success) {
      router.push('/auth/login');
      router.refresh();
    }
  };

  const handleSignIn = () => router.push('/auth/login');
  const handleGetStarted = () =>
    router.push(user ? '/dashboard' : '/auth/sign-up');

  return (
    <div className="flex items-center gap-3">
      <LanguageSwitcher />
      {user ? (
        <>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="hidden sm:inline-flex"
          >
            <Link href="/dashboard">Dashboard</Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-9 w-9 rounded-full hover:bg-accent"
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <p className="text-base capitalize font-semibold leading-none">
                        {displayName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground mt-1">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard" className="cursor-pointer">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>{t('dashboard')}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>{t('settings')}</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>{t('helpSupport')}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:bg-red-50 focus:text-destructive cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut className="text-red-500 mr-2 h-4 w-4" />
                <span>{t('logOut')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      ) : (
        <>
          <Button
            onClick={handleSignIn}
            variant="outline"
            className="hidden sm:inline-flex rounded-full"
          >
            {t('signIn')}
          </Button>
          <Button
            onClick={handleGetStarted}
            className="hidden sm:inline-flex rounded-full"
          >
            {t('getStarted')}
          </Button>
        </>
      )}
      <div className="md:hidden">
        <NavigationSheet />
      </div>
    </div>
  );
}
