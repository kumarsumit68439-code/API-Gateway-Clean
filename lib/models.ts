export type ModelInfo = {
  id: string; // exact model id to send upstream
  provider: "groq" | "openrouter";
  label: string;
};

// Free Groq-hosted models (Groq's public API is free-tier / rate-limited).
export const GROQ_MODELS: ModelInfo[] = [
  { id: "llama-3.3-70b-versatile", provider: "groq", label: "Llama 3.3 70B Versatile" },
  { id: "llama-3.1-8b-instant", provider: "groq", label: "Llama 3.1 8B Instant" },
  { id: "mixtral-8x7b-32768", provider: "groq", label: "Mixtral 8x7B" },
  { id: "gemma2-9b-it", provider: "groq", label: "Gemma2 9B" },
];

// OpenRouter models that are free to call (":free" suffix = $0 pricing).
// OpenRouter's free lineup changes over time — see /docs page note on
// refreshing this list from https://openrouter.ai/api/v1/models.
export const OPENROUTER_FREE_MODELS: ModelInfo[] = [
  { id: "meta-llama/llama-3.3-70b-instruct:free", provider: "openrouter", label: "Llama 3.3 70B (free)" },
  { id: "google/gemini-2.0-flash-exp:free", provider: "openrouter", label: "Gemini 2.0 Flash Exp (free)" },
  { id: "deepseek/deepseek-chat:free", provider: "openrouter", label: "DeepSeek Chat (free)" },
  { id: "qwen/qwen-2.5-72b-instruct:free", provider: "openrouter", label: "Qwen 2.5 72B (free)" },
  { id: "mistralai/mistral-7b-instruct:free", provider: "openrouter", label: "Mistral 7B (free)" },
];

export const ALL_MODELS: ModelInfo[] = [...GROQ_MODELS, ...OPENROUTER_FREE_MODELS];

export function resolveProvider(modelId: string): "groq" | "openrouter" | null {
  return ALL_MODELS.find((m) => m.id === modelId)?.provider ?? null;
}
