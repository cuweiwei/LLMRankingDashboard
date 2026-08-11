import { modelAliases, resolveCanonicalModelId } from "./aliases";
import type { Model, ModelAccess } from "../../types/models";
import type { AAModel } from "../sources/artificialAnalysisApi";

function normalized(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function providerSlug(provider: string): string {
  const value = slugify(provider);
  const aliases: Record<string, string> = {
    "alibaba-qwen": "qwen",
    "google-deepmind": "google",
    "x-ai": "xai",
  };
  return aliases[value] ?? value;
}

function hasDownloadableWeights(row: AAModel): boolean {
  const candidate = row as Record<string, unknown>;
  return [candidate.huggingface_url, candidate.open_weights_url, candidate.weights_url]
    .some((value) => typeof value === "string" && value.length > 0);
}

function inferModelAccess(row: AAModel): ModelAccess {
  if (hasDownloadableWeights(row)) return "open";
  const licensing = row.licensing;
  if (licensing && typeof licensing === "object") {
    const text = JSON.stringify(licensing).toLowerCase();
    if (text.includes("open weight") || text.includes("open-weight") || text.includes("download")) return "open";
  }
  return "unknown";
}

function matchesUpstream(model: Model, row: AAModel): boolean {
  const upstreamId = typeof row.id === "string" ? row.id : undefined;
  const upstreamSlug = typeof row.slug === "string" ? row.slug : undefined;
  if (upstreamId && model.upstream_id === upstreamId) return true;
  if (upstreamSlug && model.upstream_slug === upstreamSlug) return true;

  const names = [row.name, row.slug].filter((value): value is string => typeof value === "string");
  const canonicalIds = names.map((name) => resolveCanonicalModelId(name, modelAliases));
  const candidates = [model.id, model.name, model.id.split(":")[1]];
  return candidates.some((candidate) =>
    canonicalIds.includes(candidate) || names.some((name) => normalized(candidate) === normalized(name)),
  );
}

function canonicalIdFor(row: AAModel): string | undefined {
  const provider = row.model_creator?.name;
  const slug = row.slug ?? row.name;
  if (typeof provider !== "string" || typeof slug !== "string") return undefined;
  return `${providerSlug(provider)}:${slugify(slug)}`;
}

export function mergeDiscoveredModels(existing: Model[], rows: AAModel[]): { models: Model[]; discovered: Model[] } {
  const models = [...existing];
  const discovered: Model[] = [];

  for (const row of rows) {
    if (typeof row.name !== "string" || !row.name.trim()) continue;
    const current = models.find((model) => matchesUpstream(model, row));
    if (current) {
      if (typeof row.id === "string") current.upstream_id = row.id;
      if (typeof row.slug === "string") current.upstream_slug = row.slug;
      if (!current.release_date && typeof row.release_date === "string") current.release_date = row.release_date;
      continue;
    }

    const id = canonicalIdFor(row);
    const provider = row.model_creator?.name;
    if (!id || typeof provider !== "string") continue;
    const model: Model = {
      id,
      name: row.name,
      provider,
      model_access: inferModelAccess(row),
      ...(typeof row.id === "string" ? { upstream_id: row.id } : {}),
      ...(typeof row.slug === "string" ? { upstream_slug: row.slug } : {}),
      ...(typeof row.release_date === "string" ? { release_date: row.release_date } : {}),
    };
    models.push(model);
    discovered.push(model);
  }

  return { models, discovered };
}
