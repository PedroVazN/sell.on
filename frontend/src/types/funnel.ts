import { User } from '../services/api';
import { Client } from '../services/api';

export type OpportunityStatus = 'open' | 'won' | 'lost';
export type ActivityType = 'task' | 'call' | 'message';

export interface PipelineStage {
  _id: string;
  name: string;
  order: number;
  color: string;
  isWon: boolean;
  isLost: boolean;
  isDeleted?: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LossReason {
  _id: string;
  name: string;
  order: number;
  isDeleted?: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OpportunityActivity {
  _id: string;
  opportunity: string;
  type: ActivityType;
  title: string;
  due_at: string | null;
  completed_at: string | null;
  notes?: string;
  createdBy: User;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OpportunityHistoryEntry {
  _id: string;
  opportunity: string;
  user: User;
  action: 'created' | 'updated' | 'stage_changed' | 'status_changed' | 'converted';
  field?: string;
  oldValue?: unknown;
  newValue?: unknown;
  createdAt: string;
}

export interface Opportunity {
  _id: string;
  client: Client;
  responsible_user: User;
  stage: PipelineStage;
  title: string;
  estimated_value: number;
  win_probability: number;
  expected_close_date: string | null;
  lead_source: string;
  description?: string;
  next_activity_at: string | null;
  status: OpportunityStatus;
  loss_reason?: LossReason | null;
  converted_sale?: string | null;
  activities?: OpportunityActivity[];
  history?: OpportunityHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface FunnelFilters {
  sellerId?: string;
  stageId?: string;
  status?: OpportunityStatus;
  dateFrom?: string;
  dateTo?: string;
}

export type FunnelViewMode = 'kanban' | 'list';
