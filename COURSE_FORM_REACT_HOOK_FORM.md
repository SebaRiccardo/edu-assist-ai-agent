# Course Form Dialog - React Hook Form Implementation

## Overview

Refactored the Course Form Dialog to use React Hook Form with Zod validation for a robust, type-safe form experience.

## Key Features

### 1. **React Hook Form Integration**

- Uses `useForm` hook from `react-hook-form`
- Automatic form state management
- Built-in validation handling
- Optimized re-renders

### 2. **Zod Schema Validation**

Comprehensive validation schema with the following rules:

#### **Name Field**

- Type: String
- Min length: 2 characters
- Max length: 100 characters
- Pattern: Alphanumeric, spaces, hyphens, underscores only
- Required: Yes

#### **Title Field**

- Type: String
- Min length: 3 characters
- Max length: 200 characters
- Required: Yes

#### **Description Field**

- Type: String
- Min length: 10 characters
- Max length: 1000 characters
- Required: Yes

#### **Context Field**

- Type: String
- Min length: 50 characters (to ensure enough AI context)
- Max length: 5000 characters
- Required: Yes
- Purpose: Provides detailed information for AI email categorization

#### **Year Field**

- Type: String (4 digits)
- Pattern: Must be valid 4-digit year
- Range: 2020-2030
- Default: Current year
- Required: Yes

#### **Student Count Field**

- Type: Number (integer)
- Min: 0
- Max: 1000
- Default: 0
- Required: No

#### **Start Date & End Date**

- Type: Date (optional)
- Validation: End date must be after start date
- Required: No

#### **Inboxes Field**

- Type: Array of objects
- Structure:
  ```typescript
  {
    id: string;
    email: string; // Must be valid email format
    unreadEmailCount: number; // Integer, min 0
  }
  ```
- Default: Empty array
- Required: No

### 3. **Form Components**

Uses shadcn/ui form components for consistent styling:

- `Form` - Form provider wrapper
- `FormField` - Individual field wrapper
- `FormItem` - Field container
- `FormLabel` - Field label with error state
- `FormControl` - Input wrapper with accessibility
- `FormDescription` - Help text below field
- `FormMessage` - Validation error display

### 4. **TypeScript Type Safety**

```typescript
// Form values type inferred from Zod schema
type CourseFormValues = z.infer<typeof courseFormSchema>;

// Props interface ensures correct usage
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
```

## Form Behavior

### **Create Mode** (course = null)

- Form fields are empty
- Submit button: "Create Course"
- On submit: Calls `onSubmit` with form data including `professor_id`

### **Edit Mode** (course provided)

- Form fields pre-filled with course data
- Submit button: "Update Course"
- On submit: Calls `onSubmit` with updated form data

### **Form Reset**

- Form automatically resets when dialog opens/closes
- When editing: Populates fields with existing course data
- When creating: Clears all fields to defaults

### **Validation**

- Real-time validation as user types
- Error messages displayed below each field
- Submit button disabled if form is invalid
- Form-level validation for date comparison

## Usage Example

```typescript
import { CourseFormDialog } from '@/components/course-form-dialog';
import { useCreateCourse, useUpdateCourse } from '@/hooks/use-courses';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const { mutateAsync: createCourse } = useCreateCourse();
  const { mutateAsync: updateCourse } = useUpdateCourse();

  const handleSubmit = async (data) => {
    if (editingCourse) {
      await updateCourse({ id: editingCourse.id, ...data });
    } else {
      await createCourse([{ ...data, professor_id: userId }]);
    }
    setIsOpen(false);
  };

  return (
    <CourseFormDialog
      open={isOpen}
      onOpenChange={setIsOpen}
      course={editingCourse}
      onSubmit={handleSubmit}
      isLoading={false}
    />
  );
}
```

## Accessibility Features

1. **ARIA Labels**: All form fields have proper `aria-describedby` attributes
2. **Error Announcements**: Screen readers announce validation errors
3. **Focus Management**: Proper tab order and focus indicators
4. **Keyboard Navigation**: Full keyboard support for all interactions
5. **Required Field Indicators**: Visual `*` markers for required fields

## Form Layout

The form is organized into logical sections:

1. **Basic Information**
   - Course Name (identifier)
   - Course Title (display name)
   - Academic Year

2. **Enrollment**
   - Number of Students

3. **Course Details**
   - Description (brief overview)
   - AI Context (detailed information for email categorization)

## Validation Error Messages

All validation rules provide clear, user-friendly error messages:

- `"Name must be at least 2 characters"`
- `"Name can only contain letters, numbers, spaces, hyphens, and underscores"`
- `"Description must be at least 10 characters"`
- `"Context must be at least 50 characters to help AI categorize emails effectively"`
- `"Year must be between 2020 and 2030"`
- `"Student count cannot be negative"`
- `"End date must be after start date"`

## Benefits of This Approach

### **Developer Experience**

- ✅ Type-safe form handling
- ✅ Centralized validation logic
- ✅ Automatic form state management
- ✅ Less boilerplate code
- ✅ Better error handling

### **User Experience**

- ✅ Real-time validation feedback
- ✅ Clear error messages
- ✅ Disabled submit button prevents invalid submissions
- ✅ Smooth form interactions
- ✅ Accessible to all users

### **Maintainability**

- ✅ Schema-based validation is easy to update
- ✅ Validation rules defined in one place
- ✅ TypeScript ensures consistency
- ✅ Testable validation logic

## Future Enhancements

### Potential Additions

1. **Date Pickers** - Add calendar UI for start/end dates
2. **Inbox Management** - UI to add/edit inbox email addresses
3. **Autosave** - Save draft as user types
4. **Field Hints** - Show character counts for text fields
5. **Rich Text** - WYSIWYG editor for context field
6. **Templates** - Pre-fill forms with common course templates
7. **Duplicate Detection** - Warn if similar course exists

## Testing Checklist

- [ ] Create new course with valid data
- [ ] Create course with missing required fields
- [ ] Create course with invalid year format
- [ ] Edit existing course
- [ ] Cancel form (data should reset)
- [ ] Validation messages display correctly
- [ ] Submit button disabled when form invalid
- [ ] Form resets after successful submission
- [ ] Keyboard navigation works
- [ ] Screen reader announces errors

## Related Files

- `/src/components/course-form-dialog.tsx` - Main form component
- `/src/components/ui/form.tsx` - Shadcn form primitives
- `/src/hooks/use-courses.ts` - TanStack Query hooks
- `/src/lib/supabase/types/courses.types.ts` - Database types
- `/src/app/dashboard/courses/page.tsx` - Usage example

## Dependencies

- `react-hook-form` - Form state management
- `@hookform/resolvers` - Zod integration
- `zod` - Schema validation
- `@radix-ui/react-dialog` - Dialog component
- `@radix-ui/react-label` - Label component

## Migration Notes

### Before (Manual State Management)

```typescript
const [title, setTitle] = useState('');
const [description, setDescription] = useState('');
// ... more state
// Manual validation in handleSubmit
```

### After (React Hook Form)

```typescript
const form = useForm<CourseFormValues>({
  resolver: zodResolver(courseFormSchema),
  defaultValues: {
    /* ... */
  },
});
// Validation automatic, state managed by form
```

This refactor reduces code, improves type safety, and provides better UX with real-time validation.
