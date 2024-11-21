"use server";

import { supabase } from "@/lib/supabase";
import { Event } from "@/types/event";
import { Game, GameCategory, GameLocation } from "@/types/game";

interface DatabaseGame {
  id: string;
  name: string;
  category: GameCategory;
  description: string;
  min_players: number;
  max_players: number;
  duration: number;
  location: GameLocation;
  materials: string[];
  rules: string[];
}

interface DatabaseEventGame {
  id: string;
  event_id: string;
  game_id: string;
  order_index: number;
  game: DatabaseGame;
}

interface FormattedEventGame {
  id: string;
  eventId: string;
  gameId: string;
  orderIndex: number;
  game: Game;
}

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

export async function registerGamesToEvent(eventId: string, gameIds: string[]) {
  try {
    // 게임 순서를 위한 배열 생성
    const gameEntries = gameIds.map((gameId, index) => ({
      event_id: eventId,
      game_id: gameId,
      order_index: index,
    }));

    const { data, error } = await supabase.from("event_games").insert(gameEntries).select();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error("Error registering games:", error);
    return { success: false, error };
  }
}

export async function getEventGames(eventId: string) {
  try {
    const { data, error } = await supabase
      .from("event_games")
      .select(
        `
        id,
        event_id,
        game_id,
        order_index,
        game:games (
          id,
          name,
          category,
          description,
          min_players,
          max_players,
          duration,
          location,
          materials,
          rules
        )
      `,
      )
      .eq("event_id", eventId)
      .order("order_index");

    if (error) throw error;

    const rawData = data as unknown as DatabaseEventGame[];

    const formattedData: FormattedEventGame[] = rawData.map((item) => ({
      id: item.id,
      eventId: item.event_id,
      gameId: item.game_id,
      orderIndex: item.order_index,
      game: {
        id: item.game.id,
        name: item.game.name,
        category: item.game.category,
        description: item.game.description,
        minPlayers: item.game.min_players,
        maxPlayers: item.game.max_players,
        duration: item.game.duration,
        location: item.game.location as GameLocation,
        materials: item.game.materials || [],
        rules: item.game.rules || [],
      },
    }));

    return { success: true, data: formattedData };
  } catch (error) {
    console.error("Error fetching event games:", error);
    return { success: false, error };
  }
}

export async function unregisterGameFromEvent(eventId: string, eventGameId: string) {
  try {
    const { error } = await supabase.from("event_games").delete().eq("id", eventGameId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}

export async function getEvent(eventId: string) {
  try {
    const { data, error } = await supabase.from("events").select("*").eq("id", eventId).single();

    if (error) throw error;

    return {
      success: true,
      data: {
        ...data,
        date: new Date(data.date),
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      } as Event,
    };
  } catch (error) {
    console.error("Error fetching event:", error);
    return { success: false, error };
  }
}
