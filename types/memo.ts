export interface Memo {
  id: string;
  eventId: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMemoInput {
  eventId: string;
  title: string;
  content: string;
}
