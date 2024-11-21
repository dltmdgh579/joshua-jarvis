"use server";

import { supabase } from "@/lib/supabase";
import { Checklist, ChecklistItem } from "@/types/checklist";

export async function createChecklist(data: { eventId: string; title: string; dueDate: string }) {
  try {
    const formattedDate = new Date(data.dueDate).toISOString();

    const { data: checklist, error } = await supabase
      .from("checklists")
      .insert({
        event_id: data.eventId,
        title: data.title,
        due_date: formattedDate,
      })
      .select(
        `
        id,
        title,
        due_date,
        created_at,
        updated_at,
        items:checklist_items(*)
      `,
      )
      .single();

    if (error) throw error;

    return {
      success: true,
      data: {
        ...checklist,
        dueDate: new Date(checklist.due_date),
        createdAt: new Date(checklist.created_at),
        updatedAt: new Date(checklist.updated_at),
        items: checklist.items || [],
      },
    };
  } catch (error) {
    console.error("Error creating checklist:", error);
    return { success: false, error };
  }
}

export async function createChecklistItem(data: { checklistId: string; title: string }) {
  try {
    const { data: item, error } = await supabase
      .from("checklist_items")
      .insert({
        checklist_id: data.checklistId,
        title: data.title,
        is_completed: false,
      })
      .select(
        `
        id,
        title,
        is_completed,
        created_at,
        updated_at
      `,
      )
      .single();

    if (error) throw error;

    return {
      success: true,
      data: {
        id: item.id,
        title: item.title,
        isCompleted: item.is_completed,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
      },
    };
  } catch (error) {
    console.error("Error creating checklist item:", error);
    return { success: false, error };
  }
}

export async function getEventChecklists(eventId: string) {
  try {
    const { data: checklists, error: checklistsError } = await supabase
      .from("checklists")
      .select(
        `
        id,
        event_id,
        title,
        due_date,
        is_completed,
        created_at,
        updated_at,
        items:checklist_items (
          id,
          checklist_id,
          title,
          is_completed,
          created_at,
          updated_at
        )
      `,
      )
      .eq("event_id", eventId)
      .order("created_at", { ascending: false });

    if (checklistsError) throw checklistsError;

    return {
      success: true,
      data: checklists.map((checklist) => ({
        id: checklist.id,
        eventId: checklist.event_id,
        title: checklist.title,
        dueDate: new Date(checklist.due_date),
        isCompleted: checklist.is_completed,
        createdAt: new Date(checklist.created_at),
        updatedAt: new Date(checklist.updated_at),
        items: (checklist.items || []).map((item) => ({
          id: item.id,
          checklistId: item.checklist_id,
          title: item.title,
          isCompleted: item.is_completed,
          createdAt: new Date(item.created_at),
          updatedAt: new Date(item.updated_at),
        })),
      })),
    };
  } catch (error) {
    console.error("Error fetching checklists:", error);
    return { success: false, error };
  }
}

export async function updateChecklistItem(itemId: string, isCompleted: boolean) {
  try {
    const { error } = await supabase.from("checklist_items").update({ is_completed: isCompleted }).eq("id", itemId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("Error updating checklist item:", error);
    return { success: false, error };
  }
}

export async function deleteChecklist(checklistId: string) {
  try {
    const { error } = await supabase.from("checklists").delete().eq("id", checklistId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("Error deleting checklist:", error);
    return { success: false, error };
  }
}

export async function createChecklistSubItem(data: { checklistId: string; title: string }) {
  try {
    const { data: subItem, error } = await supabase
      .from("checklist_sub_items")
      .insert({
        checklist_id: data.checklistId,
        title: data.title,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data: {
        id: subItem.id,
        checklistId: subItem.checklist_id,
        title: subItem.title,
        isCompleted: subItem.is_completed,
        createdAt: new Date(subItem.created_at),
        updatedAt: new Date(subItem.updated_at),
      },
    };
  } catch (error) {
    console.error("Error creating checklist sub item:", error);
    return { success: false, error };
  }
}

export async function updateChecklistSubItem(subItemId: string, isCompleted: boolean) {
  try {
    const { error } = await supabase
      .from("checklist_sub_items")
      .update({ is_completed: isCompleted })
      .eq("id", subItemId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("Error updating checklist sub item:", error);
    return { success: false, error };
  }
}

export async function deleteChecklistSubItem(subItemId: string) {
  try {
    const { error } = await supabase.from("checklist_sub_items").delete().eq("id", subItemId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("Error deleting checklist sub item:", error);
    return { success: false, error };
  }
}

export async function updateChecklistItemStatus(itemId: string) {
  try {
    const { data: subItems, error: fetchError } = await supabase
      .from("checklist_sub_items")
      .select("is_completed")
      .eq("item_id", itemId);

    if (fetchError) throw fetchError;

    const isCompleted = subItems.length > 0 && subItems.every((item) => item.is_completed);

    const { error: updateError } = await supabase
      .from("checklist_items")
      .update({ is_completed: isCompleted })
      .eq("id", itemId);

    if (updateError) throw updateError;

    return { success: true };
  } catch (error) {
    console.error("Error updating checklist item status:", error);
    return { success: false, error };
  }
}

export async function deleteChecklistItem(itemId: string) {
  try {
    const { error } = await supabase.from("checklist_items").delete().eq("id", itemId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error("Error deleting checklist item:", error);
    return { success: false, error };
  }
}
