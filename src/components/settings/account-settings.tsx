'use client';

import { useState, useEffect } from 'react';
import { useProfile, useUpdateProfile } from '@/hooks/use-profiles';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Loader2,
  Upload,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface AccountSettingsProps {
  user: User | null;
}

export function AccountSettings({ user }: AccountSettingsProps) {
  const t = useTranslations('Settings.Account');
  const { data: profile, isLoading: profileLoading } = useProfile(user?.id);
  const { mutateAsync: updateProfile, isPending } = useUpdateProfile({
    onSuccess: () => {
      toast.success(t('profileUpdated') || 'Profile updated successfully');
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    currentPassword: '',
    newPassword: '',
  });

  useEffect(() => {
    if (profile) {
      const nameParts = (profile.full_name || '').split(' ');
      setFormData(prev => ({
        ...prev,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
      }));
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();

      await updateProfile({ id: user?.id || '', full_name: fullName });
    } catch (error) {
      toast.error(t('profileUpdateFailed') || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (profileLoading || !user) {
    return (
      <Card className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <CardContent className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  const userInitials =
    formData.firstName[0]?.toUpperCase() ||
    formData.lastName[0]?.toUpperCase() ||
    user.email?.[0]?.toUpperCase() ||
    'U';

  // Filter out email provider, only show OAuth providers
  const oauthProviders = (user?.identities || []).filter(
    (identity: any) => identity.provider !== 'email'
  );

  return (
    <div className="space-y-6 p-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 rounded-3xl">
      <div>
        <h2 className="text-2xl font-bold">{t('title')}</h2>
        <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
      </div>

      {/* <Separator /> */}

      {/* Profile Picture Section */}
      {/* <div className="space-y-2">
        <h3 className="text-base font-semibold">Profile picture</h3>
        <p className="text-sm text-muted-foreground">PNG, JPEG under 15MB</p>
        <div className="flex items-center gap-4 mt-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="text-xl">{userInitials}</AvatarFallback>
          </Avatar>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm">
              Upload new picture
            </Button>
            <Button type="button" variant="ghost" size="sm">
              Delete
            </Button>
          </div>
        </div>
      </div> */}

      <Separator />

      {/* Full Name Section */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold">{t('fullName')}</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label
              htmlFor="firstName"
              className="text-sm text-muted-foreground"
            >
              {t('firstName')}
            </Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={e =>
                setFormData({ ...formData, firstName: e.target.value })
              }
              placeholder="Bryan"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-sm text-muted-foreground">
              {t('lastName')}
            </Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={e =>
                setFormData({ ...formData, lastName: e.target.value })
              }
              placeholder="Cranston"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Contact Email Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-semibold">{t('contactEmail')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('contactEmailDescription')}
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm text-muted-foreground">
            {t('email')}
          </Label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={user.email || ''}
                disabled
                className="pl-10 pr-24"
              />
              {user.email_confirmed_at && (
                <Badge
                  variant="secondary"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                >
                  <CheckCircle className="h-4 w-4" />
                  {t('verified')}
                </Badge>
              )}
              {!user.email_confirmed_at && (
                <Badge
                  variant="secondary"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
                >
                  <span className="mr-1">⚠</span>
                  {t('notVerified')}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Password Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-semibold">{t('password')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('passwordDescription')}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label
              htmlFor="currentPassword"
              className="text-sm text-muted-foreground"
            >
              {t('currentPassword')}
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={e =>
                  setFormData({ ...formData, currentPassword: e.target.value })
                }
                placeholder="••••••••••"
                className="pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="newPassword"
              className="text-sm text-muted-foreground"
            >
              {t('newPassword')}
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={e =>
                  setFormData({ ...formData, newPassword: e.target.value })
                }
                placeholder="••••••••••"
                className="pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Integrated Accounts Section */}
      {oauthProviders.length > 0 && (
        <>
          <Separator />
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-semibold">
                {t('integratedAccount')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('integratedAccountDescription')}
              </p>
            </div>
            <div className="space-y-3">
              {oauthProviders.map((identity: any) => (
                <div
                  key={identity.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                      <span className="text-lg font-semibold capitalize text-orange-600 dark:text-orange-400">
                        {identity.provider[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium capitalize">
                        {identity.provider}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {identity.identity_data?.email ||
                          `Navigate the ${identity.provider} interface and reports.`}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="text-green-600 bg-green-50 dark:bg-green-900/20"
                  >
                    {t('connected')}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Save Button */}
      <div className="flex justify-start pt-4">
        <Button onClick={handleSubmit} disabled={isPending || isSubmitting}>
          {isSubmitting || isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('saving')}
            </>
          ) : (
            t('saveChanges')
          )}
        </Button>
      </div>
    </div>
  );
}
