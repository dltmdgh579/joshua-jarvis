import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GameTab } from "@/components/events/game/GameTab";
import { EventHeader } from "@/components/events/EventHeader";
import { ChecklistTab } from "@/components/events/checklist/ChecklistTab";
import { getEvent } from "@/app/actions/events";

export default async function EventPage({ params }: { params: { id: string } }) {
  const { data: event } = await getEvent(params.id);

  return (
    <div className="container py-6 space-y-6">
      {event && <EventHeader event={event} />}

      <Tabs defaultValue="games" className="space-y-4">
        <TabsList>
          <TabsTrigger value="games">게임</TabsTrigger>
          <TabsTrigger value="schedule">일정표</TabsTrigger>
          <TabsTrigger value="checklist">체크리스트</TabsTrigger>
          <TabsTrigger value="memo">메모</TabsTrigger>
        </TabsList>

        <TabsContent value="games">{event && <GameTab eventId={params.id} event={event} />}</TabsContent>

        <TabsContent value="checklist">
          <ChecklistTab eventId={params.id} />
        </TabsContent>

        <TabsContent value="schedule">
          <div className="p-4 border rounded-lg">
            <h3 className="text-lg font-semibold mb-4">일정표</h3>
            <p className="text-gray-500">아직 등록된 일정이 없습니다.</p>
          </div>
        </TabsContent>

        <TabsContent value="memo">
          <div className="p-4 border rounded-lg">
            <h3 className="text-lg font-semibold mb-4">메모</h3>
            <p className="text-gray-500">아직 등록된 메모가 없습니다.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
