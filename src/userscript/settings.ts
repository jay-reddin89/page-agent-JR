export interface AgentSettings {
  baseURL: string;
  apiKey: string;
  model: string;
}

const SETTINGS_KEY = 'page-agent-settings-v1';

export const DEFAULT_SETTINGS: AgentSettings = {
  baseURL: 'https://page-ag-testing-ohftxirgbn.cn-shanghai.fcapp.run',
  apiKey: '',
  model: 'qwen3.5-plus',
};

export function getSettings(): AgentSettings {
  try {
    const saved = GM_getValue<Partial<AgentSettings>>(SETTINGS_KEY, {});
    return { ...DEFAULT_SETTINGS, ...saved };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: AgentSettings): void {
  GM_setValue(SETTINGS_KEY, settings);
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
  if (!settings.apiKey.trim()) return 'Enter an API key.';
  return null;
}
