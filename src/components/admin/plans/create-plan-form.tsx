'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';

const createPlanSchema = z.object({
  name: z.string().min(1, 'Plan name is required'),
  description: z.string().optional(),
  price: z.coerce.number().positive('Price must be positive'),
  currency: z.string().default('ARS'),
  interval: z.enum(['months', 'days', 'years']),
  intervalCount: z.coerce.number().int().positive().default(1),
  trialPeriodDays: z.coerce.number().int().nonnegative().optional(),
  features: z.string().optional(),
  isActive: z.boolean().default(true),
});

type CreatePlanFormValues = z.infer<typeof createPlanSchema>;

export function CreatePlanForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CreatePlanFormValues>({
    resolver: zodResolver(createPlanSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      currency: 'ARS',
      interval: 'months',
      intervalCount: 1,
      trialPeriodDays: 0,
      features: '',
      isActive: true,
    },
  });

  async function onSubmit(values: CreatePlanFormValues) {
    setIsLoading(true);

    try {
      // Parse features from comma-separated string
      const featuresArray = values.features
        ?.split(',')
        .map(f => f.trim())
        .filter(f => f.length > 0);

      const response = await fetch('/api/subscriptions/plan/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: values.name,
          description: values.description,
          price: values.price,
          currency: values.currency,
          interval: values.interval,
          intervalCount: values.intervalCount,
          trialPeriodDays:
            values.trialPeriodDays && values.trialPeriodDays > 0
              ? values.trialPeriodDays
              : undefined,
          features: featuresArray,
          isActive: values.isActive,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create plan');
      }

      toast.success('Plan created successfully!', {
        description: `${result.data.plan.name} has been created and is now available.`,
      });

      // Redirect to plans list
      router.push('/admin/plans');
      router.refresh();
    } catch (error: any) {
      toast.error('Error creating plan', {
        description: error.message || 'An unexpected error occurred',
      });
      console.error('Error creating plan:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Plan Details</CardTitle>
        <CardDescription>
          Enter the details for the new subscription plan. The plan will be
          created in MercadoPago and saved to your database.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plan Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Premium Plan" {...field} />
                  </FormControl>
                  <FormDescription>
                    The name of the subscription plan as shown to users.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Full access to all features..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A brief description of what this plan includes.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (in cents)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="9999" {...field} />
                    </FormControl>
                    <FormDescription>
                      Price in smallest currency unit (e.g., 9999 = $99.99)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ARS">
                          ARS (Argentine Peso)
                        </SelectItem>
                        <SelectItem value="USD">USD (US Dollar)</SelectItem>
                        <SelectItem value="EUR">EUR (Euro)</SelectItem>
                        <SelectItem value="BRL">
                          BRL (Brazilian Real)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="interval"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Billing Interval</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select interval" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="days">Days</SelectItem>
                        <SelectItem value="months">Months</SelectItem>
                        <SelectItem value="years">Years</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="intervalCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interval Count</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" placeholder="1" {...field} />
                    </FormControl>
                    <FormDescription>
                      Number of intervals (e.g., 1 month, 3 months)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="trialPeriodDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Free Trial Period (days)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" placeholder="14" {...field} />
                  </FormControl>
                  <FormDescription>
                    Optional: Number of days for free trial (0 for no trial)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="features"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Features</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Unlimited emails, Priority support, Advanced AI features"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Comma-separated list of plan features
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Plan</FormLabel>
                    <FormDescription>
                      Make this plan available for subscription immediately
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                Create Plan
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
