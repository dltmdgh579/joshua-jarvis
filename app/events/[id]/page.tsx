import { EventDashboard } from "@/components/events/EventDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GameTab } from "@/components/events/GameTab";
import { EventHeader } from "@/components/events/EventHeader";

export default function EventPage({ params }: { params: { id: string } }) {
  return (
    <div className="container py-6 space-y-6">
      <EventHeader eventId={params.id} />

      <Tabs defaultValue="games" className="space-y-4">
        <TabsList>
          <TabsTrigger value="games">게임</TabsTrigger>
          <TabsTrigger value="schedule">일정표</TabsTrigger>
          <TabsTrigger value="checklist">체크리스트</TabsTrigger>
          <TabsTrigger value="memo">메모</TabsTrigger>
        </TabsList>

        <TabsContent value="games">
          <GameTab eventId={params.id} />
        </TabsContent>
        {/* 다른 탭 컨텐츠... */}
      </Tabs>
    </div>
  );
}
