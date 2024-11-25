"use server";

import { supabase } from "@/lib/supabase";
import { CreateMemoInput, Memo } from "@/types/memo";

export async function createMemo(data: CreateMemoInput) {
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
        ...memo,
        createdAt: new Date(memo.created_at),
        updatedAt: new Date(memo.updated_at),
      },
    };
  } catch (error) {
    console.error("Error creating memo:", error);
    return { success: false, error };
  }
}

interface MemoResponse {
  success: boolean;
  data?: Memo[];
  error?: any;
}

export async function getEventMemos(eventId: string): Promise<MemoResponse> {
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
    return { success: false, error };
  }
}

export async function deleteMemo(memoId: string) {
  try {
    const { error } = await supabase.from("memos").delete().eq("id", memoId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("Error deleting memo:", error);
    return { success: false, error };
  }
}

export async function updateMemo(memoId: string, data: { title: string; content: string }) {
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
    return { success: false, error };
  }
}
