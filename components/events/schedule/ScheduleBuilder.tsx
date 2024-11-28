"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, MapPin, Trash2, Info } from "lucide-react";
import { Program, ScheduleBlock } from "@/types/schedule";
import { cn } from "@/lib/utils";
import { ProgramDetailDialog } from "./ProgramDetailDialog";
import { getCategoryLabel, getCategoryColor } from "@/lib/program-utils";

interface ScheduleBuilderProps {
  blocks: ScheduleBlock[];
  onBlocksChange: (blocks: ScheduleBlock[]) => void;
  programs: Program[];
  onProgramUpdate: (updatedProgram: Program) => void;
}

export function ScheduleBuilder({ blocks, onBlocksChange, programs, onProgramUpdate }: ScheduleBuilderProps) {
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  const handleTimeChange = (blockId: string, time: string) => {
    const updatedBlocks = blocks.map((block) => {
      if (block.id === blockId) {
        return { ...block, startTime: time };
      }
      return block;
    });

    // 시간 순으로 정렬
    const sortedBlocks = updatedBlocks.sort((a, b) => {
      if (!a.startTime) return 1;
      if (!b.startTime) return -1;
      return a.startTime.localeCompare(b.startTime);
    });

    onBlocksChange(sortedBlocks);
  };

  const handleRemoveBlock = (blockId: string) => {
    onBlocksChange(blocks.filter((block) => block.id !== blockId));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const programId = e.dataTransfer.getData("programId");
    const program = programs.find((p) => p.id === programId);

    if (program) {
      const newBlock: ScheduleBlock = {
        ...program,
        startTime: undefined,
        order: blocks.length,
      };
      onBlocksChange([...blocks, newBlock]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">시간표 만들기</h3>

      <div
        className={cn(
          "min-h-[200px] p-4 border-2 border-dashed rounded-lg",
          blocks.length === 0 ? "bg-gray-50" : "bg-white",
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {blocks.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            <p>프로그램 블록을 이곳에 드래그하여 추가하세요</p>
          </div>
        ) : (
          <div className="space-y-2">
            {blocks.map((block, index) => (
              <Card
                key={block.id}
                className={cn(
                  "p-3 hover:shadow-md transition-shadow",
                  selectedBlockId === block.id && "ring-2 ring-primary",
                )}
                onClick={() => setSelectedBlockId(block.id)}
              >
                <div className="flex items-center gap-4">
                  <Input
                    type="time"
                    value={block.startTime || ""}
                    onChange={(e) => handleTimeChange(block.id, e.target.value)}
                    className="w-32"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{block.name}</h4>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProgram(block);
                        }}
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{block.duration}분</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{block.location}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(block.category)}`}>
                        {getCategoryLabel(block.category)}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          block.type === "indoor"
                            ? "bg-blue-100 text-blue-700"
                            : block.type === "outdoor"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {block.type === "indoor" ? "실내" : block.type === "outdoor" ? "야외" : "실내/야외"}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveBlock(block.id);
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {selectedProgram && (
        <ProgramDetailDialog
          program={selectedProgram}
          open={!!selectedProgram}
          onOpenChange={(open) => !open && setSelectedProgram(null)}
          onDelete={() => handleRemoveBlock(selectedProgram.id)}
          onUpdate={onProgramUpdate}
        />
      )}
    </div>
  );
}
