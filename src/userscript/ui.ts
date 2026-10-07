import { clearLogs, formatLogs, getLogRoutes, getLogs, setLogRoute, subscribeLogs, type LogRoute } from './logger';
import type { AgentSettings } from './settings';

const buttonStyle = 'all:initial;box-sizing:border-box;font:600 12px/1.2 system-ui,sans-serif;color:#fff;background:#171125;border:1px solid #8b5cf6;border-radius:8px;padding:8px 11px;cursor:pointer;box-shadow:0 5px 18px #0008;';
const inputStyle = 'box-sizing:border-box;display:block;width:100%;margin-top:5px;padding:10px;border:1px solid #685582;border-radius:8px;background:#241b35;color:#fff;';

export interface UserscriptUI {
  setOpen(open: boolean): void;
  openSettings(settings: AgentSettings, error?: string): void;
  openLogs(): void;
}

export function createUI(onToggle: () => void, onSave: (settings: AgentSettings) => void): UserscriptUI {
  const launcher = document.createElement('button');
  launcher.id = 'page-agent-userscript-launcher';
  launcher.textContent = 'Page Agent';
  launcher.setAttribute('style', `${buttonStyle}position:fixed;left:12px;top:12px;z-index:2147483647;`);
  launcher.addEventListener('click', onToggle);
  document.documentElement.appendChild(launcher);

  const dialog = document.createElement('dialog');
  dialog.setAttribute('style', 'box-sizing:border-box;width:min(680px,calc(100vw - 32px));max-height:calc(100dvh - 32px);overflow:auto;margin:auto;padding:0;border-radius:16px;border:1px solid #685582;background:#171125;color:#fff;font:14px/1.4 system-ui,sans-serif;z-index:2147483647;box-shadow:0 20px 70px #000b;');
  dialog.innerHTML = `<div style="padding:22px">
    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px">
      <h2 style="all:initial;color:#fff;font:600 22px/1.2 system-ui,sans-serif">Page Agent</h2>
      <button data-close type="button" aria-label="Close settings" style="${buttonStyle}">Close</button>
    </div>
    <div role="tablist" aria-label="Page Agent configuration" style="display:flex;gap:8px;border-bottom:1px solid #453854;margin-bottom:18px">
      <button data-tab="settings" type="button" role="tab" style="${buttonStyle}border-radius:8px 8px 0 0">Settings</button>
      <button data-tab="logs" type="button" role="tab" style="${buttonStyle}border-radius:8px 8px 0 0">Logs <span data-log-count></span></button>
    </div>
    <section data-panel="settings" role="tabpanel">
      <form style="all:initial;color:#fff;font:14px/1.4 system-ui,sans-serif">
        <p style="margin:0 0 18px;color:#c3b8d5">Saved by your userscript manager. The API key is optional and stored as plain text only when supplied.</p>
        <label style="display:block;margin-bottom:14px">VITE_LLM_MODEL<input name="model" placeholder="qwen3.5-plus" required style="${inputStyle}"></label>
        <label style="display:block;margin-bottom:14px">VITE_LLM_BASE_URL<input name="baseURL" type="url" placeholder="https://page-ag-testing-ohftxirgbn.cn-shanghai.fcapp.run" required style="${inputStyle}"></label>
        <label style="display:block;margin-bottom:14px">VITE_LLM_API_KEY <span style="color:#a99db8">(optional)</span><input name="apiKey" type="password" placeholder="Leave empty for keyless providers" autocomplete="off" style="${inputStyle}"></label>
        <p data-settings-error role="alert" style="min-height:20px;margin:0 0 8px;color:#fda4af"></p>
        <div style="display:flex;justify-content:flex-end;gap:10px"><button data-cancel type="button" style="${buttonStyle}">Cancel</button><button type="submit" style="${buttonStyle}background:#7c3aed">Save settings</button></div>
      </form>
    </section>
    <section data-panel="logs" role="tabpanel" hidden>
      <p style="margin:0 0 12px;color:#c3b8d5">Choose which routes are recorded. API keys and authorization values are never written to logs.</p>
      <fieldset data-routes style="margin:0 0 12px;padding:10px;border:1px solid #453854;border-radius:8px">
        <legend style="padding:0 6px">Active log routes</legend>
        ${(['lifecycle', 'navigation', 'request', 'response', 'error'] as LogRoute[]).map(route => `<label style="display:inline-flex;align-items:center;gap:5px;margin:4px 14px 4px 0"><input type="checkbox" data-route="${route}"> ${route}</label>`).join('')}
      </fieldset>
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px">
        <span data-log-status aria-live="polite" style="color:#a99db8"></span>
        <div style="display:flex;gap:8px"><button data-copy type="button" style="${buttonStyle}">Copy logs</button><button data-clear type="button" style="${buttonStyle}border-color:#ef4444">Clear logs</button></div>
      </div>
      <pre data-log-output tabindex="0" aria-label="Live Page Agent logs" style="box-sizing:border-box;width:100%;height:340px;overflow:auto;margin:0;padding:12px;border:1px solid #453854;border-radius:8px;background:#09070e;color:#d8f3dc;font:12px/1.45 ui-monospace,SFMono-Regular,Consolas,monospace;white-space:pre-wrap;overflow-wrap:anywhere"></pre>
    </section>
  </div>`;
  document.documentElement.appendChild(dialog);

  const form = dialog.querySelector('form') as HTMLFormElement;
  const field = (name: string) => form.elements.namedItem(name) as HTMLInputElement;
  const settingsPanel = dialog.querySelector<HTMLElement>('[data-panel="settings"]')!;
  const logsPanel = dialog.querySelector<HTMLElement>('[data-panel="logs"]')!;
  const output = dialog.querySelector<HTMLElement>('[data-log-output]')!;
  const status = dialog.querySelector<HTMLElement>('[data-log-status]')!;
  const count = dialog.querySelector<HTMLElement>('[data-log-count]')!;
  const error = dialog.querySelector<HTMLElement>('[data-settings-error]')!;
  let activeTab: 'settings' | 'logs' = 'settings';

  const showTab = (tab: 'settings' | 'logs') => {
    activeTab = tab;
    settingsPanel.hidden = tab !== 'settings';
    logsPanel.hidden = tab !== 'logs';
    for (const button of dialog.querySelectorAll<HTMLButtonElement>('[data-tab]')) {
      const selected = button.dataset.tab === tab;
      button.setAttribute('aria-selected', String(selected));
      button.style.borderColor = selected ? '#22c55e' : '#8b5cf6';
    }
    if (tab === 'logs') output.scrollTop = output.scrollHeight;
  };

  const renderLogs = () => {
    const logs = getLogs();
    output.textContent = formatLogs();
    count.textContent = `(${logs.length})`;
    const preferences = getLogRoutes();
    for (const checkbox of dialog.querySelectorAll<HTMLInputElement>('[data-route]')) {
      checkbox.checked = preferences[checkbox.dataset.route as LogRoute];
    }
    if (activeTab === 'logs') output.scrollTop = output.scrollHeight;
  };
  subscribeLogs(renderLogs);
  renderLogs();

  for (const button of dialog.querySelectorAll<HTMLButtonElement>('[data-tab]')) {
    button.addEventListener('click', () => showTab(button.dataset.tab as 'settings' | 'logs'));
  }
  for (const checkbox of dialog.querySelectorAll<HTMLInputElement>('[data-route]')) {
    checkbox.addEventListener('change', () => setLogRoute(checkbox.dataset.route as LogRoute, checkbox.checked));
  }
  dialog.querySelector('[data-close]')?.addEventListener('click', () => dialog.close());
  dialog.querySelector('[data-cancel]')?.addEventListener('click', () => dialog.close());
  dialog.querySelector('[data-copy]')?.addEventListener('click', () => {
    GM_setClipboard(formatLogs(), 'text');
    status.textContent = 'Logs copied to clipboard.';
  });
  dialog.querySelector('[data-clear]')?.addEventListener('click', () => {
    clearLogs();
    status.textContent = 'Logs cleared.';
  });
  form.addEventListener('submit', event => {
    event.preventDefault();
    onSave({ model: field('model').value, baseURL: field('baseURL').value, apiKey: field('apiKey').value });
  });

  const open = (tab: 'settings' | 'logs') => {
    showTab(tab);
    if (!dialog.open) dialog.showModal();
  };

  return {
    setOpen(isOpen) {
      launcher.setAttribute('aria-expanded', String(isOpen));
      launcher.style.borderColor = isOpen ? '#22c55e' : '#8b5cf6';
    },
    openSettings(settings, message = '') {
      field('model').value = settings.model;
      field('baseURL').value = settings.baseURL;
      field('apiKey').value = settings.apiKey;
      error.textContent = message;
      open('settings');
    },
    openLogs() {
      status.textContent = '';
      open('logs');
    },
  };
}
