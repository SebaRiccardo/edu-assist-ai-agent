// SVG Imports
import LogoSvg from '@/assets/svg/logo';

// Util Imports
import { cn } from '@/lib/utils';

const WordmarkLogo = ({ className }: { className?: string }) => {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <LogoSvg className="size-8.5" />
      <span className="text-xl font-semibold">EduAssist</span>
    </div>
  );
};

export default WordmarkLogo;
