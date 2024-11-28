"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, Edit, Trash2 } from "lucide-react";
import { Program } from "@/types/schedule";
import { useToast } from "@/hooks/use-toast";
import { deleteProgram } from "@/app/actions/programs";
import { EditProgramDialog } from "./EditProgramDialog";
import { getCategoryLabel, getCategoryColor } from "@/lib/program-utils";

interface ProgramDetailDialogProps {
  program: Program;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete?: () => void;
  onUpdate?: (updatedProgram: Program) => void;
}

export function ProgramDetailDialog({ program, open, onOpenChange, onDelete, onUpdate }: ProgramDetailDialogProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!confirm("이 프로그램을 삭제하시겠습니까?")) return;

    try {
      const result = await deleteProgram(program.id);
      if (!result.success) {
        throw new Error(result.error);
      }

      toast({
        title: "프로그램 삭제 완료",
        description: "프로그램이 삭제되었습니다.",
      });
      onOpenChange(false);
      onDelete?.();
    } catch (error) {
      toast({
        title: "프로그램 삭제 실패",
        description: error instanceof Error ? error.message : "프로그램 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = (updatedProgram: Program) => {
    onUpdate?.(updatedProgram);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[500px]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl">{program.name}</DialogTitle>
              <div className="flex gap-2">
                {onUpdate && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsEditDialogOpen(true)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDelete}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center gap-4 text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{program.duration}분</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{program.location}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <span className={`text-sm px-2 py-1 rounded-full ${getCategoryColor(program.category)}`}>
                {getCategoryLabel(program.category)}
              </span>
              <span
                className={`text-sm px-2 py-1 rounded-full ${
                  program.type === "indoor"
                    ? "bg-blue-100 text-blue-700"
                    : program.type === "outdoor"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {program.type === "indoor" ? "실내" : program.type === "outdoor" ? "야외" : "실내/야외"}
              </span>
            </div>

            {program.description && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">설명</h4>
                <p className="text-gray-600 whitespace-pre-wrap">{program.description}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {isEditDialogOpen && (
        <EditProgramDialog
          program={program}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSuccess={handleUpdate}
        />
      )}
    </>
  );
}
