# SRD Spellbook (3.5)

A fast, compact SRD spell browser with delayed "full card" tooltips and a practical daily tracker for prepared spells and remaining slots.

## Features

- **Spell Browser**: Browse spells by level, class, or school with search and filters
- **Delayed Tooltips**: Hover or focus on a spell for 1 second to see full SRD stat block
- **Slot Tracker**: Track spell slots (regular + domain) for levels 0-9
- **Prepared Spells**: Manage prepared spells with cast/use tracking
- **Character Profiles**: Save caster type, class, and domains to localStorage
- **Import/Export**: Backup and restore your profile data as JSON

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
npm run build
npm run preview
```

## Data

Spell data is loaded from `/static/spells.json`. The data follows the schema defined in `schemas/spells.schema.json`.

## License

SRD spell text is Open Game Content under the OGL. See the OGL section in the app's Settings page for full license text.

## Tech Stack

- [SvelteKit](https://kit.svelte.dev/) - Web framework
- [Svelte 5](https://svelte.dev/) - Component framework with runes
- [Tailwind CSS v4](https://tailwindcss.com/) - Utility-first CSS
- [@floating-ui/dom](https://floating-ui.com/) - Tooltip positioning
