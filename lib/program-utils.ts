import { ProgramCategory } from "@/types/schedule";

export const PROGRAM_CATEGORIES: { value: ProgramCategory; label: string; color: string }[] = [
  { value: "game", label: "게임", color: "bg-blue-100 text-blue-700" },
  { value: "worship", label: "예배", color: "bg-purple-100 text-purple-700" },
  { value: "meal", label: "식사", color: "bg-orange-100 text-orange-700" },
  { value: "qt", label: "큐티", color: "bg-yellow-100 text-yellow-700" },
  { value: "ice_break", label: "아이스브레이크", color: "bg-pink-100 text-pink-700" },
  { value: "praise", label: "찬양", color: "bg-indigo-100 text-indigo-700" },
  { value: "lecture", label: "강의/설교", color: "bg-emerald-100 text-emerald-700" },
  { value: "group", label: "조별 활동", color: "bg-cyan-100 text-cyan-700" },
  { value: "rest", label: "휴식", color: "bg-slate-100 text-slate-700" },
  { value: "etc", label: "기타", color: "bg-gray-100 text-gray-700" },
];

export function getCategoryLabel(category: ProgramCategory): string {
  return PROGRAM_CATEGORIES.find((cat) => cat.value === category)?.label || "기타";
}

export function getCategoryColor(category: ProgramCategory): string {
  return PROGRAM_CATEGORIES.find((cat) => cat.value === category)?.color || "bg-gray-100 text-gray-700";
}
