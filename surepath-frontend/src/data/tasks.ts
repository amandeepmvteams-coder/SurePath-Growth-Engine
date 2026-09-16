import { Task } from "@/types/task-types";

export const tasks: Task[] = [
  {
    id: 1,
    merchantId: 5,
    title: "Follow up with Allbirds",
    dueDate: "2026-09-08",
    completed: false,
    assignee: "Admin",
  },
  {
    id: 2,
    merchantId: 6,
    title: "Send proposal",
    dueDate: "2026-09-09",
    completed: false,
    assignee: "Admin",
  },
  {
    id: 3,
    merchantId: 7,
    title: "Prepare demo",
    dueDate: "2026-09-12",
    completed: false,
    assignee: "John Doe",
  },
];