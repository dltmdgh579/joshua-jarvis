"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface CreateChecklistItemDialogProps {
  checklistId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateChecklistItemDialog({
  checklistId,
  open,
  onOpenChange,
  onSuccess,
}: CreateChecklistItemDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    dueDate: "",
  });

  const handleSubmit = async () => {
    if (!formData.title || !formData.dueDate) {
      toast({
        title: "입력 오류",
        description: "제목과 날짜를 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      // TODO: 체크리스트 아이템 생성 API 호출
      onSuccess();
      onOpenChange(false);
      setFormData({ title: "", dueDate: "" });
    } catch (error) {
      toast({
        title: "체크리스트 아이템 생성 실패",
        description: "아이템 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>새 체크리스트 항목</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">제목</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="체크리스트 항목 제목"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="dueDate">마감일</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>추가하기</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
