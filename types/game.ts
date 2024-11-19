export type GameCategory =
  | "icebreaker" // 아이스브레이킹
  | "team" // 팀 게임
  | "individual" // 개인 게임
  | "quiet" // 정적인 게임
  | "active" // 활동적인 게임
  | "spiritual"; // 영적인 게임

export interface Game {
  id: string;
  name: string;
  category: GameCategory;
  minPlayers: number;
  maxPlayers: number;
  duration: number; // 분 단위
  location: GameLocation;
  description: string;
  materials?: string[];
  rules: string[];
}

export type GameLocation = "indoor" | "outdoor" | "both";
