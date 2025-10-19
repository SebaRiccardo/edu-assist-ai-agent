import { cn } from '@/lib/utils';
import logo from '@/assets/main-logo.png';
import Image from 'next/image';
interface AuxiliarLogoProps {
  className?: string;
}

/**
 * AuxilIAr Logo - Geometric design representing AI assistant for professors
 * Features: Graduation cap shape with neural network connections
 * Inspired by modern geometric logos like Supabase
 */
export default function AuxiliarLogo({ className }: AuxiliarLogoProps) {
  return <Image src={logo} width={30} height={30} alt="main-logo" />;
}
