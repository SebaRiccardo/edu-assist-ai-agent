import { Logo } from './logo';
import { NavMenu } from './nav-menu';
import { getCurrentUser } from '@/lib/supabase/server';

import NavbarClient from './navbarClient';

export default async function Navbar() {
  const user = await getCurrentUser();
  return (
    <nav className="fixed z-10 top-6 inset-x-4 h-14 xs:h-16 bg-background/50 backdrop-blur-sm border dark:border-slate-700/70 max-w-screen-xl mx-auto rounded-full">
      <div className="h-full flex items-center justify-between mx-auto px-4">
        <Logo />
        <NavMenu className="hidden md:block" />
        <NavbarClient user={user} />
      </div>
    </nav>
  );
}
