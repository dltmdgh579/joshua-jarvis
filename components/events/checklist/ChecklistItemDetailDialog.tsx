"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { PlusIcon, Trash2Icon, SparklesIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checklist, ChecklistItem } from "@/types/checklist";
import { useToast } from "@/hooks/use-toast";
import {
  createChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
  generateAIChecklist,
} from "@/app/actions/checklists";

interface ChecklistItemDetailDialogProps {
  checklist: Checklist;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export function ChecklistItemDetailDialog({ checklist, open, onOpenChange, onUpdate }: ChecklistItemDetailDialogProps) {
  const [newItem, setNewItem] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendCount, setRecommendCount] = useState<5 | 10>(5);
  const { toast } = useToast();

  const handleAddItem = async () => {
    if (!newItem.trim()) return;

    try {
      const result = await createChecklistItem({
        checklistId: checklist.id,
        title: newItem.trim(),
      });

      if (!result.success) {
        throw new Error("항목 추가 실패");
      }

      toast({
        title: "항목 추가 완료",
        description: "새로운 항목이 추가되었습니다.",
      });
      setNewItem("");
      onUpdate();
    } catch (error) {
      console.error("Error adding item:", error);
      toast({
        title: "항목 추가 실패",
        description: "체크리스트 항목 추가 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleToggleItem = async (itemId: string, isCompleted: boolean) => {
    try {
      const result = await updateChecklistItem(itemId, isCompleted);
      if (result.success) {
        onUpdate();
      } else {
        throw new Error("상태 업데이트 실패");
      }
    } catch (error) {
      toast({
        title: "상태 업데이트 실패",
        description: "체크리스트 항목 상태 업데이트 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const result = await deleteChecklistItem(itemId);
      if (result.success) {
        toast({
          title: "항목 삭제 완료",
          description: "체크리스트 항목이 삭제되었습니다.",
        });
        onUpdate();
      } else {
        throw new Error("항목 삭제 실패");
      }
    } catch (error) {
      toast({
        title: "항목 삭제 실패",
        description: "체크리스트 항목 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleAIRecommend = async () => {
    setIsGenerating(true);
    try {
      const result = await generateAIChecklist(
        checklist.id,
        checklist.event?.title || "행사",
        checklist.title,
        recommendCount,
      );

      if (!result.success) {
        throw new Error("체크리스트 생성 실패");
      }

      toast({
        title: "AI 추천 완료",
        description: `${recommendCount}개의 체크리스트가 추가되었습니다.`,
      });
      onUpdate();
    } catch (error) {
      toast({
        title: "AI 추천 실패",
        description: "체크리스트 추천 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const sortedItems = checklist.items?.sort((a, b) => {
    if (a.isCompleted === b.isCompleted) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return a.isCompleted ? 1 : -1;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{checklist.title}</DialogTitle>
          <DialogDescription>할 일과 준비물을 체크리스트로 관리하세요</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Input
                placeholder="새로운 할 일 또는 준비물 추가"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAddItem();
                  }
                }}
              />
              <Button onClick={handleAddItem}>
                <PlusIcon className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant={recommendCount === 5 ? "default" : "outline"}
                onClick={() => setRecommendCount(5)}
                className="flex-1"
              >
                5개 추천
              </Button>
              <Button
                variant={recommendCount === 10 ? "default" : "outline"}
                onClick={() => setRecommendCount(10)}
                className="flex-1"
              >
                10개 추천
              </Button>
            </div>
            <Button variant="secondary" onClick={handleAIRecommend} disabled={isGenerating} className="w-full">
              <SparklesIcon className="w-4 h-4 mr-2" />
              {isGenerating ? "추천 중..." : `AI 체크리스트 ${recommendCount}개 추천`}
            </Button>
          </div>
          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {sortedItems?.map((item) => (
              <div key={item.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg">
                <Checkbox
                  checked={item.isCompleted}
                  onCheckedChange={(checked) => handleToggleItem(item.id, !!checked)}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={item.isCompleted ? "line-through text-gray-500" : ""}>{item.title}</span>
                    {item.isAIRecommended && (
                      <Badge variant="secondary" className="text-xs">
                        <SparklesIcon className="w-3 h-3 mr-1" />
                        AI 추천
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleDeleteItem(item.id)}
                >
                  <Trash2Icon className="w-4 h-4" />
                </Button>
              </div>
            ))}
            {(!checklist.items || checklist.items.length === 0) && (
              <p className="text-center text-gray-500 py-4">
                아직 등록된 항목이 없습니다.
                <br />
                새로운 할 일이나 준비물을 추가해보세요.
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
