"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { updateMemo } from "@/app/actions/memos";
import { Memo } from "@/types/memo";

interface EditMemoDialogProps {
  memo: Memo;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditMemoDialog({ memo, open, onOpenChange, onSuccess }: EditMemoDialogProps) {
  const [title, setTitle] = useState(memo.title);
  const [content, setContent] = useState(memo.content);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      const result = await updateMemo(memo.id, {
        title: title.trim(),
        content: content.trim(),
      });

      if (!result.success) {
        throw new Error("메모 수정 실패");
      }

      toast({
        title: "메모 수정 완료",
        description: "메모가 수정되었습니다.",
      });
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "메모 수정 실패",
        description: "메모 수정 중 오류가 발생했습니다.",
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
          <DialogTitle className="text-2xl">메모 수정</DialogTitle>
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
              className="min-h-[300px] text-lg p-3 resize-y"
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
