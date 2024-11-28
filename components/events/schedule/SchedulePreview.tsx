"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Clock, MapPin } from "lucide-react";
import { ScheduleBlock } from "@/types/schedule";
import { getCategoryLabel, getCategoryColor } from "@/lib/program-utils";

interface SchedulePreviewProps {
  blocks: ScheduleBlock[];
}

export function SchedulePreview({ blocks }: SchedulePreviewProps) {
  // 시작 시간이 있는 블록만 필터링하고 시간순으로 정렬
  const sortedBlocks = useMemo(() => {
    return blocks.filter((block) => block.startTime).sort((a, b) => a.startTime!.localeCompare(b.startTime!));
  }, [blocks]);

  // 시작 시간과 종료 시간 계산
  const timeRange = useMemo(() => {
    if (sortedBlocks.length === 0) return null;

    const startTimes = sortedBlocks.map((block) => {
      const [hours, minutes] = block.startTime!.split(":").map(Number);
      return hours * 60 + minutes;
    });

    const endTimes = sortedBlocks.map((block, index) => {
      const [hours, minutes] = block.startTime!.split(":").map(Number);
      return hours * 60 + minutes + block.duration;
    });

    const minTime = Math.min(...startTimes);
    const maxTime = Math.max(...endTimes);

    return {
      start: minTime,
      end: maxTime,
    };
  }, [sortedBlocks]);

  if (sortedBlocks.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">시간표 미리보기</h3>
        <Card className="p-8">
          <div className="text-center text-gray-500">
            <p>아직 시간이 설정된 프로그램이 없습니다.</p>
            <p className="text-sm">프로그램을 추가하고 시작 시간을 설정해주세요.</p>
          </div>
        </Card>
      </div>
    );
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">시간표 미리보기</h3>
      <Card className="p-4">
        <div className="space-y-2">
          {sortedBlocks.map((block, index) => {
            const [hours, minutes] = block.startTime!.split(":").map(Number);
            const startMinutes = hours * 60 + minutes;
            const endMinutes = startMinutes + block.duration;

            return (
              <div key={block.id} className="relative">
                {index > 0 && <div className="absolute -top-2 left-[4.5rem] w-0.5 h-4 bg-gray-200" />}
                <div className="flex items-start gap-4">
                  <div className="w-16 text-right text-sm text-gray-500">{formatTime(startMinutes)}</div>
                  <div className="flex-1">
                    <Card
                      className={`p-3 ${
                        block.type === "indoor" ? "bg-blue-50" : block.type === "outdoor" ? "bg-green-50" : "bg-gray-50"
                      }`}
                    >
                      <h4 className="font-medium">{block.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{block.duration}분</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{block.location}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(block.category)}`}>
                          {getCategoryLabel(block.category)}
                        </span>
                      </div>
                    </Card>
                  </div>
                  <div className="w-16 text-sm text-gray-500">{formatTime(endMinutes)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
