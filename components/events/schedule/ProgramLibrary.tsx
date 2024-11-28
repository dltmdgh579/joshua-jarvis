"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, MapPin, Clock, Info } from "lucide-react";
import { Program } from "@/types/schedule";
import { CreateProgramDialog } from "./CreateProgramDialog";
import { ProgramDetailDialog } from "./ProgramDetailDialog";
import { getCategoryLabel, getCategoryColor } from "@/lib/program-utils";

interface ProgramLibraryProps {
  eventId: string;
  programs: Program[];
  onProgramsChange: (programs: Program[]) => void;
  onProgramUpdate: (updatedProgram: Program) => void;
}

export function ProgramLibrary({ eventId, programs, onProgramsChange, onProgramUpdate }: ProgramLibraryProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  const handleDragStart = (e: React.DragEvent, program: Program) => {
    e.dataTransfer.setData("programId", program.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleProgramDelete = () => {
    onProgramsChange(programs.filter((p) => p.id !== selectedProgram?.id));
  };

  const handleProgramUpdate = (updatedProgram: Program) => {
    onProgramsChange(programs.map((p) => (p.id === updatedProgram.id ? updatedProgram : p)));
    onProgramUpdate(updatedProgram);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">프로그램 블록</h3>
        <Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-1" />
          블록 추가
        </Button>
      </div>

      <div className="space-y-2">
        {programs.map((program) => (
          <Card
            key={program.id}
            className="p-3 cursor-move hover:shadow-md transition-shadow"
            draggable
            onDragStart={(e) => handleDragStart(e, program)}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{program.name}</h4>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedProgram(program)}>
                  <Info className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
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
                <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(program.category)}`}>
                  {getCategoryLabel(program.category)}
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
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
            </div>
          </Card>
        ))}

        {programs.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>프로그램 블록이 없습니다.</p>
            <p className="text-sm">블록 추가 버튼을 눌러 새로운 블록을 만들어보세요.</p>
          </div>
        )}
      </div>

      <CreateProgramDialog
        eventId={eventId}
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={(newProgram) => {
          onProgramsChange([...programs, newProgram]);
        }}
      />

      {selectedProgram && (
        <ProgramDetailDialog
          program={selectedProgram}
          open={!!selectedProgram}
          onOpenChange={(open) => !open && setSelectedProgram(null)}
          onDelete={handleProgramDelete}
          onUpdate={handleProgramUpdate}
        />
      )}
    </div>
  );
}
