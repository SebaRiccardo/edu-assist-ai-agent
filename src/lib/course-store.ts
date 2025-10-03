import { Course } from '@/types';

// In-memory storage for courses
let courses: Course[] = [
  {
    id: 'course-1',
    name: 'Algebra I',
    title: 'Algebra I',
    description: 'Introduction to algebraic concepts including linear equations, polynomials, factoring, quadratic equations, and functions. This is a foundational course for students beginning their study of advanced mathematics. Topics include: solving equations, graphing linear functions, working with exponents, and understanding mathematical patterns.',
    professorId: 'prof-123',
    studentCount: 32,
    unreadEmailCount: 5,
    createdAt: new Date('2024-09-01'),
    updatedAt: new Date('2024-09-01'),
  },
  {
    id: 'course-2',
    name: 'Calculus II',
    title: 'Calculus II',
    description: 'Advanced calculus covering integration techniques, applications of integrals, sequences and series, parametric equations, and polar coordinates. Prerequisites include Calculus I. Students will learn advanced integration methods, infinite series, Taylor series, and their applications in physics and engineering.',
    professorId: 'prof-123',
    studentCount: 28,
    unreadEmailCount: 3,
    createdAt: new Date('2024-09-01'),
    updatedAt: new Date('2024-09-01'),
  },
  {
    id: 'course-3',
    name: 'Linear Algebra',
    title: 'Linear Algebra',
    description: 'Study of vector spaces, linear transformations, matrices, determinants, eigenvalues and eigenvectors. Applications to computer science and engineering. Topics include: systems of linear equations, matrix operations, vector spaces, linear independence, basis and dimension, orthogonality, and diagonalization.',
    professorId: 'prof-123',
    studentCount: 25,
    unreadEmailCount: 7,
    createdAt: new Date('2024-09-01'),
    updatedAt: new Date('2024-09-01'),
  },
];

// CRUD operations
export const courseStore = {
  // Get all courses for a professor
  getCourses(professorId: string): Course[] {
    return courses.filter(course => course.professorId === professorId);
  },

  // Get a single course by ID
  getCourse(courseId: string): Course | undefined {
    return courses.find(course => course.id === courseId);
  },

  // Create a new course
  createCourse(course: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>): Course {
    const newCourse: Course = {
      ...course,
      id: `course-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    courses.push(newCourse);
    return newCourse;
  },

  // Update an existing course
  updateCourse(courseId: string, updates: Partial<Omit<Course, 'id' | 'createdAt' | 'professorId'>>): Course | null {
    const index = courses.findIndex(course => course.id === courseId);
    if (index === -1) return null;

    courses[index] = {
      ...courses[index],
      ...updates,
      updatedAt: new Date(),
    };
    return courses[index];
  },

  // Delete a course
  deleteCourse(courseId: string): boolean {
    const index = courses.findIndex(course => course.id === courseId);
    if (index === -1) return false;

    courses.splice(index, 1);
    return true;
  },

  // Update unread email count
  updateUnreadCount(courseId: string, count: number): void {
    const course = courses.find(c => c.id === courseId);
    if (course) {
      course.unreadEmailCount = count;
      course.updatedAt = new Date();
    }
  },
};
