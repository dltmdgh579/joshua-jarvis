"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Memo } from "@/types/memo";
import { MemoDetailDialog } from "./MemoDetailDialog";

interface MemoCardProps {
  memo: Memo;
  onUpdate: () => void;
}

export function MemoCard({ memo, onUpdate }: MemoCardProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setIsDetailOpen(true)}>
        <CardHeader>
          <CardTitle>{memo.title}</CardTitle>
          <p className="text-sm text-gray-500">{formatDate(memo.createdAt)}</p>
        </CardHeader>
        <CardContent>
          <p className="line-clamp-3 text-gray-600">{memo.content}</p>
        </CardContent>
      </Card>

      <MemoDetailDialog memo={memo} open={isDetailOpen} onOpenChange={setIsDetailOpen} onUpdate={onUpdate} />
    </>
  );
}
