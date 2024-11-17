"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { getGames } from "@/app/actions/games";
import { Game } from "@/types/game";
import { Badge } from "../ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";

export function GameList() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    const result = await getGames();
    if (result.success) {
      setGames(result.data ?? []);
    }
    setLoading(false);
  };

  const getCategoryLabel = (category: Game["category"]) => {
    const labels = {
      icebreaker: "아이스브레이킹",
      team: "팀 게임",
      individual: "개인 게임",
      quiet: "정적인 게임",
      active: "활동적인 게임",
      spiritual: "영적인 게임",
    };
    return labels[category];
  };

  const getLocationLabel = (location: Game["location"]) => {
    const labels = {
      indoor: "실내",
      outdoor: "실외",
      both: "실내/실외",
    };
    return labels[location];
  };

  if (loading) {
    return <div>게임 목록을 불러오는 중...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>저장된 게임 목록</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="space-y-4">
          {games.map((game) => (
            <AccordionItem key={game.id} value={game.id}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-2 text-left">
                  <span className="font-medium">{game.name}</span>
                  <div className="flex gap-2">
                    <Badge variant="outline">{getCategoryLabel(game.category)}</Badge>
                    <Badge variant="outline">{getLocationLabel(game.location)}</Badge>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-4">
                  <div>
                    <h4 className="font-medium">설명</h4>
                    <p className="text-sm text-gray-600">{game.description}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-medium">인원</h4>
                      <p className="text-sm text-gray-600">
                        {game.minPlayers}-{game.maxPlayers}명
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium">소요 시간</h4>
                      <p className="text-sm text-gray-600">{game.duration}분</p>
                    </div>
                  </div>

                  {game.materials && game.materials.length > 0 && (
                    <div>
                      <h4 className="font-medium">준비물</h4>
                      <p className="text-sm text-gray-600">{game.materials.join(", ")}</p>
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium">진행 방법</h4>
                    <ol className="list-decimal list-inside text-sm text-gray-600">
                      {game.rules.map((rule, index) => (
                        <li key={index}>{rule}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
