export type Task = {
  id: number;
  merchantId: number;
  title: string;
  dueDate: string | null;
  completed: boolean;
  assignee: string;
};