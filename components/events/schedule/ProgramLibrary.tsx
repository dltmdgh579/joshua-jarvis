"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, MapPin, Clock, Info } from "lucide-react";
import { Program } from "@/types/schedule";
import { CreateProgramDialog } from "./CreateProgramDialog";
import { ProgramDetailDialog } from "./ProgramDetailDialog";
import { getCategoryLabel, getCategoryColor } from "@/lib/program-utils";
import { convertGameToProgram, analyzeMemoForPrograms } from "@/app/actions/ai";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { GameSelectionDialog } from "./GameSelectionDialog";

interface ProgramLibraryProps {
  eventId: string;
  programs: Program[];
  onProgramsChange: (programs: Program[]) => void;
  onProgramUpdate: (updatedProgram: Program) => void;
}

export function ProgramLibrary({ eventId, programs, onProgramsChange, onProgramUpdate }: ProgramLibraryProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [memoContent, setMemoContent] = useState("");
  const [isGameDialogOpen, setIsGameDialogOpen] = useState(false);
  const { toast } = useToast();

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

  const handleConvertGame = async (gameId: string) => {
    try {
      const result = await convertGameToProgram(eventId, gameId);
      if (!result.success) {
        throw new Error(result.error);
      }

      if (!result.data) {
        throw new Error("프로그램 데이터가 없습니다");
      }

      onProgramsChange([...programs, result.data]);
      toast({
        title: "게임을 프로그램으로 변환 완료",
        description: "게임이 프로그램 블록으로 추가되었습니다.",
      });
    } catch (error) {
      toast({
        title: "변환 실패",
        description: error instanceof Error ? error.message : "게임을 프로그램으로 변환하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleAnalyzeMemo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memoContent.trim()) return;

    setIsAnalyzing(true);
    try {
      const result = await analyzeMemoForPrograms(eventId, memoContent);
      if (!result.success) {
        throw new Error(result.error);
      }

      if (!result.data) {
        throw new Error("프로그램 데이터가 없습니다");
      }

      onProgramsChange([...programs, ...result.data]);
      toast({
        title: "메모 분석 완료",
        description: `${result.data.length}개의 프로그램이 추가되었습니다.`,
      });
      setMemoContent("");
    } catch (error) {
      toast({
        title: "분석 실패",
        description: error instanceof Error ? error.message : "메모 분석 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-4 h-full">
      <div className="space-y-4">
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                메모로 생성
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>메모 분석하여 프로그램 생성</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAnalyzeMemo} className="space-y-4">
                <Textarea
                  value={memoContent}
                  onChange={(e) => setMemoContent(e.target.value)}
                  placeholder="메모 내용을 입력하세요..."
                  rows={6}
                  disabled={isAnalyzing}
                />
                <div className="flex justify-end">
                  <Button type="submit" disabled={isAnalyzing}>
                    {isAnalyzing ? "분석 중..." : "분석하기"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          <Button size="sm" variant="outline" onClick={() => setIsGameDialogOpen(true)}>
            게임에서 추가
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">프로그램 블록</h3>
          <Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-1" />
            블록 추가
          </Button>
        </div>
      </div>

      <div className="h-[calc(100vh-48rem)] overflow-y-auto pr-2">
        <div className="space-y-2">
          {programs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>등록된 프로그램이 없습니다.</p>
              <p className="text-sm mt-2">게임을 추가하거나 새 프로그램을 만들어보세요.</p>
            </div>
          ) : (
            programs.map((program) => (
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
            ))
          )}
        </div>
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

      <GameSelectionDialog
        eventId={eventId}
        open={isGameDialogOpen}
        onOpenChange={setIsGameDialogOpen}
        onSelect={(program) => {
          onProgramsChange([...programs, program]);
        }}
      />
    </div>
  );
}
