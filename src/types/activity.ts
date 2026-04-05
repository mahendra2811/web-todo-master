import type { Database } from './database';

export type ActivityLog = Database['public']['Tables']['activity_logs']['Row'];
export type ActivityAction = Database['public']['Enums']['activity_action'];
