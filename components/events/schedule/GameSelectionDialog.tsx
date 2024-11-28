"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clock, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { convertGameToProgram } from "@/app/actions/ai";
import { getSavedGames, Game } from "@/app/actions/games";

interface GameSelectionDialogProps {
  eventId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (program: any) => void;
}

export function GameSelectionDialog({ eventId, open, onOpenChange, onSelect }: GameSelectionDialogProps) {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConverting, setIsConverting] = useState(false);
  const { toast } = useToast();

  // 저장된 게임 목록 로드
  useEffect(() => {
    const loadGames = async () => {
      try {
        const result = await getSavedGames(eventId);
        if (!result.success) {
          throw new Error(result.error);
        }
        setGames(result.data);
      } catch (error) {
        toast({
          title: "게임 목록 로드 실패",
          description: error instanceof Error ? error.message : "저장된 게임 목록을 불러오는 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (open) {
      setIsLoading(true);
      loadGames();
    }
  }, [open, eventId, toast]);

  const handleSelect = async (game: Game) => {
    setIsConverting(true);
    try {
      const result = await convertGameToProgram(eventId, game.id);
      if (!result.success) {
        throw new Error(result.error);
      }

      onSelect(result.data);
      onOpenChange(false);
      toast({
        title: "게임을 프로그램으로 변환 완료",
        description: "게임이 프로그램 블록으로 추가되었습니다.",
      });
    } catch (error) {
      toast({
        title: "변환 실패",
        description: error instanceof Error ? error.message : "게임을 프로그램으로 변환하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px]">
        <DialogHeader>
          <DialogTitle>게임 선택</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <p>게임 목록을 불러오는 중...</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {games.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>등록된 게임이 없습니다.</p>
              </div>
            ) : (
              games.map((game) => (
                <Card key={game.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <h4 className="font-medium">{game.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{game.duration}분</span>
                        </div>
                        {game.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{game.location}</span>
                          </div>
                        )}
                      </div>
                      {game.description && <p className="text-sm text-gray-600">{game.description}</p>}
                    </div>
                    <Button onClick={() => handleSelect(game)} disabled={isConverting}>
                      선택
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
