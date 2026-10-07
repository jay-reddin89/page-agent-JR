# Page Agent Everywhere

A standalone userscript that adds a configurable [Page Agent](https://github.com/alibaba/page-agent) assistant to ordinary webpages. It builds as one installable file and does not include the original conference demo website.

## Build

```bash
npm install
npm run build
```

Install `dist/page-agent.user.js` with Tampermonkey or Violentmonkey. Open the launcher, enter an OpenAI-compatible endpoint, model, and API key, then save.

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
