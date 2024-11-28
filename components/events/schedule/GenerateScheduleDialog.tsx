"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Clock, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Program, ScheduleBlock } from "@/types/schedule";
import { generateSchedule } from "@/app/actions/ai";
import { getCategoryLabel, getCategoryColor } from "@/lib/program-utils";

interface GenerateScheduleDialogProps {
  eventId: string;
  programs: Program[];
  currentBlocks: ScheduleBlock[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (blocks: ScheduleBlock[]) => void;
}

export function GenerateScheduleDialog({
  eventId,
  programs,
  currentBlocks,
  open,
  onOpenChange,
  onGenerate,
}: GenerateScheduleDialogProps) {
  const [startTime, setStartTime] = useState("09:00");
  const [memo, setMemo] = useState("");
  const [generatedBlocks, setGeneratedBlocks] = useState<ScheduleBlock[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startTime || programs.length === 0) return;

    setIsGenerating(true);
    try {
      const result = await generateSchedule({
        eventId,
        programs,
        startTime,
        memo: memo.trim() || undefined,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      setGeneratedBlocks(result.data);
      toast({
        title: "일정표 생성 완료",
        description: "생성된 일정표를 확인하고 적용하시겠습니까?",
      });
    } catch (error) {
      toast({
        title: "일정표 생성 실패",
        description: error instanceof Error ? error.message : "일정표 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    onGenerate(generatedBlocks);
    onOpenChange(false);
    setGeneratedBlocks([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[800px]">
        <DialogHeader>
          <DialogTitle>AI 일정표 생성</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          {/* 입력 폼 */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">시작 시간</label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  disabled={isGenerating}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">추가 고려사항 (선택)</label>
                <Textarea
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="특별히 고려해야 할 사항이 있다면 입력해주세요."
                  rows={3}
                  disabled={isGenerating}
                />
              </div>

              <Button type="submit" disabled={isGenerating || programs.length === 0}>
                {isGenerating ? "생성 중..." : "일정표 생성"}
              </Button>
            </form>
          </div>

          {/* 생성된 일정표 미리보기 */}
          <div className="space-y-4">
            <h4 className="font-medium">생성된 일정표 미리보기</h4>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {generatedBlocks.length > 0 ? (
                <>
                  {generatedBlocks.map((block) => (
                    <Card key={block.id} className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 text-sm text-gray-500">{block.startTime}</div>
                        <div className="flex-1">
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
                          <div className="flex gap-2 mt-1">
                            <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(block.category)}`}>
                              {getCategoryLabel(block.category)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                  <div className="flex justify-end mt-4">
                    <Button onClick={handleApply}>이 일정표 적용하기</Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>일정표를 생성하면 여기에 미리보기가 표시됩니다.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
