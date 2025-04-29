import { ModelOption } from "./types";

// 定义模型选项
export const models: ModelOption[] = [
  {
    id: "deepseek-v3",
    name: "DeepSeek V3",
    apiUrl: "https://api.deepseek.com/v1/chat/completions",
    modelId: "deepseek-chat",
    isDefault: true
  },
  {
    id: "deepseek-v3-fast",
    name: "DeepSeek V3 极速",
    apiUrl: "https://openrouter.ai/api/v1/chat/completions",
    modelId: "deepseek/deepseek-chat-v3-0324",
    apiKey: "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"
  }
];

// 获取默认模型
export function getDefaultModel(): ModelOption {
  const defaultModel = models.find(model => model.isDefault);
  return defaultModel || models[0];
}

// 根据ID获取模型
export function getModelById(id: string): ModelOption | undefined {
  return models.find(model => model.id === id);
} 