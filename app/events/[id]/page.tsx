import { supabase } from "@/lib/supabase";
import { EventDashboard } from "@/components/events/EventDashboard";
import { notFound } from "next/navigation";

export default async function EventPage({ params }: { params: { id: string } }) {
  const { data: event, error } = await supabase.from("events").select("*").eq("id", params.id).single();

  if (error || !event) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{event.name}</h1>
        <div className="text-sm text-gray-500">
          <p>{new Date(event.date).toLocaleDateString()}</p>
          <p>{event.location}</p>
          <p>{event.type === "indoor" ? "실내" : "야외"}</p>
        </div>
      </div>
      <EventDashboard eventId={event.id} />
    </div>
  );
}
