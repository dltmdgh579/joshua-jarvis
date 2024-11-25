import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy-key",
});

export function isOpenAIAvailable() {
  return !!process.env.OPENAI_API_KEY;
}
