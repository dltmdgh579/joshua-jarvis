"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Memo } from "@/types/memo";
import { getEventMemos } from "@/app/actions/memos";
import { CreateMemoDialog } from "./CreateMemoDialog";
import { MemoCard } from "./MemoCard";

interface MemoTabProps {
  eventId: string;
}

export function MemoTab({ eventId }: MemoTabProps) {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchMemos = async () => {
    const result = await getEventMemos(eventId);
    if (result.success && result.data) {
      setMemos(result.data);
    } else {
      toast({
        title: "메모 로드 실패",
        description: "메모를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchMemos();
  }, [eventId]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">메모</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <PlusIcon className="w-4 h-4 mr-2" />새 메모
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {memos.map((memo) => (
          <MemoCard key={memo.id} memo={memo} onUpdate={fetchMemos} />
        ))}
      </div>

      <CreateMemoDialog
        eventId={eventId}
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={fetchMemos}
      />
    </div>
  );
}
