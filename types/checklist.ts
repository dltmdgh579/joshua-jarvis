export interface ChecklistItem {
  id: string;
  checklistId: string;
  title: string;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Checklist {
  id: string;
  eventId: string;
  title: string;
  dueDate: Date;
  isCompleted: boolean;
  items: ChecklistItem[];
  createdAt: Date;
  updatedAt: Date;
}
