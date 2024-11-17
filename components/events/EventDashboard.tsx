"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Event } from "@/types/event";
import { supabase } from "@/lib/supabase";

export function EventDashboard({ eventId }: { eventId: string }) {
  const [event, setEvent] = useState<Event | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      const { data } = await supabase.from("events").select("*").eq("id", eventId).single();
      if (data) {
        setEvent(data as Event);
      }
    };

    fetchEvent();
  }, [eventId]);

  if (!event) {
    return <div>로딩 중...</div>;
  }

  return (
    <Tabs defaultValue="games" className="w-full">
      <TabsList className="w-full justify-start">
        <TabsTrigger value="games">게임 추천</TabsTrigger>
        <TabsTrigger value="schedule">일정표</TabsTrigger>
        <TabsTrigger value="checklist">체크리스트</TabsTrigger>
        <TabsTrigger value="notes">메모</TabsTrigger>
      </TabsList>

      <TabsContent value="games" className="mt-4">
        <div className="p-4 border rounded-lg">
          <h3 className="text-lg font-semibold mb-4">추천 게임</h3>
          <p className="text-gray-500">아직 추천된 게임이 없습니다.</p>
        </div>
      </TabsContent>

      <TabsContent value="schedule" className="mt-4">
        <div className="p-4 border rounded-lg">
          <h3 className="text-lg font-semibold mb-4">일정표</h3>
          <p className="text-gray-500">아직 등록된 일정이 없습니다.</p>
        </div>
      </TabsContent>

      <TabsContent value="checklist" className="mt-4">
        <div className="p-4 border rounded-lg">
          <h3 className="text-lg font-semibold mb-4">체크리스트</h3>
          <p className="text-gray-500">아직 등록된 체크리스트가 없습니다.</p>
        </div>
      </TabsContent>

      <TabsContent value="notes" className="mt-4">
        <div className="p-4 border rounded-lg">
          <h3 className="text-lg font-semibold mb-4">메모</h3>
          <p className="text-gray-500">아직 등록된 메모가 없습니다.</p>
        </div>
      </TabsContent>
    </Tabs>
  );
}
