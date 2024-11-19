"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { GameList } from "./GameList";
import { registerGamesToEvent, getEventGames } from "@/app/actions/events";

interface SavedGamesProps {
  eventId: string;
}

export function SavedGames({ eventId }: SavedGamesProps) {
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const [registering, setRegistering] = useState(false);
  const [registeredGameIds, setRegisteredGameIds] = useState<string[]>([]);
  const { toast } = useToast();

  // 이미 등록된 게임 목록 로드
  useEffect(() => {
    async function loadRegisteredGames() {
      const result = await getEventGames(eventId);
      if (result.success && result.data) {
        const gameIds = result.data.map((item) => item.gameId);
        setRegisteredGameIds(gameIds);
      }
    }
    loadRegisteredGames();
  }, [eventId]);

  const handleGameSelect = (gameId: string) => {
    // 이미 등록된 게임이면 알림 표시
    if (registeredGameIds.includes(gameId)) {
      toast({
        title: "이미 등록된 게임",
        description: "이 게임은 이미 행사에 등록되어 있습니다.",
        variant: "destructive",
      });
      return;
    }

    setSelectedGames((prev) => (prev.includes(gameId) ? prev.filter((id) => id !== gameId) : [...prev, gameId]));
  };

  const handleRegisterGames = async () => {
    if (selectedGames.length === 0) {
      toast({
        title: "게임을 선택해주세요",
        description: "행사에 등록할 게임을 하나 이상 선택해주세요.",
        variant: "destructive",
      });
      return;
    }

    // 이미 등록된 게임이 있는지 확인
    const alreadyRegistered = selectedGames.some((id) => registeredGameIds.includes(id));
    if (alreadyRegistered) {
      toast({
        title: "이미 등록된 게임 포함",
        description: "선택한 게임 중 이미 등록된 게임이 있습니다.",
        variant: "destructive",
      });
      return;
    }

    setRegistering(true);
    try {
      const result = await registerGamesToEvent(eventId, selectedGames);

      if (result.success) {
        toast({
          title: "게임 등록 완료",
          description: `${selectedGames.length}개의 게임이 성공적으로 등록되었습니다.`,
        });
        // 등록된 게임 목록 업데이트
        setRegisteredGameIds((prev) => [...prev, ...selectedGames]);
        setSelectedGames([]); // 선택 초기화
      } else {
        throw new Error("게임 등록 실패");
      }
    } catch (err) {
      toast({
        title: "게임 등록 실패",
        description: "게임 등록 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setRegistering(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>저장된 게임 목록</CardTitle>
        <Button onClick={handleRegisterGames} disabled={selectedGames.length === 0 || registering}>
          {registering ? "등록 중..." : `선택한 게임 등록하기 (${selectedGames.length})`}
        </Button>
      </CardHeader>
      <CardContent>
        <GameList
          selectable
          selectedGames={selectedGames}
          onGameSelect={handleGameSelect}
          registeredGameIds={registeredGameIds} // 이미 등록된 게임 ID 목록 전달
        />
      </CardContent>
    </Card>
  );
}
