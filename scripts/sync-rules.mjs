#!/usr/bin/env node
// Copies the shared rules in rules/ into each template's ai-rules/ folder,
// so every template stays self-contained when it is copied out of this repo.
//
//   node scripts/sync-rules.mjs          write the copies
//   node scripts/sync-rules.mjs --check  exit 1 if any copy is out of date (CI)

import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

const common = ['workflow', 'docs-lookup', 'typescript', 'security', 'testing']
const reactUi = ['react', 'tailwind', 'motion']

/** Which rule files each template receives. */
export const TEMPLATES = {
  'fullstack-with-database': [...common, ...reactUi, 'zustand', 'react-router', 'express', 'mongodb'],
  'fullstack-without-database': [...common, ...reactUi, 'nextjs'],
  frontend: [...common, ...reactUi, 'zustand', 'react-router'],
}

const header = (name) =>
  `<!-- Generated from web-starter/rules/${name}.md. Edit the source there, then run: node scripts/sync-rules.mjs -->\n\n`

const check = process.argv.includes('--check')
const problems = []

for (const [template, rules] of Object.entries(TEMPLATES)) {
  const outDir = join(root, 'projects', template, 'ai-rules')
  const expected = new Map(
    rules.map((name) => {
      const source = readFileSync(join(root, 'rules', `${name}.md`), 'utf8')
      return [`${name}.md`, header(name) + source]
    }),
  )

  const existing = existsSync(outDir) ? readdirSync(outDir).filter((f) => f.endsWith('.md')) : []

  for (const [file, content] of expected) {
    const target = join(outDir, file)
    const current = existsSync(target) ? readFileSync(target, 'utf8') : null
    if (current === content) continue
    if (check) {
      problems.push(`${template}/ai-rules/${file} is ${current === null ? 'missing' : 'out of date'}`)
    } else {
      mkdirSync(outDir, { recursive: true })
      writeFileSync(target, content)
      console.log(`wrote  projects/${template}/ai-rules/${file}`)
    }
  }

  for (const file of existing) {
    if (expected.has(file)) continue
    if (check) {
      problems.push(`${template}/ai-rules/${file} is not in the manifest`)
    } else {
      rmSync(join(outDir, file))
      console.log(`removed projects/${template}/ai-rules/${file}`)
    }
  }
}

if (check) {
  if (problems.length > 0) {
    console.error('Template rules are out of sync:\n  ' + problems.join('\n  '))
    console.error('\nRun: node scripts/sync-rules.mjs')
    process.exit(1)
  }
  console.log('All template rules are in sync.')
}
