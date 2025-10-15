import { CreatePlanForm } from '@/components/admin/plans/create-plan-form';
import { PlanType } from '@/subscriptions/plans';

type SearchParams = Promise<{ template?: string }>;

export default async function CreatePlanPage(props: {
  searchParams: SearchParams;
}) {
  // Validate and parse template parameter
  const { template } = await props.searchParams;
  const validTemplates: PlanType[] = ['basic', 'pro', 'pro_plus'];
  const planTemplate: PlanType | undefined =
    template && validTemplates.includes(template as PlanType)
      ? (template as PlanType)
      : undefined;

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <h1 className="text-3xl font-bold ">
          {planTemplate
            ? `Create ${planTemplate.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Plan`
            : 'Create Subscription Plan'}
        </h1>
        <p className="text-muted-foreground mt-2">
          {planTemplate
            ? `Create a new ${planTemplate} subscription plan based on the template.`
            : 'Create a new subscription plan in MercadoPago and save it to the database.'}
        </p>
      </div>
      <CreatePlanForm template={planTemplate} />
    </div>
  );
}
