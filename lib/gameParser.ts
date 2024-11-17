import { Game, GameCategory } from "@/types/game";

interface ParsedGame {
  name: string;
  description: string;
  players: {
    min: number;
    max: number;
  };
  duration: number;
  materials: string[];
  rules: string[];
}

export function parseGameFromMarkdown(markdown: string): ParsedGame[] {
  const games: ParsedGame[] = [];
  const gameBlocks = markdown.split(/(?=\d+\.\s*이름:)/);

  for (const block of gameBlocks) {
    console.log(block);
    if (!block.trim()) continue;

    const game: Partial<ParsedGame> = {
      materials: [],
      rules: [],
    };

    const lines = block.split("\n");
    let currentSection: "rules" | "materials" | null = null;
    let collectingRules = false;

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      // 게임 이름 파싱
      if (trimmedLine.match(/이름:\s*"([^"]+)"/)) {
        const nameMatch = trimmedLine.match(/이름:\s*"([^"]+)"/);
        if (nameMatch) {
          game.name = nameMatch[1].trim();
        }
        continue;
      }

      // 게임 설명 파싱
      if (trimmedLine.startsWith("- 설명:")) {
        game.description = trimmedLine.replace("- 설명:", "").trim();
        continue;
      }

      // 인원 파싱
      if (trimmedLine.startsWith("- 필요 인원:")) {
        const playersText = trimmedLine.replace("- 필요 인원:", "").trim();
        const playerCount = parseInt(playersText);
        if (!isNaN(playerCount)) {
          game.players = {
            min: Math.floor(playerCount * 0.5), // 최소 인원을 전체 인원의 50%로 설정
            max: playerCount,
          };
        }
        continue;
      }

      // 소요 시간 파싱
      if (trimmedLine.startsWith("- 소요 시간:")) {
        const durationText = trimmedLine.replace("- 소요 시간:", "").trim();
        const durationMatch = durationText.match(/(\d+)/);
        if (durationMatch) {
          game.duration = parseInt(durationMatch[1]);
        }
        continue;
      }

      // 준비물 파싱
      if (trimmedLine.startsWith("- 준비물:")) {
        const materialsText = trimmedLine.replace("- 준비물:", "").trim();
        if (materialsText && materialsText.toLowerCase() !== "없음") {
          game.materials = materialsText.split(",").map((item) => item.trim());
        }
        continue;
      }

      // 진행 방법 파싱
      if (trimmedLine.startsWith("- 진행 방법:")) {
        collectingRules = true;
        continue;
      }

      // 진행 방법 내용 수집
      if (collectingRules) {
        const ruleMatch = trimmedLine.match(/\d+\)\s*(.+)/);
        if (ruleMatch) {
          if (!game.rules) {
            game.rules = [];
          }
          game.rules.push(ruleMatch[1].trim());
        }
      }
    }

    if (game.name && game.description && game.players && game.duration) {
      games.push(game as ParsedGame);
    }
  }

  return games;
}

// Game 인터페이스로 변환하는 헬퍼 함수 추가
export function convertToGame(
  parsedGame: ParsedGame,
  category: GameCategory,
  location: "indoor" | "outdoor" | "both",
): Game {
  return {
    id: crypto.randomUUID(), // 임시 ID 생성
    name: parsedGame.name,
    category,
    description: parsedGame.description,
    minPlayers: parsedGame.players.min,
    maxPlayers: parsedGame.players.max,
    duration: parsedGame.duration,
    location,
    materials: parsedGame.materials,
    rules: parsedGame.rules,
  };
}
