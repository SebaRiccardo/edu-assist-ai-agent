'use client';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, MailPlus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image, { StaticImageData } from 'next/image';

interface AddConnectionCardProps {
  logo: StaticImageData;
  title: string;
  description: string;
  isLoading: boolean;
  disabled?: boolean;
  onClick: () => void;
  hoverColor: 'red' | 'blue';
}

export const AddConnectionCard = ({ logo, title, description, isLoading, disabled, onClick, hoverColor }: AddConnectionCardProps) => {
  const t = useTranslations('Connections');

  return (
    <Card
      className={`border-2 bg-transparent border-dashed gap-2 transition-all duration-200 hover:border-blue-500 border-blue-400 cursor-pointer`}
      onClick={!disabled && !isLoading ? onClick : undefined}
    >
      <CardHeader>
        <div className="flex flex-col items-center gap-2">
          <Image src={logo} width={40} height={40} alt={`${title} Logo`} />
          <span className="text-base font-semibold">{title}</span>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-center text-muted-foreground text-sm">{description}</p>
      </CardContent>
      <CardFooter className="border-t-0 bg-transparent hover:bg-transparent">
        <Button
          className="w-full cursor-pointer"
          size="sm"
          disabled={isLoading || disabled}
          onClick={e => {
            e.stopPropagation();
            onClick();
          }}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('connecting')}
            </>
          ) : (
            <>
              <MailPlus className="mr-2 h-4 w-4" />
              {t('connectAccount')}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
