export interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  type: "indoor" | "outdoor";
  createdAt: string;
}
