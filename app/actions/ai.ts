"use server";

import { openai, isOpenAIAvailable } from "@/lib/openai";
import { APIResponse } from "@/types/api";
import { Program, ScheduleBlock } from "@/types/schedule";
import { supabase } from "@/lib/supabase";

interface GenerateScheduleInput {
  eventId: string;
  programs: Program[];
  startTime: string; // HH:mm 형식
  memo?: string;
}

export async function generateMemoAIContent(
  content: string,
  type: "summary" | "suggestions",
): Promise<APIResponse<string>> {
  if (!isOpenAIAvailable()) {
    return {
      success: false,
      error: "OpenAI API 키가 설정되지 않아 AI 기능을 사용할 수 없습니다.",
    };
  }

  try {
    const prompt =
      type === "summary"
        ? `다음 회의록/메모 내용을 간단히 요약해주세요:\n\n${content}\n\n핵심 내용만 간단명료하게 정리해주세요.`
        : `다음 회의록/메모 내용을 바탕으로 개선 아이디어나 추가로 고려해볼 사항을 제안해주세요:\n\n${content}\n\n실용적이고 구체적인 제안을 해주세요.`;

    const systemContent =
      type === "summary"
        ? "당신은 회의록과 메모를 요약하는 전문가입니다. 핵심 내용을 간단명료하게 정리해주세요."
        : "당신은 교회 청년부 행사 기획 전문가입니다. 메모 내용을 분석하여 실용적인 제안을 해주세요.";

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: systemContent,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return {
      success: true,
      data: response.choices[0].message.content || "",
    };
  } catch (error) {
    console.error(`Error generating memo ${type}:`, error);
    return {
      success: false,
      error: `AI ${type === "summary" ? "요약" : "제안"} 생성 중 오류가 발생했습니다.`,
    };
  }
}

export async function generateChecklist(
  eventTitle: string,
  checklistTitle: string,
  currentItems: string[], // 현재 체크리스트 항목들
  count: number = 5,
) {
  try {
    const prompt = `
        교회 청년부 행사 "${eventTitle}"의 "${checklistTitle}" 체크리스트에 대해 추가로 필요한 항목들을 추천해주세요.
  
        현재 체크리스트 항목:
        ${currentItems.map((item) => `- ${item}`).join("\n")}
  
        위 항목들을 검토하고, 보완/개선/추가로 필요한 사항을 정확히 ${count}개 추천해주세요.
        각 항목은 간단명료하게 작성하고, 줄바꿈으로 구분해주세요.
        
        한 번에 한 가지 일을 추천해 주세요.
        기존에 있는 항목에 무리한 보완/개선을 하지 말아주세요.
        
        앞에 '-' 나 '•' 같은 기호를 붙이지 말아주세요.
        기존 항목과 중복되지 않도록 해주세요.
        
        예시:
        장소 예약 확인
        참가자 명단 작성
        필요한 물품 구매
        ...
      `;

    const response = await openai!.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "당신은 교회 청년부 행사 준비를 돕는 전문가입니다. 기존 체크리스트를 검토하고 보완이 필요한 항목들을 추천해주세요.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const items = response.choices[0].message.content
      ?.split("\n")
      .filter((item) => item.trim().length > 0)
      .map((item) => item.replace(/^[-•\s]+/, "").trim())
      .slice(0, count);

    return items || [];
  } catch (error) {
    console.error("Error generating checklist:", error);
    throw error;
  }
}

