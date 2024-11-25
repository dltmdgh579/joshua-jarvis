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

export interface MemoAIContent {
  id: string;
  memoId: string;
  type: "summary" | "suggestions";
  content: string;
  createdAt: Date;
  updatedAt: Date;
}
