"use server";

import { supabase } from "@/lib/supabase";
import { CreateMemoInput, Memo, MemoAIContent } from "@/types/memo";
import { APIResponse } from "@/types/api";
import { PostgrestError } from "@supabase/supabase-js";

export async function createMemo(data: CreateMemoInput): Promise<APIResponse<Memo>> {
  try {
    const { data: memo, error } = await supabase
      .from("memos")
      .insert({
        event_id: data.eventId,
        title: data.title,
        content: data.content,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data: {
        id: memo.id,
        eventId: memo.event_id,
        title: memo.title,
        content: memo.content,
        createdAt: new Date(memo.created_at),
        updatedAt: new Date(memo.updated_at),
      },
    };
  } catch (error) {
    console.error("Error creating memo:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "메모 생성 중 오류가 발생했습니다.",
    };
  }
}

export async function getEventMemos(eventId: string): Promise<APIResponse<Memo[]>> {
  try {
    const { data: memos, error } = await supabase
      .from("memos")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return {
      success: true,
      data: memos.map((memo) => ({
        id: memo.id,
        eventId: memo.event_id,
        title: memo.title,
        content: memo.content,
        createdAt: new Date(memo.created_at),
        updatedAt: new Date(memo.updated_at),
      })),
    };
  } catch (error) {
    console.error("Error fetching memos:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "메모 조회 중 오류가 발생했습니다.",
    };
  }
}

export async function deleteMemo(memoId: string): Promise<APIResponse<void>> {
  try {
    const { error } = await supabase.from("memos").delete().eq("id", memoId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("Error deleting memo:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "메모 삭제 중 오류가 발생했습니다.",
    };
  }
}

export async function updateMemo(memoId: string, data: { title: string; content: string }): Promise<APIResponse<void>> {
  try {
    const { error } = await supabase
      .from("memos")
      .update({
        title: data.title,
        content: data.content,
        updated_at: new Date().toISOString(),
      })
      .eq("id", memoId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("Error updating memo:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "메모 수정 중 오류가 발생했습니다.",
    };
  }
}

export async function saveMemoAIContent(
  memoId: string,
  type: "summary" | "suggestions",
  content: string,
): Promise<APIResponse<MemoAIContent>> {
  try {
    // 기존 AI 내용이 있는지 확인
    const { data: existing } = await supabase
      .from("memo_ai_contents")
      .select()
      .eq("memo_id", memoId)
      .eq("type", type)
      .single();

    let result;
    if (existing) {
      // 업데이트
      result = await supabase
        .from("memo_ai_contents")
        .update({
          content,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single();
    } else {
      // 새로 생성
      result = await supabase
        .from("memo_ai_contents")
        .insert({
          memo_id: memoId,
          type,
          content,
        })
        .select()
        .single();
    }

    if (result.error) throw result.error;

    return {
      success: true,
      data: {
        id: result.data.id,
        memoId: result.data.memo_id,
        type: result.data.type,
        content: result.data.content,
        createdAt: new Date(result.data.created_at),
        updatedAt: new Date(result.data.updated_at),
      },
    };
  } catch (error) {
    console.error("Error saving memo AI content:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "AI 내용 저장 중 오류가 발생했습니다.",
    };
  }
}

export async function getMemoAIContents(memoId: string): Promise<APIResponse<MemoAIContent[]>> {
  try {
    const { data, error } = await supabase.from("memo_ai_contents").select().eq("memo_id", memoId);

    if (error) throw error;

    return {
      success: true,
      data: data.map((item) => ({
        id: item.id,
        memoId: item.memo_id,
        type: item.type,
        content: item.content,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
      })),
    };
  } catch (error) {
    console.error("Error fetching memo AI contents:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "AI 내용 조회 중 오류가 발생했습니다.",
    };
  }
}
