#!/usr/bin/env node
/**
 * Widget artifacts for event + olivia (symlinks).
 *
 * This script lives in the `olivia-support` repo but operates on the sibling
 * `olivia` repo (`../olivia` by default; override with the `OLIVIA_ROOT` env var).
 *
 * Usage (run from the olivia-support repo root):
 *   node src/setup-widget-local.mjs setup    Create areas/event/.gitignore and symlinks
 *   node src/setup-widget-local.mjs cleanup  Remove .gitignore and symlinks
 *
 * Critical for local widget load (areas/event on :3000):
 *   areas/event/public/widget-manifest.json
 *   → apps/widget/.output/public/widget/manifest.json
 *
 * Without that file, `GET /api/widget/init/:id` returns 400
 * "Failed to load widget manifest" (see apps/olivia/server/utils/widget.ts —
 * in dev the Nitro bundle resolves `public/` under areas/event, not apps/olivia).
 *
 * Symlinks are created even when the widget build output is missing (dangling).
 * Build the widget once so targets exist (run in the olivia repo):
 *   pnpm env-nx @paradoxai/olivia-widget:build
 *
 * Re-run setup after cleanup or when symlinks are missing. Restart the dev
 * server after each widget build if chunks fail to load (manifest is cached
 * in Nitro `assets:server` storage after the first successful init).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const LOG = '[widget-artifacts]'

// olivia-support/src/<this file> -> olivia-support -> workspace root -> olivia
const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const supportRoot = path.resolve(scriptDir, '..')
const workspaceRoot = path.resolve(supportRoot, '..')
const repoRoot = process.env.OLIVIA_ROOT
  ? path.resolve(process.env.OLIVIA_ROOT)
  : path.join(workspaceRoot, 'olivia')
const eventRoot = path.join(repoRoot, 'areas/event')
const eventGitignorePath = path.join(eventRoot, '.gitignore')

const widgetOutputDir = path.join(repoRoot, 'apps/widget/.output/public/widget')
const widgetManifest = path.join(widgetOutputDir, 'manifest.json')

const oliviaServerWidgetApi = path.join(repoRoot, 'apps/olivia/server/api/widget')
const oliviaServerWidgetUtils = path.join(repoRoot, 'apps/olivia/server/utils/widget.ts')

/** @type {Array<{ link: string, target: string, type: 'file' | 'dir' }>} */
const eventSymlinks = [
  {
    link: path.join(eventRoot, 'public/widget'),
    target: widgetOutputDir,
    type: 'dir',
  },
  // Required by loadWidgetManifest() when serving areas/event in dev
  {
    link: path.join(eventRoot, 'public/widget-manifest.json'),
    target: widgetManifest,
    type: 'file',
  },
  {
    link: path.join(eventRoot, 'server/api/widget'),
    target: oliviaServerWidgetApi,
    type: 'dir',
  },
  {
    link: path.join(eventRoot, 'server/utils/widget.ts'),
    target: oliviaServerWidgetUtils,
    type: 'file',
  },
  {
    link: path.join(eventRoot, 'server/assets/widget-manifest.json'),
    target: widgetManifest,
    type: 'file',
  },
]

/** Event paths listed in .gitignore but not symlinked by this script. */
const eventGitignoreExtra = []

/** @type {Array<{ link: string, target: string, type: 'file' | 'dir' }>} */
const oliviaSymlinks = [
  {
    link: path.join(repoRoot, 'apps/olivia/public/widget'),
    target: widgetOutputDir,
    type: 'dir',
  },
  {
    link: path.join(repoRoot, 'apps/olivia/public/widget-manifest.json'),
    target: widgetManifest,
    type: 'file',
  },
  {
    link: path.join(repoRoot, 'apps/olivia/server/assets/widget-manifest.json'),
    target: widgetManifest,
    type: 'file',
  },
]

const symlinks = [...eventSymlinks, ...oliviaSymlinks]

