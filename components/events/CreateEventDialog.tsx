"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createEvent } from "@/app/actions/events";
import { useToast } from "@/hooks/use-toast";
import { EventLocation, EventStatus, EventType } from "@/types/event";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function CreateEventDialog() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    location: "" as EventLocation,
    type: "" as EventType,
    status: "planning" as EventStatus,
  });

  const handleSubmit = async () => {
    try {
      const result = await createEvent({
        name: formData.name,
        date: new Date(formData.date),
        location: formData.location as EventLocation,
        type: formData.type as EventType,
        status: formData.status,
      });

      if (result.success) {
        toast({
          title: "행사 생성 완료",
          description: "새로운 행사가 생성되었습니다.",
        });
        setOpen(false);
        router.refresh();
      } else {
        throw new Error("행사 생성 실패");
      }
    } catch (error) {
      toast({
        title: "행사 생성 실패",
        description: "행사 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>새 행사 만들기</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>새 행사 만들기</DialogTitle>
          <DialogDescription>새로운 행사를 생성합니다. 모든 필드를 입력해주세요.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">행사명</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="date">행사 일자</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="location">장소</Label>
            <Select
              value={formData.location}
              onValueChange={(value: EventLocation) => setFormData((prev) => ({ ...prev, location: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="장소 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="indoor">실내</SelectItem>
                <SelectItem value="outdoor">실외</SelectItem>
                <SelectItem value="both">실내/실외</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="type">행사 종류</Label>
            <Select
              value={formData.type}
              onValueChange={(value: EventType) => setFormData((prev) => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="행사 종류 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="worship">예배</SelectItem>
                <SelectItem value="fellowship">친교</SelectItem>
                <SelectItem value="education">교육</SelectItem>
                <SelectItem value="mission">선교</SelectItem>
                <SelectItem value="other">기타</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>생성하기</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
