import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { loadContext } from './helpers.mjs';

const ctx = loadContext();

// Helper: reset tmux state to known defaults
function reset() {
  const a = ctx.getTmuxAnswers();
  a.prefix = null;
  a.mouse = true;
  a.baseIndex = true;
  a.renumber = true;
  a.autoRename = false;
  a.visualBell = true;
  a.historyLimit = 10000;
  a.terminalType = 'screen-256color';
  a.focusEvents = true;
  a.clipboard = true;
  a.displayPanesTime = 2000;
  a.repeatTime = 500;
  a.aggressiveResize = true;
  a.theme = null;
  a.paneBorder = false;
  a.activeBorder = true;
  a.statusPosition = null;
  a.statusModules = [];
  a.statusInterval = 5;
  a.statusLeftLength = 40;
  a.statusRightLength = 50;
  a.statusJustify = 'centre';
  a.splitKeys = null;
  a.extraBindings = [];
  a.plugins = [];
}

// ── getThemeColors ─────────────────────────────────────
describe('getThemeColors', () => {
  test('nord theme returns correct statusBg', () => {
    const colors = ctx.getThemeColors('nord');
    assert.equal(colors.statusBg, '#2E3440');
  });

  test('dracula theme returns correct activeBorder', () => {
    const colors = ctx.getThemeColors('dracula');
    assert.equal(colors.activeBorder, '#bd93f9');
  });

  test('catppuccin theme has all required color keys', () => {
    const colors = ctx.getThemeColors('catppuccin');
    const required = ['statusBg', 'statusFg', 'activeBorder', 'border', 'activeBg', 'activeFg'];
    for (const key of required) {
      assert.ok(key in colors, `missing key: ${key}`);
    }
  });

  test('unknown theme falls back to github theme colors', () => {
    const colors = ctx.getThemeColors('nonexistent');
    const github = ctx.getThemeColors('github');
    assert.deepEqual(colors, github);
  });

  test('tokyonight theme has correct statusBg', () => {
    const colors = ctx.getThemeColors('tokyonight');
    assert.equal(colors.statusBg, '#1a1b26');
  });
});

// ── generateTmuxConfig ─────────────────────────────────
describe('generateTmuxConfig', () => {
  test('output contains tmux header comment', () => {
    reset();
    const config = ctx.generateTmuxConfig();
    assert.match(config, /# tmux Configuration/);
  });

  test('mouse enabled produces "set -g mouse on"', () => {
    reset();
    ctx.getTmuxAnswers().mouse = true;
    const config = ctx.generateTmuxConfig();
    assert.match(config, /set -g mouse on/);
  });

  test('mouse disabled omits "set -g mouse on"', () => {
    reset();
    ctx.getTmuxAnswers().mouse = false;
    const config = ctx.generateTmuxConfig();
    assert.doesNotMatch(config, /set -g mouse on/);
  });

  test('changing prefix from C-b adds unbind and set prefix lines', () => {
    reset();
    ctx.getTmuxAnswers().prefix = 'C-a';
    const config = ctx.generateTmuxConfig();
    assert.match(config, /unbind C-b/);
    assert.match(config, /set -g prefix C-a/);
  });

  test('default prefix (C-b) does not add unbind line', () => {
    reset();
    ctx.getTmuxAnswers().prefix = 'C-b';
    const config = ctx.generateTmuxConfig();
    assert.doesNotMatch(config, /unbind C-b/);
  });

  test('baseIndex true adds base-index 1', () => {
    reset();
    ctx.getTmuxAnswers().baseIndex = true;
    const config = ctx.generateTmuxConfig();
    assert.match(config, /set -g base-index 1/);
  });

  test('historyLimit is reflected in history-limit', () => {
    reset();
    ctx.getTmuxAnswers().historyLimit = 50000;
    const config = ctx.generateTmuxConfig();
    assert.match(config, /history-limit 50000/);
  });

  test('nord theme adds status-style with theme colors', () => {
    reset();
    ctx.getTmuxAnswers().theme = 'nord';
    const config = ctx.generateTmuxConfig();
    assert.match(config, /status-style/);
    assert.match(config, /#2E3440/);
  });

  test('no theme: default theme section is skipped', () => {
    reset();
    ctx.getTmuxAnswers().theme = null;
    const config = ctx.generateTmuxConfig();
    assert.doesNotMatch(config, /status-style/);
  });

  test('session statusModule adds status-left with [#S]', () => {
    reset();
    ctx.getTmuxAnswers().statusModules = ['session'];
    const config = ctx.generateTmuxConfig();
    assert.match(config, /status-left/);
    assert.match(config, /\[#S\]/);
  });

  test('datetime statusModule adds date format to status-right', () => {
    reset();
    ctx.getTmuxAnswers().statusModules = ['datetime'];
    const config = ctx.generateTmuxConfig();
    assert.match(config, /status-right/);
    assert.match(config, /%Y-%m-%d/);
  });

  test('vim split keys adds | and - bindings', () => {
    reset();
    ctx.getTmuxAnswers().splitKeys = 'vim';
    const config = ctx.generateTmuxConfig();
    assert.match(config, /bind \| split-window -h/);
    assert.match(config, /bind - split-window -v/);
  });

  test('vim-navigation extra binding adds h/j/k/l pane navigation', () => {
    reset();
    ctx.getTmuxAnswers().extraBindings = ['vim-navigation'];
    const config = ctx.generateTmuxConfig();
    assert.match(config, /bind h select-pane -L/);
    assert.match(config, /bind j select-pane -D/);
  });

  test('tpm plugin adds tpm set line', () => {
    reset();
    ctx.getTmuxAnswers().plugins = ['tpm'];
    const config = ctx.generateTmuxConfig();
    assert.match(config, /tmux-plugins\/tpm/);
    assert.match(config, /run '~\/.tmux\/plugins\/tpm\/tpm'/);
  });

  test('resurrect plugin without tpm still adds plugin line', () => {
    reset();
    ctx.getTmuxAnswers().plugins = ['tpm', 'resurrect'];
    const config = ctx.generateTmuxConfig();
    assert.match(config, /tmux-resurrect/);
  });

  test('continuum plugin adds continuum-restore on setting', () => {
    reset();
    ctx.getTmuxAnswers().plugins = ['tpm', 'continuum'];
    const config = ctx.generateTmuxConfig();
    assert.match(config, /continuum-restore/);
  });

  test('reload extra binding adds source-file line', () => {
    reset();
    ctx.getTmuxAnswers().extraBindings = ['reload'];
    const config = ctx.generateTmuxConfig();
    assert.match(config, /source-file ~\/.tmux.conf/);
  });
});