export async function generateSchedule(input: GenerateScheduleInput): Promise<APIResponse<ScheduleBlock[]>> {
  try {
    const prompt = `
      청년부 행사의 일정표를 생성해주세요.
      시작 시간은 ${input.startTime}입니다.

      다음 프로그램들을 적절히 배치해주세요:
      ${input.programs.map((p) => `- ${p.name} (${p.duration}분, ${p.category}, ${p.type})`).join("\n")}

      ${input.memo ? `\n추가 고려사항:\n${input.memo}` : ""}

      다음 규칙을 지켜주세요:
      1. 프로그램 간에 적절한 휴식 시간을 배치해주세요.
      2. 실내/야외 활동이 연속되지 않도록 해주세요.
      3. 식사 시간은 적절한 시간대에 배치해주세요.
      4. 예배나 큐티는 가능한 아침에 배치해주세요.
      5. 게임은 너무 늦은 시간에 배치하지 마세요.

      JSON 형식으로 응답해주세요:
      [
        {
          "programId": "프로그램ID",
          "startTime": "HH:mm"
        },
        ...
      ]
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "당신은 교회 청년부 행사 일정표 생성을 도와주는 전문가입니다.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    const schedule = result.schedule || [];

    // AI 응답을 ScheduleBlock 형식으로 변환
    const blocks: ScheduleBlock[] = schedule.map((item: any) => {
      const program = input.programs.find((p) => p.id === item.programId);
      if (!program) throw new Error(`프로그램을 찾을 수 없습니다: ${item.programId}`);

      return {
        ...program,
        startTime: item.startTime,
      };
    });

    return {
      success: true,
      data: blocks,
    };
  } catch (error) {
    console.error("Error generating schedule:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "일정표 생성 중 오류가 발생했습니다.",
    };
  }
}

// 게임을 프로그램 블록으로 변환
export async function convertGameToProgram(eventId: string, gameId: string): Promise<APIResponse<Program>> {
  try {
    // 게임 정보 조회
    const { data: game, error: gameError } = await supabase.from("games").select("*").eq("id", gameId).single();

    if (gameError) throw gameError;
    if (!game) throw new Error("게임을 찾을 수 없습니다.");

    // 프로그램 생성
    const { data: program, error: createError } = await supabase
      .from("programs")
      .insert({
        event_id: eventId,
        name: game.name,
        duration: game.duration,
        type: game.type || "both", // type이 없을 경우 기본값 설정
        category: "game",
        location: game.location || "미정",
        description: game.description,
        source_type: "game",
        source_id: game.id,
      })
      .select()
      .single();

    if (createError) throw createError;

    return {
      success: true,
      data: {
        id: program.id,
        name: program.name,
        duration: program.duration,
        type: program.type,
        category: program.category,
        location: program.location,
        description: program.description,
        source: {
          type: "game",
          id: game.id,
        },
      },
    };
  } catch (error) {
    console.error("Error converting game to program:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "게임을 프로그램으로 변환하는 중 오류가 발생했습니다.",
    };
  }
}

// 메모 내용을 분석하여 프로그램 블록 생성
export async function analyzeMemoForPrograms(eventId: string, memoContent: string): Promise<APIResponse<Program[]>> {
  try {
    const prompt = `
      다음 메모 내용을 분석하여 프로그램 목록을 추출해주세요:

      ${memoContent}

      다음 형식의 JSON으로 응답해주세요:
      {
        "programs": [
          {
            "name": "프로그램명",
            "duration": 예상소요시간(분),
            "type": "indoor" 또는 "outdoor" 또는 "both",
            "category": "worship" 또는 "meal" 또는 "game" 등,
            "location": "장소",
            "description": "설명"
          }
        ]
      }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "당신은 교회 청년부 행사 프로그램을 분석하는 전문가입니다.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    const programs = result.programs || [];

    // 추출된 프로그램들을 데이터베이스에 저장
    const createdPrograms: Program[] = [];
    for (const program of programs) {
      const { data, error } = await supabase
        .from("programs")
        .insert({
          event_id: eventId,
          name: program.name,
          duration: program.duration,
          type: program.type,
          category: program.category,
          location: program.location,
          description: program.description,
          source_type: "memo",
        })
        .select()
        .single();

      if (error) throw error;

      createdPrograms.push({
        id: data.id,
        name: data.name,
        duration: data.duration,
        type: data.type,
        category: data.category,
        location: data.location,
        description: data.description,
        source: {
          type: "memo",
          id: data.id,
        },
      });
    }

    return {
      success: true,
      data: createdPrograms,
    };
  } catch (error) {
    console.error("Error analyzing memo:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "메모 분석 중 오류가 발생했습니다.",
    };
  }
}
