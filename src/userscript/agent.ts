import { PageAgent } from 'page-agent';
import type { AgentSettings } from './settings';
import { createProviderFetch, NO_API_KEY_SENTINEL } from './network';

export function createAgent(settings: AgentSettings): PageAgent {
  return new PageAgent({
    ...settings,
    apiKey: settings.apiKey || NO_API_KEY_SENTINEL,
    customFetch: createProviderFetch(settings),
    language: 'en-US',
    enableMask: true,
    viewportExpansion: 0,
    instructions: {
      system: `You are a browser assistant operating on the webpage the user is viewing.
- Follow the user's request precisely.
- Ask before submitting forms, purchases, messages, or other consequential actions.
- Never reveal or copy passwords, API keys, payment data, or private tokens.
- Report errors clearly and stop rather than retrying blindly.`,
      getPageInstructions: url => `Current page: ${url}`,
    },
  });
}
