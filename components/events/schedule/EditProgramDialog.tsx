"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Program, ProgramType, ProgramCategory } from "@/types/schedule";
import { updateProgram } from "@/app/actions/programs";
import { PROGRAM_CATEGORIES } from "@/lib/program-utils";

interface EditProgramDialogProps {
  program: Program;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (updatedProgram: Program) => void;
}

export function EditProgramDialog({ program, open, onOpenChange, onSuccess }: EditProgramDialogProps) {
  const [name, setName] = useState(program.name);
  const [duration, setDuration] = useState(program.duration.toString());
  const [type, setType] = useState<ProgramType>(program.type);
  const [category, setCategory] = useState<ProgramCategory>(program.category);
  const [location, setLocation] = useState(program.location);
  const [description, setDescription] = useState(program.description || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !duration || !location.trim()) return;

    setIsSubmitting(true);
    try {
      const result = await updateProgram(program.id, {
        name: name.trim(),
        duration: parseInt(duration),
        type,
        category,
        location: location.trim(),
        description: description.trim() || undefined,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      toast({
        title: "프로그램 수정 완료",
        description: "프로그램 블록이 수정되었습니다.",
      });

      if (result.data) {
        onSuccess(result.data);
        onOpenChange(false);
      }
    } catch (error) {
      toast({
        title: "프로그램 수정 실패",
        description: error instanceof Error ? error.message : "프로그램 수정 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[500px]">
        <DialogHeader>
          <DialogTitle>프로그램 블록 수정</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">프로그램명</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="프로그램 이름을 입력하세요"
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">카테고리</label>
              <Select value={category} onValueChange={(value: ProgramCategory) => setCategory(value)}>
                <SelectTrigger disabled={isSubmitting}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROGRAM_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">장소 유형</label>
              <Select value={type} onValueChange={(value: ProgramType) => setType(value)}>
                <SelectTrigger disabled={isSubmitting}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="indoor">실내</SelectItem>
                  <SelectItem value="outdoor">야외</SelectItem>
                  <SelectItem value="both">실내/야외</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">소요 시간 (분)</label>
              <Input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="30"
                min="1"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">장소</label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="구체적인 장소를 입력하세요"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">설명 (선택)</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="프로그램에 대한 설명을 입력하세요"
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "저장 중..." : "저장"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
