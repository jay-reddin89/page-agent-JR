function parseHeaders(rawHeaders: string): Headers {
  const headers = new Headers();
  for (const line of rawHeaders.trim().split(/[\r\n]+/)) {
    const separator = line.indexOf(':');
    if (separator > 0) headers.append(line.slice(0, separator).trim(), line.slice(separator + 1).trim());
  }
  return headers;
}

export const userscriptFetch: typeof fetch = async (input, init = {}) => {
  const request = new Request(input, init);
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => { headers[key] = value; });
  const data = request.method === 'GET' || request.method === 'HEAD'
    ? undefined
    : await request.clone().arrayBuffer();

  return new Promise<Response>((resolve, reject) => {
    const xhr = GM_xmlhttpRequest({
      method: request.method,
      url: request.url,
      headers,
      data,
      responseType: 'arraybuffer',
      onload: response => resolve(new Response(response.response, {
        status: response.status,
        statusText: response.statusText,
        headers: parseHeaders(response.responseHeaders),
      })),
      onerror: () => reject(new TypeError(`Network request failed for ${request.url}`)),
      ontimeout: () => reject(new DOMException('The request timed out.', 'TimeoutError')),
    });
    if (request.signal.aborted) xhr.abort();
    request.signal.addEventListener('abort', () => xhr.abort(), { once: true });
  });
};
