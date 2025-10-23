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
    <Tabs defaultValue="account" className="gap-4">
      <TabsList className="grid p-1 h-12 grid-cols-2 rounded-xl">
        <TabsTrigger value="account" className="gap-2 data-[state=active]:shadow-none">
          <UserCircle className="h-4 w-4" />
          <span className="hidden sm:inline">{t('account')}</span>
        </TabsTrigger>
        <TabsTrigger value="subscription" className="gap-2 data-[state=active]:shadow-none">
          <CreditCard className="h-4 w-4" />
          <span className="hidden sm:inline">{t('subscription')}</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="account" >
        <AccountSettings user={user} />
      </TabsContent>

      <TabsContent value="subscription">
        <SubscriptionSettings user={user} />
      </TabsContent>
    </Tabs>
  );
}
