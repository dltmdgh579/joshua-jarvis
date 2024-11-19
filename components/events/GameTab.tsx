"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GameRecommendation } from "./GameRecommendation";
import { SavedGames } from "./SavedGames";
import { RegisteredGames } from "./RegisteredGames";
import { useEvent } from "@/hooks/useEvent";
import { useState } from "react";

interface GameTabProps {
  eventId: string;
}

export function GameTab({ eventId }: GameTabProps) {
  const { event } = useEvent(eventId);
  const [gamesUpdated, setGamesUpdated] = useState(false);

  const handleGamesUpdate = () => {
    setGamesUpdated((prev) => !prev);
  };

  return (
    <div className="space-y-6">
      <RegisteredGames eventId={eventId} onGamesUpdate={handleGamesUpdate} />

      <Tabs defaultValue="recommend" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="recommend">게임 추천받기</TabsTrigger>
          <TabsTrigger value="saved">저장된 게임</TabsTrigger>
        </TabsList>

        <TabsContent value="recommend">
          <GameRecommendation eventId={eventId} eventType={event?.location || "both"} />
        </TabsContent>

        <TabsContent value="saved">
          <SavedGames eventId={eventId} key={gamesUpdated ? "updated" : "initial"} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
