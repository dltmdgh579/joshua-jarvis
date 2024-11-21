"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GameRecommendation } from "./GameRecommendation";
import { SavedGames } from "./SavedGames";
import { RegisteredGames } from "./RegisteredGames";
import { Event } from "@/types/event";

interface GameTabProps {
  eventId: string;
  event: Event;
}

export function GameTab({ eventId, event }: GameTabProps) {
  return (
    <div className="space-y-6">
      <RegisteredGames eventId={eventId} />

      <Tabs defaultValue="recommend" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="recommend">게임 추천받기</TabsTrigger>
          <TabsTrigger value="saved">저장된 게임</TabsTrigger>
        </TabsList>

        <TabsContent value="recommend">
          <GameRecommendation eventType={event.location} />
        </TabsContent>

        <TabsContent value="saved">
          <SavedGames eventId={eventId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
