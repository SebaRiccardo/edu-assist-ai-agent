import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CreditCard, DollarSign, TrendingUp } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export async function AdminDashboardContent() {
  const supabase = await createClient();

  // Fetch statistics
  const [usersResult, plansResult, subscriptionsResult] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase
      .from('subscription_plans')
      .select('id', { count: 'exact', head: true }),
    supabase
      .from('user_subscriptions')
      .select('id, status', { count: 'exact' })
      .eq('status', 'authorized'),
  ]);

  const totalUsers = usersResult.count || 0;
  const totalPlans = plansResult.count || 0;
  const activeSubscriptions = subscriptionsResult.count || 0;

  // Calculate total revenue (simplified - would need to sum actual payments)
  const totalRevenue = activeSubscriptions * 9999; // Placeholder calculation

  const stats = [
    {
      title: 'Total Users',
      value: totalUsers,
      icon: Users,
      description: 'Registered users',
    },
    {
      title: 'Active Subscriptions',
      value: activeSubscriptions,
      icon: CreditCard,
      description: 'Currently active',
    },
    {
      title: 'Subscription Plans',
      value: totalPlans,
      icon: TrendingUp,
      description: 'Available plans',
    },
    {
      title: 'Revenue (Est.)',
      value: `$${(totalRevenue / 100).toFixed(2)}`,
      icon: DollarSign,
      description: 'Total estimated',
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
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="text-muted-foreground size-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
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
            <a
              href="/admin/users"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              Manage Users
            </a>
            <a
              href="/admin/plans"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Manage Plans
            </a>
            <a
              href="/admin/subscriptions"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              View Subscriptions
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
