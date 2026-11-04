# Looking Up Current Docs (Context7)

Your knowledge of these libraries may be out of date. Before writing code that depends on a library API you are not certain about, get the docs for the **installed** version.

## Where to look, in order

1. **Bundled docs.** Next.js ships version-matched docs in `node_modules/next/dist/docs/`. Read them first for anything Next.js.
2. **Context7 MCP.** If your tool has the Context7 MCP server, use it: resolve the library ID, then request docs for a focused topic (for example "persist middleware typescript").
3. **Context7 HTTP API.** If you can run shell commands but have no MCP:

   ```bash
   # 1. Find the library ID
   curl -s "https://context7.com/api/v1/search?query=zustand"

   # 2. Fetch docs for a topic as plain text
   curl -s -G "https://context7.com/api/v1/pmndrs/zustand" \
     --data-urlencode "type=txt" \
     --data-urlencode "topic=persist middleware typescript"
   ```

4. **Official websites**, listed below.

Keep the topic specific. "useShallow selecting multiple values" returns better results than "zustand".

## Library IDs

| Library | Context7 ID | Official docs |
| --- | --- | --- |
| React | `/reactjs/react.dev` | https://react.dev |
| Vite | `/vitejs/vite` | https://vite.dev |
| Tailwind CSS | `/tailwindlabs/tailwindcss.com` | https://tailwindcss.com/docs |
| Motion (formerly Framer Motion) | `/websites/motion_dev` | https://motion.dev/docs/react |
| Zustand | `/pmndrs/zustand` | https://zustand.docs.pmnd.rs |
| React Router | `/remix-run/react-router` | https://reactrouter.com |
| Next.js | `/vercel/next.js` | https://nextjs.org/docs |
| Express (API reference) | `/expressjs/express` | https://expressjs.com |
| Express (guides, migration) | `/websites/expressjs` | https://expressjs.com/en/guide/migrating-5 |
| Mongoose | `/automattic/mongoose` | https://mongoosejs.com/docs |
| Zod | `/colinhacks/zod` | https://zod.dev |
| Vitest | `/vitest-dev/vitest` | https://vitest.dev |

## Installing Context7 MCP (for the human)

- **Claude Code:** `claude mcp add --transport http context7 https://mcp.context7.com/mcp`
- **Cursor, VS Code, Windsurf, Gemini CLI and others:** add an MCP server with the URL `https://mcp.context7.com/mcp`.
- An API key from https://context7.com raises the rate limits. It's optional.
