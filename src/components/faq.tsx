'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useTranslations } from 'next-intl';

export default function FAQ() {
  const t = useTranslations('FAQ');
  const items = [0, 1, 2, 3, 4, 5];
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="max-w-xl">
        <h2 className="text-4xl md:text-5xl leading-[1.15]! font-semibold tracking-tighter">
          {t('title')}
        </h2>
        <Accordion type="single" className="mt-6" defaultValue="question-0">
          {items.map(i => (
            <AccordionItem key={`q-${i}`} value={`question-${i}`}>
              <AccordionTrigger className="text-left text-lg">
                {t(`q${i}.question`)}
              </AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground">
                {t(`q${i}.answer`)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
