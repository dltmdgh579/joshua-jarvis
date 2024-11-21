"use client";

import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { CalendarIcon, MapPinIcon, TagIcon } from "lucide-react";
import { Event, EventLocation, EventStatus, EventType } from "@/types/event";

interface EventHeaderProps {
  event: Event;
}

export function EventHeader({ event }: EventHeaderProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    }).format(date);
  };

  const getLocationLabel = (location: EventLocation) => {
    const labels: Record<EventLocation, string> = {
      indoor: "실내",
      outdoor: "실외",
      both: "실내/실외",
    };
    return labels[location];
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

  const getStatusLabel = (status: EventStatus) => {
    const labels: Record<EventStatus, string> = {
      planning: "기획 중",
      inProgress: "진행 중",
      completed: "완료",
      cancelled: "취소됨",
    };
    return labels[status];
  };

  const getStatusColor = (status: EventStatus) => {
    const colors: Record<EventStatus, string> = {
      planning: "bg-yellow-100 text-yellow-800",
      inProgress: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status];
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-2">{event.name}</h1>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-600">
                <CalendarIcon className="w-4 h-4" />
                <span>{formatDate(event.date)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPinIcon className="w-4 h-4" />
                <span>{getLocationLabel(event.location)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <TagIcon className="w-4 h-4" />
                <span>{getTypeLabel(event.type)}</span>
              </div>
            </div>
          </div>
          <Badge variant="secondary" className={getStatusColor(event.status)}>
            {getStatusLabel(event.status)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
