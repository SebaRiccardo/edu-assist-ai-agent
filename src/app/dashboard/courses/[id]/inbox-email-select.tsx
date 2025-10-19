'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DomainInbox } from '@/types';

const FormSchema = z.object({
  email: z.email(),
  connectedAccountId: z.string().optional(),
});

export function InboxEmailSelect({
  inboxes,
  onSelected,
  canAddNew = true,
}: {
  inboxes?: DomainInbox[];
  onSelected: (inbox: DomainInbox) => void;
  canAddNew?: boolean;
}) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: inboxes && inboxes.length > 0 ? inboxes[0].email : '',
      connectedAccountId: inboxes && inboxes.length > 0 ? inboxes[0].connectedAccountId : '',
    },
  });

  const handleOnChange = (value: string) => {
    if (value === '__add_new') {
      window.location.href = '/dashboard/settings/connections';
      return;
    }

    form.setValue('email', value, { shouldValidate: true });
    const selectedInbox = inboxes?.find(inbox => inbox.email === value);
    if (selectedInbox) {
      onSelected(selectedInbox);
      toast('You selected the following values', {
        description: `Email: ${selectedInbox.email}`,
      });
    }
  };

  return (
    <Form {...form}>
      <form className="flex flex-col items-start space-y-3">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Seleccionado:</FormLabel>
              <Select onValueChange={handleOnChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-white shadow-none w-full border-none">
                    <SelectValue placeholder="Select a connected email" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {inboxes?.map(inbox => (
                    <div key={inbox.id}>
                      <SelectItem key={inbox.id} value={inbox.email}>
                        {inbox.email}
                      </SelectItem>
                      {canAddNew && (
                        <SelectItem className="text-blue-500 font-semibold" value="__add_new">
                          Click to add new
                        </SelectItem>
                      )}
                    </div>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
