import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY environment variable");
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

    const response = await openai.chat.completions.create({
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
