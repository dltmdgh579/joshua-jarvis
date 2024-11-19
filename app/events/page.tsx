import { CreateEventDialog } from "@/components/events/CreateEventDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Suspense } from "react";
import { getEvents } from "../actions/events";
import { Event, EventType } from "@/types/event";

// 로딩 컴포넌트
function EventsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="border rounded-lg p-4 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

// 이벤트 카드 컴포넌트
function EventCard({ event }: { event: Event }) {
  const statusColors = {
    planning: "bg-yellow-100 text-yellow-800",
    "in-progress": "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
  };

  const statusText = {
    planning: "계획 중",
    "in-progress": "진행 중",
    completed: "완료",
  };

  const getTypeLabel = (type: EventType) => {
    const labels: Record<EventType, string> = {
      worship: "예배",
      fellowship: "친교",
      education: "교육",
      mission: "선교",
      other: "기타",
    };
    return labels[type];
  };

  return (
    <Link href={`/events/${event.id}`}>
      <Card className="hover:bg-gray-50 transition-colors cursor-pointer h-full">
        <CardHeader>
          <CardTitle>{event.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              <span className="font-medium">날짜:</span>{" "}
              {new Date(event.date).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                weekday: "long",
              })}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">장소:</span> {event.location}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">유형:</span> {getTypeLabel(event.type)}
            </p>
            <span
              className={`inline-block px-2 py-1 text-sm rounded-full mt-2 ${
                statusColors[event.status as keyof typeof statusColors]
              }`}
            >
              {statusText[event.status as keyof typeof statusText]}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// 이벤트 목록 컴포넌트
async function EventsList() {
  const { data: events, success } = await getEvents();

  if (!success || !events || events.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">아직 등록된 행사가 없습니다.</p>
        <p className="text-gray-500 text-sm mt-2">새로운 행사를 만들어보세요!</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}

export default function EventsPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">행사 목록</h1>
          <p className="text-gray-500 text-sm mt-1">모든 행사를 한눈에 확인하세요</p>
        </div>
        <CreateEventDialog />
      </div>
      <Suspense fallback={<EventsSkeleton />}>
        <EventsList />
      </Suspense>
    </div>
  );
}
