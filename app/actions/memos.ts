"use server";

import { supabase } from "@/lib/supabase";
import { CreateMemoInput, Memo } from "@/types/memo";
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
