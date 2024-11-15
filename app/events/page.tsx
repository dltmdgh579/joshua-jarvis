"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import CreateEventDialog from "@/components/events/CreateEventDialog";
import { Event } from "@/types/event";

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">행사 관리</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />새 행사 만들기
        </Button>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12 text-gray-500">아직 등록된 행사가 없습니다. 새 행사를 만들어보세요!</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <Card key={event.id} className="p-4 hover:shadow-lg transition-shadow">
              <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
              <div className="text-sm text-gray-600">
                <p>일자: {new Date(event.date).toLocaleDateString()}</p>
                <p>장소: {event.location}</p>
                <p>유형: {event.type === "indoor" ? "실내" : "야외"}</p>
              </div>
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => (window.location.href = `/events/${event.id}`)}
              >
                대시보드 보기
              </Button>
            </Card>
          ))}
        </div>
      )}

      <CreateEventDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onEventCreate={(newEvent) => setEvents([...events, newEvent])}
      />
    </div>
  );
}
