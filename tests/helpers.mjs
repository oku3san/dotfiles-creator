// ── Test helper ────────────────────────────────────────
// Loads source JS files into an isolated function scope using the
// Function constructor so that let/const declarations in state.js
// are accessible to all the config-generation functions via closure.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

// Minimal DOM stub — prevents ReferenceError in functions that
// optionally touch the DOM but are not under test here.
const domStub = {
  getElementById: () => null,
  querySelector: () => null,
  querySelectorAll: () => ({ forEach: () => {} }),
  createElement: () => ({
    innerHTML: '',
    className: '',
    textContent: '',
    children: { length: 0 },
    appendChild: () => {},
    classList: { add: () => {}, remove: () => {}, contains: () => false },
    insertAdjacentHTML: () => {},
  }),
  body: { appendChild: () => {}, removeChild: () => {} },
};

/**
 * Creates a fresh isolated scope containing all source files.
 * Returns an object exposing testable functions and mutable state
 * references. Call once per test file for a clean baseline.
 */
export function loadContext() {
  const sourceFiles = [
    'js/state.js',
    'js/utils.js',
    'js/starship.js',
    'js/tmux.js',
    'js/zsh.js',
    'js/neovim.js',
    'js/claudemd.js',
  ];

  const code = sourceFiles
    .map(f => fs.readFileSync(path.join(root, f), 'utf-8'))
    .join('\n');

  // eslint-disable-next-line no-new-func
  const factory = new Function('document', 'window', 'navigator', `
    ${code}

    return {
      // Utility functions
      escapeHtml,
      highlightValue,
      highlightToml,
      highlightConf,
      highlightZsh,
      highlightLua,
      // Starship
      generateConfig,
      buildFormatParts,
      addModuleVars,
      getCharacter,
      getColor,
      STARSHIP_PRESETS,
      // tmux
      generateTmuxConfig,
      getThemeColors,
      // zsh
      generateZshConfig,
      // Neovim
      generateNeovimConfig,
      getNeovimThemeColors,
      // CLAUDE.md
      generateClaudeMdConfig,
      highlightMarkdown,
      // Mutable state references — mutations are visible to generators
      getAnswers:           () => answers,
      getTmuxAnswers:       () => tmuxAnswers,
      getZshAnswers:        () => zshAnswers,
      getNeovimAnswers:     () => neovimAnswers,
      getClaudeMdAnswers:   () => claudeMdAnswers,
    };
  `);

  return factory(domStub, {}, {});
}
