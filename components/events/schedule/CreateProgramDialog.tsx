"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CreateProgramInput, Program, ProgramType, ProgramCategory } from "@/types/schedule";
import { createProgram } from "@/app/actions/programs";

interface CreateProgramDialogProps {
  eventId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (program: Program) => void;
}

const PROGRAM_CATEGORIES: { value: ProgramCategory; label: string }[] = [
  { value: "game", label: "게임" },
  { value: "worship", label: "예배" },
  { value: "meal", label: "식사" },
  { value: "qt", label: "큐티" },
  { value: "ice_break", label: "아이스브레이크" },
  { value: "praise", label: "찬양" },
  { value: "lecture", label: "강의/설교" },
  { value: "group", label: "조별 활동" },
  { value: "rest", label: "휴식" },
  { value: "etc", label: "기타" },
];

export function CreateProgramDialog({ eventId, open, onOpenChange, onSuccess }: CreateProgramDialogProps) {
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");
  const [type, setType] = useState<ProgramType>("indoor");
  const [category, setCategory] = useState<ProgramCategory>("etc");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !duration || !location.trim()) return;

    setIsSubmitting(true);
    try {
      const programData: CreateProgramInput = {
        eventId,
        name: name.trim(),
        duration: parseInt(duration),
        type,
        category,
        location: location.trim(),
        description: description.trim() || undefined,
      };

      const result = await createProgram(programData);
      if (!result.success) {
        throw new Error(result.error);
      }

      toast({
        title: "프로그램 생성 완료",
        description: "새로운 프로그램 블록이 생성되었습니다.",
      });

      if (result.data) {
        onSuccess(result.data);
        onOpenChange(false);
        resetForm();
      }
    } catch (error) {
      toast({
        title: "프로그램 생성 실패",
        description: error instanceof Error ? error.message : "프로그램 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName("");
    setDuration("");
    setType("indoor");
    setCategory("etc");
    setLocation("");
    setDescription("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[500px]">
        <DialogHeader>
          <DialogTitle>새 프로그램 블록 추가</DialogTitle>
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

          <div className="space-y-2">
            <label className="text-sm font-medium">장소</label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="구체적인 장소를 입력하세요"
              disabled={isSubmitting}
            />
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
