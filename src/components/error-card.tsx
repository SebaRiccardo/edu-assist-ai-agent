'use client';

import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MailWarning } from 'lucide-react';

interface ErrorCardProps {
  error: string;
}

export function ErrorCard({ error }: ErrorCardProps) {
  if (!error) return null;

  return (
    <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-red-100 p-2 dark:bg-red-900/50">
            <MailWarning className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <CardTitle className="text-lg text-red-900 dark:text-red-100">Error</CardTitle>
            <CardDescription className="text-red-700 dark:text-red-300">{error}</CardDescription>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
