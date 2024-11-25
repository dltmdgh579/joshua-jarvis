"use server";

import { openai, isOpenAIAvailable } from "@/lib/openai";

export async function generateMemoAIContent(content: string, type: "summary" | "suggestions") {
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
      data: response.choices[0].message.content,
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
