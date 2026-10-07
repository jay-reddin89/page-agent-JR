import { resolve } from 'node:path'
import { defineConfig } from 'vite'

const userscriptHeader = `// ==UserScript==
// @name         Page Agent Everywhere
// @namespace    https://github.com/jay-reddin89/page-agent-JR
// @version      0.1.0
// @description  Add a configurable Page Agent assistant to every webpage.
// @match        http://*/*
// @match        https://*/*
// @run-at       document-idle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @connect      *
// ==/UserScript==`

export default defineConfig({
  publicDir: false,
  plugins: [{
    name: 'userscript-metadata',
    generateBundle(_options, bundle) {
      for (const output of Object.values(bundle)) {
        if (output.type === 'chunk' && output.isEntry) output.code = `${userscriptHeader}\n${output.code}`
      }
    },
  }],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, 'src/userscript/main.ts'),
      name: 'PageAgentUserscript',
      formats: ['iife'],
      fileName: () => 'page-agent.user.js',
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
      onwarn(warning, warn) {
        // Suppress eval warning from page-controller library
        if (warning.code === 'EVAL') return
        // Suppress chunk size warning
        if (warning.message?.includes('Some chunks are larger than 500 kB')) return
        warn(warning)
      },
    },
  },
})
