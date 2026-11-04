#!/usr/bin/env node
// Copies a template into a new folder, ready to hand to an AI agent.
//
//   node scripts/new-project.mjs <template> <target-dir>
//   node scripts/new-project.mjs frontend ../my-landing

import { cpSync, existsSync, readdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const templates = readdirSync(join(root, 'projects'))

const [template, target] = process.argv.slice(2)

if (!template || !target || !templates.includes(template)) {
  console.error('Usage: node scripts/new-project.mjs <template> <target-dir>')
  console.error(`Templates: ${templates.join(', ')}`)
  process.exit(1)
}

const dest = resolve(target)
if (existsSync(dest) && readdirSync(dest).length > 0) {
  console.error(`Target folder is not empty: ${dest}`)
  process.exit(1)
}

cpSync(join(root, 'projects', template), dest, { recursive: true })

console.log(`Created ${dest} from the "${template}" template.

Next steps:
  1. cd ${target}
  2. Describe your project in PROJECT.md (or let the AI interview you).
  3. Open the folder in your AI tool and say: "Read AGENTS.md and bootstrap the project."`)
