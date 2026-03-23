/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface BookmarkTopic {
  id: string;
  content: string;
}

export interface Task {
  id: string;
  name: string;
  condition: string;
  reward: number; // Number of book flips
  limit: number; // Daily limit
  type: 'basic' | 'content' | 'voice';
  category: 'daily' | 'once' | 'unlimited';
  completedCount: number;
}

export interface Reward {
  id: string;
  name: string;
  type: 'virtual' | 'vip' | 'flip_again';
  description: string;
  icon: string;
}

export interface Book {
  id: number;
  title: string;
  points: number; // Current points (0-3)
}

export interface UserState {
  flipChances: number;
  totalLightingPoints: number;
  books: Book[];
  dailyCardId: string | null;
  lastCardDate: string | null;
  completedTasks: Record<string, number>; // taskId -> count
  rewards: Reward[];
  personalCharityValue: number;
}
