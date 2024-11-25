import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getEvent } from "@/app/actions/events";
import { EventHeader } from "@/components/events/EventHeader";
import { GameTab } from "@/components/events/game/GameTab";
import { ChecklistTab } from "@/components/events/checklist/ChecklistTab";
import { MemoTab } from "@/components/events/memo/MemoTab";

interface EventPageProps {
  params: {
    id: string;
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const { data: event } = await getEvent(params.id);

  if (!event) {
    return <div>이벤트를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="container py-6 space-y-6">
      <EventHeader event={event} />
      <Tabs defaultValue="checklist">
        <TabsList>
          <TabsTrigger value="game">게임</TabsTrigger>
          <TabsTrigger value="checklist">체크리스트</TabsTrigger>
          <TabsTrigger value="schedule">일정표</TabsTrigger>
          <TabsTrigger value="memo">메모</TabsTrigger>
        </TabsList>

        <TabsContent value="game" className="mt-4">
          <GameTab eventId={event.id} event={event} />
        </TabsContent>
        <TabsContent value="checklist" className="mt-4">
          <ChecklistTab eventId={event.id} />
        </TabsContent>
        <TabsContent value="schedule" className="mt-4">
          <div className="p-4 border rounded-lg">
            <h3 className="text-lg font-semibold mb-4">일정표</h3>
            <p className="text-gray-500">아직 등록된 일정이 없습니다.</p>
          </div>
        </TabsContent>
        <TabsContent value="memo" className="mt-4">
          <MemoTab eventId={event.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
