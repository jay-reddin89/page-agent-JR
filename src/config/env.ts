export const config = {
  llm: {
    baseURL: import.meta.env.VITE_LLM_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    apiKey: import.meta.env.VITE_LLM_API_KEY || '',
    model: import.meta.env.VITE_LLM_MODEL || 'qwen3.5-plus',
  },
} as const;

export type Config = typeof config;
