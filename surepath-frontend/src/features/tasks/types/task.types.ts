export interface TaskAssignedTo {
  id: string;
  username: string;
  display_name: string | null;
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
  due_at: string | null;
  completed_at: string | null;
  created_by: string | null;
  created_at: string;
}

export interface CreateMerchantTaskData {
  title: string;
  notes?: string;
  assigned_to_id?: string;
  due_at?: string;
}

export interface UpdateMerchantTaskData {
  title?: string;
  notes?: string;
  assigned_to_id?: string | null;
  due_at?: string | null;
  completed?: boolean;
}