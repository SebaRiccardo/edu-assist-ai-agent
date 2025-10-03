import { Course, Professor } from '@/types';

// Mock professor - in production this would come from auth session
export const mockProfessor: Professor = {
  id: 'prof-123',
  name: 'Dr. Sarah Johnson',
  email: 'sarah.johnson@university.edu',
};

// Mock courses - in production this would come from Supabase
export const mockCourses: Course[] = [
  {
    id: 'course-1',
    name: 'Algebra I',
    professorId: 'prof-123',
    context: 'Introduction to algebraic concepts including linear equations, polynomials, factoring, quadratic equations, and functions. This is a foundational course for students beginning their study of advanced mathematics.',
    createdAt: new Date('2024-09-01'),
  },
  {
    id: 'course-2',
    name: 'Calculus II',
    professorId: 'prof-123',
    context: 'Advanced calculus covering integration techniques, applications of integrals, sequences and series, parametric equations, and polar coordinates. Prerequisites include Calculus I.',
    createdAt: new Date('2024-09-01'),
  },
  {
    id: 'course-3',
    name: 'Linear Algebra',
    professorId: 'prof-123',
    context: 'Study of vector spaces, linear transformations, matrices, determinants, eigenvalues and eigenvectors. Applications to computer science and engineering.',
    createdAt: new Date('2024-09-01'),
  },
];

// Helper function to get course by ID
export function getCourseById(courseId: string): Course | undefined {
  return mockCourses.find(course => course.id === courseId);
}

// Helper function to get all courses for a professor
export function getCoursesByProfessor(professorId: string): Course[] {
  return mockCourses.filter(course => course.professorId === professorId);
}
