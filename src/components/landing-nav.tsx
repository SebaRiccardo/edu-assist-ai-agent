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
  User,
  Settings,
  LogOut,
  HelpCircle,
  Sparkles,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  useCurrentUser,
  useUserInitials,
  useUserDisplayName,
} from '@/hooks/use-current-user';
import { signOut } from '@/auth/service';
import WordmarkLogo from '@/components/wordmark-logo';

interface LandingNavProps {
  onGetStarted?: () => void;
}

export function LandingNav({ onGetStarted }: LandingNavProps) {
  const router = useRouter();
  const { user, loading } = useCurrentUser();
  const initials = useUserInitials();
  const displayName = useUserDisplayName();

  const handleLogout = async () => {
    const result = await signOut();
    if (result.success) {
      router.push('/auth/login');
      router.refresh();
    }
  };

  const handleGetStarted = () => {
    if (user) {
      router.push('/dashboard');
    } else if (onGetStarted) {
      onGetStarted();
    } else {
      router.push('/auth/login');
    }
  };

  return (
    <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="group">
            <WordmarkLogo className="gap-3" />
          </Link>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : user ? (
              // Authenticated User - Show Avatar Dropdown
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
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
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
              </>
            ) : (
              // Guest User - Show Sign In and Get Started
              <>
                <button
                  onClick={handleGetStarted}
                  className="text-foreground hover:text-primary px-4 py-2 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={handleGetStarted}
                  className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:opacity-90 transition-opacity shadow-sm"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
