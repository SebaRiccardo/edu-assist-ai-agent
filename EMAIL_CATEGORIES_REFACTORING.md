# Email Categories Refactoring

## Overview
The email categorization system has been refactored from 10 specific categories to 7 more general categories that better align with academic email workflows.

## Category Changes

### Old Categories (10 categories)
```typescript
// ❌ Deprecated Categories
const oldCategories = [
  'student_question',        // Questions about course material
  'professor_inquiry',       // Communications from colleagues
  'administrative',          // Course logistics
  'assignment_submission',   // Assignment submissions
  'grade_inquiry',          // Questions about grades
  'office_hours',           // Meeting requests
  'course_feedback',        // Student feedback
  'technical_support',      // IT issues
  'parent_communication',   // Parent communications
  'general',                // Other
];
```

### New Categories (7 categories)
```typescript
// ✅ Current Categories
const categoryEnum = z.enum([
  'course_related',      // Directly related to course content
  'student_email',       // From students
  'staff_email',         // From colleagues or staff
  'administrative',      // Administrative matters
  'assignment',          // Assignment submissions or questions
  'grade_inquiry',       // Grade-related inquiries
  'other'               // Not related to course
]);

export type EmailCategoryType = z.infer<typeof categoryEnum>;
```

## Category Mapping

### Migration Guide

| Old Category | New Category | Notes |
|-------------|--------------|-------|
| `student_question` | `student_email` | All student emails consolidated |
| `professor_inquiry` | `staff_email` | Colleague/staff communications |
| `administrative` | `administrative` | ✅ No change |
| `assignment_submission` | `assignment` | Simplified name |
| `grade_inquiry` | `grade_inquiry` | ✅ No change |
| `office_hours` | `student_email` | Merged into student emails |
| `course_feedback` | `student_email` | Merged into student emails |
| `technical_support` | `other` | Non-course specific |
| `parent_communication` | `other` | Edge case, less common |
| `general` | `other` | ✅ Renamed for clarity |

## Updated UI Configuration

### Email Card Badge Configuration

```typescript
const emailCategoryConfig = {
  course_related: {
    label: 'Course Related',
    variant: 'default' as const,
    icon: '📚',
  },
  student_email: {
    label: 'Student Email',
    variant: 'info' as const,
    icon: '🎓',
  },
  staff_email: {
    label: 'Staff Email',
    variant: 'warning' as const,
    icon: '👨‍🏫',
  },
  administrative: {
    label: 'Administrative',
    variant: 'secondary' as const,
    icon: '📋',
  },
  assignment: {
    label: 'Assignment',
    variant: 'info' as const,
    icon: '📝',
  },
  grade_inquiry: {
    label: 'Grade Inquiry',
    variant: 'warning' as const,
    icon: '📊',
  },
  other: {
    label: 'Other',
    variant: 'secondary' as const,
    icon: '📧',
  },
};
```

## Category Descriptions

### 1. 📚 **course_related**
**Purpose:** Emails directly discussing course content, lectures, materials, or topics  
**Examples:**
- Questions about specific lectures or topics
- Discussion about course materials
- Requests for clarification on course concepts
- Course content feedback

**Badge:** Default variant, book icon

---

### 2. 🎓 **student_email**
**Purpose:** General communications from students  
**Examples:**
- General questions from students
- Office hours requests
- Personal concerns affecting coursework
- Course feedback
- Meeting scheduling

**Badge:** Info variant, graduation cap icon

**Consolidates:**
- Old `student_question`
- Old `office_hours`
- Old `course_feedback`

---

### 3. 👨‍🏫 **staff_email**
**Purpose:** Communications from academic colleagues, department staff, or administrators  
**Examples:**
- Emails from other professors
- Department communications
- TA communications
- Academic staff inquiries

**Badge:** Warning variant, teacher icon

**Replaces:** Old `professor_inquiry`

---

### 4. 📋 **administrative**
**Purpose:** Course logistics, policies, and administrative matters  
**Examples:**
- Room changes
- Schedule updates
- Policy notifications
- Enrollment issues
- Course registration

**Badge:** Secondary variant, clipboard icon

**No change from old system**

---

### 5. 📝 **assignment**
**Purpose:** Anything related to assignments  
**Examples:**
- Assignment submissions
- Extension requests
- Assignment clarification questions
- Late submission notifications
- Assignment grading questions

**Badge:** Info variant, pencil icon

**Replaces:** Old `assignment_submission` (simplified name)

---

### 6. 📊 **grade_inquiry**
**Purpose:** Questions and discussions about grades and grading  
**Examples:**
- Grade questions
- Exam score inquiries
- Grading clarifications
- Grade disputes
- Regrade requests

**Badge:** Warning variant, chart icon

**No change from old system**

---

### 7. 📧 **other**
**Purpose:** Emails not related to the course or unclassifiable  
**Examples:**
- Spam
- Unrelated department emails
- Technical support issues
- Parent communications (rare in university setting)
- Misdirected emails

**Badge:** Secondary variant, email icon

**Replaces:** Old `general`, `technical_support`, `parent_communication`

## Benefits of Refactoring

### 1. **Simplified Categorization**
- ✅ Fewer categories = easier for AI to classify correctly
- ✅ Higher confidence scores
- ✅ Less ambiguity between categories

