# fake-api

Local helper scripts for working with the `olivia` repo (data seeding, locale
downloads, widget symlinks).

These scripts assume `fake-api` and `olivia` live side by side:

```
workspace/
├── fake-api/   ← you are here
└── olivia/
```

If your `olivia` checkout is somewhere else, set `OLIVIA_ROOT` to its path when
running any script below.

## Setup

```bash
uv sync
```

This installs the Python dependencies (`requests`, `faker`). The Node scripts
(`*.mjs`) only need a local Node install — no extra deps.

## Scripts

### `src/download_locales.py` — download compiled locale JSON

`nx gettext:compile` generates `areas/<area>/public/locale/*.json` from the
`.po` sources, but pulling fresh translations needs Crowdin credentials we don't
have locally. This script instead downloads the already-compiled JSON straight
from the CDN (e.g. `https://cdn.test.paradox.ai/locale/bs.json`) into
`olivia/areas/<area>/public/locale/`.

The language list comes from the `.po` files in
`olivia/areas/<area>/app/assets/locale`, so it always matches the area.

```bash
# Download ALL event locales into olivia/areas/event/public/locale
uv run python src/download_locales.py

# Download only specific locales
uv run python src/download_locales.py vi en

# Download a different area
LOCALE_AREA=candidate uv run python src/download_locales.py

# Point at a different olivia checkout / CDN
OLIVIA_ROOT=/path/to/olivia uv run python src/download_locales.py
LOCALE_CDN_BASE_URL=https://cdn.paradox.ai/locale uv run python src/download_locales.py
```

Environment variables:

| Variable             | Default                              | Description                          |
| -------------------- | ------------------------------------ | ------------------------------------ |
| `LOCALE_AREA`        | `event`                              | Which `areas/<area>` to download for |
| `OLIVIA_ROOT`        | `../olivia`                          | Path to the olivia repo              |
| `LOCALE_CDN_BASE_URL`| `https://cdn.test.paradox.ai/locale` | CDN base URL                         |

### `src/setup-widget-local.mjs` — widget symlinks for local dev

Creates (or removes) the symlinks the event/olivia apps need to serve the locally
built widget, plus the matching `areas/event/.gitignore` entries. Operates on the
sibling `olivia` repo.

```bash
# Create .gitignore + symlinks
node src/setup-widget-local.mjs setup

# Remove them
node src/setup-widget-local.mjs cleanup

# Custom olivia path
OLIVIA_ROOT=/path/to/olivia node src/setup-widget-local.mjs setup
```

After `setup`, build the widget once (in the olivia repo) so the symlink targets
exist:

```bash
pnpm env-nx @paradoxai/olivia-widget:build
```

Re-run `setup` after `cleanup` or whenever the symlinks go missing. Restart the
dev server after each widget build if chunks fail to load.

### `src/create_candidate_event_orientation.py` — seed orientation candidates

Creates N fake candidates and schedules them onto orientation events via the
local API (`http://localhost:8001`). Update the `AUTHORIZATION` / `EVENT_IDS`
constants in the file first.

```bash
uv run python src/create_candidate_event_orientation.py 10
```
