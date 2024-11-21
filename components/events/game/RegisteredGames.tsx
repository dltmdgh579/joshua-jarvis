"use client";

import { useCallback } from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getEventGames, unregisterGameFromEvent } from "@/app/actions/events";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Trash2Icon } from "lucide-react";
import { Game, GameCategory, GameLocation } from "@/types/game";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface RegisteredGamesProps {
  eventId: string;
  onGamesUpdate?: () => void;
}

interface EventGame {
  id: string;
  event_id: string;
  game_id: string;
  order_index: number;
  game: Game;
}

export function RegisteredGames({ eventId, onGamesUpdate }: RegisteredGamesProps) {
  const [games, setGames] = useState<EventGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [gameToUnregister, setGameToUnregister] = useState<string | null>(null);
  const { toast } = useToast();

  const loadEventGames = useCallback(async () => {
    const result = await getEventGames(eventId);
    if (result.success && result.data) {
      setGames(result.data as unknown as EventGame[]);
    }
    setLoading(false);
  }, [eventId]);

  useEffect(() => {
    loadEventGames();
  }, [loadEventGames]);

  const handleUnregister = async (eventGameId: string) => {
    try {
      const result = await unregisterGameFromEvent(eventId, eventGameId);

      if (result.success) {
        toast({
          title: "게임 등록 해제 완료",
          description: "게임이 행사에서 제거되었습니다.",
        });
        await loadEventGames();
        onGamesUpdate?.();
      } else {
        throw new Error("게임 등록 해제 실패");
      }
    } catch (err) {
      toast({
        title: "게임 등록 해제 실패",
        description: "게임 등록 해제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setGameToUnregister(null);
    }
  };

  const getCategoryLabel = (category: GameCategory) => {
    const labels: Record<GameCategory, string> = {
      icebreaker: "아이스브레이킹",
      team: "팀 게임",
      individual: "개인 게임",
      quiet: "정적인 게임",
      active: "활동적인 게임",
      spiritual: "영적인 게임",
    };
    return labels[category];
  };

  const getLocationLabel = (location: GameLocation) => {
    const labels: Record<GameLocation, string> = {
      indoor: "실내",
      outdoor: "실외",
      both: "실내/실외",
    };
    return labels[location];
  };

  if (loading) {
    return <div>등록된 게임을 불러오는 중...</div>;
  }

  if (games.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">
            아직 등록된 게임이 없습니다.
            <br />
            저장된 게임 목록에서 게임을 선택하여 등록해주세요.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>등록된 게임 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="space-y-4">
            {games.map((eventGame, index) => (
              <AccordionItem key={eventGame.id} value={eventGame.id}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-4">
                      <span className="font-medium text-lg">{index + 1}.</span>
                      <div>
                        <span className="font-medium">{eventGame.game.name}</span>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline">{getCategoryLabel(eventGame.game.category)}</Badge>
                          <Badge variant="outline">{getLocationLabel(eventGame.game.location)}</Badge>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        setGameToUnregister(eventGame.id); // game.id가 아닌 eventGame.id 사용
                      }}
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-4 pl-10">
                    <div>
                      <h4 className="font-medium">설명</h4>
                      <p className="text-sm text-gray-600">{eventGame.game.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium">인원</h4>
                        <p className="text-sm text-gray-600">
                          {eventGame.game.minPlayers}-{eventGame.game.maxPlayers}명
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium">소요 시간</h4>
                        <p className="text-sm text-gray-600">{eventGame.game.duration}분</p>
                      </div>
                    </div>

                    {eventGame.game.materials && eventGame.game.materials.length > 0 && (
                      <div>
                        <h4 className="font-medium">준비물</h4>
                        <p className="text-sm text-gray-600">{eventGame.game.materials.join(", ")}</p>
                      </div>
                    )}

                    <div>
                      <h4 className="font-medium">진행 방법</h4>
                      <ol className="list-decimal list-inside text-sm text-gray-600">
                        {eventGame.game.rules.map((rule, idx) => (
                          <li key={idx}>{rule}</li>
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

      <AlertDialog open={!!gameToUnregister} onOpenChange={() => setGameToUnregister(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>게임 등록 해제</AlertDialogTitle>
            <AlertDialogDescription>
              이 게임을 행사에서 제거하시겠습니까?
              <br />이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (gameToUnregister) {
                  await handleUnregister(gameToUnregister);
                }
              }}
              className="bg-red-500 hover:bg-red-600"
            >
              등록 해제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
