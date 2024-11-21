"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GameRecommendation } from "./game/GameRecommendation";
import { useEvent } from "@/hooks/useEvent";

export function EventDashboard({ eventId }: { eventId: string }) {
  const { event, loading } = useEvent(eventId);

  if (loading) {
    return <div>로딩 중...</div>;
  }

  if (!event) {
    return <div>행사 정보를 찾을 수 없습니다.</div>;
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
        <GameRecommendation eventType={event.location} />
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
