"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { Checklist, ChecklistItem } from "@/types/checklist";
import { useToast } from "@/hooks/use-toast";
import { createChecklistItem, updateChecklistItem, deleteChecklistItem } from "@/app/actions/checklists";

interface ChecklistItemDetailDialogProps {
  checklist: Checklist;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export function ChecklistItemDetailDialog({ checklist, open, onOpenChange, onUpdate }: ChecklistItemDetailDialogProps) {
  const [newItem, setNewItem] = useState("");
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
          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {sortedItems?.map((item) => (
              <div key={item.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg">
                <Checkbox
                  checked={item.isCompleted}
                  onCheckedChange={(checked) => handleToggleItem(item.id, !!checked)}
                />
                <span className={`flex-1 ${item.isCompleted ? "line-through text-gray-500" : ""}`}>{item.title}</span>
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
