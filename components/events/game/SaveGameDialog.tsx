"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Game, GameCategory } from "@/types/game";
import { saveGame } from "@/app/actions/games";
import { Textarea } from "../../ui/textarea";
import { parseGameFromMarkdown, convertToGame } from "@/lib/gameParser";

interface SaveGameDialogProps {
  category: GameCategory;
  location: "indoor" | "outdoor" | "both";
  recommendations: string;
}

export function SaveGameDialog({ category, location, recommendations }: SaveGameDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedGameIndex, setSelectedGameIndex] = useState(0);
  const [gameData, setGameData] = useState<Partial<Game>>({
    name: "",
    description: "",
    minPlayers: 0,
    maxPlayers: 0,
    duration: 0,
    category: category,
    location: location,
    materials: [],
    rules: [],
  });

  const handleGameSelect = (index: number) => {
    const parsedGames = parseGameFromMarkdown(recommendations);
    const selectedGame = parsedGames[index];

    console.log(parsedGames);
    console.log(selectedGame);

    if (selectedGame) {
      const gameWithCorrectFormat = convertToGame(selectedGame, category, location);
      setGameData(gameWithCorrectFormat);
      setSelectedGameIndex(index);
    }
  };

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      handleGameSelect(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await saveGame({
        ...gameData,
        category,
        location,
      } as Game);

      if (result.success) {
        setOpen(false);
        alert("게임이 저장되었습니다!");
      } else {
        alert("게임 저장에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error saving game:", error);
      alert("게임 저장 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">게임 저장하기</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>게임 저장하기</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2 mb-4">
          {[0, 1, 2].map((index) => (
            <Button
              key={index}
              variant={selectedGameIndex === index ? "default" : "outline"}
              onClick={() => handleGameSelect(index)}
            >
              게임 {index + 1}
            </Button>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">게임 이름</label>
            <Input
              value={gameData.name}
              onChange={(e) => setGameData((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">게임 설명</label>
            <Textarea
              value={gameData.description}
              onChange={(e) => setGameData((prev) => ({ ...prev, description: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">최소 인원</label>
              <Input
                type="number"
                value={gameData.minPlayers}
                onChange={(e) => setGameData((prev) => ({ ...prev, minPlayers: Number(e.target.value) }))}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">최대 인원</label>
              <Input
                type="number"
                value={gameData.maxPlayers}
                onChange={(e) => setGameData((prev) => ({ ...prev, maxPlayers: Number(e.target.value) }))}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">소요 시간 (분)</label>
            <Input
              type="number"
              value={gameData.duration}
              onChange={(e) => setGameData((prev) => ({ ...prev, duration: Number(e.target.value) }))}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">준비물 (쉼표로 구분)</label>
            <Input
              value={gameData.materials?.join(", ")}
              onChange={(e) =>
                setGameData((prev) => ({
                  ...prev,
                  materials: e.target.value
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean),
                }))
              }
              placeholder="예: 종이, 펜, 타이머"
            />
          </div>

          <div>
            <label className="text-sm font-medium">진행 방법 (줄바꿈으로 구분)</label>
            <Textarea
              value={gameData.rules?.join("\n")}
              onChange={(e) =>
                setGameData((prev) => ({
                  ...prev,
                  rules: e.target.value.split("\n").filter(Boolean),
                }))
              }
              placeholder="1. 첫 번째 단계&#13;&#10;2. 두 번째 단계"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "저장 중..." : "저장하기"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
