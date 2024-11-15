import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Event } from "@/types/event";

type EventType = "indoor" | "outdoor";

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEventCreate: (event: Event) => void;
}

export default function CreateEventDialog({ open, onOpenChange, onEventCreate }: CreateEventDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    location: "",
    type: "indoor" as EventType,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newEvent: Event = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString(),
    };

    onEventCreate(newEvent);
    onOpenChange(false);
    setFormData({ title: "", date: "", location: "", type: "indoor" as EventType });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>새 행사 만들기</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">행사명</label>
            <Input
              value={formData.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, title: e.target.value })}
              placeholder="행사명을 입력하세요"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">일자</label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">장소</label>
            <Input
              value={formData.location}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, location: e.target.value })
              }
              placeholder="장소를 입력하세요"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">행사 유형</label>
            <Select
              value={formData.type}
              onValueChange={(value: "indoor" | "outdoor") => setFormData({ ...formData, type: value })}
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
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button type="submit">만들기</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
