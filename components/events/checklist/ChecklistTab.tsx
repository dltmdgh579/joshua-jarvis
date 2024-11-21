"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { CreateChecklistDialog } from "./CreateChecklistDialog";
import { ChecklistCard } from "./ChecklistCard";
import { Checklist } from "@/types/checklist";
import { getEventChecklists } from "@/app/actions/checklists";
import { useToast } from "@/hooks/use-toast";

interface ChecklistTabProps {
  eventId: string;
}

export function ChecklistTab({ eventId }: ChecklistTabProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadChecklists = async () => {
    const result = await getEventChecklists(eventId);
    if (result.success) {
      setChecklists(result.data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadChecklists();
  }, [eventId]);

  const handleChecklistUpdate = () => {
    loadChecklists();
  };

  if (loading) {
    return <div>체크리스트를 불러오는 중...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">체크리스트</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="flex items-center gap-2">
          <PlusIcon className="w-4 h-4" />새 체크리스트
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {checklists.map((checklist) => (
          <ChecklistCard
            key={checklist.id}
            checklist={checklist}
            onUpdate={handleChecklistUpdate}
            onDelete={handleChecklistUpdate}
          />
        ))}
        {checklists.length === 0 && (
          <div className="col-span-2 text-center py-8 text-gray-500">아직 등록된 체크리스트가 없습니다.</div>
        )}
      </div>

      <CreateChecklistDialog
        eventId={eventId}
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleChecklistUpdate}
      />
    </div>
  );
}
