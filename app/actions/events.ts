"use server";

import { supabase } from "@/lib/supabase";
import { Event } from "@/types/event";

export async function createEvent(eventData: Omit<Event, "id" | "createdAt" | "updatedAt">) {
  try {
    const { data, error } = await supabase
      .from("events")
      .insert([
        {
          name: eventData.name,
          date: eventData.date,
          location: eventData.location,
          type: eventData.type,
          status: eventData.status,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    return { success: false, error };
  }
}

export async function getEvents() {
  try {
    const { data, error } = await supabase
      .from("events")
      .select(
        `
        id,
        name,
        date,
        location,
        type,
        status,
        created_at,
        updated_at
      `,
      )
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, error, data: [] };
    }

    if (!data) {
      return { success: false, error: new Error("No data returned"), data: [] };
    }

    const formattedData = data.map((event) => ({
      id: event.id,
      name: event.name,
      date: new Date(event.date),
      location: event.location,
      type: event.type,
      status: event.status,
      createdAt: new Date(event.created_at),
      updatedAt: new Date(event.updated_at),
    })) as Event[];

    return { success: true, data: formattedData };
  } catch (error) {
    return { success: false, error, data: [] };
  }
}
