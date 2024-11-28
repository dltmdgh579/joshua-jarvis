"use server";

import { supabase } from "@/lib/supabase";
import { CreateProgramInput, Program } from "@/types/schedule";
import { APIResponse } from "@/types/api";

export async function createProgram(data: CreateProgramInput): Promise<APIResponse<Program>> {
  try {
    const { data: program, error } = await supabase
      .from("programs")
      .insert({
        event_id: data.eventId,
        name: data.name,
        duration: data.duration,
        type: data.type,
        category: data.category,
        location: data.location,
        description: data.description,
      })
      .select()
      .single();

    if (error) throw error;

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
        source: program.source_type
          ? {
              type: program.source_type,
              id: program.source_id,
            }
          : undefined,
      },
    };
  } catch (error) {
    console.error("Error creating program:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "프로그램 생성 중 오류가 발생했습니다.",
    };
  }
}

export async function deleteProgram(programId: string): Promise<APIResponse<void>> {
  try {
    const { error } = await supabase.from("programs").delete().eq("id", programId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("Error deleting program:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "프로그램 삭제 중 오류가 발생했습니다.",
    };
  }
}

export async function updateProgram(
  programId: string,
  data: Omit<CreateProgramInput, "eventId">,
): Promise<APIResponse<Program>> {
  try {
    const { data: program, error } = await supabase
      .from("programs")
      .update({
        name: data.name,
        duration: data.duration,
        type: data.type,
        category: data.category,
        location: data.location,
        description: data.description,
      })
      .eq("id", programId)
      .select()
      .single();

    if (error) throw error;

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
        source: program.source_type
          ? {
              type: program.source_type,
              id: program.source_id,
            }
          : undefined,
      },
    };
  } catch (error) {
    console.error("Error updating program:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "프로그램 수정 중 오류가 발생했습니다.",
    };
  }
}

export async function getEventPrograms(eventId: string): Promise<APIResponse<Program[]>> {
  try {
    const { data: programs, error } = await supabase
      .from("programs")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return {
      success: true,
      data: programs.map((program) => ({
        id: program.id,
        name: program.name,
        duration: program.duration,
        type: program.type,
        category: program.category,
        location: program.location,
        description: program.description,
        source: program.source_type
          ? {
              type: program.source_type,
              id: program.source_id,
            }
          : undefined,
      })),
    };
  } catch (error) {
    console.error("Error fetching programs:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "프로그램 목록 조회 중 오류가 발생했습니다.",
    };
  }
}
