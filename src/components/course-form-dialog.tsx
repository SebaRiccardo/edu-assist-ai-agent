'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { DomainCourse } from '@/types';
import { InsertCourse } from '@/lib/supabase/types/courses.types';
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
import { Loader2 } from 'lucide-react';

// Zod validation schema for course form
const courseFormSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must be less than 100 characters')
      .regex(
        /^[a-zA-Z0-9\s\-_]+$/,
        'Name can only contain letters, numbers, spaces, hyphens, and underscores'
      ),
    description: z
      .string()
      .min(10, 'Description must be at least 10 characters')
      .max(1000, 'Description must be less than 1000 characters'),
    context: z
      .string()
      .min(
        50,
        'Context must be at least 50 characters to help AI categorize emails effectively'
      )
      .max(5000, 'Context must be less than 5000 characters'),
    year: z
      .string()
      .regex(/^\d{4}$/, 'Year must be a valid 4-digit year')
      .refine(val => {
        const year = parseInt(val);
        return year >= 2020 && year <= 2030;
      }, 'Year must be between 2020 and 2030'),
    student_count: z
      .number()
      .int('Student count must be a whole number')
      .min(0, 'Student count cannot be negative')
      .max(1000, 'Student count must be less than 1000'),
    start_at: z.date().optional().nullable(),
    end_at: z.date().optional().nullable(),
    inboxes: z.array(
      z.object({
        id: z.string(),
        email: z.string().email('Invalid email format'),
        unreadEmailCount: z.number().int().min(0),
      })
    ),
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
      message: 'End date must be after start date',
      path: ['end_at'],
    }
  );

type CourseFormValues = z.infer<typeof courseFormSchema>;

interface CourseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course?: DomainCourse | null;
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
  const isEdit = !!course;

  // Initialize form with React Hook Form and Zod validation
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      name: '',

      description: '',
      context: '',
      year: new Date().getFullYear().toString(),
      student_count: 0,
      start_at: null,
      end_at: null,
      inboxes: [],
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
          year: course.year,
          student_count: course.studentCount,
          start_at: course.startAt ? new Date(course.startAt) : null,
          end_at: course.endAt ? new Date(course.endAt) : null,
          inboxes: course.inboxes || [],
        });
      } else {
        form.reset({
          name: '',

          description: '',
          context: '',
          year: new Date().getFullYear().toString(),
          student_count: 0,
          start_at: null,
          end_at: null,
          inboxes: [],
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
        year: values.year,
        student_count: values.student_count,
        start_at: values.start_at ? values.start_at.toISOString() : null,
        end_at: values.end_at ? values.end_at.toISOString() : null,
        inboxes: values.inboxes as any, // JSON type
      });
      form.reset();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit Course' : 'Create New Course'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the course information below.'
              : 'Fill in the details to create a new course. Required fields are marked with *.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-6"
          >
            <div className="grid gap-4 py-4">
              {/* Name Field */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Course Name <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., CALC-101"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Short identifier for the course (alphanumeric, hyphens,
                      underscores)
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
                  <FormItem>
                    <FormLabel>
                      Academic Year <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="e.g., 2025"
                        {...field}
                        disabled={isLoading}
                        maxLength={4}
                      />
                    </FormControl>
                    <FormDescription>
                      Year when this course is being taught
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
                  <FormItem>
                    <FormLabel>Number of Students</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="1000"
                        placeholder="0"
                        {...field}
                        onChange={e =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Approximate number of enrolled students
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description Field */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Description <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide a brief description of the course, including main topics and objectives..."
                        rows={3}
                        className="resize-none"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Brief overview of the course (10-1000 characters)
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
                      AI Context <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide detailed context about the course including: syllabus topics, key concepts, assignment types, exam schedule, grading criteria, prerequisites, textbooks, important dates, office hours, and any other relevant information that will help the AI understand and categorize student emails..."
                        rows={8}
                        className="resize-y font-mono text-sm"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Detailed information to help the AI categorize and
                      understand emails related to this course (50-5000
                      characters)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !form.formState.isValid}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : isEdit ? (
                  'Update Course'
                ) : (
                  'Create Course'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
