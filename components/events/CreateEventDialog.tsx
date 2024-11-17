"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { createEvent } from "@/app/actions/events";

type EventType = "indoor" | "outdoor";
type EventStatus = "planning" | "in-progress" | "completed";

export function CreateEventDialog() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    location: "",
    type: "indoor" as EventType,
    status: "planning" as EventStatus,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await createEvent({
      ...formData,
      date: new Date(formData.date),
    });

    if (result.success) {
      setOpen(false);
      // 성공 메시지 표시 또는 페이지 새로고침
      window.location.reload();
    } else {
      // 에러 메시지 표시
      alert("이벤트 생성 중 오류가 발생했습니다.");
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
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name">행사명</label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <label htmlFor="date">날짜</label>
            <Input
              id="date"
              type="datetime-local"
              value={formData.date}
              onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
              required
            />
          </div>
          <div>
            <label htmlFor="location">장소</label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
              required
            />
          </div>
          <div>
            <label htmlFor="type">행사 유형</label>
            <Select
              value={formData.type}
              onValueChange={(value: "indoor" | "outdoor") => setFormData((prev) => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="행사 유형 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="indoor">실내</SelectItem>
                <SelectItem value="outdoor">야외</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full">
            행사 만들기
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
