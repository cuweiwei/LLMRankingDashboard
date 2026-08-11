import type { ModelAccess } from "@/types/models";

export default function ModelAccessBadge({ access }: { access: ModelAccess }) {
  const label = access === "open" ? "OPEN" : access === "closed" ? "CLOSED" : "UNKNOWN";
  return <span className={`access-badge access-${access}`}>{label}</span>;
}
