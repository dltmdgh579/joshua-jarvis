"use server";

import { supabase } from "@/lib/supabase";
import { ScheduleBlock } from "@/types/schedule";
import { APIResponse } from "@/types/api";

// 일정표 블록 저장
export async function saveScheduleBlocks(eventId: string, blocks: ScheduleBlock[]): Promise<APIResponse<void>> {
  try {
    // 기존 블록 삭제
    await supabase.from("schedule_blocks").delete().eq("event_id", eventId);

    // 새로운 블록 추가
    if (blocks.length > 0) {
      const { error } = await supabase.from("schedule_blocks").insert(
        blocks.map((block, index) => ({
          event_id: eventId,
          program_id: block.id,
          start_time: block.startTime,
          order_index: index,
        })),
      );

      if (error) throw error;
    }

    return { success: true };
  } catch (error) {
    console.error("Error saving schedule blocks:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "일정표 저장 중 오류가 발생했습니다.",
    };
  }
}

// 일정표 블록 불러오기
export async function getScheduleBlocks(eventId: string): Promise<APIResponse<ScheduleBlock[]>> {
  try {
    // 블록과 프로그램 정보를 함께 조회
    const { data: blocks, error } = await supabase
      .from("schedule_blocks")
      .select(
        `
        *,
        program:programs (
          id,
          name,
          duration,
          type,
          category,
          location,
          description,
          source_type,
          source_id
        )
      `,
      )
      .eq("event_id", eventId)
      .order("order_index");

    if (error) throw error;

    return {
      success: true,
      data: blocks.map((block) => ({
        id: block.program.id,
        name: block.program.name,
        duration: block.program.duration,
        type: block.program.type,
        category: block.program.category,
        location: block.program.location,
        description: block.program.description,
        startTime: block.start_time,
        order: block.order_index,
        source: block.program.source_type
          ? {
              type: block.program.source_type,
              id: block.program.source_id,
            }
          : undefined,
      })),
    };
  } catch (error) {
    console.error("Error loading schedule blocks:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "일정표 불러오기 중 오류가 발생했습니다.",
    };
  }
}
