import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { loadContext } from './helpers.mjs';

const ctx = loadContext();

// Helper: reset Neovim state to known defaults
function reset() {
  const a = ctx.getNeovimAnswers();
  a.pluginManager = 'none';
  a.number = true;
  a.relativenumber = true;
  a.cursorline = true;
  a.signcolumn = true;
  a.wrap = false;
  a.termguicolors = true;
  a.scrolloff = 8;
  a.tabWidth = 2;
  a.expandtab = true;
  a.smartindent = true;
  a.ignorecase = true;
  a.smartcase = true;
  a.hlsearch = true;
  a.clipboard = true;
  a.mouse = true;
  a.swapfile = true;
  a.undofile = true;
  a.splitright = true;
  a.splitbelow = true;
  a.colorscheme = null;
  a.plugins = [];
  a.leader = null;
  a.keymaps = [];
}

// ── getNeovimThemeColors ────────────────────────────────
describe('getNeovimThemeColors', () => {
  test('catppuccin theme has correct bg', () => {
    const colors = ctx.getNeovimThemeColors('catppuccin');
    assert.equal(colors.bg, '#1e1e2e');
  });

  test('tokyonight theme has correct accent color', () => {
    const colors = ctx.getNeovimThemeColors('tokyonight');
    assert.equal(colors.accent, '#7aa2f7');
  });

  test('all themes have required color keys', () => {
    const required = ['bg', 'fg', 'lineNum', 'cursorLine', 'accent', 'keyword',
      'string', 'comment', 'func', 'type', 'statusBg', 'statusFg',
      'sidebarBg', 'border', 'number'];
    for (const theme of ['catppuccin', 'tokyonight', 'gruvbox', 'nord', 'dracula', 'onedark', 'rose-pine', 'kanagawa']) {
      const colors = ctx.getNeovimThemeColors(theme);
      for (const key of required) {
        assert.ok(key in colors, `theme "${theme}" missing key: ${key}`);
      }
    }
  });

  test('unknown theme falls back to catppuccin', () => {
    const colors = ctx.getNeovimThemeColors('unknown-theme');
    const catppuccin = ctx.getNeovimThemeColors('catppuccin');
    assert.deepEqual(colors, catppuccin);
  });
});