### 2. **Better Alignment with Academic Workflows**
- ✅ Categories match how professors naturally think about emails
- ✅ More actionable groupings
- ✅ Clearer priority signals

### 3. **Improved Consolidation**
- ✅ `student_email` captures all student communications
- ✅ `assignment` covers all assignment-related items
- ✅ `other` catches edge cases without cluttering main categories

### 4. **Reduced Overhead**
- ✅ Less prompt engineering required
- ✅ Faster AI processing
- ✅ Simpler UI components

### 5. **Easier to Extend**
- ✅ Clear category boundaries
- ✅ Easy to add new categories if needed
- ✅ Maintains backward compatibility through mapping

## AI Prompt Updates

### Categorization Guidelines

The AI agent now uses these simplified guidelines:

```
Categorization Guidelines:
- **course_related**: Email directly discusses course content, lectures, materials
- **student_email**: From students asking questions or making requests
- **staff_email**: From academic colleagues, department staff, or administrators
- **administrative**: Course logistics, room changes, schedules, policies
- **assignment**: Assignment submissions, extensions, clarifications
- **grade_inquiry**: Questions about grades, grading, exam scores
- **other**: Unrelated to the course or spam
```

### Label Suggestions

The AI suggests Gmail labels based on category:

| Category | Example Label Suggestions |
|----------|--------------------------|
| `course_related` | `CS101-CourseContent`, `Physics-Lectures` |
| `student_email` | `CS101-Students`, `Math-StudentQuestions` |
| `staff_email` | `CS101-Staff`, `Department-Faculty` |
| `administrative` | `CS101-Admin`, `Course-Logistics` |
| `assignment` | `CS101-Assignments`, `Homework-Submissions` |
| `grade_inquiry` | `CS101-Grades`, `Exam-Questions` |
| `other` | `Unrelated`, `Spam`, `Misc` |

## TypeScript Types

### Updated Type Definition

```typescript
// src/types/index.ts
export interface CategorizedEmail extends TransformedEmail {
  category: 'course_related' | 'student_email' | 'staff_email' | 
            'administrative' | 'assignment' | 'grade_inquiry' | 'other';
  isRelated: boolean;
  suggestedLabel: string;
  confidence: number;
  reasoning: string;
}
```

### Zod Schema

```typescript
// src/agents/analyze-inbox.ts
const categoryEnum = z.enum([
  'course_related',
  'student_email',
  'staff_email',
  'administrative',
  'assignment',
  'grade_inquiry',
  'other'
]).describe('The category of the email');

export type EmailCategoryType = z.infer<typeof categoryEnum>;
```

## Migration Checklist

- ✅ Updated Zod schema in `/src/agents/analyze-inbox.ts`
- ✅ Updated TypeScript types in `/src/types/index.ts`
- ✅ Updated UI config in `/src/components/email-card.tsx`
- ✅ Updated AI prompts with new categorization guidelines
- ✅ Updated label suggestion logic
- ✅ Tested with sample emails
- ✅ Documentation created

## Testing Recommendations

### Test Cases for Each Category

1. **course_related**
   ```
   Subject: "Question about today's lecture on binary search"
   Body: "Hi Professor, I didn't understand the time complexity..."
   Expected: course_related, high confidence
   ```

2. **student_email**
   ```
   Subject: "Office hours availability"
   Body: "Hi, are you available for office hours this week?"
   Expected: student_email, high confidence
   ```

3. **staff_email**
   ```
   Subject: "Department meeting next week"
   From: colleague@university.edu
   Expected: staff_email, high confidence
   ```

4. **administrative**
   ```
   Subject: "Room change for CS101"
   Body: "Please note the room has changed to Building 3..."
   Expected: administrative, high confidence
   ```

5. **assignment**
   ```
   Subject: "Assignment 3 submission"
   Body: "Attached is my completed Assignment 3..."
   Expected: assignment, high confidence
   ```

6. **grade_inquiry**
   ```
   Subject: "Question about midterm grade"
   Body: "I noticed my grade is different from what I expected..."
   Expected: grade_inquiry, high confidence
   ```

7. **other**
   ```
   Subject: "IT password reset"
   Body: "Your university password will expire in 7 days..."
   Expected: other, high confidence
   ```

## Future Enhancements

### Potential Category Additions

If needed, these categories could be added in the future:

- `exam_related` - Separate from assignments
- `project` - For larger projects vs homework
- `attendance` - For attendance-related emails
- `recommendation` - Letter of recommendation requests

### Subcategories

Could add subcategorization within main categories:

```typescript
interface CategoryWithSubtype {
  category: EmailCategoryType;
  subtype?: 'question' | 'request' | 'submission' | 'notification';
}
```

## Rollback Plan

If needed, the old 10-category system can be restored:

1. Revert `/src/agents/analyze-inbox.ts` categoryEnum
2. Revert `/src/types/index.ts` CategorizedEmail type
3. Revert `/src/components/email-card.tsx` config
4. Revert AI prompt guidelines

All changes are isolated to these 3 files.

---

**Last Updated:** October 4, 2025  
**Version:** 2.0  
**Status:** ✅ Implemented and tested
