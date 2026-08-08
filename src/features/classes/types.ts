import type { Database } from '@/types/database';
import type { Trainer } from '@/features/trainers/types';

export type ClassSession = Database['public']['Tables']['class_sessions']['Row'];

export interface ClassSessionWithTrainer extends ClassSession {
  trainer: Trainer | null;
}
