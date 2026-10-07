import { addLog } from './logger';
import type { AgentSettings } from './settings';

const NO_API_KEY_SENTINEL = '__PAGE_AGENT_NO_API_KEY__';

function parseHeaders(rawHeaders: string): Headers {
  const headers = new Headers();
  for (const line of rawHeaders.trim().split(/[\r\n]+/)) {
    const separator = line.indexOf(':');
    if (separator > 0) headers.append(line.slice(0, separator).trim(), line.slice(separator + 1).trim());
  }
  return headers;
}

function safeErrorBody(buffer: ArrayBuffer): string | undefined {
  if (!buffer.byteLength) return undefined;
  const text = new TextDecoder().decode(buffer).slice(0, 2000);
  return text
    .replace(/Bearer\s+[^\s"']+/gi, 'Bearer [REDACTED]')
    .replace(/("?(?:api[_-]?key|authorization)"?\s*[:=]\s*")[^"]+/gi, '$1[REDACTED]');
}

export const createUserscriptFetch = (settings: AgentSettings): typeof fetch => async (input, init = {}) => {
  const request = new Request(input, init);
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => { headers[key] = value; });
  const apiKeyConfigured = Boolean(settings.apiKey);
  if (!apiKeyConfigured || headers.authorization === `Bearer ${NO_API_KEY_SENTINEL}`) {
    delete headers.authorization;
  }
  const authorizationSent = Boolean(headers.authorization);
  const data = request.method === 'GET' || request.method === 'HEAD'
    ? undefined
    : await request.clone().arrayBuffer();

  addLog('request', 'Sending request to provider/cloud', {
    method: request.method,
    url: request.url,
    baseURL: settings.baseURL,
    model: settings.model,
    apiKeyConfigured,
    authorizationHeaderSent: authorizationSent,
  });
  const startedAt = performance.now();

  return new Promise<Response>((resolve, reject) => {
    const xhr = GM_xmlhttpRequest({
      method: request.method,
      url: request.url,
      headers,
      data,
      responseType: 'arraybuffer',
      onload: response => {
        const details = {
          url: request.url,
          finalUrl: response.finalUrl,
          status: response.status,
          statusText: response.statusText,
          durationMs: Math.round(performance.now() - startedAt),
          ...(response.status >= 400 ? { providerError: safeErrorBody(response.response) } : {}),
        };
        addLog('response', 'Received response from provider/cloud', details);
        if (response.status >= 400) addLog('error', `Provider returned HTTP ${response.status}`, details);
        resolve(new Response(response.response, {
          status: response.status,
          statusText: response.statusText,
          headers: parseHeaders(response.responseHeaders),
        }));
      },
      onerror: () => {
        addLog('error', 'Userscript network request failed', { url: request.url });
        reject(new TypeError(`Network request failed for ${request.url}`));
      },
      ontimeout: () => {
        addLog('error', 'Userscript network request timed out', { url: request.url });
        reject(new DOMException('The request timed out.', 'TimeoutError'));
      },
    });
    if (request.signal.aborted) xhr.abort();
    request.signal.addEventListener('abort', () => xhr.abort(), { once: true });
  });
};

export { NO_API_KEY_SENTINEL };
