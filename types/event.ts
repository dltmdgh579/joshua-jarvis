export type EventStatus = "planning" | "inProgress" | "completed" | "cancelled";
export type EventLocation = "indoor" | "outdoor" | "both";

export interface Event {
  id: string;
  name: string;
  date: Date;
  location: EventLocation;
  type: EventType;
  status: EventStatus;
  createdAt: Date;
  updatedAt: Date;
}
export type EventType = "worship" | "fellowship" | "education" | "mission" | "other";
