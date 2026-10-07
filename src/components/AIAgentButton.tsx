import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { getPageAgent, initializePageAgent, getAgentSettings, updateAgentSettings } from '../services/pageAgent';
import { attachPanelGeometry } from '../services/panelGeometry';

export function AIAgentButton() {
  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState(getAgentSettings);
  const [revision, setRevision] = useState(0);
  const [error, setError] = useState('');
  const reopen = useRef(false);
  const launcher = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    let agent;
    try { agent = initializePageAgent(); setError(''); }
    catch { setError('Check your endpoint, model, and API key in settings.'); return; }
    const panel = agent.panel.wrapper;
    const detach = attachPanelGeometry(panel);
    const controls = panel.querySelector<HTMLElement>('[class*="_controls_"]');
    const gear = document.createElement('button');
    gear.type = 'button'; gear.textContent = '⚙'; gear.title = 'Page Agent settings';
    gear.setAttribute('aria-label', 'Page Agent settings');
    const existing = controls?.querySelector('button');
    if (existing) gear.className = existing.className.replace(/\S*expandButton\S*/g, '');
    gear.style.fontSize = '16px';
    const edit = () => { setSettings(getAgentSettings()); setSettingsOpen(true); };
    gear.addEventListener('click', edit);
    controls?.prepend(gear);
    const closeButton = controls?.querySelector<HTMLButtonElement>('[class*="_stopButton_"]');
    const close = (event: MouseEvent) => {
      if (agent.status === 'running') return;
      event.preventDefault(); event.stopImmediatePropagation();
      agent.panel.hide(); setOpen(false); launcher.current?.focus();
    };
    closeButton?.addEventListener('click', close, true);
    const observer = new MutationObserver(() => setOpen(panel.style.display !== 'none' && panel.style.opacity === '1'));
    observer.observe(panel, { attributes: true, attributeFilter: ['style'] });
    if (reopen.current) { agent.panel.show(); reopen.current = false; }
    return () => {
      observer.disconnect(); closeButton?.removeEventListener('click', close, true);
      gear.removeEventListener('click', edit); gear.remove(); detach();
    };
  }, [revision]);
  useEffect(() => {
    if (settingsOpen) dialog.current?.showModal(); else dialog.current?.close();
  }, [settingsOpen]);
  const toggle = () => {
    const agent = getPageAgent();
    if (!agent || agent.disposed) {
      if (error) { setSettingsOpen(true); return; }
      reopen.current = true; setRevision(v => v + 1); return;
    }
    const panel = agent.panel.wrapper;
    if (panel.style.display !== 'none' && panel.style.opacity === '1') agent.panel.hide(); else agent.panel.show();
  };
  return <>
    <button ref={launcher} onClick={toggle} aria-label="Toggle Page Agent" aria-expanded={open}
      className="fixed top-3 left-3 z-9999 flex items-center gap-1 px-2 py-1 rounded border border-border bg-black/80 backdrop-blur-sm hover:border-accent/50 transition-all">
      <span className="text-[10px] font-medium" style={{ color: '#c084fc' }}>Page-Agent</span>
      {open && <span className="w-1 h-1 rounded-full bg-accent animate-pulse" />}
    </button>
    {createPortal(<dialog ref={dialog} onCancel={() => setSettingsOpen(false)} onClose={() => setSettingsOpen(false)} aria-labelledby="agent-settings-title"
      style={{ margin: 'auto', width: 'min(440px, calc(100vw - 32px))', maxHeight: 'calc(100dvh - 32px)', overflow: 'auto', padding: 24, borderRadius: 16, background: '#171125', color: '#fff', border: '1px solid #685582' }}>
      <form onSubmit={event => {
        event.preventDefault();
        let url: URL;
        try { url = new URL(settings.baseURL); } catch { setError('Enter a valid endpoint URL.'); return; }
        if (!['https:', 'http:'].includes(url.protocol)) { setError('Use an HTTP or HTTPS endpoint URL.'); return; }
        if (!settings.model.trim() || !settings.apiKey.trim()) { setError('Enter a model and API key.'); return; }
        updateAgentSettings({ baseURL: settings.baseURL.trim(), model: settings.model.trim(), apiKey: settings.apiKey.trim() });
        reopen.current = true; setSettingsOpen(false); setRevision(v => v + 1);
      }}>
        <h2 id="agent-settings-title" style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>Page Agent settings</h2>
        <p style={{ fontSize: 13, color: '#c3b8d5', marginBottom: 20 }}>Changes apply to this tab. Your API key is saved for this tab’s session.</p>
        {(['model', 'baseURL', 'apiKey'] as const).map(field => <label key={field} style={{ display: 'block', marginBottom: 16, fontSize: 14 }}>
          {field === 'baseURL' ? 'Endpoint URL' : field === 'apiKey' ? 'API key' : 'Model'}
          <input autoFocus={field === 'model'} required type={field === 'apiKey' ? 'password' : field === 'baseURL' ? 'url' : 'text'} autoComplete="off" spellCheck={false}
            value={settings[field]} onChange={event => { setSettings({ ...settings, [field]: event.target.value }); setError(''); }}
            style={{ display: 'block', width: '100%', marginTop: 6, padding: '10px 12px', borderRadius: 8, border: '1px solid #685582', background: '#241b35', color: '#fff' }} />
        </label>)}
        {error && <p role="alert" style={{ color: '#fda4af', marginBottom: 12 }}>{error}</p>}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button type="button" onClick={() => setSettingsOpen(false)} style={{ padding: '8px 12px' }}>Cancel</button>
          <button type="submit" style={{ padding: '8px 16px', borderRadius: 8, background: '#7c3aed' }}>Save settings</button>
        </div>
      </form>
    </dialog>, document.body)}
  </>;
}
