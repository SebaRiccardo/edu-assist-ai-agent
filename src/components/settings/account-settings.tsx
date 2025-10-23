'use client';

import { useState, useEffect, useMemo } from 'react';
import { useProfile, useUpdateProfile } from '@/hooks/use-profiles';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, Lock, Eye, EyeOff, CheckCircle, Unlink, Link2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { User, UserIdentity } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { CurrentUserAvatar } from '../current-user-avatar';
import googleLogo from '@/assets/svg/google.svg';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GOOGLE_OAUTH_REDIRECT_URL } from '@/auth/service';
interface AccountSettingsProps {
  user: User | null;
}

export function AccountSettings({ user }: AccountSettingsProps) {
  const t = useTranslations('Settings.Account');
  const tCommon = useTranslations('Common');
  const tAuth = useTranslations('Auth');

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

  // Identities state
  const [identities, setIdentities] = useState<UserIdentity[]>(user?.identities || []);
  const [identitiesLoading, setIdentitiesLoading] = useState(false);
  const [unlinkConfirmOpen, setUnlinkConfirmOpen] = useState(false);
  const [identityPendingUnlink, setIdentityPendingUnlink] = useState<UserIdentity | null>(null);

  // Set password dialog state (when user only has OAuth)
  const [setPasswordOpen, setSetPasswordOpen] = useState(false);
  const [setPasswordLoading, setSetPasswordLoading] = useState(false);
  const [setPwd, setSetPwd] = useState('');
  const [setPwdConfirm, setSetPwdConfirm] = useState('');
  const [setPwdShow, setSetPwdShow] = useState(false);
  const [setPwdConfirmShow, setSetPwdConfirmShow] = useState(false);
  const [linkingProvider, setLinkingProvider] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);

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

  // Load linked identities from Supabase (authoritative)
  useEffect(() => {
    const loadIdentities = async () => {
      if (!user) return;
      setIdentitiesLoading(true);
      try {
        const { data, error } = await supabase.auth.getUserIdentities();
        if (error) throw error;
        setIdentities(data.identities || []);
      } catch (err) {
        console.error('Failed loading identities', err);
      } finally {
        setIdentitiesLoading(false);
      }
    };
    loadIdentities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

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
      <Card className="bg-transparent">
        <CardContent className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const userInitials = formData.firstName[0]?.toUpperCase() || formData.lastName[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U';

  // Filter out email provider, only show OAuth providers
  const oauthProviders = (identities || []).filter((identity: any) => identity.provider !== 'email');

  const hasEmailIdentity = useMemo(() => (identities || []).some(i => i.provider === 'email'), [identities]);
  const hasGoogleIdentity = useMemo(() => (identities || []).some(i => i.provider === 'google'), [identities]);

  const canUnlinkIdentity = (identity: UserIdentity) => {
    // Supabase requires at least 2 identities to unlink one
    const total = identities?.length || 0;
    if (total < 2) return false;
    return true;
  };

  const handleRequestUnlink = (identity: UserIdentity) => {
    // If this is the last OAuth identity and there's no email identity, require setting a password first
    const remainingOauth = oauthProviders.length;
    const isLastOauth = remainingOauth === 1 && identity.provider !== 'email';

    if (isLastOauth && !hasEmailIdentity) {
      setIdentityPendingUnlink(identity);
      setSetPasswordOpen(true);
      return;
    }

    setIdentityPendingUnlink(identity);
    setUnlinkConfirmOpen(true);
  };

  const refreshIdentities = async () => {
    try {
      const { data, error } = await supabase.auth.getUserIdentities();
      if (error) throw error;
      setIdentities(data.identities || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLinkGoogle = async () => {
    try {
      setLinkingProvider('google');
      const { error } = await supabase.auth.linkIdentity({
        provider: 'google',
        options: { redirectTo: GOOGLE_OAUTH_REDIRECT_URL },
      });
      if (error) throw error;
      // This typically redirects; keep spinner until navigation.
    } catch (err) {
      console.error(err);
      toast.error(t('linkFailed'));
      setLinkingProvider(null);
    }
  };

  const performUnlink = async () => {
    if (!identityPendingUnlink) return;
    if (!canUnlinkIdentity(identityPendingUnlink)) {
      toast.error(t('cannotUnlinkNeedAnotherMethod'));
      setUnlinkConfirmOpen(false);
      setIdentityPendingUnlink(null);
      return;
    }
    try {
      const { error } = await supabase.auth.unlinkIdentity(identityPendingUnlink);
      if (error) throw error;
      toast.success(t('identityUnlinked'));
      await refreshIdentities();
    } catch (err: any) {
      console.error(err);
      toast.error(t('identityUnlinkFailed'));
    } finally {
      setUnlinkConfirmOpen(false);
      setIdentityPendingUnlink(null);
    }
  };

  const handleSetPasswordThenUnlink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (setPwd.length < 8) {
      toast.error(t('passwordTooShort'));
      return;
    }
    if (setPwd !== setPwdConfirm) {
      toast.error(t('passwordsDoNotMatch'));
      return;
    }
    setSetPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: setPwd });
      if (error) throw error;
      toast.success(t('passwordSetSuccess'));
      await refreshIdentities();
      setSetPasswordOpen(false);
      setSetPwd('');
      setSetPwdConfirm('');
      // Now proceed to unlink
      setUnlinkConfirmOpen(true);
    } catch (err) {
      console.error(err);
      toast.error(t('passwordSetFailed'));
    } finally {
      setSetPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 rounded-3xl">
      <h2 className="text-2xl font-bold">{t('title')}</h2>
      {/* <p className="text-sm text-muted-foreground">{t('subtitle')}</p> */}

      <div className='flex flex-col gap-8'>
        <div className="flex flex-row gap-20 w-full justify-between">
          <CurrentUserAvatar className="size-36" />
          <div className="space-y-8 flex-1">
            <div className="grid grid-cols-1 gap-10">
              <div className="grid grid-cols-2 items-start w-full justify-center">
                <Label htmlFor="firstName" className="text-sm text-black">
                  {t('firstName')}
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Marty"
                />
              </div>
              <Separator />
              <div className="grid grid-cols-2 items-start w-full justify-center">
                <Label htmlFor="lastName" className="text-sm text-black">
                  {t('lastName')}
                </Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="McFly"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end">
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
      <Separator />

      {/* Contact Email Section */}
      <div className="space-y-4">
        {/* <div>
          <h3 className="text-base font-semibold">{t('contactEmail')}</h3>
          <p className="text-sm text-muted-foreground">{t('contactEmailDescription')}</p>
        </div> */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm text-muted-foreground">
            {t('email')}
          </Label>
          <div className="flex items-center gap-2">
            <div className="relative flex flex-row items-center gap-2 flex-1">
              <span className="">{user.email}</span>
              {user.email_confirmed_at && (
                <div className="text-green-600 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                  <CheckCircle className="h-4 w-4" />
                </div>
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
          <p className="text-sm text-muted-foreground">{t('passwordDescription')}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword" className="text-sm text-muted-foreground">
              {t('currentPassword')}
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={e => setFormData({ ...formData, currentPassword: e.target.value })}
                placeholder="••••••••••"
                className="pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-sm text-muted-foreground">
              {t('newPassword')}
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={e => setFormData({ ...formData, newPassword: e.target.value })}
                placeholder="••••••••••"
                className="pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Integrated Accounts Section */}

      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold">{t('integratedAccount')}</h3>
            <p className="text-sm text-muted-foreground">{t('integratedAccountDescription')}</p>
          </div>
        </div>
        <div className="space-y-3">
          {identitiesLoading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          )}
          {!identitiesLoading &&
            oauthProviders.map((identity: UserIdentity) => (
              <div key={identity.id} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Image
                      alt="provider-logo"
                      className="size-9 z-50"
                      src={identity.provider === 'google' ? googleLogo : undefined}
                      width={25}
                      height={25}
                    />
                    <Avatar className="size-5 absolute -bottom-2 right-0">
                      <AvatarImage src={identity.identity_data?.picture} />
                      <AvatarFallback className="text-xl">{userInitials}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div>
                    <p className="font-medium text-base capitalize">{identity.identity_data?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {identity.identity_data?.email || `Navigate the ${identity.provider} interface and reports.`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="destructive" size="sm" onClick={() => handleRequestUnlink(identity)}>
                    <Unlink className="h-4 w-4 mr-1" /> {t('unlink')}
                  </Button>
                </div>
              </div>
            ))}
          {!hasGoogleIdentity && (
            <Button variant="outline" onClick={handleLinkGoogle} disabled={!!linkingProvider}>
              {linkingProvider ? (
                <>
                  <Loader2 className="size-6 animate-spin" /> {t('linking')}
                </>
              ) : (
                <>
                  <Image src={googleLogo} width={20} height={20} alt="logo" className="size-6" /> {t('linkGoogle')}
                </>
              )}
            </Button>
          )}
          {/* {!identitiesLoading && oauthProviders.length === 0 && <p className="text-sm text-muted-foreground">{t('noOauthConnected')}</p>} */}
        </div>
      </div>

      {/* Confirm unlink dialog */}
      <AlertDialog open={unlinkConfirmOpen} onOpenChange={setUnlinkConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('unlinkConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('unlinkConfirmDescription')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={performUnlink}>{tCommon('confirm')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Set password dialog when needed */}
      <Dialog open={setPasswordOpen} onOpenChange={setSetPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('setPasswordTitle')}</DialogTitle>
            <DialogDescription>{t('setPasswordDescription')}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSetPasswordThenUnlink} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="set-password" className="text-sm text-muted-foreground">
                {t('newPassword')}
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="set-password"
                  type={setPwdShow ? 'text' : 'password'}
                  value={setPwd}
                  onChange={e => setSetPwd(e.target.value)}
                  placeholder="••••••••••"
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setSetPwdShow(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {setPwdShow ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="set-password-confirm" className="text-sm text-muted-foreground">
                {tAuth('confirmPassword')}
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="set-password-confirm"
                  type={setPwdConfirmShow ? 'text' : 'password'}
                  value={setPwdConfirm}
                  onChange={e => setSetPwdConfirm(e.target.value)}
                  placeholder="••••••••••"
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setSetPwdConfirmShow(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {setPwdConfirmShow ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSetPasswordOpen(false)}>
                {tCommon('cancel')}
              </Button>
              <Button type="submit" disabled={setPasswordLoading}>
                {setPasswordLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('saving')}
                  </>
                ) : (
                  t('setPasswordCta')
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
