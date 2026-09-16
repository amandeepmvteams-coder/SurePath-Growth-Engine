export interface TaskAssignedTo {
  id: string;
  username: string;
  display_name: string | null;
}

export interface TaskQueueFilters {
  assigned_to?: string;
  merchant_id?: string;
  open_only?: boolean;
  due_before?: Date;
  limit?: number;
}

export interface MerchantTask {
  id: string;
  merchant_id: string;

  merchant_domain: string;
  merchant_store_name: string | null;

  assigned_to_id: string | null;
  assigned_to: TaskAssignedTo | null;

  title: string;
  notes: string | null;

  due_at: Date | null;
  completed_at: Date | null;

  created_by: string | null;
  created_at: Date;
}

export interface CreateMerchantTaskData {
  title: string;
  notes?: string;
  assigned_to_id?: string;
  due_at?: Date;
  created_by: string;
}

export interface UpdateMerchantTaskData {
  title?: string;
  notes?: string;
  assigned_to_id?: string | null;
  due_at?: Date | null;
  completed?: boolean;
}


export interface MerchantTaskSummary {
    open: number;
    overdue: number;
    due_today: number;
    undated: number;
}