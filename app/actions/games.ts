"use server";

import { supabase } from "@/lib/supabase";
import { openai } from "@/lib/openai";
import { Game, GameCategory } from "@/types/game";

interface GameFilters {
  category: GameCategory;
  players: number;
  duration: number;
  location: "indoor" | "outdoor" | "both";
}

export async function getAIGameRecommendations(filters: GameFilters) {
  try {
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

    return {
      success: true,
      recommendations: completion.choices[0].message.content,
    };
  } catch (error) {
    console.error("Error getting AI recommendations:", error);
    return { success: false, error };
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
