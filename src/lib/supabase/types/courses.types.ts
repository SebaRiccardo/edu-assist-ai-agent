import { Database } from './database.types';

export type Course = Database['public']['Tables']['courses']['Row'];
export type InsertCourse = Database['public']['Tables']['courses']['Insert'];
export type UpdateCourse = Database['public']['Tables']['courses']['Update'];
