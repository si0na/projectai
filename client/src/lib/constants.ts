export const RAG_STATUS = {
  GREEN: 'Green',
  AMBER: 'Amber',
  RED: 'Red'
} as const;

export const PROJECT_IMPORTANCE = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low'
} as const;

export const DELIVERY_MODELS = {
  AGILE: 'Agile',
  SCRUM: 'Scrum',
  KANBAN: 'Kanban',
  WATERFALL: 'Waterfall'
} as const;

export const USER_ROLES = {
  PROJECT_MANAGER: 'project_manager',
  DELIVERY_MANAGER: 'delivery_manager',
  ADMIN: 'admin'
} as const;

export const LLM_PROVIDERS = {
  GOOGLE: 'Google',
  OPENAI: 'OpenAI',
  DEEPSEEK: 'DeepSeek'
} as const;

export const GOOGLE_MODELS = [
  'gemini-2.0-flash',
  'gemini-1.5-pro',
  'gemini-1.5-flash'
];

export const OPENAI_MODELS = [
  'gpt-4o',
  'gpt-4o-mini',
  'gpt-4-turbo'
];

export const DEEPSEEK_MODELS = [
  'deepseek-chat',
  'deepseek-coder'
];

export const MODEL_OPTIONS = {
  [LLM_PROVIDERS.GOOGLE]: GOOGLE_MODELS,
  [LLM_PROVIDERS.OPENAI]: OPENAI_MODELS,
  [LLM_PROVIDERS.DEEPSEEK]: DEEPSEEK_MODELS
};
