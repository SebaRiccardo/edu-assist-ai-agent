import Link from 'next/link';
import WordmarkLogo from '@/components/wordmark-logo';

export const Logo = () => (
  <Link href="/" className="flex items-center">
    <WordmarkLogo />
  </Link>
);
