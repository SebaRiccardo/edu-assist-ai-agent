'use client';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, MailPlus } from 'lucide-react';
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

const HOVER_STYLES = {
  red: 'hover:bg-red-50 hover:border-red-500',
  blue: 'hover:bg-blue-100 hover:border-blue-500',
} as const;

export const AddConnectionCard = ({ logo, title, description, isLoading, disabled, onClick, hoverColor }: AddConnectionCardProps) => {
  return (
    <Card
      className={`bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 gap-2 
                  transition-all duration-150 border-2 hover:border-dashed hover:shadow-md 
                  cursor-pointer border-transparent ${HOVER_STYLES[hoverColor]}`}
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
          className="w-full"
          size="sm"
          variant="link"
          disabled={isLoading || disabled}
          onClick={e => {
            e.stopPropagation();
            onClick();
          }}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <MailPlus className="mr-2 h-4 w-4" />
              Connect Account
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