function buildEventGitignoreContent() {
  const destToGitignorePattern = (link) => {
    const relative = path.relative(eventRoot, link)
    return `/${relative.split(path.sep).join('/')}`
  }

  const patterns = [
    ...eventSymlinks.map(({ link }) => destToGitignorePattern(link)),
    ...eventGitignoreExtra.map(destToGitignorePattern),
  ]
  return `${patterns.join('\n')}\n`
}

function ensureEventGitignore() {
  const content = buildEventGitignoreContent()
  const relativePath = path.relative(repoRoot, eventGitignorePath)
  const exists = fs.existsSync(eventGitignorePath)

  if (exists) {
    const existing = fs.readFileSync(eventGitignorePath, 'utf8')
    if (existing === content) {
      return
    }
    fs.writeFileSync(eventGitignorePath, content)
    console.log(`${LOG} ${relativePath} (updated)`)
    return
  }

  fs.mkdirSync(path.dirname(eventGitignorePath), { recursive: true })
  fs.writeFileSync(eventGitignorePath, content)
  console.log(`${LOG} ${relativePath} (created)`)
}

/** Like fs.existsSync but does not follow symlinks, so broken/dangling symlinks count as existing. */
function pathExists(targetPath) {
  try {
    fs.lstatSync(targetPath)
    return true
  }
  catch {
    return false
  }
}

/** Relative symlink text via readlink (works for dangling links; unlike realpath). */
function readSymlinkRelative(linkPath) {
  try {
    if (!fs.lstatSync(linkPath).isSymbolicLink()) {
      return null
    }
    return fs.readlinkSync(linkPath)
  }
  catch {
    return null
  }
}

function ensureSymlink({ link, target, type }) {
  const absTarget = path.resolve(target)
  const absLink = path.resolve(link)
  const relativePath = path.relative(repoRoot, absLink)
  const relativeTarget = path.relative(path.dirname(absLink), absTarget)
  const targetMissing = !fs.existsSync(absTarget)

  // Always create the link — dangling is OK until the widget is built.
  // Skipping when the target is missing was the failure mode: setup-before-build
  // left areas/event/public/widget-manifest.json absent → widget init 400.
  if (readSymlinkRelative(absLink) === relativeTarget) {
    if (targetMissing) {
      console.warn(
        `${LOG} ${relativePath} → ${relativeTarget} (dangling — build widget first)`,
      )
    }
    return
  }

  if (pathExists(absLink)) {
    fs.rmSync(absLink, { recursive: true, force: true })
  }
  else {
    fs.mkdirSync(path.dirname(absLink), { recursive: true })
  }

  fs.symlinkSync(relativeTarget, absLink, type)
  if (targetMissing) {
    console.warn(
      `${LOG} ${relativePath} → ${relativeTarget} (created, dangling — build widget first)`,
    )
  }
  else {
    console.log(`${LOG} ${relativePath} → ${relativeTarget}`)
  }
}

function setup() {
  if (!fs.existsSync(repoRoot)) {
    console.error(`${LOG} olivia repo not found at ${repoRoot} (set OLIVIA_ROOT?)`)
    process.exit(1)
  }

  ensureEventGitignore()

  for (const entry of symlinks) {
    ensureSymlink(entry)
  }

  if (!fs.existsSync(widgetManifest)) {
    console.warn(
      `${LOG} widget build output missing — run in olivia:\n`
      + `  pnpm env-nx @paradoxai/olivia-widget:build`,
    )
  }
  else {
    console.log(`${LOG} done — widget manifest present, init should work after restart if needed`)
  }
}

function cleanup() {
  const pathsToRemove = [
    ...symlinks.map(({ link }) => link),
    ...eventGitignoreExtra,
    eventGitignorePath,
  ]

  for (const target of pathsToRemove) {
    if (!pathExists(target)) {
      continue
    }

    fs.rmSync(target, { recursive: true, force: true })
    console.log(`${LOG} removed ${path.relative(repoRoot, target)}`)
  }
}

const action = process.argv[2]

if (action === 'setup') {
  setup()
}
else if (action === 'cleanup') {
  cleanup()
}
else {
  console.error(`${LOG} usage: node src/setup-widget-local.mjs <setup|cleanup>`)
  process.exit(1)
}
