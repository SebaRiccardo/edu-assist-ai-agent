'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { type DateRange } from 'react-day-picker';
import { useTranslations } from 'next-intl';
import { DomainCourse } from '@/types';
import { Course, InsertCourse } from '@/lib/supabase/types/courses.types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { DateRangePicker } from '@/components/date-range-picker';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Loader2, Calendar as CalendarIcon, ChevronDown } from 'lucide-react';

// Zod validation schema for course form - will be created with translations
const createCourseFormSchema = (t: any) =>
  z
    .object({
      name: z
        .string()
        .min(2, t('validationNameMin'))
        .max(100, t('validationNameMax'))
        .regex(/^[a-zA-Z0-9\s\-_]+$/, t('validationNamePattern')),
      description: z
        .string()
        .min(10, t('validationDescriptionMin'))
        .max(160, t('validationDescriptionMax')),
      context: z
        .string()
        .min(50, t('validationContextMin'))
        .max(25000, t('validationContextMax')),
      student_count: z
        .number()
        .int(t('validationStudentCountInt'))
        .min(0, t('validationStudentCountMin'))
        .max(1000, t('validationStudentCountMax'))
        .optional(),
      year: z
        .string()
        .regex(/^\d{4}$/, t('validationYearFormat'))
        .refine(val => {
          const year = parseInt(val);
          return year >= 2020 && year <= 2030;
        }, t('validationYearRange')),
      start_at: z.date().optional().nullable(),
      end_at: z.date().optional().nullable(),
    })
    .refine(
      data => {
        // Validate that end_at is after start_at if both are provided
        if (data.start_at && data.end_at) {
          return data.end_at > data.start_at;
        }
        return true;
      },
      {
        message: t('validationEndDateAfterStart'),
        path: ['end_at'],
      }
    );

type CourseFormValues = z.infer<ReturnType<typeof createCourseFormSchema>>;

interface CourseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course?: Course | null;
  onSubmit: (
    data: Omit<
      InsertCourse,
      'professor_id' | 'created_at' | 'updated_at' | 'id'
    >
  ) => Promise<void>;
  isLoading?: boolean;
}

export function CourseFormDialog({
  open,
  onOpenChange,
  course,
  onSubmit,
  isLoading = false,
}: CourseFormDialogProps) {
  const t = useTranslations('CourseForm');
  const isEdit = !!course;

  // Initialize form with React Hook Form and Zod validation
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(createCourseFormSchema(t)),
    defaultValues: {
      name: '',
      description: '',
      context: '',
      student_count: 0,
      year: new Date().getFullYear().toString(),
      start_at: null,
      end_at: null,
    },
  });

  // Reset form when dialog opens or course changes
  useEffect(() => {
    if (open) {
      if (course) {
        form.reset({
          name: course.name,
          description: course.description,
          context: course.context,
          student_count: course.student_count ?? 0,
          year: course.year ?? new Date().getFullYear().toString(),
          start_at: course.start_at ? new Date(course.start_at) : null,
          end_at: course.end_at ? new Date(course.end_at) : null,
        });
      } else {
        form.reset({
          name: '',
          description: '',
          context: '',
          student_count: 0,
          year: new Date().getFullYear().toString(),
          start_at: null,
          end_at: null,
        });
      }
    }
  }, [course, open, form]);

  const handleFormSubmit = async (values: CourseFormValues) => {
    try {
      await onSubmit({
        name: values.name,
        description: values.description,
        context: values.context,
        student_count: values.student_count,
        year: values.year,
        start_at: values.start_at ? values.start_at.toISOString() : null,
        end_at: values.end_at ? values.end_at.toISOString() : null,
      });
      form.reset();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[95vh] overflow-y-auto bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t('editTitle') : t('createTitle')}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? t('editDescription') : t('createDescription')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-2"
          >
            <div className="grid gap-4 py-4">
              <div className="flex flex-row items-start gap-4">
                {/* Name Field */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>
                        {t('nameLabel')} <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="bg-blue-50  border-none"
                          placeholder={t('namePlaceholder')}
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormDescription>
                        {t('nameDescription', {
                          count: field.value?.length || 0,
                        })}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Student Count Field */}
                <FormField
                  control={form.control}
                  name="student_count"
                  render={({ field }) => (
                    <FormItem className="w-32">
                      <FormLabel>
                        {t('studentsLabel')}{' '}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder={t('studentsPlaceholder')}
                          className="bg-blue-50  border-none"
                          {...field}
                          onChange={e =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                          disabled={isLoading}
                          min={0}
                          max={10000}
                        />
                      </FormControl>
                      <FormDescription>
                        {t('studentsDescription')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Year Field */}
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem className="w-28">
                      <FormLabel>
                        {t('yearLabel')} <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder={t('yearPlaceholder')}
                          className="bg-blue-50 border-none"
                          {...field}
                          disabled={isLoading}
                          maxLength={4}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Description Field */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('descriptionLabel')}{' '}
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('descriptionPlaceholder')}
                        rows={3}
                        className="bg-blue-50  border-none resize-none shadow-none"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      {t('descriptionDescription', {
                        count: field.value?.length || 0,
                      })}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Context Field */}
              <FormField
                control={form.control}
                name="context"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t('contextLabel')}{' '}
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('contextPlaceholder')}
                        rows={10}
                        className="bg-blue-50 border-none resize-y font-mono text-sm border-2 shadow-none"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      {t('contextDescription', {
                        count: field.value?.length || 0,
                      })}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Course Duration (Date Range) - Collapsible */}
              <Collapsible className="space-y-2">
                <CollapsibleTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-between"
                    disabled={isLoading}
                  >
                    <span className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      {t('durationLabel')}
                      {form.watch('start_at') && form.watch('end_at') && (
                        <span className="text-xs text-muted-foreground ml-2">
                          {form.watch('start_at')?.toLocaleDateString()} -{' '}
                          {form.watch('end_at')?.toLocaleDateString()}
                        </span>
                      )}
                    </span>
                    <ChevronDown className="h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2">
                  <FormDescription>{t('durationDescription')}</FormDescription>
                  <DateRangePicker
                    dateRange={{
                      from: form.watch('start_at') || undefined,
                      to: form.watch('end_at') || undefined,
                    }}
                    onDateRangeChange={range => {
                      form.setValue('start_at', range?.from || null);
                      form.setValue('end_at', range?.to || null);

                      // Auto-fill year based on the start date
                      if (range?.from) {
                        const year = range.from.getFullYear().toString();
                        form.setValue('year', year);
                      }
                    }}
                    disabled={isLoading}
                  />
                  {form.formState.errors.end_at && (
                    <p className="text-sm font-medium text-destructive">
                      {form.formState.errors.end_at.message}
                    </p>
                  )}
                </CollapsibleContent>
              </Collapsible>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
                className="h-11 shadow-none"
              >
                {t('cancel')}
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="h-11 shadow-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('save')}
                  </>
                ) : isEdit ? (
                  t('update')
                ) : (
                  t('create')
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
