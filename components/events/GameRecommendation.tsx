"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Game, GameCategory } from "@/types/game";
import { getAIGameRecommendations, saveGame } from "@/app/actions/games";
import ReactMarkdown from "react-markdown";
import { SaveGameDialog } from "./SaveGameDialog";

interface GameRecommendationProps {
  eventType: "indoor" | "outdoor";
}

export function GameRecommendation({ eventType }: GameRecommendationProps) {
  const [filters, setFilters] = useState({
    category: "" as GameCategory | "",
    players: "",
    duration: "",
  });
  const [recommendations, setRecommendations] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRecommendation = async () => {
    if (!filters.category || !filters.players || !filters.duration) {
      alert("모든 필드를 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      const result = await getAIGameRecommendations({
        category: filters.category as GameCategory,
        players: Number(filters.players),
        duration: Number(filters.duration),
        location: eventType,
      });

      if (result.success) {
        setRecommendations(result.recommendations || "");
      } else {
        alert("게임 추천을 가져오는데 실패했습니다.");
      }
    } catch (error) {
      console.error("Error getting recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>게임 찾기</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">카테고리</label>
            <Select
              value={filters.category}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, category: value as GameCategory }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="카테고리 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="icebreaker">아이스브레이킹</SelectItem>
                <SelectItem value="team">팀 게임</SelectItem>
                <SelectItem value="individual">개인 게임</SelectItem>
                <SelectItem value="quiet">정적인 게임</SelectItem>
                <SelectItem value="active">활동적인 게임</SelectItem>
                <SelectItem value="spiritual">영적인 게임</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">참여 인원</label>
            <Input
              type="number"
              placeholder="참여 인원 수"
              value={filters.players}
              onChange={(e) => setFilters((prev) => ({ ...prev, players: e.target.value }))}
            />
          </div>

          <div>
            <label className="text-sm font-medium">희망 소요 시간 (분)</label>
            <Input
              type="number"
              placeholder="예: 30"
              value={filters.duration}
              onChange={(e) => setFilters((prev) => ({ ...prev, duration: e.target.value }))}
            />
          </div>

          <Button className="w-full" onClick={handleRecommendation} disabled={loading}>
            {loading ? "게임 추천 받는 중..." : "게임 추천받기"}
          </Button>
        </CardContent>
      </Card>

      {recommendations && (
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>AI 추천 게임</span>
              <SaveGameDialog
                category={filters.category as GameCategory}
                location={eventType}
                recommendations={recommendations}
              />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <ReactMarkdown>{recommendations}</ReactMarkdown>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-gray-500">마음에 드는 게임이 있다면 저장하여 다음에도 사용할 수 있습니다.</p>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}