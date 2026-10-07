# Page Agent Everywhere

A standalone userscript that adds a configurable [Page Agent](https://github.com/alibaba/page-agent) assistant to ordinary webpages. It builds as one installable file and does not include the original conference demo website.

## Build

```bash
npm install
npm run build
```

Install `dist/page-agent.user.js` with ScriptCat, Tampermonkey, or Violentmonkey. Open the launcher and save settings in this format:

```dotenv
VITE_LLM_BASE_URL=https://page-ag-testing-ohftxirgbn.cn-shanghai.fcapp.run
VITE_LLM_API_KEY=your-api-key
VITE_LLM_MODEL=qwen3.5-plus
```

The API key is optional. Leave it empty for the free Page Agent testing endpoint or another keyless provider. `NA` and placeholder values are rejected because they would otherwise be sent as invalid bearer credentials. Settings appear as separate records in userscript storage. Version 0.2+ automatically migrates the earlier `page-agent-settings-v1` JSON object.

The “Append `/chat/completions`” option is off by default. Leave it off when the entered URL is the complete provider endpoint. Enable it only for OpenAI-compatible base URLs that expect the conventional `/chat/completions` path.

The Settings popup includes a live Logs tab. It records lifecycle, navigation, outbound request metadata, inbound response status, and errors. Each route can be enabled independently, and logs can be copied or cleared. API keys and authorization values are never logged.

## Development

```bash
npm run watch
npm run lint
```

The source is isolated under `src/userscript/`:

- `main.ts` — lifecycle and Page Agent integration
- `agent.ts` — generic assistant configuration
- `ui.ts` — launcher and settings dialog
- `panelGeometry.ts` — draggable and resizable popup behavior
- `settings.ts` — userscript-manager settings storage
- `network.ts` — cross-origin request adapter

See [docs/USERSCRIPT-MIGRATION.md](docs/USERSCRIPT-MIGRATION.md) for the implementation roadmap, acceptance criteria, security work, and distribution plan.

## Security

The current development build stores the API key in userscript-manager storage and requests `@connect *` so users can configure arbitrary endpoints. Treat that storage as plain text. Narrow network permissions, add sensitive-field masking, and add per-domain controls before broad distribution.

## License

MIT
