// SVG Imports
import AuxiliarLogo from '@/assets/svg/auxiliar-logo';

// Util Imports
import { cn } from '@/lib/utils';

const WordmarkLogo = ({ className }: { className?: string }) => {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <AuxiliarLogo className="size-8" />
      <span className="text-xl font-semibold">
        Auxil<span className="text-primary">IA</span>r
      </span>
    </div>
  );
};

export default WordmarkLogo;
