import { DomainCourse, Professor } from '@/types';

// Mock professor - in production this would come from auth session
export const mockProfessor: Professor = {
  id: 'prof-123',
  name: 'Dr. Sarah Johnson',
  email: 'sarah.johnson@university.edu',
};

// Mock courses - in production this would come from Supabase
export const mockCourses: DomainCourse[] = [
  {
    id: 'course-1',
    name: 'Algebra I',
    title: 'Algebra I - Introduction to Algebraic Concepts',
    description:
      'Introduction to algebraic concepts including linear equations, polynomials, factoring, quadratic equations, and functions. This is a foundational course for students beginning their study of advanced mathematics.',
    professorId: 'prof-123',
    studentCount: 28,
    unreadEmailCount: 5,
    createdAt: new Date('2024-09-01'),
    updatedAt: new Date('2024-09-01'),
  },
  {
    id: 'course-2',
    name: 'Calculus II',
    title: 'Calculus II - Advanced Integration and Series',
    description:
      'Advanced calculus covering integration techniques, applications of integrals, sequences and series, parametric equations, and polar coordinates. Prerequisites include Calculus I.',
    professorId: 'prof-123',
    studentCount: 32,
    unreadEmailCount: 3,
    createdAt: new Date('2024-09-01'),
    updatedAt: new Date('2024-09-01'),
  },
  {
    id: 'course-3',
    name: 'Linear Algebra',
    title: 'Linear Algebra - Vectors and Matrices',
    description:
      'Study of vector spaces, linear transformations, matrices, determinants, eigenvalues and eigenvectors. Applications to computer science and engineering.',
    professorId: 'prof-123',
    studentCount: 25,
    unreadEmailCount: 7,
    createdAt: new Date('2024-09-01'),
    updatedAt: new Date('2024-09-01'),
  },
];

// Helper function to get course by ID
export function getCourseById(courseId: string): DomainCourse | undefined {
  return mockCourses.find(course => course.id === courseId);
}

// Helper function to get all courses for a professor
export function getCoursesByProfessor(professorId: string): DomainCourse[] {
  return mockCourses.filter(course => course.professorId === professorId);
}