// ── generateNeovimConfig ────────────────────────────────
describe('generateNeovimConfig', () => {
  test('output contains Neovim header comment', () => {
    reset();
    const config = ctx.generateNeovimConfig();
    assert.match(config, /-- Neovim Configuration/);
  });

  test('leader key "space" generates space character', () => {
    reset();
    ctx.getNeovimAnswers().leader = 'space';
    const config = ctx.generateNeovimConfig();
    assert.match(config, /vim\.g\.mapleader = " "/);
  });

  test('leader key "comma" generates comma character', () => {
    reset();
    ctx.getNeovimAnswers().leader = 'comma';
    const config = ctx.generateNeovimConfig();
    assert.match(config, /vim\.g\.mapleader = ","/);
  });

  test('number = true adds vim.opt.number = true', () => {
    reset();
    ctx.getNeovimAnswers().number = true;
    const config = ctx.generateNeovimConfig();
    assert.match(config, /vim\.opt\.number = true/);
  });

  test('number = false omits vim.opt.number line', () => {
    reset();
    ctx.getNeovimAnswers().number = false;
    const config = ctx.generateNeovimConfig();
    assert.doesNotMatch(config, /vim\.opt\.number = true/);
  });

  test('tabWidth is reflected in tabstop setting', () => {
    reset();
    ctx.getNeovimAnswers().tabWidth = 4;
    const config = ctx.generateNeovimConfig();
    assert.match(config, /vim\.opt\.tabstop = 4/);
    assert.match(config, /vim\.opt\.shiftwidth = 4/);
  });

  test('clipboard true adds unnamedplus', () => {
    reset();
    ctx.getNeovimAnswers().clipboard = true;
    const config = ctx.generateNeovimConfig();
    assert.match(config, /vim\.opt\.clipboard = "unnamedplus"/);
  });

  test('scrolloff is reflected in config', () => {
    reset();
    ctx.getNeovimAnswers().scrolloff = 10;
    const config = ctx.generateNeovimConfig();
    assert.match(config, /vim\.opt\.scrolloff = 10/);
  });

  test('lazy.nvim plugin manager: generates lazy bootstrap code', () => {
    reset();
    ctx.getNeovimAnswers().pluginManager = 'lazy';
    const config = ctx.generateNeovimConfig();
    assert.match(config, /Bootstrap lazy\.nvim/);
    assert.match(config, /folke\/lazy\.nvim/);
    assert.match(config, /require\("lazy"\)\.setup/);
  });

  test('packer plugin manager: generates packer bootstrap code', () => {
    reset();
    ctx.getNeovimAnswers().pluginManager = 'packer';
    const config = ctx.generateNeovimConfig();
    assert.match(config, /Bootstrap packer\.nvim/);
    assert.match(config, /wbthomason\/packer\.nvim/);
    assert.match(config, /require\("packer"\)\.startup/);
  });

  test('lazy.nvim + treesitter plugin adds treesitter line', () => {
    reset();
    ctx.getNeovimAnswers().pluginManager = 'lazy';
    ctx.getNeovimAnswers().plugins = ['treesitter'];
    const config = ctx.generateNeovimConfig();
    assert.match(config, /nvim-treesitter\/nvim-treesitter/);
  });

  test('lazy.nvim + telescope plugin adds telescope line', () => {
    reset();
    ctx.getNeovimAnswers().pluginManager = 'lazy';
    ctx.getNeovimAnswers().plugins = ['telescope'];
    const config = ctx.generateNeovimConfig();
    assert.match(config, /nvim-telescope\/telescope\.nvim/);
  });

  test('packer + gitsigns plugin adds use line', () => {
    reset();
    ctx.getNeovimAnswers().pluginManager = 'packer';
    ctx.getNeovimAnswers().plugins = ['gitsigns'];
    const config = ctx.generateNeovimConfig();
    assert.match(config, /use "lewis6991\/gitsigns\.nvim"/);
  });

  test('colorscheme is applied via vim.cmd.colorscheme', () => {
    reset();
    ctx.getNeovimAnswers().pluginManager = 'lazy';
    ctx.getNeovimAnswers().colorscheme = 'tokyonight';
    const config = ctx.generateNeovimConfig();
    assert.match(config, /vim\.cmd\.colorscheme\("tokyonight"\)/);
  });

  test('no colorscheme: no vim.cmd.colorscheme line', () => {
    reset();
    ctx.getNeovimAnswers().pluginManager = 'none';
    ctx.getNeovimAnswers().colorscheme = null;
    const config = ctx.generateNeovimConfig();
    assert.doesNotMatch(config, /vim\.cmd\.colorscheme/);
  });

  test('window-nav keymap adds C-h/j/k/l mappings', () => {
    reset();
    ctx.getNeovimAnswers().keymaps = ['window-nav'];
    const config = ctx.generateNeovimConfig();
    assert.match(config, /"<C-h>"/);
    assert.match(config, /"<C-l>"/);
  });

  test('save-file keymap adds C-s mapping', () => {
    reset();
    ctx.getNeovimAnswers().keymaps = ['save-file'];
    const config = ctx.generateNeovimConfig();
    assert.match(config, /"<C-s>"/);
  });

  test('telescope keymap added when telescope plugin selected', () => {
    reset();
    ctx.getNeovimAnswers().pluginManager = 'lazy';
    ctx.getNeovimAnswers().plugins = ['telescope'];
    ctx.getNeovimAnswers().keymaps = ['clear-search'];
    const config = ctx.generateNeovimConfig();
    assert.match(config, /Telescope find_files/);
  });

  test('no keymaps selected: no Keymaps section', () => {
    reset();
    ctx.getNeovimAnswers().keymaps = [];
    const config = ctx.generateNeovimConfig();
    assert.doesNotMatch(config, /^-- Keymaps$/m);
  });

  test('lualine plugin setup is included when selected', () => {
    reset();
    ctx.getNeovimAnswers().pluginManager = 'lazy';
    ctx.getNeovimAnswers().plugins = ['lualine'];
    const config = ctx.generateNeovimConfig();
    assert.match(config, /require\("lualine"\)\.setup/);
  });

  test('lualine uses colorscheme as theme when colorscheme is set', () => {
    reset();
    ctx.getNeovimAnswers().pluginManager = 'lazy';
    ctx.getNeovimAnswers().plugins = ['lualine'];
    ctx.getNeovimAnswers().colorscheme = 'gruvbox';
    const config = ctx.generateNeovimConfig();
    assert.match(config, /theme = "gruvbox"/);
  });
});
