import type { PageAgent } from 'page-agent';
import { createAgent } from './agent';
import { attachPanelGeometry } from './panelGeometry';
import { createUI } from './ui';
import { clearSettings, getSettings, normalizeSettings, saveSettings, validateSettings, type AgentSettings } from './settings';

let agent: PageAgent | null = null;
let detachPanel: (() => void) | null = null;
let settings = getSettings();

const ui = createUI(togglePanel, applySettings);

GM_registerMenuCommand('Open Page Agent settings', () => ui.openSettings(settings));
GM_registerMenuCommand('Toggle Page Agent', togglePanel);
GM_registerMenuCommand('Clear saved Page Agent credentials', () => {
  if (!window.confirm('Clear the saved Page Agent endpoint, model, and API key?')) return;
  detachPanel?.();
  agent?.dispose();
  agent = null;
  detachPanel = null;
  settings = clearSettings();
  ui.setOpen(false);
  ui.openSettings(settings, 'Saved credentials were cleared.');
});

function mountAgent(nextSettings: AgentSettings, show = false): void {
  detachPanel?.();
  agent?.dispose();
  agent = createAgent(nextSettings);
  detachPanel = attachPanelGeometry(agent.panel.wrapper);
  const controls = agent.panel.wrapper.querySelector<HTMLElement>('[class*="_controls_"]');
  const templateButton = controls?.querySelector<HTMLButtonElement>('button');
  const settingsButton = document.createElement('button');
  settingsButton.type = 'button';
  settingsButton.textContent = '⚙';
  settingsButton.title = 'Page Agent settings';
  settingsButton.setAttribute('aria-label', 'Page Agent settings');
  if (templateButton) settingsButton.className = templateButton.className.replace(/\S*expandButton\S*/g, '');
  settingsButton.addEventListener('click', event => {
    event.stopPropagation();
    ui.openSettings(settings);
  });
  controls?.prepend(settingsButton);
  const closeButton = controls?.querySelector<HTMLButtonElement>('[class*="_stopButton_"]');
  closeButton?.addEventListener('click', event => {
    if (agent?.status === 'running') return;
    event.preventDefault();
    event.stopImmediatePropagation();
    agent?.panel.hide();
    ui.setOpen(false);
  }, true);
  if (show) {
    agent.panel.show();
    ui.setOpen(true);
  }
}

function togglePanel(): void {
  const settingsError = validateSettings(settings);
  if (settingsError) {
    ui.openSettings(settings, settingsError);
    return;
  }
  if (!agent || agent.disposed) mountAgent(settings, true);
  else if (agent.panel.wrapper.style.display !== 'none' && agent.panel.wrapper.style.opacity === '1') {
    agent.panel.hide();
    ui.setOpen(false);
  } else {
    agent.panel.show();
    ui.setOpen(true);
  }
}

function applySettings(nextSettings: AgentSettings): void {
  const normalized = normalizeSettings(nextSettings);
  const error = validateSettings(normalized);
  if (error) {
    ui.openSettings(normalized, error);
    return;
  }
  settings = normalized;
  saveSettings(settings);
  document.querySelector<HTMLDialogElement>('dialog[open]')?.close();
  mountAgent(settings, true);
}

if (!validateSettings(settings)) mountAgent(settings);
