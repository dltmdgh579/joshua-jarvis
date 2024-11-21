"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PlusIcon, Trash2Icon, ChevronRightIcon } from "lucide-react";
import { Checklist } from "@/types/checklist";
import { ChecklistItemDetailDialog } from "./ChecklistItemDetailDialog";
import { useToast } from "@/hooks/use-toast";
import { updateChecklistItem, deleteChecklist } from "@/app/actions/checklists";

interface ChecklistCardProps {
  checklist: Checklist;
  onUpdate: () => void;
  onDelete: () => void;
}

export function ChecklistCard({ checklist, onUpdate, onDelete }: ChecklistCardProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const { toast } = useToast();

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const result = await deleteChecklist(checklist.id);
      if (result.success) {
        toast({
          title: "체크리스트 삭제 완료",
          description: "체크리스트가 삭제되었습니다.",
        });
        onDelete();
      } else {
        throw new Error("체크리스트 삭제 실패");
      }
    } catch (error) {
      toast({
        title: "체크리스트 삭제 실패",
        description: "체크리스트 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string | Date) => {
    try {
      const date = typeof dateString === "string" ? new Date(dateString) : dateString;
      if (isNaN(date.getTime())) {
        return "날짜 없음";
      }
      return new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date);
    } catch (error) {
      return "날짜 없음";
    }
  };

  const completedCount = checklist.items?.filter((item) => item.isCompleted).length || 0;
  const totalCount = checklist.items?.length || 0;

  return (
    <>
      <Card className="cursor-pointer hover:shadow-md transition-all" onClick={() => setIsDetailOpen(true)}>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex-1">
            <CardTitle>{checklist.title}</CardTitle>
            <p className="text-sm text-gray-500">마감일: {formatDate(checklist.dueDate)}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              {completedCount} / {totalCount} 완료
            </div>
            <Button variant="ghost" size="icon" onClick={handleDelete} className="text-red-500 hover:text-red-700">
              <Trash2Icon className="w-4 h-4" />
            </Button>
            <ChevronRightIcon className="w-4 h-4 text-gray-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-500">클릭하여 체크리스트 상세 보기</div>
        </CardContent>
      </Card>

      <ChecklistItemDetailDialog
        checklist={checklist}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onUpdate={onUpdate}
      />
    </>
  );
}
