"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { SchedulePreview } from "./SchedulePreview";
import { ScheduleBuilder } from "./ScheduleBuilder";
import { ProgramLibrary } from "./ProgramLibrary";
import { Program, ScheduleBlock } from "@/types/schedule";
import { saveScheduleBlocks, getScheduleBlocks } from "@/app/actions/schedules";
import { getEventPrograms } from "@/app/actions/programs";

interface ScheduleTabProps {
  eventId: string;
}

export function ScheduleTab({ eventId }: ScheduleTabProps) {
  const [scheduleBlocks, setScheduleBlocks] = useState<ScheduleBlock[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // 초기 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // 프로그램 목록 로드
        const programsResult = await getEventPrograms(eventId);
        if (!programsResult.success) {
          throw new Error(programsResult.error);
        }
        setPrograms(programsResult.data || []);

        // 일정표 로드
        const scheduleResult = await getScheduleBlocks(eventId);
        if (!scheduleResult.success) {
          throw new Error(scheduleResult.error);
        }
        setScheduleBlocks(scheduleResult.data || []);
      } catch (error) {
        toast({
          title: "데이터 로드 실패",
          description: error instanceof Error ? error.message : "데이터를 불러오는 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [eventId]);

  // 일정표 자동 저장
  useEffect(() => {
    if (isLoading) return; // 초기 로딩 중에는 저장하지 않음

    const saveSchedule = async () => {
      setIsSaving(true);
      try {
        const result = await saveScheduleBlocks(eventId, scheduleBlocks);
        if (!result.success) {
          throw new Error(result.error);
        }
      } catch (error) {
        toast({
          title: "일정표 저장 실패",
          description: error instanceof Error ? error.message : "일정표 저장 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      } finally {
        setIsSaving(false);
      }
    };

    // 디바운스 처리
    const timeoutId = setTimeout(saveSchedule, 1000);
    return () => clearTimeout(timeoutId);
  }, [scheduleBlocks, eventId, isLoading]);

  // 프로그램 업데이트 핸들러
  const handleProgramUpdate = (updatedProgram: Program) => {
    // 프로그램 목록 업데이트
    setPrograms(programs.map((p) => (p.id === updatedProgram.id ? updatedProgram : p)));

    // 시간표 블록도 업데이트
    setScheduleBlocks(
      scheduleBlocks.map((block) => {
        if (block.id === updatedProgram.id) {
          return {
            ...block,
            ...updatedProgram,
            startTime: block.startTime,
            order: block.order,
          };
        }
        return block;
      }),
    );
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">로딩 중...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SchedulePreview blocks={scheduleBlocks} />
        </div>
        <div>
          <ProgramLibrary
            eventId={eventId}
            programs={programs}
            onProgramsChange={setPrograms}
            onProgramUpdate={handleProgramUpdate}
          />
        </div>
      </div>
      <div>
        <ScheduleBuilder
          blocks={scheduleBlocks}
          onBlocksChange={setScheduleBlocks}
          programs={programs}
          onProgramUpdate={handleProgramUpdate}
        />
      </div>
    </div>
  );
}
