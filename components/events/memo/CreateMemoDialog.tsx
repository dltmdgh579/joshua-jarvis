"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { createMemo } from "@/app/actions/memos";

interface CreateMemoDialogProps {
  eventId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateMemoDialog({ eventId, open, onOpenChange, onSuccess }: CreateMemoDialogProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      const result = await createMemo({
        eventId,
        title: title.trim(),
        content: content.trim(),
      });

      if (!result.success) {
        throw new Error("메모 생성 실패");
      }

      toast({
        title: "메모 생성 완료",
        description: "새로운 메모가 생성되었습니다.",
      });
      setTitle("");
      setContent("");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "메모 생성 실패",
        description: "메모 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[800px] w-[90vw]">
        <DialogHeader>
          <DialogTitle className="text-2xl">새 메모 작성</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Input
              placeholder="제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
              className="text-lg p-3"
            />
          </div>
          <div className="space-y-2">
            <Textarea
              placeholder="내용을 입력하세요..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isSubmitting}
              rows={15}
              className="min-h-[700px] text-lg p-3 resize-y"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="px-6 py-2 text-lg"
            >
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting} className="px-6 py-2 text-lg">
              {isSubmitting ? "저장 중..." : "저장"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
