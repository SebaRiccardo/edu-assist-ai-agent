# Courses TanStack Query Migration

## Overview

Successfully migrated course CRUD operations from API routes to TanStack Query hooks using `@supabase-cache-helpers/postgrest-react-query`.

## Changes Made

### 1. Removed API Routes

- **Deleted**: `/src/app/api/courses/route.ts`
- **Reason**: Replaced with direct Supabase queries via TanStack Query hooks

### 2. Updated Query Builders (`/src/hooks/queries/courses.ts`)

- Fixed `getAllCoursesForUserQuery` → `getAllCoursesForProfessorQuery` (uses `professor_id` column)
- Added `.single()` to `getCourseByIdQuery` for single record fetching
- Added `getCoursesCountQuery` for counting courses
- Added comprehensive JSDoc comments for all query builders

### 3. Enhanced Hooks (`/src/hooks/use-courses.ts`)

- Added `'use client'` directive for client-side usage
- Updated `useCourses(professorId?)` to use corrected query function
- Added `enabled` flag to `useCourse` hook for conditional fetching
- Added `useCoursesCount(professorId?)` hook for counting records
- Added `useDeleteCourse()` hook using `useDeleteMutation`
- Improved JSDoc documentation

### 4. Updated Pages

#### `/src/app/dashboard/courses/[id]/page.tsx`

- Replaced `useEffect` + `fetch` with `useCourse(courseId)` hook
- Added type transformation from `Course` (Supabase) to `DomainCourse` (app domain)
- Removed manual loading state management (handled by TanStack Query)
- Imports `Course` type from `@/lib/supabase/types/courses.types`

#### `/src/app/dashboard/courses/page.tsx`

- Replaced `fetch` DELETE call with `useDeleteCourse()` hook
- Added `useUpdateCourse()` hook for future update functionality
- Updated `handleEdit` to properly transform `Course` to `DomainCourse`
- Added `student_count` parameter to `createCourse` mutation

### 5. Updated Components

#### `/src/components/course-form-dialog.tsx`

- Added `title` field to `onSubmit` callback interface
- Updated form submission to pass both `name` and `title` fields

## Database Schema Mapping

### Supabase `courses` table → `DomainCourse` type

```typescript
{
  professor_id → professorId
  student_count → studentCount
  start_at → startAt (Date)
  end_at → endAt (Date)
  created_at → createdAt (Date)
  updated_at → updatedAt (Date)
  inboxes → inboxes (JSON)
}
```

## Benefits

### 1. Automatic Caching

- TanStack Query automatically caches course data
- Reduces unnecessary network requests
- Improves app performance

### 2. Optimistic Updates

- Mutations support optimistic UI updates
- Better user experience with instant feedback

### 3. Automatic Refetching

- Data automatically refetches when stale
- Window focus refetching
- Network reconnection refetching

### 4. Error Handling

- Built-in error states
- Automatic retry logic
- Better error recovery

### 5. Loading States

- Automatic loading state management
- No manual `isLoading` state needed
- Built-in suspense support

### 6. Type Safety

- Full TypeScript support with Supabase types
- Type inference from database schema
- Compile-time type checking

## Usage Examples

### Fetch all courses for current user

```typescript
const { user } = useCurrentUser();
const { data: courses, isLoading, error } = useCourses(user?.id);
```

### Fetch single course

```typescript
const { data: course, isLoading } = useCourse(courseId);
```

### Create course

```typescript
const { mutateAsync: createCourse } = useCreateCourse();

await createCourse([
  {
    name: 'Algebra I',
    title: 'Algebra I',
    description: 'Introduction to algebra',
    context: 'Detailed course context...',
    professor_id: user.id,
    year: '2025',
    student_count: 30,
  },
]);
```

### Update course

```typescript
const { mutateAsync: updateCourse } = useUpdateCourse();

await updateCourse({
  id: courseId,
  name: 'Updated Name',
  description: 'Updated description',
  student_count: 35,
});
```

### Delete course

```typescript
const { mutateAsync: deleteCourse } = useDeleteCourse();

await deleteCourse({ id: courseId });
```

### Count courses

```typescript
const { data: count } = useCoursesCount(professorId);
```

## Next Steps

### Recommended Improvements

1. **Add Optimistic Updates**
   - Implement optimistic UI updates for mutations
   - Show immediate feedback before server confirmation

2. **Add Pagination**
   - Implement cursor or offset pagination for large course lists
   - Use `useInfiniteQuery` for infinite scroll

3. **Add Search/Filter**
   - Add course search functionality
   - Filter by year, status, or other criteria

4. **Error Boundaries**
   - Add error boundaries for better error handling
   - Show user-friendly error messages

5. **Cache Invalidation**
   - Fine-tune cache invalidation strategies
   - Add manual refetch triggers when needed

6. **Prefetching**
   - Prefetch course details on hover
   - Improve perceived performance

## Testing

### Manual Testing Checklist

- [x] View courses list page
- [x] Create new course
- [x] Edit existing course
- [x] Delete course
- [x] View course details
- [x] Verify proper loading states
- [x] Verify error handling

### Regression Testing

- [ ] Verify Gmail integration still works
- [ ] Verify email analysis still works
- [ ] Verify all course-related features work

## References

- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Supabase Cache Helpers](https://github.com/psteinroe/supabase-cache-helpers)
- [Project TanStack Query Patterns](./TANSTACK_QUERY_IMPLEMENTATION_SUMMARY.md)
