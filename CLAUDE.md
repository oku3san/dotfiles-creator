# CLAUDE.md

## Project Overview

**dotfiles-creator** is a **Starship Config Generator** — a client-side single-page web application that helps users create customized [Starship](https://starship.rs) shell prompt configurations through a guided wizard interface. The UI is in Japanese.

- **Owner:** oku3san
- **Repository:** [oku3san/dotfiles-creator](https://github.com/oku3san/dotfiles-creator)

## Repository Structure

```
dotfiles-creator/
├── CLAUDE.md       # This file — guidance for AI assistants
├── .gitignore      # Ignores OS/editor temp files (.DS_Store, Thumbs.db, *.swp)
├── index.html      # HTML + embedded CSS — full UI for the 5-step wizard
└── app.js          # Vanilla JavaScript — state, navigation, config generation
```

There are **no dependencies, no build tools, no package manager, and no framework**. The project is served as plain static files.

## Technology Stack

- **Language:** Vanilla JavaScript (ES6+), HTML5, CSS3
- **Frameworks/Libraries:** None
- **Build system:** None — open `index.html` directly in a browser
- **Tests:** None configured
- **Linting:** None configured

## Development Setup

No installation is needed. To run locally:

1. Open `index.html` in a web browser

There are no dependencies to install, no environment variables, and no build step.

## How the App Works

The wizard walks users through 5 steps:

1. **Step 0 — Prompt style:** Choose layout (plain, nerd font icons, bracketed, multi-line)
2. **Step 1 — Prompt character:** Choose cursor symbol (❯, $, ➜, λ)
3. **Step 2 — Accent color:** Choose from 8 preset colors (cyan, green, blue, purple, yellow, red, white, orange)
4. **Step 3 — Modules:** Select which Starship modules to enable (multi-select)
5. **Step 4 — Result:** View generated TOML config, preview prompt appearance, copy or download

### Supported Starship Modules

Git, Node.js, Python, Go, Rust, Docker, AWS, Kubernetes, Terraform, Time, Battery, Command Duration

## Key Code Architecture

### `app.js` (421 lines)

| Section | Functions | Purpose |
|---|---|---|
| State | `answers`, `TOTAL_STEPS` | Tracks user selections (style, character, color, modules) |
| Progress bar | `renderProgress()` | Draws the step indicator bar |
| Navigation | `showStep()`, `nextStep()`, `prevStep()`, `goToStart()` | Moves between wizard steps |
| Input handlers | `setupOptions()`, `updateNextButton()` | Handles radio, checkbox, and color swatch clicks |
| Config generation | `generateConfig()`, `buildFormatParts()`, `addModuleVars()` | Builds Starship TOML output from selections |
| Preview | `buildPromptPreview()` | Creates an HTML preview of the prompt |
| Result | `renderResult()`, `copyConfig()`, `downloadConfig()` | Displays output, clipboard copy, file download |

### `index.html` (510 lines)

Contains all HTML structure and embedded CSS. Uses CSS custom properties for theming (dark mode with GitHub-inspired palette). Key CSS variables are defined in `:root` (e.g., `--bg`, `--surface`, `--accent`).

## Coding Conventions

- Keep changes minimal and focused on the task at hand
- Do not add unnecessary abstractions or over-engineer solutions
- Write clear commit messages that explain the "why" not just the "what"
- Prefer simple, readable code over clever code
- Code uses section dividers with `// ── Title ──` comment style in `app.js`
- No external dependencies — keep it vanilla JS with no frameworks
- UI text is in Japanese; comments and code identifiers are in English
- Update this CLAUDE.md file when adding new files, tooling, or changing project structure

## AI Assistant Guidelines

- **Read before editing:** Always read files before proposing changes
- **Stay in scope:** Only make changes that are directly requested or clearly necessary
- **Validate in browser:** Since there are no tests, manually verify changes render correctly if possible
- **Update docs:** If you add files, tooling, or change the project structure, update this file
- **Branch workflow:** Develop on feature branches, not directly on `main`
- **Keep it simple:** This project intentionally has zero dependencies — avoid introducing build tools or frameworks unless explicitly requested
