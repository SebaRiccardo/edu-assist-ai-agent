'use client';

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
import {
  Settings,
  LogOut,
  Bell,
  Search,
  BookOpen,
  Home,
  HelpCircle,
  Sparkles,
  Loader2,
  User as UserIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  useCurrentUser,
  useUserInitials,
  useUserDisplayName,
} from '@/hooks/use-current-user';
import { signOut } from '@/auth/service';
import WordmarkLogo from '@/components/wordmark-logo';
import { User } from '@supabase/supabase-js';

export function TopNav({ user }: { user: User | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user: clientSideUser, loading } = useCurrentUser(user);
  const initials = useUserInitials(user);
  const displayName = useUserDisplayName();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Courses', href: '/dashboard/courses', icon: BookOpen },
    // { name: 'Email Management', href: '/dashboard/emails', icon: Mail },
    // { name: 'Students', href: '/dashboard/students', icon: Users },
    // { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  ];

  const handleLogout = async () => {
    const result = await signOut();
    if (result.success) {
      router.replace('/auth/login');
      router.refresh();
    }
  };

  console.log('server user', user);

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
              const isActive =
                pathname === item.href ||
                (pathname.startsWith(item.href + '/') &&
                  item.href !== '/dashboard');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
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
          {/* Search Button */}
          <Button
            variant="ghost"
            size="sm"
            className="hidden md:flex gap-2 text-muted-foreground hover:text-foreground"
          >
            <Search className="h-4 w-4" />
            <span className="text-sm">Search</span>
            <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>

          {/* Help */}
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
          >
            <HelpCircle className="h-5 w-5" />
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative text-muted-foreground hover:text-foreground"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-9 w-9 rounded-full hover:bg-accent"
                disabled={loading}
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      initials
                    )}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-2 p-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <p className="text-sm font-semibold leading-none">
                        {displayName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground mt-1">
                        {user?.email || 'Loading...'}
                      </p>
                    </div>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings/connections">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Gmail Connections</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Help & Support</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
