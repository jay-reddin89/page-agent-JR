import type { AgentSettings } from './settings';

const buttonStyle = 'all:initial;box-sizing:border-box;font:600 12px/1.2 system-ui,sans-serif;color:#fff;background:#171125;border:1px solid #8b5cf6;border-radius:8px;padding:8px 11px;cursor:pointer;box-shadow:0 5px 18px #0008;';

export interface UserscriptUI {
  setOpen(open: boolean): void;
  openSettings(settings: AgentSettings, error?: string): void;
}

export function createUI(onToggle: () => void, onSave: (settings: AgentSettings) => void): UserscriptUI {
  const launcher = document.createElement('button');
  launcher.id = 'page-agent-userscript-launcher';
  launcher.textContent = 'Page Agent';
  launcher.setAttribute('style', `${buttonStyle}position:fixed;left:12px;top:12px;z-index:2147483647;`);
  launcher.addEventListener('click', onToggle);
  document.documentElement.appendChild(launcher);

  const dialog = document.createElement('dialog');
  dialog.setAttribute('style', 'box-sizing:border-box;width:min(440px,calc(100vw - 32px));margin:auto;padding:24px;border-radius:16px;border:1px solid #685582;background:#171125;color:#fff;font:14px/1.4 system-ui,sans-serif;z-index:2147483647;box-shadow:0 20px 70px #000b;');
  dialog.innerHTML = `<form method="dialog" style="all:initial;color:#fff;font:14px/1.4 system-ui,sans-serif">
    <h2 style="all:initial;display:block;color:#fff;font:600 22px/1.2 system-ui,sans-serif;margin:0 0 8px">Page Agent settings</h2>
    <p style="margin:0 0 18px;color:#c3b8d5">Saved by your userscript manager. The API key is stored as plain text in its local storage.</p>
    <label style="display:block;margin-bottom:14px">VITE_LLM_MODEL<input name="model" placeholder="your-model-name" required style="box-sizing:border-box;display:block;width:100%;margin-top:5px;padding:10px;border:1px solid #685582;border-radius:8px;background:#241b35;color:#fff"></label>
    <label style="display:block;margin-bottom:14px">VITE_LLM_BASE_URL<input name="baseURL" type="url" placeholder="https://page-ag-testing-ohftxirgbn.cn-shanghai.fcapp.run" required style="box-sizing:border-box;display:block;width:100%;margin-top:5px;padding:10px;border:1px solid #685582;border-radius:8px;background:#241b35;color:#fff"></label>
    <label style="display:block;margin-bottom:14px">VITE_LLM_API_KEY<input name="apiKey" type="password" placeholder="your-api-key" required autocomplete="off" style="box-sizing:border-box;display:block;width:100%;margin-top:5px;padding:10px;border:1px solid #685582;border-radius:8px;background:#241b35;color:#fff"></label>
    <p data-error role="alert" style="min-height:20px;margin:0 0 8px;color:#fda4af"></p>
    <div style="display:flex;justify-content:flex-end;gap:10px"><button value="cancel" style="${buttonStyle}">Cancel</button><button data-save value="default" style="${buttonStyle}background:#7c3aed">Save settings</button></div>
  </form>`;
  document.documentElement.appendChild(dialog);
  const form = dialog.querySelector('form') as HTMLFormElement;
  const field = (name: string) => form.elements.namedItem(name) as HTMLInputElement;
  form.addEventListener('submit', event => {
    const submitter = (event as SubmitEvent).submitter as HTMLButtonElement | null;
    if (submitter?.value === 'cancel') return;
    event.preventDefault();
    onSave({ model: field('model').value, baseURL: field('baseURL').value, apiKey: field('apiKey').value });
  });

  return {
    setOpen(open) {
      launcher.setAttribute('aria-expanded', String(open));
      launcher.style.borderColor = open ? '#22c55e' : '#8b5cf6';
    },
    openSettings(settings, error = '') {
      field('model').value = settings.model;
      field('baseURL').value = settings.baseURL;
      field('apiKey').value = settings.apiKey;
      (dialog.querySelector('[data-error]') as HTMLElement).textContent = error;
      if (!dialog.open) dialog.showModal();
    },
  };
}
