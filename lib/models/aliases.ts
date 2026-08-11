import type { ModelAlias } from "@/types/models";

export const modelAliases: ModelAlias[] = [
  { canonical_model_id: "openai:gpt-5.6", aliases: ["GPT-5.6", "OpenAI GPT-5.6", "gpt-5.6-2026-07"] },
  { canonical_model_id: "anthropic:claude-opus-4.7", aliases: ["Claude Opus 4.7", "claude-opus-4-7"] },
  { canonical_model_id: "google:gemini-3.1-pro", aliases: ["Gemini 3.1 Pro", "gemini-3.1-pro-preview"] },
  { canonical_model_id: "deepseek:deepseek-v3.2", aliases: ["DeepSeek V3.2", "deepseek-v3.2-chat"] },
];

export function resolveCanonicalModelId(nameOrId: string, aliases = modelAliases): string {
  const normalized = nameOrId.trim().toLowerCase();
  const match = aliases.find((entry) =>
    [entry.canonical_model_id, ...entry.aliases].some((alias) => alias.toLowerCase() === normalized),
  );
  return match?.canonical_model_id ?? nameOrId;
}
