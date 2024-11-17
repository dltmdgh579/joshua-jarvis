export interface Event {
  id: string;
  name: string;
  date: Date;
  location: string;
  type: "indoor" | "outdoor";
  status: "planning" | "in-progress" | "completed";
  createdAt: Date;
  updatedAt: Date;
}
