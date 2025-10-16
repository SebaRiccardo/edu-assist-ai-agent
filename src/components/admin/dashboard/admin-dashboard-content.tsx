'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  CreditCard,
  DollarSign,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import { useProfiles } from '@/hooks/use-profiles';
import { usePlans } from '@/hooks/use-subscription-plans';
import { useActiveSubscriptions } from '@/hooks/use-subscriptions';
import Link from 'next/link';

export function AdminDashboardContent() {
  // Fetch data using TanStack Query
  const { data: profiles, isLoading: usersLoading } = useProfiles();
  const { data: plans, isLoading: plansLoading } = usePlans({
    status: 'active',
  });
  const { data: subscriptions, isLoading: subscriptionsLoading } =
    useActiveSubscriptions();

  const isLoading = usersLoading || plansLoading || subscriptionsLoading;

  const totalUsers = profiles?.length || 0;
  const totalPlans = plans?.results?.length || 0;
  const activeSubscriptions = subscriptions?.length || 0;

  // Calculate total revenue (simplified - would need to sum actual payments)
  const totalRevenue = activeSubscriptions * 9999; // Placeholder calculation

  const stats = [
    {
      title: 'Total Users',
      value: totalUsers,
      icon: Users,
      description: 'Registered users',
      isLoading: usersLoading,
    },
    {
      title: 'Active Subscriptions',
      value: activeSubscriptions,
      icon: CreditCard,
      description: 'Currently active',
      isLoading: subscriptionsLoading,
    },
    {
      title: 'Subscription Plans',
      value: totalPlans,
      icon: TrendingUp,
      description: 'Available plans',
      isLoading: plansLoading,
    },
    {
      title: 'Revenue (Est.)',
      value: `$${(totalRevenue / 100).toFixed(2)}`,
      icon: DollarSign,
      description: 'Total estimated',
      isLoading: subscriptionsLoading,
    },
  ];

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage users, subscription plans, and monitor system activity.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 px-4 md:grid-cols-2 lg:grid-cols-4 lg:px-6">
        {stats.map(stat => (
          <Card className="border" key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="text-muted-foreground size-4" />
            </CardHeader>
            <CardContent>
              {stat.isLoading ? (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="text-2xl font-bold">{stat.value}</div>
              )}
              <p className="text-muted-foreground text-xs">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Link
              href="/admin/users"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              Manage Users
            </Link>
            <Link
              href="/admin/plans"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Manage Plans
            </Link>
            <Link
              href="/admin/subscriptions"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              View Subscriptions
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
