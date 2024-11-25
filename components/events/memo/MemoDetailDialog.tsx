"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { SparklesIcon, Trash2Icon, EditIcon } from "lucide-react";
import { Memo } from "@/types/memo";
import { useToast } from "@/hooks/use-toast";
import { generateMemoAIContent } from "@/app/actions/ai";
import { deleteMemo } from "@/app/actions/memos";
import { EditMemoDialog } from "./EditMemoDialog";

interface MemoDetailDialogProps {
  memo: Memo;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export function MemoDetailDialog({ memo, open, onOpenChange, onUpdate }: MemoDetailDialogProps) {
  const [activeTab, setActiveTab] = useState("content");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const handleGenerateAI = async (type: "summary" | "suggestions") => {
    setIsGenerating(true);
    try {
      const result = await generateMemoAIContent(memo.content, type);

      if (!result.success) {
        throw new Error(result.error);
      }
      if (type === "summary") {
        setAiSummary(result.data ?? null);
      } else {
        setAiSuggestions(result.data ?? null);
      }

      toast({
        title: type === "summary" ? "요약 생성 완료" : "제안 생성 완료",
        description: "AI가 내용을 분석하여 결과를 생성했습니다.",
      });
    } catch (error) {
      console.error("Error generating AI content:", error);
      toast({
        title: "AI 생성 실패",
        description: error instanceof Error ? error.message : "AI 내용을 생성하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("정말 이 메모를 삭제하시겠습니까?")) return;

    try {
      const result = await deleteMemo(memo.id);
      if (!result.success) {
        throw new Error("메모 삭제 실패");
      }

      toast({
        title: "메모 삭제 완료",
        description: "메모가 삭제되었습니다.",
      });
      onOpenChange(false);
      onUpdate();
    } catch (error) {
      toast({
        title: "메모 삭제 실패",
        description: "메모를 삭제하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[800px] w-[90vw] max-h-[90vh]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl">{memo.title}</DialogTitle>
                <p className="text-sm text-gray-500">{formatDate(memo.createdAt)}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditDialogOpen(true)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <EditIcon className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleDelete} className="text-red-500 hover:text-red-700">
                  <Trash2Icon className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </DialogHeader>
          <div className="overflow-y-auto flex-1">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
              <TabsList>
                <TabsTrigger value="content">메모 내용</TabsTrigger>
                <TabsTrigger value="summary">AI 요약</TabsTrigger>
                <TabsTrigger value="suggestions">AI 제안</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="mt-4">
                <div className="min-h-[200px] max-h-[60vh] overflow-y-auto text-md p-4 whitespace-pre-wrap rounded-lg bg-gray-50">
                  {memo.content}
                </div>
              </TabsContent>

              <TabsContent value="summary" className="mt-4">
                <div className="space-y-4">
                  {!aiSummary ? (
                    <div className="text-center py-8">
                      <Button onClick={() => handleGenerateAI("summary")} disabled={isGenerating} className="gap-2">
                        <SparklesIcon className="w-4 h-4" />
                        {isGenerating ? "요약 생성 중..." : "AI로 요약하기"}
                      </Button>
                      <p className="text-sm text-gray-500 mt-2">
                        AI가 메모 내용을 분석하여 핵심 내용을 요약해드립니다.
                      </p>
                    </div>
                  ) : (
                    <div className="min-h-[200px] max-h-[60vh] overflow-y-auto text-md p-4 whitespace-pre-wrap rounded-lg bg-gray-50">
                      {aiSummary}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="suggestions" className="mt-4">
                <div className="space-y-4">
                  {!aiSuggestions ? (
                    <div className="text-center py-8">
                      <Button onClick={() => handleGenerateAI("suggestions")} disabled={isGenerating} className="gap-2">
                        <SparklesIcon className="w-4 h-4" />
                        {isGenerating ? "제안 생성 중..." : "AI 제안 받기"}
                      </Button>
                      <p className="text-sm text-gray-500 mt-2">
                        AI가 메모 내용을 분석하여 개선 아이디어를 제안해드립니다.
                      </p>
                    </div>
                  ) : (
                    <div className="min-h-[200px] max-h-[60vh] overflow-y-auto text-md p-4 whitespace-pre-wrap rounded-lg bg-gray-50">
                      {aiSuggestions}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      <EditMemoDialog memo={memo} open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} onSuccess={onUpdate} />
    </>
  );
}
