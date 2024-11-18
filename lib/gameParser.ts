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
    if (!block.trim()) continue;

    const game: Partial<ParsedGame> = {
      materials: [],
      rules: [],
    };

    const lines = block.split("\n");
    let collectingRules = false;

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      // 게임 이름 파싱 수정
      if (trimmedLine.match(/\d+\.\s*이름:\s*(.+)/)) {
        const nameMatch = trimmedLine.match(/\d+\.\s*이름:\s*(.+)/);
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

        // "X-Y명" 형식 체크
        const rangeMatch = playersText.match(/(\d+)\s*[-~]\s*(\d+)명?/);
        if (rangeMatch) {
          game.players = {
            min: parseInt(rangeMatch[1]),
            max: parseInt(rangeMatch[2]),
          };
        } else {
          // "X명" 형식 체크
          const singleMatch = playersText.match(/(\d+)명?/);
          if (singleMatch) {
            const maxPlayers = parseInt(singleMatch[1]);
            game.players = {
              min: Math.max(2, Math.floor(maxPlayers * 0.5)), // 최소 2명, 또는 최대 인원의 50%
              max: maxPlayers,
            };
          }
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

      // 진행 방법 내용 수집 수정
      if (collectingRules) {
        // 다른 섹션의 시작을 만나면 진행 방법 수집 중단
        if (trimmedLine.startsWith("-")) {
          collectingRules = false;
          continue;
        }

        // 숫자) 또는 숫자. 형식의 규칙 매칭
        const ruleMatch = trimmedLine.match(/^\s*\d+[\).]\s*(.+)/);
        if (ruleMatch) {
          if (!game.rules) game.rules = [];
          game.rules.push(ruleMatch[1].trim());
        } else if (trimmedLine && !trimmedLine.startsWith("-")) {
          // 들여쓰기된 내용도 이전 규칙의 일부로 처리
          if (!game.rules) game.rules = [];
          const lastRule = game.rules[game.rules.length - 1];
          if (lastRule) {
            game.rules[game.rules.length - 1] = `${lastRule} ${trimmedLine}`;
          }
        }
      }
    }

    if (game.name && game.description && game.players && game.duration) {
      // 빈 규칙 제거
      if (game.rules) {
        game.rules = game.rules.filter((rule) => rule.trim().length > 0);
      }
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
