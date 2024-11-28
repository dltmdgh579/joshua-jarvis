export type ProgramType = "indoor" | "outdoor" | "both";

export type ProgramCategory =
  | "game" // 게임
  | "worship" // 예배
  | "meal" // 식사
  | "qt" // 큐티
  | "ice_break" // 아이스브레이크
  | "praise" // 찬양
  | "lecture" // 강의/설교
  | "group" // 조별 활동
  | "rest" // 휴식
  | "etc"; // 기타

export interface Program {
  id: string;
  name: string;
  duration: number;
  type: ProgramType;
  category: ProgramCategory;
  location: string;
  description?: string;
  source?: {
    type: "game" | "memo";
    id: string;
  };
}

export interface ScheduleBlock extends Program {
  startTime?: string; // HH:mm 형식
  order?: number;
}

export interface CreateProgramInput {
  eventId: string;
  name: string;
  duration: number;
  type: ProgramType;
  category: ProgramCategory;
  location: string;
  description?: string;
  source?: {
    type: "game" | "memo";
    id: string;
  };
}
