export function formatDateTime(value: string): string {
  return new Date(value).toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function formatDateOnly(value?: string): string {
  return value ? new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "—";
}

export function isStale(value: string, days: number): boolean {
  return Date.now() - new Date(value).getTime() > days * 24 * 60 * 60 * 1000;
}
