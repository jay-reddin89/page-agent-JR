export interface AgentSettings {
  baseURL: string;
  apiKey: string;
  model: string;
  appendChatCompletions: boolean;
}

const LEGACY_SETTINGS_KEY = 'page-agent-settings-v1';
const BASE_URL_KEY = 'VITE_LLM_BASE_URL';
const API_KEY_KEY = 'VITE_LLM_API_KEY';
const MODEL_KEY = 'VITE_LLM_MODEL';
const APPEND_PATH_KEY = 'VITE_LLM_APPEND_CHAT_COMPLETIONS';

export const DEFAULT_SETTINGS: AgentSettings = {
  baseURL: 'https://page-ag-testing-ohftxirgbn.cn-shanghai.fcapp.run',
  apiKey: '',
  model: 'qwen3.5-plus',
  appendChatCompletions: false,
};

export function getSettings(): AgentSettings {
  try {
    const baseURL = GM_getValue<string | null>(BASE_URL_KEY, null);
    const apiKey = GM_getValue<string | null>(API_KEY_KEY, null);
    const model = GM_getValue<string | null>(MODEL_KEY, null);
    const appendChatCompletions = GM_getValue<boolean | null>(APPEND_PATH_KEY, null);
    if (baseURL !== null || apiKey !== null || model !== null || appendChatCompletions !== null) {
      return normalizeSettings({
        baseURL: baseURL ?? DEFAULT_SETTINGS.baseURL,
        apiKey: apiKey ?? DEFAULT_SETTINGS.apiKey,
        model: model ?? DEFAULT_SETTINGS.model,
        appendChatCompletions: appendChatCompletions ?? DEFAULT_SETTINGS.appendChatCompletions,
      });
    }

    const legacy = GM_getValue<Partial<AgentSettings> | null>(LEGACY_SETTINGS_KEY, null);
    if (legacy) {
      const migrated = normalizeSettings({ ...DEFAULT_SETTINGS, ...legacy });
      saveSettings(migrated);
      GM_deleteValue(LEGACY_SETTINGS_KEY);
      return migrated;
    }
    return { ...DEFAULT_SETTINGS };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: AgentSettings): void {
  const normalized = normalizeSettings(settings);
  GM_setValue(BASE_URL_KEY, normalized.baseURL);
  GM_setValue(API_KEY_KEY, normalized.apiKey);
  GM_setValue(MODEL_KEY, normalized.model);
  GM_setValue(APPEND_PATH_KEY, normalized.appendChatCompletions);
  GM_deleteValue(LEGACY_SETTINGS_KEY);
}

export function clearSettings(): AgentSettings {
  GM_deleteValue(BASE_URL_KEY);
  GM_deleteValue(API_KEY_KEY);
  GM_deleteValue(MODEL_KEY);
  GM_deleteValue(APPEND_PATH_KEY);
  GM_deleteValue(LEGACY_SETTINGS_KEY);
  return { ...DEFAULT_SETTINGS };
}

export function normalizeSettings(settings: AgentSettings): AgentSettings {
  const baseURL = settings.baseURL.trim().replace(/\/+$/, '');
  return {
    baseURL,
    apiKey: settings.apiKey.trim(),
    model: settings.model.trim(),
    appendChatCompletions: Boolean(settings.appendChatCompletions),
  };
}

export function validateSettings(settings: AgentSettings): string | null {
  let endpoint: URL;
  try {
    endpoint = new URL(settings.baseURL);
  } catch {
    return 'Enter a valid endpoint URL.';
  }
  if (!['https:', 'http:'].includes(endpoint.protocol)) return 'Use an HTTP or HTTPS endpoint.';
  if (!settings.model.trim()) return 'Enter a model name.';
  if (settings.apiKey && ['na', 'your-api-key'].includes(settings.apiKey.trim().toLowerCase())) {
    return 'Leave the API key empty for a keyless endpoint, or enter a real key.';
  }
  return null;
}
