import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Event } from "@/types/event";

export function useEvent(eventId: string) {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadEvent() {
      try {
        const { data, error } = await supabase.from("events").select("*").eq("id", eventId).single();

        if (error) throw error;

        if (data) {
          setEvent({
            ...data,
            date: new Date(data.date),
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
          });
        }
      } catch (e) {
        setError(e as Error);
      } finally {
        setLoading(false);
      }
    }

    loadEvent();
  }, [eventId]);

  return { event, loading, error };
}
