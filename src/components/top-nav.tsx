'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Settings, LogOut, Bell, Search, BookOpen, Home, HelpCircle, Sparkles, Loader2, User as UserIcon, Mail } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCurrentUser, useUserInitials, useUserDisplayName } from '@/hooks/use-current-user';
import { signOut } from '@/auth/service';
import WordmarkLogo from '@/components/wordmark-logo';
import { User } from '@supabase/supabase-js';
import LanguageSwitcher from './language-switcher';

export function DashboardNavBar({ user }: { user: User | null }) {
  const t = useTranslations('TopNav');
  const pathname = usePathname();
  const router = useRouter();
  const { user: clientSideUser, loading } = useCurrentUser(user);
  const initials = useUserInitials(user);
  const displayName = useUserDisplayName();

  const navigation = [
    { name: t('dashboard'), href: '/dashboard', icon: Home },
    { name: t('courses'), href: '/dashboard/courses', icon: BookOpen },
    // { name: t('emailManagement'), href: '/dashboard/emails', icon: Mail },
    // { name: t('students'), href: '/dashboard/students', icon: Users },
    // { name: t('analytics'), href: '/dashboard/analytics', icon: BarChart3 },
  ];

  const handleLogout = async () => {
    const result = await signOut();
    if (result.success) {
      router.replace('/auth/login');
      router.refresh();
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-card/80 backdrop-blur-xl supports-[backdrop-filter]:bg-card/60 ">
      <div className="flex h-16 items-center justify-between px-6 max-w-7xl mx-auto">
        {/* Logo and Brand */}
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="group">
            <WordmarkLogo className="gap-3" />
          </Link>

          {/* Main Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navigation.map(item => {
              const isActive = pathname === item.href || (pathname.startsWith(item.href + '/') && item.href !== '/dashboard');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full hover:bg-accent" disabled={loading}>
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-2 ">
                  <div className="flex items-center gap-2">
                    <Avatar className="size-9">
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <p className="text-sm font-semibold leading-none">{displayName}</p>
                      <p className="text-xs leading-none text-muted-foreground mt-1">{user?.email || t('loading')}</p>
                    </div>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <Link href="/settings/connections">
                  <Mail className="mr-2 h-4 w-4" />
                  <span>{t('emailConnections')}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings/connections">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>{t('settings')}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>{t('helpSupport')}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t('logout')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
