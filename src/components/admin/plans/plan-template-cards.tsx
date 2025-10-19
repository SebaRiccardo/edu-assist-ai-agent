'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  ChevronDown,
  Plus,
  Check,
  Infinity as InfinityIcon,
} from 'lucide-react';
import {
  SUBSCRIPTION_PLANS_CONFIG,
  PLAN_LIMITS,
  type PlanType,
} from '@/subscriptions/plans';
import { useState } from 'react';

interface PlanTemplateCardsProps {
  onCreatePlan: (planType: PlanType) => void;
}

type PlanConfig =
  | typeof SUBSCRIPTION_PLANS_CONFIG.BASIC
  | typeof SUBSCRIPTION_PLANS_CONFIG.PRO
  | typeof SUBSCRIPTION_PLANS_CONFIG.PRO_PLUS;

export function PlanTemplateCards({ onCreatePlan }: PlanTemplateCardsProps) {
  const [openCards, setOpenCards] = useState<Record<string, boolean>>({
    basic: false,
    pro: false,
    pro_plus: false,
  });

  const toggleCard = (key: string) => {
    setOpenCards(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const planEntries: Array<{ key: PlanType; config: PlanConfig }> = [
    { key: 'basic', config: SUBSCRIPTION_PLANS_CONFIG.BASIC },
    { key: 'pro', config: SUBSCRIPTION_PLANS_CONFIG.PRO },
    { key: 'pro_plus', config: SUBSCRIPTION_PLANS_CONFIG.PRO_PLUS },
  ];

  const formatLimitValue = (
    value:
      | number
      | boolean
      | null
      | { input: number; output: number; interval: string }
  ) => {
    if (value === null || (typeof value === 'number' && !isFinite(value)))
      return 'Unlimited';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'object' && value !== null && 'input' in value) {
      return `${value.input}/${value.output} per ${value.interval}`;
    }
    return value.toString();
  };

  const formatLimitLabel = (key: string): string => {
    const labels: Record<string, string> = {
      maxInboxes: 'Max Inboxes',
      maxCourses: 'Max Courses',
      aiQueriesPerDay: 'AI Queries/Day',
      emailsProcessedPerMonth: 'Emails/Month',
      storageGB: 'Storage (GB)',
      autoReplies: 'Auto Replies',
      prioritySupport: 'Priority Support',
      autoLabels: 'Auto Labels',
      autonomusEmailManagement: 'Autonomous Management',
    };
    return labels[key] || key;
  };

  return (
    <div className="space-y-4 mb-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Quick Create Plans</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Use these predefined templates to quickly create subscription plans
          with recommended settings.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {planEntries.map(({ key, config }) => {
          const limits = PLAN_LIMITS[key];
          const isOpen = openCards[key];

          return (
            <Card
              key={key}
              className={`relative border ${config.highlighted ? 'border-primary shadow-md' : ''}`}
            >
              {config.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="default" className="shadow-sm">
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{config.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {config.subtitle}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="ml-2">
                    {config.currency}
                  </Badge>
                </div>
                <div className="mt-4">
                  <span className="text-4xl font-bold">
                    {config.currency === 'USD' ? '$' : '$'}
                    {config.price.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground text-sm ml-2">
                    {config.period}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {config.description}
                </p>

                <Collapsible open={isOpen} onOpenChange={() => toggleCard(key)}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium hover:text-primary transition-colors">
                    <span>View Features & Limits</span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
                    />
                  </CollapsibleTrigger>

                  <CollapsibleContent className="space-y-4 pt-4">
                    {/* Features */}
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Features</h4>
                      <ul className="space-y-1.5">
                        {config.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start text-xs">
                            <Check className="h-3.5 w-3.5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Limits */}
                    <div>
                      <h4 className="text-sm font-semibold mb-2">
                        Plan Limits
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(limits).map(
                          ([limitKey, limitValue]) => (
                            <div
                              key={limitKey}
                              className="flex flex-col p-2 bg-muted/30 rounded-md text-xs"
                            >
                              <span className="text-muted-foreground mb-1">
                                {formatLimitLabel(limitKey)}
                              </span>
                              <span className="font-semibold flex items-center gap-1">
                                {(limitValue === null ||
                                  (typeof limitValue === 'number' &&
                                    !isFinite(limitValue))) && (
                                  <InfinityIcon className="h-3 w-3 text-primary" />
                                )}
                                {formatLimitValue(limitValue)}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                <Button
                  onClick={() => onCreatePlan(key)}
                  className="w-full"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create {config.name} Plan
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
