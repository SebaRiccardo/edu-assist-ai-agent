'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User as UserIcon, CreditCard, Shield, Bell, UserCircle } from 'lucide-react';
import { AccountSettings, SubscriptionSettings } from '@/components/settings';
import { User } from '@supabase/supabase-js';
import { useTranslations } from 'next-intl';

interface SettingsPageContentProps {
  user: User;
}

export function SettingsPageContent({ user }: SettingsPageContentProps) {
  const t = useTranslations('Settings');

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>

        <Tabs defaultValue="account" className="space-y-6 ">
          <TabsList className="grid w-full grid-cols-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <TabsTrigger value="account" className="gap-2">
              <UserCircle className="h-4 w-4" />
              <span className="hidden sm:inline">{t('account')}</span>
            </TabsTrigger>
            <TabsTrigger value="subscription" className="gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">{t('subscription')}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account">
            <AccountSettings user={user} />
          </TabsContent>

          <TabsContent value="subscription">
            <SubscriptionSettings user={user} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
