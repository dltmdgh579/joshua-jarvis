"use server";

import { supabase } from "@/lib/supabase";
import { openai } from "@/lib/openai";
import { Game, GameCategory } from "@/types/game";
import { APIResponse } from "@/types/api";
import { ProgramType } from "@/types/schedule";

interface GameFilters {
  category: GameCategory;
  players: number;
  duration: number;
  location: "indoor" | "outdoor" | "both";
}

export async function getAIGameRecommendations(filters: GameFilters) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key is not configured");
    }

    const prompt = `청년부 행사를 위한 게임을 추천해주세요.

조건:
- 카테고리: ${filters.category}
- 참여 인원: ${filters.players}명
- 소요 시간: ${filters.duration}분
- 장소: ${filters.location}

다음 형식으로 3개의 게임을 추천해주세요:
1. 이름: [게임 이름]
- 설명: (게임 방법과 목적을 간단히)
- 필요 인원: (최소-최대)
- 소요 시간: (분)
- 준비물: (필요한 경우)
- 진행 방법: (단계별로)

각 게임은 청년부 행사의 특성을 고려하여 재미있고 의미있는 활동이 되도록 해주세요.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "당신은 교회 청년부 행사 게임 전문가입니다. 주어진 조건에 맞는 최적의 게임을 추천해주세요.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    if (!completion.choices[0].message.content) {
      throw new Error("No response from OpenAI");
    }

    return {
      success: true,
      recommendations: completion.choices[0].message.content,
    };
  } catch (error) {
    console.error("Error getting AI recommendations:", error);

    // 사용자에게 더 명확한 에러 메시지 제공
    let errorMessage = "게임 추천을 가져오는데 실패했습니다.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
      recommendations: null,
    };
  }
}
export async function saveGame(game: Omit<Game, "id">) {
  try {
    const { data, error } = await supabase
      .from("games")
      .insert([
        {
          id: crypto.randomUUID(),
          name: game.name,
          category: game.category,
          description: game.description,
          min_players: game.minPlayers,
          max_players: game.maxPlayers,
          duration: game.duration,
          location: game.location,
          materials: game.materials,
          rules: game.rules,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error saving game:", error);
    return { success: false, error };
  }
}

export async function getGames() {
  try {
    const { data, error } = await supabase.from("games").select("*").order("created_at", { ascending: false });

    if (error) throw error;

    const formattedData = data?.map((game) => ({
      id: game.id,
      name: game.name,
      category: game.category,
      description: game.description,
      minPlayers: game.min_players,
      maxPlayers: game.max_players,
      duration: game.duration,
      location: game.location,
      materials: game.materials,
      rules: game.rules,
    }));

    return { success: true, data: formattedData };
  } catch (error) {
    console.error("Error fetching games:", error);
    return { success: false, error };
  }
}

export interface ScheduleGame {
  id: string;
  name: string;
  duration: number;
  type: ProgramType;
  location?: string;
  description?: string;
  created_at: string;
}

export async function getSavedGames(eventId: string): Promise<APIResponse<ScheduleGame[]>> {
  try {
    // event_games 테이블을 통해 이벤트에 저장된 게임 조회
    const { data, error } = await supabase
      .from("event_games")
      .select(
        `
        game:games (
          id,
          name,
          duration,
          location,
          description,
          created_at
        )
      `,
      )
      .eq("event_id", eventId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // 중첩된 game 객체를 풀어서 반환
    const games = data?.map((item) => item.game).filter(Boolean) || [];

    return {
      success: true,
      data: games,
    };
  } catch (error) {
    console.error("Error fetching saved games:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "저장된 게임 목록을 불러오는 중 오류가 발생했습니다.",
    };
  }
}
