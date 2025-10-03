// Mock types for our application
export interface Course {
  id: string;
  name: string;
  title: string; // Display title
  description: string; // Full description/context about the course
  professorId: string;
  studentCount: number; // Number of students enrolled
  unreadEmailCount: number; // Number of unread course-related emails
  createdAt: Date;
  updatedAt: Date;
}

export interface Professor {
  id: string;
  name: string;
  email: string;
}

export interface CategorizedEmail {
  id: string;
  from: string;
  subject: string;
  snippet: string;
  body: string;
  receivedAt: string;
  isUnread: boolean;
  courseId: string;
  courseName: string;
  emailType: 'student_question' | 'professor_inquiry' | 'general' | 'administrative';
  confidence: number; // 0-1 confidence score from AI
  reasoning: string; // AI explanation for categorization
  labels: string[];
}

export interface EmailAnalysisResult {
  isRelated: boolean;
  courseId: string;
  courseName: string;
  emailType: 'student_question' | 'professor_inquiry' | 'general' | 'administrative';
  confidence: number;
  reasoning: string;
}
